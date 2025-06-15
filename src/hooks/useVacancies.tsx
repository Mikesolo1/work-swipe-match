
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Vacancy = Tables<'vacancies'> & {
  employer?: Tables<'users'>;
};

export const useVacancies = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['vacancies', user?.id],
    queryFn: async (): Promise<Vacancy[]> => {
      if (!user) {
        console.log('No user found, returning empty array');
        return [];
      }

      let query = supabase
        .from('vacancies')
        .select(`
          *,
          employer:users!vacancies_employer_id_fkey(*)
        `);

      // Если пользователь работодатель, показываем только его вакансии
      if (user.role === 'employer') {
        console.log('Filtering vacancies for employer:', user.id);
        query = query.eq('employer_id', user.id);
      } else {
        console.log('User is not an employer, showing all vacancies');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vacancies:', error);
        throw error;
      }

      console.log('Fetched vacancies:', data?.length || 0);
      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreateVacancy = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (vacancyData: Omit<TablesInsert<'vacancies'>, 'employer_id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('vacancies')
        .insert({
          ...vacancyData,
          employer_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating vacancy:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
    },
  });
};

export const useUpdateVacancy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...vacancyData }: { id: string } & Partial<TablesInsert<'vacancies'>>) => {
      const { data, error } = await supabase
        .from('vacancies')
        .update(vacancyData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating vacancy:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
    },
  });
};

export const useDeleteVacancy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vacancies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting vacancy:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
    },
  });
};
