
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Heart, User, Clock, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMatchesOptimized } from '@/hooks/useMatchesOptimized';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import NetworkStatus from '@/components/NetworkStatus';

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

  const handleStartSwipe = () => {
    window.location.href = '/swipe';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-matchwork-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Загружаем мэтчи..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-matchwork-background flex items-center justify-center">
        <EmptyState
          icon="❌"
          title="Ошибка загрузки"
          description={error}
          actionText="Попробовать снова"
          onAction={handleRefresh}
        />
      </div>
    );
  }

  return (
    <>
      <NetworkStatus />
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
            <EmptyState
              icon="💔"
              title="Пока нет мэтчей"
              description="Продолжайте свайпать, чтобы найти идеальные совпадения!"
              actionText="Начать поиск"
              onAction={handleStartSwipe}
            />
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
    </>
  );
};

export default Matches;
