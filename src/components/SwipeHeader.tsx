
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
      className="text-center mb-4 flex-shrink-0"
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="matchwork-gradient-primary w-8 h-8 rounded-lg flex items-center justify-center">
          <Heart className="text-white" size={16} />
        </div>
        <h1 className="matchwork-heading text-xl">Matchwork</h1>
      </div>
      
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-3">
        <Sparkles size={14} />
        <span>{remainingCount} карточек осталось</span>
      </div>

      {userRole === 'employer' && (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onCreateVacancy}
            size="sm"
            className="flex-1 text-xs matchwork-button-secondary"
          >
            <Plus className="mr-1" size={12} />
            Создать
          </Button>
          <Button 
            variant="outline" 
            onClick={onManageVacancies}
            size="sm"
            className="flex-1 text-xs matchwork-button-secondary"
          >
            <Settings className="mr-1" size={12} />
            Управление
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default SwipeHeader;
