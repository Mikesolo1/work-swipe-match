
import React, { useState, useMemo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSwipeTargets, useSwipe } from '@/hooks/useSwipe';
import BottomNav from '@/components/BottomNav';
import MatchModal from '@/components/MatchModal';
import TinderCard from '@/components/TinderCard';
import { useNavigate } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';

type Vacancy = Tables<'vacancies'> & {
  employer?: Tables<'users'>;
};

type UserProfile = Tables<'users'>;

const Swipe = () => {
  const { user } = useAuth();
  const { data: targets, isLoading } = useSwipeTargets();
  const { createSwipe } = useSwipe();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchData, setMatchData] = useState(null);
  
  const currentIndexRef = useRef(currentIndex);
  const childRefs = useMemo(
    () =>
      Array(targets?.length || 0)
        .fill(0)
        .map((i) => React.createRef()),
    [targets?.length]
  );

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canGoBack = currentIndex < (targets?.length || 0) - 1;
  const canSwipe = currentIndex >= 0;

  const swiped = async (direction: 'left' | 'right', index: number) => {
    if (!targets || !targets[index] || !user) return;

    const target = targets[index];
    const swipeDirection = direction === 'right' ? 'like' : 'dislike';
    
    try {
      await createSwipe.mutateAsync({
        target_id: target.id,
        target_type: user.role === 'seeker' ? 'vacancy' : 'user',
        direction: swipeDirection
      });

      // Симуляция мэтча
      if (direction === 'right' && Math.random() > 0.7) {
        setMatchData(target);
        setShowMatch(true);
      }
    } catch (error) {
      console.error('Error creating swipe:', error);
    }

    updateCurrentIndex(index - 1);
  };

  const outOfFrame = (name: string, idx: number) => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current);
    if (currentIndexRef.current >= idx) {
      childRefs[idx].current?.restoreCard?.();
    }
  };

  const swipe = async (dir: 'left' | 'right') => {
    if (canSwipe && currentIndex < (targets?.length || 0)) {
      await childRefs[currentIndex].current?.swipe(dir);
    }
  };

  const goBack = async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    await childRefs[newIndex].current?.restoreCard();
  };

  const handleCreateVacancy = () => {
    navigate('/create-vacancy');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!targets || targets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center pb-20">
        <div className="text-center p-6 max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Пока всё!
          </h2>
          <p className="text-gray-600 mb-6">
            {user?.role === 'employer' 
              ? 'Вы просмотрели всех доступных кандидатов. Скоро появятся новые!'
              : 'Вы просмотрели все доступные вакансии. Скоро появятся новые!'
            }
          </p>
          {user?.role === 'employer' && (
            <Button 
              onClick={handleCreateVacancy}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="mr-2" size={16} />
              Создать вакансию
            </Button>
          )}
        </div>
        <BottomNav activeTab="swipe" />
      </div>
    );
  }

  const isVacancy = user?.role === 'seeker';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="p-4 max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Мэтчворк</h1>
          <p className="text-gray-600">
            {Math.max(0, (targets?.length || 0) - currentIndex)} карточек осталось
          </p>
          {user?.role === 'employer' && (
            <Button 
              variant="outline" 
              onClick={handleCreateVacancy}
              className="mt-2"
              size="sm"
            >
              <Plus className="mr-1" size={14} />
              Создать вакансию
            </Button>
          )}
        </motion.div>

        <div className="relative h-[500px] mb-6">
          <div className="card-container">
            {targets.map((target, index) => (
              <TinderCard
                ref={childRefs[index]}
                className="swipe"
                key={target.id}
                target={target}
                isVacancy={isVacancy}
                onSwipe={(dir) => swiped(dir, index)}
                preventSwipe={['up', 'down']}
              />
            )).reverse()}
          </div>
        </div>

        <div className="flex justify-center gap-6">
          <Button
            onClick={() => swipe('left')}
            variant="outline"
            size="lg"
            className="w-16 h-16 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300"
            disabled={!canSwipe}
          >
            <X className="text-red-500" size={24} />
          </Button>
          <Button
            onClick={() => swipe('right')}
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
            disabled={!canSwipe}
          >
            <Heart className="text-white" size={24} />
          </Button>
        </div>

        {canGoBack && (
          <div className="flex justify-center mt-4">
            <Button onClick={goBack} variant="outline" size="sm">
              Отменить
            </Button>
          </div>
        )}
      </div>

      <BottomNav activeTab="swipe" />
      
      <MatchModal 
        isOpen={showMatch}
        matchData={matchData}
        onClose={() => setShowMatch(false)}
      />

      <style jsx>{`
        .card-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .swipe {
          position: absolute !important;
        }
      `}</style>
    </div>
  );
};

export default Swipe;
