
import { useQuery } from '@tanstack/react-query';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from './useAuth';
import { useEffect } from 'react';
import type { Match } from '@/types/entities';

export const useMatchesOptimized = () => {
  const { user } = useAuth();

  const {
    data: matches = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['matches', user?.id],
    queryFn: async (): Promise<Match[]> => {
      if (!user) return [];
      return supabaseService.getUserMatches(user.id);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 30, // Refetch every 30 seconds to update time left
  });

  // Set up real-time subscription for new matches
  useEffect(() => {
    if (!user) return;

    const unsubscribe = supabaseService.subscribeToMatches(user.id, (payload) => {
      console.log('New match received:', payload);
      refetch(); // Refetch matches when new match is created
    });

    return () => {
      unsubscribe();
    };
  }, [user, refetch]);

  // Helper to get match info for current user
  const getMatchInfo = (match: Match) => {
    if (!user) return null;

    const otherParticipant = match.participant_a === user.id 
      ? match.participant_b_user 
      : match.participant_a_user;

    return {
      user: otherParticipant,
      vacancy: match.vacancy,
      isExpired: match.isExpired || false,
      timeLeft: match.timeLeft || 0,
    };
  };

  // Helper to format time left
  const formatTimeLeft = (timeLeft: number) => {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  return {
    matches,
    isLoading,
    error: error?.message,
    refetch,
    getMatchInfo,
    formatTimeLeft,
    hasMatches: matches.length > 0,
  };
};
