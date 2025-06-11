
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Heart, User, Building2, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMatches } from '@/hooks/useMatches';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';

const Matches = () => {
  const { user } = useAuth();
  const { data: matches, isLoading } = useMatches();

  const handleTelegramContact = (telegramId: number) => {
    const telegramUrl = `https://t.me/user?id=${telegramId}`;
    window.open(telegramUrl, '_blank');
  };

  const getMatchInfo = (match: any) => {
    if (!user) return null;

    const otherParticipant = match.participant_a === user.id 
      ? match.participant_b_user 
      : match.participant_a_user;

    return {
      user: otherParticipant,
      vacancy: match.vacancy,
      isExpired: new Date(match.expires_at) < new Date()
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen matchwork-gradient-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 matchwork-gradient-primary rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
          <p className="text-slate-600 font-medium">Загружаем мэтчи...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen matchwork-gradient-bg pb-20">
      <div className="p-4 max-w-md mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="matchwork-gradient-secondary w-8 h-8 rounded-lg flex items-center justify-center">
              <Heart className="text-white" size={16} />
            </div>
            <h1 className="matchwork-heading text-2xl">Мэтчи</h1>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Sparkles size={14} />
            <span>{matches?.length || 0} взаимных интересов</span>
          </div>
        </motion.div>

        {!matches || matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">💔</span>
            </div>
            <h3 className="matchwork-subheading mb-2">
              Пока нет мэтчей
            </h3>
            <p className="matchwork-text">
              Продолжайте свайпать, чтобы найти идеальные совпадения!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, index) => {
              const matchInfo = getMatchInfo(match);
              if (!matchInfo) return null;

              const { user: otherUser, vacancy, isExpired } = matchInfo;
              const timeLeft = new Date(match.expires_at).getTime() - new Date().getTime();
              const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
              const minutesLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));

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
                        <Avatar className="w-16 h-16 ring-2 ring-indigo-100">
                          <AvatarImage src={otherUser?.avatar_url} />
                          <AvatarFallback className="bg-indigo-100 text-indigo-600">
                            {otherUser?.first_name?.[0] || <User className="w-6 h-6" />}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-slate-800">
                            {otherUser?.first_name} {otherUser?.last_name}
                          </h3>
                          
                          {user?.role === 'seeker' && otherUser?.company && (
                            <p className="text-slate-600 text-sm font-medium">
                              {otherUser.company}
                            </p>
                          )}
                          
                          {vacancy && (
                            <p className="text-indigo-600 text-sm font-semibold">
                              Вакансия: {vacancy.title}
                            </p>
                          )}
                          
                          {otherUser?.city && (
                            <p className="text-slate-500 text-sm">
                              {otherUser.city}
                            </p>
                          )}
                          
                          <div className="mt-2 flex items-center gap-1">
                            <Clock size={12} />
                            {isExpired ? (
                              <p className="text-red-500 text-xs font-medium">
                                Время для связи истекло
                              </p>
                            ) : (
                              <p className="text-green-600 text-xs font-medium">
                                Осталось: {hoursLeft}ч {minutesLeft}м
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => handleTelegramContact(otherUser?.telegram_id)}
                          className={isExpired ? "bg-slate-300" : "matchwork-button-primary"}
                          size="sm"
                          disabled={isExpired}
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
