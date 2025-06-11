
import React, { useRef } from 'react';
import { Card } from "@/components/ui/card";
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSwipeOptimized } from '@/hooks/useSwipeOptimized';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import MatchModal from '@/components/MatchModal';
import TinderCardWrapper, { TinderCardRef } from '@/components/TinderCard';
import SwipeHeader from '@/components/SwipeHeader';
import SwipeCardContent from '@/components/SwipeCardContent';
import SwipeActions from '@/components/SwipeActions';
import NoMoreCards from '@/components/NoMoreCards';

const Swipe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cardRefs = useRef<(TinderCardRef | null)[]>([]);
  
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
  } = useSwipeOptimized();

  console.log('Swipe component - user:', user, 'currentTarget:', currentTarget, 'loading:', isLoading, 'error:', error);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-matchwork-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 matchwork-gradient-primary rounded-2xl flex items-center justify-center matchwork-pulse">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
          <p className="matchwork-text font-medium">Загружаем карточки...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-matchwork-background flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-2xl flex items-center justify-center">
            <X className="text-red-500" size={24} />
          </div>
          <h2 className="matchwork-subheading text-red-600 mb-2">Ошибка загрузки</h2>
          <p className="matchwork-text">{error}</p>
          <button 
            onClick={handleRetry}
            className="mt-4 matchwork-button-primary"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!hasMore) {
    return (
      <div className="min-h-screen bg-matchwork-background flex items-center justify-center pb-20">
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
    <div className="min-h-screen bg-matchwork-background pb-20 overflow-hidden">
      <div className="p-4 max-w-md mx-auto h-screen flex flex-col">
        <SwipeHeader 
          remainingCount={remainingCount}
          userRole={user?.role}
          onCreateVacancy={handleCreateVacancy}
          onManageVacancies={handleManageVacancies}
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
                  <Card className="h-full matchwork-card overflow-hidden" style={{ zIndex: 10 - index }}>
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
    </div>
  );
};

export default Swipe;
