
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';

type Vacancy = Tables<'vacancies'> & {
  employer?: Tables<'users'>;
};

type UserProfile = Tables<'users'>;

const findSimilarSkills = (userSkills: string[], targetSkills: string[]): number => {
  if (!userSkills?.length || !targetSkills?.length) return 0;
  
  const matches = userSkills.filter(skill => 
    targetSkills.some(targetSkill => 
      skill.toLowerCase().includes(targetSkill.toLowerCase()) ||
      targetSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  return matches.length;
};

const calculateRelevanceScore = (user: UserProfile, target: Vacancy | UserProfile, userRole: string): number => {
  let score = 0;
  
  // Проверка города (высший приоритет)
  if (userRole === 'seeker' && 'city' in target) {
    const vacancy = target as Vacancy;
    if (user.city === vacancy.city || vacancy.city === 'Удаленная работа' || user.city === 'Удаленная работа') {
      score += 100;
    }
  } else if (userRole === 'employer' && 'city' in target) {
    const candidate = target as UserProfile;
    if (user.city === candidate.city || candidate.city === 'Удаленная работа' || user.city === 'Удаленная работа') {
      score += 100;
    }
  }
  
  // Проверка навыков
  if (userRole === 'seeker' && 'skills_required' in target) {
    const vacancy = target as Vacancy;
    const skillMatches = findSimilarSkills(user.skills || [], vacancy.skills_required || []);
    score += skillMatches * 20;
  } else if (userRole === 'employer' && 'skills' in target) {
    const candidate = target as UserProfile;
    const skillMatches = findSimilarSkills(user.skills || [], candidate.skills || []);
    score += skillMatches * 20;
  }
  
  return score;
};

export const useSwipeTargets = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['swipe-targets', user?.id, user?.role],
    queryFn: async () => {
      if (!user) return [];

      if (user.role === 'seeker') {
        // Получаем вакансии для соискателя
        const { data: vacancies, error } = await supabase
          .from('vacancies')
          .select(`
            *,
            employer:users!vacancies_employer_id_fkey(*)
          `)
          .not('employer_id', 'eq', user.id);

        if (error) {
          console.error('Error fetching vacancies:', error);
          throw error;
        }

        // Сортируем по релевантности
        const sortedVacancies = (vacancies as Vacancy[]).sort((a, b) => {
          const scoreA = calculateRelevanceScore(user, a, 'seeker');
          const scoreB = calculateRelevanceScore(user, b, 'seeker');
          return scoreB - scoreA;
        });

        return sortedVacancies;
      } else {
        // Получаем профили соискателей для работодателя
        const { data: seekers, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'seeker')
          .not('id', 'eq', user.id);

        if (error) {
          console.error('Error fetching seekers:', error);
          throw error;
        }

        // Сортируем по релевантности
        const sortedSeekers = (seekers as UserProfile[]).sort((a, b) => {
          const scoreA = calculateRelevanceScore(user, a, 'employer');
          const scoreB = calculateRelevanceScore(user, b, 'employer');
          return scoreB - scoreA;
        });

        return sortedSeekers;
      }
    },
    enabled: !!user,
  });
};

export const useSwipe = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createSwipe = useMutation({
    mutationFn: async (swipeData: {
      target_id: string;
      target_type: 'user' | 'vacancy';
      direction: 'like' | 'dislike';
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          target_id: swipeData.target_id,
          target_type: swipeData.target_type,
          direction: swipeData.direction,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating swipe:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swipe-targets'] });
    },
  });

  return { createSwipe };
};
