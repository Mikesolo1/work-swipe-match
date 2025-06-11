
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Heart, User, Clock, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMatchesOptimized } from '@/hooks/useMatchesOptimized';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';

const Matches = () => {
  const { user } = useAuth();
  const { 
    matches, 
    isLoading, 
    error, 
    refetch, 
    getMatchInfo, 
    formatTimeLeft, 
    hasMatches 
  } = useMatchesOptimized();

  const handleTelegramContact = (telegramId: number) => {
    const telegramUrl = `https://t.me/user?id=${telegramId}`;
    window.open(telegramUrl, '_blank');
  };

  const handleRefresh = () => {
    refetch();
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
          <p className="matchwork-text font-medium">Загружаем мэтчи...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-matchwork-background flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-2xl flex items-center justify-center">
            <Sparkles className="text-red-500" size={24} />
          </div>
          <h2 className="matchwork-subheading text-red-600 mb-2">Ошибка загрузки</h2>
          <p className="matchwork-text mb-4">{error}</p>
          <Button onClick={handleRefresh} className="matchwork-button-primary">
            <RefreshCw size={16} className="mr-2" />
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-matchwork-background pb-20">
      <div className="p-4 max-w-md mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="matchwork-gradient-secondary w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="text-white" size={18} />
            </div>
            <h1 className="matchwork-heading text-2xl">Мэтчи</h1>
            <Button
              onClick={handleRefresh}
              className="w-10 h-10 rounded-2xl bg-white/80 hover:bg-white border border-matchwork-border"
              size="sm"
            >
              <RefreshCw size={16} className="text-matchwork-primary" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-2 matchwork-text-muted">
            <Sparkles size={16} className="text-matchwork-accent" />
            <span className="font-medium">{matches.length} взаимных интересов</span>
          </div>
        </motion.div>

        {!hasMatches ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-3xl flex items-center justify-center">
              <span className="text-4xl">💔</span>
            </div>
            <h3 className="matchwork-subheading mb-3">
              Пока нет мэтчей
            </h3>
            <p className="matchwork-text text-balance mb-6">
              Продолжайте свайпать, чтобы найти идеальные совпадения!
            </p>
            <Button 
              onClick={() => window.location.href = '/swipe'}
              className="matchwork-button-primary"
            >
              Начать поиск
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, index) => {
              const matchInfo = getMatchInfo(match);
              if (!matchInfo) return null;

              const { user: otherUser, vacancy, isExpired, timeLeft } = matchInfo;
              const { hours, minutes } = formatTimeLeft(timeLeft);

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`matchwork-card hover:shadow-xl transition-all duration-300 ${isExpired ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16 ring-2 ring-matchwork-primary/20">
                          <AvatarImage src={otherUser?.avatar_url} />
                          <AvatarFallback className="bg-matchwork-primary/10 text-matchwork-primary">
                            {otherUser?.first_name?.[0] || <User className="w-6 h-6" />}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-matchwork-text">
                            {otherUser?.first_name} {otherUser?.last_name}
                          </h3>
                          
                          {user?.role === 'seeker' && otherUser?.company && (
                            <p className="matchwork-text-secondary text-sm font-medium">
                              {otherUser.company}
                            </p>
                          )}
                          
                          {vacancy && (
                            <p className="text-matchwork-primary text-sm font-semibold">
                              Вакансия: {vacancy.title}
                            </p>
                          )}
                          
                          {otherUser?.city && (
                            <p className="matchwork-text-muted text-sm">
                              {otherUser.city}
                            </p>
                          )}
                          
                          <div className="mt-2 flex items-center gap-1">
                            <Clock size={12} className="text-matchwork-text-muted" />
                            {isExpired ? (
                              <p className="text-red-500 text-xs font-medium">
                                Время для связи истекло
                              </p>
                            ) : (
                              <p className="text-matchwork-success text-xs font-medium">
                                Осталось: {hours}ч {minutes}м
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => otherUser?.telegram_id && handleTelegramContact(otherUser.telegram_id)}
                          className={isExpired ? "bg-slate-300" : "matchwork-button-primary"}
                          size="sm"
                          disabled={isExpired || !otherUser?.telegram_id}
                        >
                          <MessageCircle size={16} className="mr-1" />
                          {isExpired ? 'Истекло' : 'Написать'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav activeTab="matches" />
    </div>
  );
};

export default Matches;
