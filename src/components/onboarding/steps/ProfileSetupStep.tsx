
import React from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Briefcase, Star } from 'lucide-react';

interface ProfileSetupStepProps {
  userRole: 'seeker' | 'employer' | null;
}

const ProfileSetupStep: React.FC<ProfileSetupStepProps> = ({ userRole }) => {
  const tips = userRole === 'employer' ? [
    {
      icon: <Briefcase className="w-5 h-5 text-blue-500" />,
      title: 'Название компании',
      description: 'Укажите полное название вашей компании'
    },
    {
      icon: <MapPin className="w-5 h-5 text-green-500" />,
      title: 'Местоположение',
      description: 'Выберите город, где находится офис'
    },
    {
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      title: 'О компании',
      description: 'Расскажите, чем занимается ваша компания'
    }
  ] : [
    {
      icon: <User className="w-5 h-5 text-blue-500" />,
      title: 'Опыт работы',
      description: 'Кратко опишите ваш профессиональный опыт'
    },
    {
      icon: <MapPin className="w-5 h-5 text-green-500" />,
      title: 'Город',
      description: 'Укажите, где вы хотите работать'
    },
    {
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      title: 'Навыки',
      description: 'Добавьте ваши ключевые навыки и технологии'
    }
  ];

  return (
    <div>
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Настроим ваш профиль
        </h3>
        <p className="text-gray-600">
          {userRole === 'employer' 
            ? 'Хороший профиль компании привлекает лучших кандидатов'
            : 'Качественный профиль увеличивает шансы найти работу мечты'
          }
        </p>
      </div>

      <div className="space-y-4">
        {tips.map((tip, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="flex-shrink-0 mt-1">
              {tip.icon}
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{tip.title}</h4>
              <p className="text-sm text-gray-600">{tip.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
      >
        <p className="text-sm text-purple-700 font-medium">
          💡 Совет: Заполните профиль на 100% для максимальной эффективности!
        </p>
      </motion.div>
    </div>
  );
};

export default ProfileSetupStep;
