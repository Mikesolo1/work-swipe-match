
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';

const Matches = () => {
  // Mock data для мэтчей
  const mockMatches = [
    {
      id: 1,
      name: 'Анна Иванова',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=400&h=400&fit=crop&crop=face',
      role: 'Тимлид в TechCorp',
      vacancy: 'Frontend Developer',
      telegram_id: 123456789,
      timestamp: '2 часа назад'
    },
    {
      id: 2,
      name: 'Михаил Петров',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      role: 'Frontend Developer',
      city: 'Санкт-Петербург',
      telegram_id: 987654321,
      timestamp: '1 день назад'
    },
    {
      id: 3,
      name: 'Дмитрий Сидоров',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      role: 'Тимлид в StartupHub',
      vacancy: 'Backend Developer',
      telegram_id: 456789123,
      timestamp: '3 дня назад'
    }
  ];

  const handleTelegramContact = (telegramId: number) => {
    const telegramUrl = `https://t.me/user?id=${telegramId}`;
    window.open(telegramUrl, '_blank');
  };

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
            {mockMatches.length} взаимных интересов
          </p>
        </motion.div>

        {mockMatches.length === 0 ? (
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
            {mockMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={match.avatar} />
                        <AvatarFallback>{match.name[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800">
                          {match.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {match.role}
                        </p>
                        {match.vacancy && (
                          <p className="text-blue-600 text-sm font-medium">
                            Вакансия: {match.vacancy}
                          </p>
                        )}
                        {match.city && (
                          <p className="text-gray-500 text-sm">
                            {match.city}
                          </p>
                        )}
                        <p className="text-gray-400 text-xs mt-1">
                          {match.timestamp}
                        </p>
                      </div>
                      
                      <Button
                        onClick={() => handleTelegramContact(match.telegram_id)}
                        className="bg-blue-500 hover:bg-blue-600"
                        size="sm"
                      >
                        <MessageCircle size={16} className="mr-1" />
                        Написать
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav activeTab="matches" />
    </div>
  );
};

export default Matches;
