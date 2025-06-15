import React, { useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSwipeOptimized } from '@/hooks/useSwipeOptimized';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import MatchModal from '@/components/MatchModal';
import TinderCardWrapper, { TinderCardRef } from '@/components/TinderCard';
import SwipeHeader from '@/components/SwipeHeader';
import SwipeCardContent from '@/components/SwipeCardContent';
import SwipeActions from '@/components/SwipeActions';
import NoMoreCards from '@/components/NoMoreCards';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import NetworkStatus from '@/components/NetworkStatus';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import { useSwipeFilters } from '@/hooks/useSwipeFilters';
import type { SwipeFilters } from '@/types/filters';

const Swipe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cardRefs = useRef<(TinderCardRef | null)[]>([]);
  const { showOnboarding, completeOnboarding } = useOnboarding();
  
  // Используем новый хук для фильтров
  const {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFiltersCount,
    availableCities,
    popularSkills,
  } = useSwipeFilters({ userRole: user?.role });
  
  // Передаем фильтры в useSwipeOptimized
  const {
    currentTarget,
    remainingCount,
    hasMore,
    isLoading,
    error,
    showMatchModal,
    matchData,
    handleSwipe,
    closeMatchModal,
    refetchTargets,
    isVacancy,
    targets,
    currentIndex,
  } = useSwipeOptimized({ filters });

  console.log('Swipe component - user:', user, 'currentTarget:', currentTarget, 'loading:', isLoading, 'error:', error, 'filters:', filters);

  const handleCardSwipe = async (direction: string) => {
    console.log('Card swiped:', direction);
    await handleSwipe(direction as 'left' | 'right');
  };

  const handleButtonSwipe = (direction: 'like' | 'dislike') => {
    const cardRef = cardRefs.current[currentIndex];
    if (cardRef) {
      cardRef.swipe(direction === 'like' ? 'right' : 'left');
    }
  };

  const handleCreateVacancy = () => {
    navigate('/create-vacancy');
  };

  const handleManageVacancies = () => {
    navigate('/vacancy-management');
  };

  const handleRetry = () => {
    refetchTargets();
  };

  const handleFiltersChange = (newFilters: SwipeFilters) => {
    console.log('Filters changed:', newFilters);
    updateFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen matchwork-gradient-bg flex items-center justify-center">
        <LoadingSpinner size="lg" text="Загружаем карточки..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen matchwork-gradient-bg flex items-center justify-center">
        <EmptyState
          icon="❌"
          title="Ошибка загрузки"
          description={error}
          actionText="Попробовать снова"
          onAction={handleRetry}
        />
      </div>
    );
  }

  if (!hasMore) {
    return (
      <div className="min-h-screen matchwork-gradient-bg flex items-center justify-center pb-20">
        <NoMoreCards 
          userRole={user?.role}
          onCreateVacancy={handleCreateVacancy}
          onManageVacancies={handleManageVacancies}
        />
        <BottomNav activeTab="swipe" />
      </div>
    );
  }

  return (
    <>
      <NetworkStatus />
      <div className="min-h-screen matchwork-gradient-bg pb-20 overflow-hidden">
        <div className="p-4 max-w-md mx-auto h-screen flex flex-col">
          <SwipeHeader 
            remainingCount={remainingCount}
            userRole={user?.role}
            onCreateVacancy={handleCreateVacancy}
            onManageVacancies={handleManageVacancies}
            onFiltersChange={handleFiltersChange}
            currentFilters={filters}
            availableCities={availableCities}
            popularSkills={popularSkills}
          />

          {/* Cards Stack */}
          <div className="relative flex-1 mb-6">
            <AnimatePresence>
              {targets.slice(currentIndex, currentIndex + 3).map((target, index) => {
                const actualIndex = currentIndex + index;
                return (
                  <TinderCardWrapper
                    key={target.id}
                    ref={el => cardRefs.current[actualIndex] = el}
                    onSwipe={handleCardSwipe}
                    onCardLeftScreen={() => {
                      // Card has left screen, no additional action needed
                      // as the swipe is already handled in handleCardSwipe
                    }}
                    preventSwipe={actualIndex !== currentIndex ? ['up', 'down', 'left', 'right'] : ['up', 'down']}
                  >
                    <Card className="h-full matchwork-card overflow-hidden shadow-xl border-0" style={{ zIndex: 10 - index }}>
                      <SwipeCardContent target={target} isVacancy={isVacancy} />
                    </Card>
                  </TinderCardWrapper>
                );
              })}
            </AnimatePresence>
          </div>

          <SwipeActions 
            onLike={() => handleButtonSwipe('like')}
            onDislike={() => handleButtonSwipe('dislike')}
          />
        </div>

        <BottomNav activeTab="swipe" />
        
        <MatchModal 
          isOpen={showMatchModal}
          matchData={matchData}
          onClose={closeMatchModal}
        />

        <OnboardingModal
          isOpen={showOnboarding}
          onClose={completeOnboarding}
          userRole={user?.role || null}
        />
      </div>
    </>
  );
};

export default Swipe;
