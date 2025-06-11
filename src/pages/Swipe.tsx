
import React, { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSwipeTargets, useSwipe } from '@/hooks/useSwipe';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import BottomNav from '@/components/BottomNav';
import MatchModal from '@/components/MatchModal';
import TinderCardWrapper, { TinderCardRef } from '@/components/TinderCard';
import SwipeHeader from '@/components/SwipeHeader';
import SwipeCardContent from '@/components/SwipeCardContent';
import SwipeActions from '@/components/SwipeActions';
import NoMoreCards from '@/components/NoMoreCards';

const Swipe = () => {
  const { user } = useAuth();
  const { data: targets, isLoading, error } = useSwipeTargets();
  const { createSwipe } = useSwipe();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const cardRefs = useRef<(TinderCardRef | null)[]>([]);

  console.log('Swipe component - user:', user, 'targets:', targets, 'loading:', isLoading, 'error:', error);

  const handleSwipe = async (direction: string) => {
    if (!targets || !targets[currentIndex] || !user) {
      console.log('Cannot swipe - missing data:', { targets: !!targets, currentIndex, user: !!user });
      return;
    }

    const target = targets[currentIndex];
    const swipeDirection = direction === 'right' ? 'like' : 'dislike';
    
    console.log('Handling swipe:', direction, 'on target:', target.id, 'as:', swipeDirection);
    
    try {
      await createSwipe.mutateAsync({
        target_id: target.id,
        target_type: user.role === 'seeker' ? 'vacancy' : 'user',
        direction: swipeDirection
      });

      if (swipeDirection === 'like' && Math.random() > 0.7) {
        console.log('Simulating match for target:', target);
        setMatchData(target);
        setShowMatch(true);
      }

      toast({
        title: swipeDirection === 'like' ? "Лайк отправлен!" : "Пропущено",
        description: swipeDirection === 'like' ? "Возможно, у вас будет мэтч!" : "Переходим к следующей карточке",
      });

      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);
    } catch (error) {
      console.error('Error creating swipe:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить действие. Попробуйте еще раз.",
        variant: "destructive"
      });
    }
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
          <p className="matchwork-text">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!targets || targets.length === 0 || currentIndex >= targets.length) {
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

  const currentTarget = targets[currentIndex];
  const isVacancy = user?.role === 'seeker';

  return (
    <div className="min-h-screen bg-matchwork-background pb-20 overflow-hidden">
      <div className="p-4 max-w-md mx-auto h-screen flex flex-col">
        <SwipeHeader 
          remainingCount={targets.length - currentIndex}
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
                  onSwipe={handleSwipe}
                  onCardLeftScreen={() => {
                    if (actualIndex === currentIndex) {
                      setCurrentIndex(prev => prev + 1);
                    }
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
        isOpen={showMatch}
        matchData={matchData}
        onClose={() => setShowMatch(false)}
      />
    </div>
  );
};

export default Swipe;
