
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Heart, User, Building2 } from 'lucide-react';
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

    // Определяем, кто является другой стороной мэтча
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Heart className="text-red-500" size={24} />
            Мэтчи
          </h1>
          <p className="text-gray-600">
            {matches?.length || 0} взаимных интересов
          </p>
        </motion.div>

        {!matches || matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Пока нет мэтчей
            </h3>
            <p className="text-gray-500">
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
                  <Card className={`hover:shadow-lg transition-all duration-300 ${isExpired ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={otherUser?.avatar_url} />
                          <AvatarFallback>
                            {otherUser?.first_name?.[0] || <User className="w-6 h-6" />}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-800">
                            {otherUser?.first_name} {otherUser?.last_name}
                          </h3>
                          
                          {user?.role === 'seeker' && otherUser?.company && (
                            <p className="text-gray-600 text-sm">
                              {otherUser.company}
                            </p>
                          )}
                          
                          {vacancy && (
                            <p className="text-blue-600 text-sm font-medium">
                              Вакансия: {vacancy.title}
                            </p>
                          )}
                          
                          {otherUser?.city && (
                            <p className="text-gray-500 text-sm">
                              {otherUser.city}
                            </p>
                          )}
                          
                          <div className="mt-1">
                            {isExpired ? (
                              <p className="text-red-500 text-xs">
                                Время для связи истекло
                              </p>
                            ) : (
                              <p className="text-green-600 text-xs">
                                Осталось: {hoursLeft}ч {minutesLeft}м
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => handleTelegramContact(otherUser?.telegram_id)}
                          className="bg-blue-500 hover:bg-blue-600"
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
