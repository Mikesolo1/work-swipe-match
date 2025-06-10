import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, DollarSign, User, Building2, Heart, X, Plus, Settings, Link, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSwipeTargets, useSwipe } from '@/hooks/useSwipe';
import BottomNav from '@/components/BottomNav';
import MatchModal from '@/components/MatchModal';
import TinderCardWrapper, { TinderCardRef } from '@/components/TinderCard';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import type { Tables } from '@/integrations/supabase/types';

type Vacancy = Tables<'vacancies'> & {
  employer?: Tables<'users'>;
};

type UserProfile = Tables<'users'>;

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

      // Симуляция мэтча (в реальности проверяется триггером в БД)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20 overflow-hidden">
      <div className="p-4 max-w-md mx-auto h-screen flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 flex-shrink-0"
        >
          <h1 className="text-xl font-bold text-gray-800 mb-1">Мэтчворк</h1>
          <p className="text-sm text-gray-600">
            {targets.length - currentIndex} карточек осталось
          </p>
          {user?.role === 'employer' && (
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                onClick={handleCreateVacancy}
                size="sm"
                className="flex-1 text-xs"
              >
                <Plus className="mr-1" size={12} />
                Создать
              </Button>
              <Button 
                variant="outline" 
                onClick={handleManageVacancies}
                size="sm"
                className="flex-1 text-xs"
              >
                <Settings className="mr-1" size={12} />
                Управление
              </Button>
            </div>
          )}
        </motion.div>

        <div className="relative flex-1 mb-4">
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
                  <Card className="h-full bg-white shadow-lg overflow-hidden" style={{ zIndex: 10 - index }}>
                    {isVacancy ? (
                      // Карточка вакансии для соискателя - компактная версия
                      <>
                        <CardHeader className="text-center pb-3">
                          <div className="flex items-center justify-center mb-3">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center">
                              <Building2 className="text-white" size={20} />
                            </div>
                          </div>
                          <CardTitle className="text-lg mb-1 leading-tight">{(target as Vacancy).title}</CardTitle>
                          {(target as Vacancy).employer?.company && (
                            <p className="text-sm text-gray-600">{(target as Vacancy).employer?.company}</p>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3 overflow-y-auto">
                          <p className="text-sm text-gray-700 line-clamp-3">{(target as Vacancy).description}</p>
                          
                          {((target as Vacancy).salary_min || (target as Vacancy).salary_max) && (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                              <DollarSign size={14} />
                              <span className="font-medium text-sm">
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
                            <MapPin size={14} />
                            <span className="text-sm">{target.city}</span>
                          </div>

                          {(target as Vacancy).skills_required && (target as Vacancy).skills_required.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-2">Требуемые навыки:</p>
                              <div className="flex flex-wrap gap-1">
                                {(target as Vacancy).skills_required.slice(0, 6).map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs px-2 py-1">{skill}</Badge>
                                ))}
                                {(target as Vacancy).skills_required.length > 6 && (
                                  <Badge variant="secondary" className="text-xs px-2 py-1">+{(target as Vacancy).skills_required.length - 6}</Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {(target as Vacancy).team_lead_name && (
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={(target as Vacancy).team_lead_avatar} />
                                <AvatarFallback className="text-xs">{(target as Vacancy).team_lead_name?.[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium">{(target as Vacancy).team_lead_name}</p>
                                <p className="text-xs text-gray-500">Тимлид</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </>
                    ) : (
                      // Карточка кандидата для работодателя - компактная версия
                      <>
                        <CardHeader className="text-center pb-3">
                          <Avatar className="w-16 h-16 mx-auto mb-3">
                            <AvatarImage src={(target as UserProfile).avatar_url} />
                            <AvatarFallback>
                              <User className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                          <CardTitle className="text-lg leading-tight">
                            {(target as UserProfile).first_name} {(target as UserProfile).last_name}
                          </CardTitle>
                          {(target as UserProfile).username && (
                            <p className="text-sm text-gray-500">@{(target as UserProfile).username}</p>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3 overflow-y-auto">
                          <div className="flex items-center justify-between text-sm">
                            {(target as UserProfile).city && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <MapPin size={12} />
                                <span>{(target as UserProfile).city}</span>
                              </div>
                            )}
                            {(target as UserProfile).salary_expectation && (
                              <div className="flex items-center gap-1 text-green-600">
                                <DollarSign size={12} />
                                <span className="font-medium">от {(target as UserProfile).salary_expectation.toLocaleString()} ₽</span>
                              </div>
                            )}
                          </div>

                          {(target as UserProfile).experience && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-1">Опыт работы:</p>
                              <p className="text-sm text-gray-600 line-clamp-2">{(target as UserProfile).experience}</p>
                            </div>
                          )}

                          {(target as UserProfile).achievement && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-1">Главное достижение:</p>
                              <p className="text-sm text-gray-600 line-clamp-2">{(target as UserProfile).achievement}</p>
                            </div>
                          )}

                          {(target as UserProfile).skills && (target as UserProfile).skills.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-2">Навыки:</p>
                              <div className="flex flex-wrap gap-1">
                                {(target as UserProfile).skills.slice(0, 6).map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs px-2 py-1">{skill}</Badge>
                                ))}
                                {(target as UserProfile).skills.length > 6 && (
                                  <Badge variant="secondary" className="text-xs px-2 py-1">+{(target as UserProfile).skills.length - 6}</Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {((target as UserProfile).resume_url || (target as UserProfile).portfolio_url) && (
                            <div className="flex gap-2">
                              {(target as UserProfile).resume_url && (
                                <a href={(target as UserProfile).resume_url} target="_blank" rel="noopener noreferrer" 
                                   className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                  <FileText size={12} />
                                  Резюме
                                </a>
                              )}
                              {(target as UserProfile).portfolio_url && (
                                <a href={(target as UserProfile).portfolio_url} target="_blank" rel="noopener noreferrer"
                                   className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                  <Link size={12} />
                                  Портфолио
                                </a>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </>
                    )}
                  </Card>
                </TinderCardWrapper>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-6 flex-shrink-0">
          <Button
            onClick={() => handleButtonSwipe('dislike')}
            variant="outline"
            size="lg"
            className="w-14 h-14 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <X className="text-red-500" size={20} />
          </Button>
          <Button
            onClick={() => handleButtonSwipe('like')}
            size="lg"
            className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
          >
            <Heart className="text-white" size={20} />
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
