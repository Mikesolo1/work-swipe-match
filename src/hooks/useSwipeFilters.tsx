
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseService } from '@/services/supabaseService';
import type { SwipeFilters } from '@/types/filters';

interface UseSwipeFiltersProps {
  userRole?: string;
}

export const useSwipeFilters = ({ userRole }: UseSwipeFiltersProps = {}) => {
  const [filters, setFilters] = useState<SwipeFilters>({
    city: '',
    skills: [],
    salaryMin: 0,
    salaryMax: 500000,
    hasVideo: false,
  });

  // Получение доступных городов
  const { data: availableCities = [] } = useQuery({
    queryKey: ['cities', userRole],
    queryFn: () => supabaseService.getAvailableCities(userRole || 'seeker'),
    enabled: !!userRole,
    staleTime: 1000 * 60 * 10, // 10 минут
  });

  // Получение популярных навыков
  const { data: popularSkills = [] } = useQuery({
    queryKey: ['popular-skills', userRole],
    queryFn: () => supabaseService.getPopularSkills(userRole || 'seeker'),
    enabled: !!userRole,
    staleTime: 1000 * 60 * 10, // 10 минут
  });

  const updateFilters = useCallback((newFilters: Partial<SwipeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      city: '',
      skills: [],
      salaryMin: 0,
      salaryMax: 500000,
      hasVideo: false,
    });
  }, []);

  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.city ||
      (filters.skills && filters.skills.length > 0) ||
      (filters.salaryMin && filters.salaryMin > 0) ||
      (filters.salaryMax && filters.salaryMax < 500000) ||
      filters.hasVideo
    );
  }, [filters]);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.city) count++;
    if (filters.skills && filters.skills.length > 0) count++;
    if (filters.salaryMin && filters.salaryMin > 0) count++;
    if (filters.salaryMax && filters.salaryMax < 500000) count++;
    if (filters.hasVideo) count++;
    return count;
  }, [filters]);

  return {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),
    activeFiltersCount: getActiveFiltersCount(),
    availableCities,
    popularSkills,
  };
};

export default useSwipeFilters;
