import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Clock, Star, Users, Heart } from 'lucide-react';

interface MatchesGuideStepProps {
  userRole: 'seeker' | 'employer' | null;
}

const MatchesGuideStep: React.FC<MatchesGuideStepProps> = ({ userRole }) => {
  const features = [
    {
      icon: <Users className="w-5 h-5 text-blue-500" />,
      title: 'Взаимная симпатия',
      description: 'Видите только тех, кто тоже поставил вам лайк'
    },
    {
      icon: <Clock className="w-5 h-5 text-orange-500" />,
      title: '24 часа на общение',
      description: 'У вас есть сутки, чтобы начать диалог'
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-green-500" />,
      title: 'Переход в Telegram',
      description: 'Общайтесь удобно через Telegram'
    }
  ];

  return (
    <div>
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Раздел матчей
        </h3>
        <p className="text-gray-600">
          Здесь собраны все ваши взаимные симпатии
        </p>
      </div>

      {/* Визуализация матча */}
      <div className="mb-6">
        <div className="relative">
          <div className="flex items-center justify-center space-x-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Heart className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="text-yellow-400"
            >
              <Star className="w-6 h-6" />
            </motion.div>
            
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 1 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Users className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          
          <div className="text-center mt-3">
            <span className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Это матч! 🎉
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100"
          >
            <div className="flex-shrink-0 mt-1">
              {feature.icon}
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{feature.title}</h4>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100 text-center"
      >
        <h4 className="font-semibold text-pink-800 mb-2">🚀 Готовы начать?</h4>
        <p className="text-sm text-pink-700">
          {userRole === 'employer' 
            ? 'Создайте первую вакансию и начните поиск талантов!'
            : 'Заполните профиль и найдите работу мечты!'
          }
        </p>
      </motion.div>
    </div>
  );
};

export default MatchesGuideStep;
