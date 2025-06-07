
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';

type Match = Tables<'matches'>;

export const useMatches = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['matches', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          participant_a_user:users!matches_participant_a_fkey(*),
          participant_b_user:users!matches_participant_b_fkey(*),
          vacancy:vacancies(*)
        `)
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching matches:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });
};
