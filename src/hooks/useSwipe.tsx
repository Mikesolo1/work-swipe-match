
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';

type Swipe = Tables<'swipes'>;
type Vacancy = Tables<'vacancies'>;
type User = Tables<'users'>;

interface SwipeData {
  target_id: string;
  target_type: 'user' | 'vacancy';
  direction: 'like' | 'dislike';
}

export const useSwipe = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createSwipe = useMutation({
    mutationFn: async (swipeData: SwipeData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          ...swipeData
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
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['swipe_targets'] });
    },
  });

  return { createSwipe };
};

export const useSwipeTargets = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['swipe_targets', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Получаем уже просвайпанные ID
      const { data: existingSwipes } = await supabase
        .from('swipes')
        .select('target_id, target_type')
        .eq('swiper_id', user.id);

      const swipedUserIds = existingSwipes
        ?.filter(s => s.target_type === 'user')
        .map(s => s.target_id) || [];
      
      const swipedVacancyIds = existingSwipes
        ?.filter(s => s.target_type === 'vacancy')
        .map(s => s.target_id) || [];

      if (user.role === 'seeker') {
        // Соискатели видят вакансии
        let query = supabase
          .from('vacancies')
          .select(`
            *,
            employer:users!vacancies_employer_id_fkey(*)
          `);

        // Исключаем уже просвайпанные вакансии
        if (swipedVacancyIds.length > 0) {
          query = query.not('id', 'in', `(${swipedVacancyIds.join(',')})`);
        }

        // Фильтрация по городу (если указан у пользователя)
        if (user.city && user.city !== 'Удаленная работа') {
          query = query.or(`city.eq.${user.city},city.eq.Удаленная работа`);
        }

        const { data: vacancies, error } = await query
          .limit(20)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return vacancies || [];
      } else {
        // Работодатели видят соискателей
        let query = supabase
          .from('users')
          .select('*')
          .eq('role', 'seeker')
          .neq('id', user.id);

        // Исключаем уже просвайпанных пользователей
        if (swipedUserIds.length > 0) {
          query = query.not('id', 'in', `(${swipedUserIds.join(',')})`);
        }

        // Фильтрация по городу (если указан у работодателя)
        if (user.city && user.city !== 'Удаленная работа') {
          query = query.or(`city.eq.${user.city},city.eq.Удаленная работа,city.is.null`);
        }

        const { data: users, error } = await query
          .limit(20)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return users || [];
      }
    },
    enabled: !!user,
  });
};
