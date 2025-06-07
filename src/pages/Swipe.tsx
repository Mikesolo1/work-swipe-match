
import React, { useState } from 'react';
import SwipeCard from '@/components/SwipeCard';
import MatchModal from '@/components/MatchModal';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';

const Swipe = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchData, setMatchData] = useState(null);

  // Mock data - в реальном приложении будет загружаться с сервера
  const mockCards = [
    {
      id: 1,
      type: 'vacancy',
      title: 'Frontend Developer',
      description: 'Ищем талантливого React разработчика в дружную команду',
      salary: '150000-200000',
      company: 'TechCorp',
      teamLead: {
        name: 'Анна Иванова',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=400&h=400&fit=crop&crop=face'
      }
    },
    {
      id: 2,
      type: 'user',
      name: 'Михаил Петров',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      city: 'Санкт-Петербург',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: 'Frontend разработчик с опытом 3 года',
      achievement: 'Создал веб-приложение, которым пользуется 100K+ пользователей',
      salary_expectation: 180000
    },
    {
      id: 3,
      type: 'vacancy',
      title: 'Backend Developer',
      description: 'Требуется опытный backend разработчик для работы с микросервисами',
      salary: '180000-250000',
      company: 'StartupHub',
      teamLead: {
        name: 'Дмитрий Сидоров',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
      }
    }
  ];

  const handleSwipe = (direction: 'like' | 'dislike') => {
    console.log(`Swiped ${direction} on card ${currentCardIndex}`);
    
    // Симуляция мэтча (в реальности проверяется на сервере)
    if (direction === 'like' && Math.random() > 0.7) {
      setMatchData(mockCards[currentCardIndex]);
      setShowMatch(true);
    }

    // Переход к следующей карточке
    setTimeout(() => {
      setCurrentCardIndex(prev => prev + 1);
    }, 300);
  };

  const handleMatchClose = () => {
    setShowMatch(false);
    setMatchData(null);
  };

  if (currentCardIndex >= mockCards.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center pb-20">
        <div className="text-center p-6">
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
            Вы просмотрели все доступные карточки. Скоро появятся новые!
          </p>
        </div>
        <BottomNav activeTab="swipe" />
      </div>
    );
  }

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
            {mockCards.length - currentCardIndex} карточек осталось
          </p>
        </motion.div>

        <div className="relative h-[500px] mb-6">
          <AnimatePresence>
            {mockCards.slice(currentCardIndex, currentCardIndex + 2).map((card, index) => (
              <SwipeCard
                key={card.id}
                card={card}
                onSwipe={index === 0 ? handleSwipe : undefined}
                style={{
                  zIndex: 2 - index,
                  scale: 1 - index * 0.05,
                  opacity: 1 - index * 0.3
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <BottomNav activeTab="swipe" />
      
      <MatchModal 
        isOpen={showMatch}
        matchData={matchData}
        onClose={handleMatchClose}
      />
    </div>
  );
};

export default Swipe;
