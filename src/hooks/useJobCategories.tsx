
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type JobCategory = Tables<'job_categories'>;

export const useJobCategories = () => {
  return useQuery({
    queryKey: ['job_categories'],
    queryFn: async (): Promise<JobCategory[]> => {
      const { data, error } = await supabase
        .from('job_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching job categories:', error);
        throw error;
      }

      return data || [];
    },
  });
};
