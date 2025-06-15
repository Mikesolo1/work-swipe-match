
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from './useAuth';
import type { User, Vacancy, SwipeState, MatchState, SwipeDirection, TargetType } from '@/types/entities';
import type { SwipeFilters } from '@/types/filters';
import { useToast } from '@/hooks/use-toast';

interface UseSwipeOptimizedProps {
  filters?: SwipeFilters;
}

export const useSwipeOptimized = ({ filters }: UseSwipeOptimizedProps = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [swipeState, setSwipeState] = useState<SwipeState>({
    currentIndex: 0,
    isLoading: false,
    targets: [],
  });
  
  const [matchState, setMatchState] = useState<MatchState>({
    showModal: false,
    matchData: null,
  });

  // Fetch swipe targets with filters
  const {
    data: targets = [],
    isLoading: targetsLoading,
    error: targetsError,
    refetch: refetchTargets,
  } = useQuery({
    queryKey: ['swipe-targets', user?.id, user?.role, filters],
    queryFn: async () => {
      if (!user) return [];
      console.log('Fetching targets for user:', user.role, 'with filters:', filters);
      return supabaseService.getSwipeTargets(user.id, user.role, filters);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Update local state when targets change
  useEffect(() => {
    setSwipeState(prev => ({
      ...prev,
      targets,
      isLoading: targetsLoading,
      error: targetsError?.message,
    }));
  }, [targets, targetsLoading, targetsError]);

  // Create swipe mutation
  const createSwipeMutation = useMutation({
    mutationFn: async ({ targetId, targetType, direction }: {
      targetId: string;
      targetType: TargetType;
      direction: SwipeDirection;
    }) => {
      if (!user) throw new Error('User not authenticated');
      return supabaseService.createSwipe(user.id, targetId, targetType, direction);
    },
    onSuccess: (_, variables) => {
      // Simulate match with 30% probability for likes
      if (variables.direction === 'like' && Math.random() > 0.7) {
        const currentTarget = swipeState.targets[swipeState.currentIndex];
        if (currentTarget) {
          setMatchState({
            showModal: true,
            matchData: currentTarget,
          });
        }
      }

      // Show success toast
      toast({
        title: variables.direction === 'like' ? "Лайк отправлен!" : "Пропущено",
        description: variables.direction === 'like' 
          ? "Возможно, у вас будет мэтч!" 
          : "Переходим к следующей карточке",
      });

      // Move to next card
      setSwipeState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }));

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['swipe-targets'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: (error) => {
      console.error('Swipe error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить действие. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
  });

  // Handle swipe action
  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    const currentTarget = swipeState.targets[swipeState.currentIndex];
    if (!currentTarget || !user) return;

    const swipeDirection: SwipeDirection = direction === 'right' ? 'like' : 'dislike';
    const targetType: TargetType = user.role === 'seeker' ? 'vacancy' : 'user';

    try {
      await createSwipeMutation.mutateAsync({
        targetId: currentTarget.id,
        targetType,
        direction: swipeDirection,
      });
    } catch (error) {
      console.error('Failed to create swipe:', error);
    }
  }, [swipeState.targets, swipeState.currentIndex, user, createSwipeMutation]);

  // Close match modal
  const closeMatchModal = useCallback(() => {
    setMatchState({
      showModal: false,
      matchData: null,
    });
  }, []);

  // Reset to first card
  const resetSwipe = useCallback(() => {
    setSwipeState(prev => ({
      ...prev,
      currentIndex: 0,
    }));
    refetchTargets();
  }, [refetchTargets]);

  // Get current target
  const currentTarget = swipeState.targets[swipeState.currentIndex] || null;
  const remainingCount = Math.max(0, swipeState.targets.length - swipeState.currentIndex);
  const hasMore = swipeState.currentIndex < swipeState.targets.length;

  return {
    // State
    currentTarget,
    remainingCount,
    hasMore,
    isLoading: swipeState.isLoading || createSwipeMutation.isPending,
    error: swipeState.error,
    
    // Match modal state
    showMatchModal: matchState.showModal,
    matchData: matchState.matchData,
    
    // Actions
    handleSwipe,
    closeMatchModal,
    resetSwipe,
    refetchTargets,
    
    // Additional helpers
    isVacancy: user?.role === 'seeker',
    targets: swipeState.targets,
    currentIndex: swipeState.currentIndex,
  };
};
