
import { supabase } from '@/integrations/supabase/client';
import type { User, Vacancy, Match, Swipe, SwipeDirection, TargetType } from '@/types/entities';

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

  // Swipe operations
  async getSwipeTargets(userId: string, userRole: string): Promise<(User | Vacancy)[]> {
    try {
      if (userRole === 'seeker') {
        return await this.getVacanciesForSeeker(userId);
      } else {
        return await this.getSeekersForEmployer(userId);
      }
    } catch (error) {
      console.error('Error fetching swipe targets:', error);
      throw error;
    }
  }

  private async getVacanciesForSeeker(userId: string): Promise<Vacancy[]> {
    // Get already swiped vacancy IDs
    const { data: swipedVacancies } = await supabase
      .from('swipes')
      .select('target_id')
      .eq('swiper_id', userId)
      .eq('target_type', 'vacancy');

    const swipedIds = swipedVacancies?.map(s => s.target_id) || [];

    // Build query
    let query = supabase
      .from('vacancies')
      .select(`
        *,
        employer:users!vacancies_employer_id_fkey(*)
      `)
      .neq('employer_id', userId);

    if (swipedIds.length > 0) {
      query = query.not('id', 'in', `(${swipedIds.join(',')})`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  private async getSeekersForEmployer(userId: string): Promise<User[]> {
    // Get already swiped user IDs
    const { data: swipedUsers } = await supabase
      .from('swipes')
      .select('target_id')
      .eq('swiper_id', userId)
      .eq('target_type', 'user');

    const swipedIds = swipedUsers?.map(s => s.target_id) || [];

    // Build query
    let query = supabase
      .from('users')
      .select('*')
      .eq('role', 'seeker')
      .neq('id', userId);

    if (swipedIds.length > 0) {
      query = query.not('id', 'in', `(${swipedIds.join(',')})`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
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
