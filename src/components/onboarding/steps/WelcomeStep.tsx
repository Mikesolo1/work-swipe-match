
import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeStepProps {
  userRole: 'seeker' | 'employer' | null;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ userRole }) => {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <img
          src="/lovable-uploads/1723d398-e44c-4a28-a5a7-addc8fd2972d.png"
          alt="Matchwork Маскот"
          className="w-32 h-32 mx-auto rounded-full shadow-lg"
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Привет! Я ваш помощник в Matchwork! 🦊
        </h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {userRole === 'employer' 
            ? 'Я помогу вам найти лучших кандидатов для вашей команды. Создавайте вакансии и находите идеальных сотрудников!'
            : 'Я помогу вам найти работу мечты! Настроим ваш профиль и покажем, как эффективно искать вакансии.'
          }
        </p>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h4 className="font-semibold text-blue-800 mb-2">Что вас ждет:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✨ Настройка профиля</li>
            {userRole === 'employer' && <li>🏢 Создание вакансий</li>}
            <li>💫 Обучение поиску</li>
            <li>❤️ Работа с матчами</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeStep;
