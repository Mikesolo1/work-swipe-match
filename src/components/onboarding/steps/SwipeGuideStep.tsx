
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, X, Eye, ArrowLeft, ArrowRight } from 'lucide-react';

interface SwipeGuideStepProps {
  userRole: 'seeker' | 'employer' | null;
}

const SwipeGuideStep: React.FC<SwipeGuideStepProps> = ({ userRole }) => {
  return (
    <div>
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Как работает поиск
        </h3>
        <p className="text-gray-600">
          {userRole === 'employer' 
            ? 'Просматривайте профили кандидатов и делайте выбор'
            : 'Просматривайте вакансии и находите подходящие'
          }
        </p>
      </div>

      {/* Визуальная демонстрация свайпа */}
      <div className="relative mb-6">
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-6 text-center border-2 border-dashed border-blue-300">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
          <h4 className="font-semibold text-gray-800">
            {userRole === 'employer' ? 'Профиль кандидата' : 'Вакансия'}
          </h4>
        </div>

        {/* Стрелки и действия */}
        <div className="flex justify-between items-center mt-4">
          <motion.div
            animate={{ x: [-10, 0, -10] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center space-x-2 text-red-500"
          >
            <ArrowLeft className="w-5 h-5" />
            <div className="flex items-center space-x-1">
              <X className="w-4 h-4" />
              <span className="text-sm font-medium">Пропустить</span>
            </div>
          </motion.div>

          <motion.div
            animate={{ x: [10, 0, 10] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center space-x-2 text-green-500"
          >
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium">Нравится</span>
              <Heart className="w-4 h-4" />
            </div>
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
          <X className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-medium text-red-800">Свайп влево</p>
            <p className="text-sm text-red-600">Не подходит</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
          <Heart className="w-5 h-5 text-green-500" />
          <div>
            <p className="font-medium text-green-800">Свайп вправо</p>
            <p className="text-sm text-green-600">Нравится! Может быть матч</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100"
      >
        <p className="text-sm text-yellow-700 font-medium">
          ⚡ Совет: Если оба участника поставят лайк - это матч!
        </p>
      </motion.div>
    </div>
  );
};

export default SwipeGuideStep;
