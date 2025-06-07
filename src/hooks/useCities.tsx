
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type City = Tables<'cities'>;

export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async (): Promise<City[]> => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching cities:', error);
        throw error;
      }

      return data || [];
    },
  });
};
