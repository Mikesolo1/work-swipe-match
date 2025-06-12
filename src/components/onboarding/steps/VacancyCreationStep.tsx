import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Users, DollarSign } from 'lucide-react';

interface VacancyCreationStepProps {
  userRole: 'seeker' | 'employer' | null;
}

const VacancyCreationStep: React.FC<VacancyCreationStepProps> = ({ userRole }) => {
  const steps = [
    {
      icon: <Plus className="w-5 h-5 text-blue-500" />,
      title: 'Создайте вакансию',
      description: 'Нажмите кнопку "+" на главном экране'
    },
    {
      icon: <Edit className="w-5 h-5 text-green-500" />,
      title: 'Заполните детали',
      description: 'Укажите название, описание и требования'
    },
    {
      icon: <DollarSign className="w-5 h-5 text-yellow-500" />,
      title: 'Укажите зарплату',
      description: 'Добавьте диапазон зарплаты для привлечения кандидатов'
    },
    {
      icon: <Users className="w-5 h-5 text-purple-500" />,
      title: 'Найдите кандидатов',
      description: 'Система покажет подходящих соискателей'
    }
  ];

  return (
    <div>
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Создание вакансий
        </h3>
        <p className="text-gray-600">
          Научимся создавать привлекательные вакансии
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex items-center space-x-4 p-3 rounded-lg border border-gray-100"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              {step.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">{step.title}</h4>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold">
              {index + 1}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100"
      >
        <h4 className="font-semibold text-green-800 mb-2">🎯 Секрет успеха:</h4>
        <p className="text-sm text-green-700">
          Чем подробнее описание вакансии, тем больше подходящих кандидатов вы найдете!
        </p>
      </motion.div>
    </div>
  );
};

export default VacancyCreationStep;
