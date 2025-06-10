
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
      if (!user) {
        console.log('No user found for swipe targets');
        return [];
      }

      console.log('Fetching swipe targets for user:', user.id, 'role:', user.role);

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
        console.log('Already swiped vacancy IDs:', swipedIds);

        let query = supabase
          .from('vacancies')
          .select(`
            *,
            employer:users!vacancies_employer_id_fkey(*)
          `);

        // Исключаем вакансии, где пользователь является работодателем
        if (user.id) {
          query = query.not('employer_id', 'eq', user.id);
        }

        // Исключаем уже просмотренные вакансии
        if (swipedIds.length > 0) {
          query = query.not('id', 'in', `(${swipedIds.join(',')})`);
        }

        const { data: vacancies, error } = await query;

        if (error) {
          console.error('Error fetching vacancies:', error);
          throw error;
        }

        console.log('Found vacancies:', vacancies?.length || 0);
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
        console.log('Already swiped user IDs:', swipedIds);

        let query = supabase
          .from('users')
          .select('*')
          .eq('role', 'seeker')
          .not('id', 'eq', user.id);

        // Исключаем уже просмотренных пользователей
        if (swipedIds.length > 0) {
          query = query.not('id', 'in', `(${swipedIds.join(',')})`);
        }

        const { data: seekers, error } = await query;

        if (error) {
          console.error('Error fetching seekers:', error);
          throw error;
        }

        console.log('Found seekers:', seekers?.length || 0);
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

      console.log('Creating swipe:', swipeData, 'for user:', user.id);

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

      console.log('Swipe created successfully:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Swipe successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['swipe-targets'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });

  return { createSwipe };
};
