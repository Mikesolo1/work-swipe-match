
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, DollarSign, User, Building2, Heart, X, Plus, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSwipeTargets, useSwipe } from '@/hooks/useSwipe';
import BottomNav from '@/components/BottomNav';
import MatchModal from '@/components/MatchModal';
import TinderCardWrapper, { TinderCardRef } from '@/components/TinderCard';
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
  const cardRefs = useRef<(TinderCardRef | null)[]>([]);

  const handleSwipe = async (direction: string) => {
    if (!targets || !targets[currentIndex] || !user) return;

    const target = targets[currentIndex];
    const swipeDirection = direction === 'right' ? 'like' : 'dislike';
    
    try {
      await createSwipe.mutateAsync({
        target_id: target.id,
        target_type: user.role === 'seeker' ? 'vacancy' : 'user',
        direction: swipeDirection
      });

      // Симуляция мэтча (в реальности проверяется триггером в БД)
      if (swipeDirection === 'like' && Math.random() > 0.7) {
        setMatchData(target);
        setShowMatch(true);
      }

      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);
    } catch (error) {
      console.error('Error creating swipe:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!targets || targets.length === 0 || currentIndex >= targets.length) {
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
            <div className="space-y-3">
              <Button 
                onClick={handleCreateVacancy}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="mr-2" size={16} />
                Создать вакансию
              </Button>
              <Button 
                onClick={handleManageVacancies}
                variant="outline"
                className="w-full"
              >
                <Settings className="mr-2" size={16} />
                Управление вакансиями
              </Button>
            </div>
          )}
        </div>
        <BottomNav activeTab="swipe" />
      </div>
    );
  }

  const currentTarget = targets[currentIndex];
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
            {targets.length - currentIndex} карточек осталось
          </p>
          {user?.role === 'employer' && (
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                onClick={handleCreateVacancy}
                size="sm"
                className="flex-1"
              >
                <Plus className="mr-1" size={14} />
                Создать вакансию
              </Button>
              <Button 
                variant="outline" 
                onClick={handleManageVacancies}
                size="sm"
                className="flex-1"
              >
                <Settings className="mr-1" size={14} />
                Управление
              </Button>
            </div>
          )}
        </motion.div>

        <div className="relative h-[500px] mb-6">
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
                <Card className="h-full bg-white shadow-lg" style={{ zIndex: 10 - index }}>
                  {isVacancy ? (
                    // Карточка вакансии для соискателя
                    <>
                      <CardHeader className="text-center pb-4">
                        <div className="flex items-center justify-center mb-4">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center">
                            <Building2 className="text-white" size={24} />
                          </div>
                        </div>
                        <CardTitle className="text-xl mb-2">{(target as Vacancy).title}</CardTitle>
                        {(target as Vacancy).employer?.company && (
                          <p className="text-gray-600">{(target as Vacancy).employer?.company}</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4 overflow-y-auto">
                        <p className="text-gray-700">{(target as Vacancy).description}</p>
                        
                        {((target as Vacancy).salary_min || (target as Vacancy).salary_max) && (
                          <div className="flex items-center gap-2 text-green-600">
                            <DollarSign size={16} />
                            <span className="font-medium">
                              {(target as Vacancy).salary_min && (target as Vacancy).salary_max 
                                ? `${(target as Vacancy).salary_min?.toLocaleString()} - ${(target as Vacancy).salary_max?.toLocaleString()} ₽`
                                : (target as Vacancy).salary_min 
                                  ? `от ${(target as Vacancy).salary_min?.toLocaleString()} ₽`
                                  : `до ${(target as Vacancy).salary_max?.toLocaleString()} ₽`
                              }
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={16} />
                          <span>{target.city}</span>
                        </div>

                        {(target as Vacancy).skills_required && (target as Vacancy).skills_required.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Требуемые навыки:</p>
                            <div className="flex flex-wrap gap-2">
                              {(target as Vacancy).skills_required.map((skill, index) => (
                                <Badge key={index} variant="secondary">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {(target as Vacancy).team_lead_name && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={(target as Vacancy).team_lead_avatar} />
                              <AvatarFallback>{(target as Vacancy).team_lead_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{(target as Vacancy).team_lead_name}</p>
                              <p className="text-xs text-gray-500">Тимлид</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </>
                  ) : (
                    // Карточка кандидата для работодателя
                    <>
                      <CardHeader className="text-center pb-4">
                        <Avatar className="w-20 h-20 mx-auto mb-4">
                          <AvatarImage src={(target as UserProfile).avatar_url} />
                          <AvatarFallback>
                            <User className="w-8 h-8" />
                          </AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-xl">
                          {(target as UserProfile).first_name} {(target as UserProfile).last_name}
                        </CardTitle>
                        {(target as UserProfile).username && (
                          <p className="text-gray-500">@{(target as UserProfile).username}</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4 overflow-y-auto">
                        {(target as UserProfile).city && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={16} />
                            <span>{(target as UserProfile).city}</span>
                          </div>
                        )}

                        {(target as UserProfile).salary_expectation && (
                          <div className="flex items-center gap-2 text-green-600">
                            <DollarSign size={16} />
                            <span className="font-medium">от {(target as UserProfile).salary_expectation.toLocaleString()} ₽</span>
                          </div>
                        )}

                        {(target as UserProfile).experience && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Опыт работы:</p>
                            <p className="text-gray-600">{(target as UserProfile).experience}</p>
                          </div>
                        )}

                        {(target as UserProfile).achievement && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Главное достижение:</p>
                            <p className="text-gray-600">{(target as UserProfile).achievement}</p>
                          </div>
                        )}

                        {(target as UserProfile).skills && (target as UserProfile).skills.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Навыки:</p>
                            <div className="flex flex-wrap gap-2">
                              {(target as UserProfile).skills.map((skill, index) => (
                                <Badge key={index} variant="secondary">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </>
                  )}
                </Card>
              </TinderCardWrapper>
            );
          })}
        </div>

        <div className="flex justify-center gap-6">
          <Button
            onClick={() => handleButtonSwipe('dislike')}
            variant="outline"
            size="lg"
            className="w-16 h-16 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <X className="text-red-500" size={24} />
          </Button>
          <Button
            onClick={() => handleButtonSwipe('like')}
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
          >
            <Heart className="text-white" size={24} />
          </Button>
        </div>
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
