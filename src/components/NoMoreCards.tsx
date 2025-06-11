
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface NoMoreCardsProps {
  userRole?: 'employer' | 'seeker';
  onCreateVacancy: () => void;
  onManageVacancies: () => void;
}

const NoMoreCards: React.FC<NoMoreCardsProps> = ({
  userRole,
  onCreateVacancy,
  onManageVacancies
}) => {
  return (
    <div className="text-center p-6 max-w-md">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-6xl mb-4 matchwork-float"
      >
        🎉
      </motion.div>
      <h2 className="matchwork-subheading mb-2">
        Пока всё!
      </h2>
      <p className="matchwork-text mb-6">
        {userRole === 'employer' 
          ? 'Вы просмотрели всех доступных кандидатов. Скоро появятся новые!'
          : 'Вы просмотрели все доступные вакансии. Скоро появятся новые!'
        }
      </p>
      {userRole === 'employer' && (
        <div className="space-y-3">
          <Button 
            onClick={onCreateVacancy}
            className="w-full matchwork-button-primary"
          >
            <Plus className="mr-2" size={16} />
            Создать вакансию
          </Button>
          <Button 
            onClick={onManageVacancies}
            className="w-full matchwork-button-secondary"
          >
            <Settings className="mr-2" size={16} />
            Управление вакансиями
          </Button>
        </div>
      )}
    </div>
  );
};

export default NoMoreCards;
