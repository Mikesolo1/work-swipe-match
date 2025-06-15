
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Settings, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/hooks/useOnboarding';
import SwipeFilters from './SwipeFilters';

interface SwipeHeaderProps {
  remainingCount: number;
  userRole?: string;
  onCreateVacancy: () => void;
  onManageVacancies: () => void;
  onFiltersChange?: (filters: any) => void;
  currentFilters?: any;
}

const SwipeHeader: React.FC<SwipeHeaderProps> = ({
  remainingCount,
  userRole,
  onCreateVacancy,
  onManageVacancies,
  onFiltersChange,
  currentFilters
}) => {
  const { startOnboarding } = useOnboarding();

  const handleFiltersChange = (filters: any) => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      <div>
        <h1 className="matchwork-heading text-2xl">Поиск</h1>
        <p className="matchwork-text-muted">
          {remainingCount > 0 ? `Осталось ${remainingCount}` : 'Загружаем...'}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {onFiltersChange && (
          <SwipeFilters 
            userRole={userRole}
            onFiltersChange={handleFiltersChange}
            initialFilters={currentFilters}
          />
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={startOnboarding}
          className="bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-purple-50"
        >
          <HelpCircle size={16} />
        </Button>

        {userRole === 'employer' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateVacancy}
              className="bg-white/80 backdrop-blur-sm border-green-200 hover:bg-green-50"
            >
              <Plus size={16} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onManageVacancies}
              className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
            >
              <Settings size={16} />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default SwipeHeader;
