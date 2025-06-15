
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Briefcase } from 'lucide-react';
import SwipeFilters from './SwipeFilters';
import type { SwipeFilters as SwipeFiltersType } from '@/types/filters';

interface SwipeHeaderProps {
  remainingCount: number;
  userRole?: string;
  onCreateVacancy: () => void;
  onManageVacancies: () => void;
  onFiltersChange: (filters: SwipeFiltersType) => void;
  currentFilters: SwipeFiltersType;
  availableCities?: string[];
  popularSkills?: string[];
}

const SwipeHeader: React.FC<SwipeHeaderProps> = ({
  remainingCount,
  userRole,
  onCreateVacancy,
  onManageVacancies,
  onFiltersChange,
  currentFilters,
  availableCities = [],
  popularSkills = []
}) => {
  return (
    <div className="flex items-center justify-between mb-4 pt-2">
      <div className="flex items-center gap-3">
        <div className="text-white/90">
          <span className="text-lg font-semibold">{remainingCount}</span>
          <span className="text-sm ml-1">
            {userRole === 'seeker' ? 'вакансий' : 'резюме'}
          </span>
        </div>
        
        <SwipeFilters
          userRole={userRole}
          onFiltersChange={onFiltersChange}
          initialFilters={currentFilters}
          availableCities={availableCities}
          popularSkills={popularSkills}
        />
      </div>

      <div className="flex gap-2">
        {userRole === 'employer' && (
          <>
            <Button
              onClick={onCreateVacancy}
              size="sm"
              className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
            >
              <Plus size={16} />
              Создать
            </Button>
            <Button
              onClick={onManageVacancies}
              size="sm"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
            >
              <Briefcase size={16} />
              Мои вакансии
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default SwipeHeader;
