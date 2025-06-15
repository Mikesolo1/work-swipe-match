
import { supabase } from '@/integrations/supabase/client';
import type { User, Vacancy, Match, Swipe, SwipeDirection, TargetType } from '@/types/entities';
import type { SwipeFilters } from '@/types/filters';

class SupabaseService {
  // User operations
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', user.user_metadata.telegram_id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        return null;
      }

      return userData;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Enhanced swipe operations with filters
  async getSwipeTargets(userId: string, userRole: string, filters?: SwipeFilters): Promise<(User | Vacancy)[]> {
    try {
      if (userRole === 'seeker') {
        return await this.getFilteredVacanciesForSeeker(userId, filters);
      } else {
        return await this.getFilteredSeekersForEmployer(userId, filters);
      }
    } catch (error) {
      console.error('Error fetching swipe targets:', error);
      throw error;
    }
  }

  private async getFilteredVacanciesForSeeker(userId: string, filters?: SwipeFilters): Promise<Vacancy[]> {
    try {
      const { data, error } = await supabase.rpc('get_filtered_vacancies_for_seeker', {
        p_user_id: userId,
        p_city: filters?.city || null,
        p_skills: filters?.skills || null,
        p_salary_min: filters?.salaryMin || null,
        p_salary_max: filters?.salaryMax || null,
        p_has_video: filters?.hasVideo || null
      });

      if (error) {
        console.error('Error in getFilteredVacanciesForSeeker:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching filtered vacancies:', error);
      throw error;
    }
  }

  private async getFilteredSeekersForEmployer(userId: string, filters?: SwipeFilters): Promise<User[]> {
    try {
      const { data, error } = await supabase.rpc('get_filtered_seekers_for_employer', {
        p_user_id: userId,
        p_city: filters?.city || null,
        p_skills: filters?.skills || null,
        p_salary_min: filters?.salaryMin || null,
        p_salary_max: filters?.salaryMax || null,
        p_has_video: filters?.hasVideo || null
      });

      if (error) {
        console.error('Error in getFilteredSeekersForEmployer:', error);
        throw error;
      }

      // Добавляем отсутствующие поля для совместимости с типом User
      const usersWithDefaults = (data || []).map(user => ({
        ...user,
        company: user.company || null,
      }));

      return usersWithDefaults;
    } catch (error) {
      console.error('Error fetching filtered seekers:', error);
      throw error;
    }
  }

  // Legacy methods for backward compatibility
  private async getVacanciesForSeeker(userId: string): Promise<Vacancy[]> {
    return this.getFilteredVacanciesForSeeker(userId);
  }

  private async getSeekersForEmployer(userId: string): Promise<User[]> {
    return this.getFilteredSeekersForEmployer(userId);
  }

  async createSwipe(
    swiperId: string,
    targetId: string,
    targetType: TargetType,
    direction: SwipeDirection
  ): Promise<Swipe> {
    try {
      const { data, error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: swiperId,
          target_id: targetId,
          target_type: targetType,
          direction: direction,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating swipe:', error);
      throw error;
    }
  }

  // Match operations
  async getUserMatches(userId: string): Promise<Match[]> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          participant_a_user:users!matches_participant_a_fkey(*),
          participant_b_user:users!matches_participant_b_fkey(*),
          vacancy:vacancies(*)
        `)
        .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(match => {
        const now = new Date();
        const expiresAt = new Date(match.expires_at);
        const timeLeft = expiresAt.getTime() - now.getTime();

        return {
          ...match,
          isExpired: timeLeft <= 0,
          timeLeft: Math.max(0, timeLeft),
        };
      });
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }
  }

  // Vacancy operations
  async createVacancy(employerId: string, vacancyData: Omit<Vacancy, 'id' | 'employer_id' | 'created_at' | 'updated_at'>): Promise<Vacancy> {
    try {
      const { data, error } = await supabase
        .from('vacancies')
        .insert({
          ...vacancyData,
          employer_id: employerId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating vacancy:', error);
      throw error;
    }
  }

  async getUserVacancies(employerId: string): Promise<Vacancy[]> {
    try {
      const { data, error } = await supabase
        .from('vacancies')
        .select('*')
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user vacancies:', error);
      throw error;
    }
  }

  async updateVacancy(vacancyId: string, updates: Partial<Vacancy>): Promise<Vacancy> {
    try {
      const { data, error } = await supabase
        .from('vacancies')
        .update(updates)
        .eq('id', vacancyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating vacancy:', error);
      throw error;
    }
  }

  async deleteVacancy(vacancyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('vacancies')
        .delete()
        .eq('id', vacancyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting vacancy:', error);
      throw error;
    }
  }

  // Filter and stats operations
  async getAvailableCities(userRole: string): Promise<string[]> {
    try {
      const tableName = userRole === 'seeker' ? 'vacancies' : 'users';
      const { data, error } = await supabase
        .from(tableName)
        .select('city')
        .not('city', 'is', null);

      if (error) throw error;

      const cities = [...new Set(data?.map(item => item.city).filter(Boolean))];
      return cities.sort();
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  }

  async getPopularSkills(userRole: string): Promise<string[]> {
    try {
      const skillsField = userRole === 'seeker' ? 'skills_required' : 'skills';
      const tableName = userRole === 'seeker' ? 'vacancies' : 'users';
      
      const { data, error } = await supabase
        .from(tableName)
        .select(skillsField)
        .not(skillsField, 'is', null);

      if (error) throw error;

      const allSkills = data?.flatMap(item => item[skillsField] || []) || [];
      const skillCounts = allSkills.reduce((acc, skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([skill]) => skill);
    } catch (error) {
      console.error('Error fetching popular skills:', error);
      return [];
    }
  }

  // Real-time subscriptions
  subscribeToMatches(userId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `participant_a=eq.${userId},participant_b=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  subscribeToSwipes(userId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel('swipes-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'swipes',
          filter: `swiper_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
