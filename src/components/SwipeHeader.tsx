
import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Plus, Settings, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface SwipeHeaderProps {
  remainingCount: number;
  userRole?: 'employer' | 'seeker';
  onCreateVacancy: () => void;
  onManageVacancies: () => void;
}

const SwipeHeader: React.FC<SwipeHeaderProps> = ({
  remainingCount,
  userRole,
  onCreateVacancy,
  onManageVacancies
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-6 space-y-4"
    >
      <div className="flex items-center justify-center gap-3">
        <div className="matchwork-gradient-primary w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg">
          <Heart className="text-white" size={18} />
        </div>
        <h1 className="matchwork-heading text-2xl">Matchwork</h1>
      </div>
      
      <div className="flex items-center justify-center gap-2 matchwork-text-muted">
        <Sparkles size={16} className="text-matchwork-accent" />
        <span className="font-medium">{remainingCount} карточек осталось</span>
      </div>

      {userRole === 'employer' && (
        <div className="flex gap-3">
          <Button 
            onClick={onCreateVacancy}
            className="flex-1 matchwork-button-secondary text-sm"
          >
            <Plus className="mr-2" size={16} />
            Создать
          </Button>
          <Button 
            onClick={onManageVacancies}
            className="flex-1 matchwork-button-secondary text-sm"
          >
            <Settings className="mr-2" size={16} />
            Управление
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default SwipeHeader;
