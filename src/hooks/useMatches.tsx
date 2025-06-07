
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useMatches = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['matches', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          *,
          participant_a:users!matches_participant_a_fkey(*),
          participant_b:users!matches_participant_b_fkey(*),
          vacancy:vacancies(*)
        `)
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching matches:', error);
        throw error;
      }

      return matches || [];
    },
    enabled: !!user,
  });
};
