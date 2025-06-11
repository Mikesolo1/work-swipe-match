
import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, X } from 'lucide-react';

interface SwipeActionsProps {
  onLike: () => void;
  onDislike: () => void;
}

const SwipeActions: React.FC<SwipeActionsProps> = ({ onLike, onDislike }) => {
  return (
    <div className="flex justify-center gap-6 flex-shrink-0">
      <Button
        onClick={onDislike}
        variant="outline"
        size="lg"
        className="w-14 h-14 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300 transition-all"
      >
        <X className="text-red-500" size={20} />
      </Button>
      <Button
        onClick={onLike}
        size="lg"
        className="w-14 h-14 rounded-full matchwork-gradient-secondary hover:scale-110 transition-transform matchwork-pulse"
      >
        <Heart className="text-white" size={20} />
      </Button>
    </div>
  );
};

export default SwipeActions;
