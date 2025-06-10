
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';

type Vacancy = Tables<'vacancies'> & {
  employer?: Tables<'users'>;
};

type UserProfile = Tables<'users'>;

export const useSwipeTargets = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['swipe-targets', user?.id, user?.role],
    queryFn: async () => {
      if (!user) return [];

      if (user.role === 'seeker') {
        // Получаем вакансии для соискателя, исключая уже просмотренные
        const { data: swipedVacancies, error: swipedError } = await supabase
          .from('swipes')
          .select('target_id')
          .eq('swiper_id', user.id)
          .eq('target_type', 'vacancy');

        if (swipedError) {
          console.error('Error fetching swiped vacancies:', swipedError);
        }

        const swipedIds = swipedVacancies?.map(s => s.target_id) || [];

        const { data: vacancies, error } = await supabase
          .from('vacancies')
          .select(`
            *,
            employer:users!vacancies_employer_id_fkey(*)
          `)
          .not('employer_id', 'eq', user.id)
          .not('id', 'in', `(${swipedIds.length > 0 ? swipedIds.join(',') : 'null'})`);

        if (error) {
          console.error('Error fetching vacancies:', error);
          throw error;
        }

        return vacancies as Vacancy[];
      } else {
        // Получаем профили соискателей для работодателя, исключая уже просмотренные
        const { data: swipedUsers, error: swipedError } = await supabase
          .from('swipes')
          .select('target_id')
          .eq('swiper_id', user.id)
          .eq('target_type', 'user');

        if (swipedError) {
          console.error('Error fetching swiped users:', swipedError);
        }

        const swipedIds = swipedUsers?.map(s => s.target_id) || [];

        const { data: seekers, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'seeker')
          .not('id', 'eq', user.id)
          .not('id', 'in', `(${swipedIds.length > 0 ? swipedIds.join(',') : 'null'})`);

        if (error) {
          console.error('Error fetching seekers:', error);
          throw error;
        }

        return seekers as UserProfile[];
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
