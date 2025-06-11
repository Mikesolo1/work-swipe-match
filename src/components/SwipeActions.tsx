
import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, X } from 'lucide-react';

interface SwipeActionsProps {
  onLike: () => void;
  onDislike: () => void;
}

const SwipeActions: React.FC<SwipeActionsProps> = ({ onLike, onDislike }) => {
  return (
    <div className="flex justify-center gap-8 py-4">
      <Button
        onClick={onDislike}
        size="lg"
        className="w-16 h-16 rounded-full bg-white border-2 border-red-200 hover:bg-red-50 hover:border-red-300 hover:scale-110 transition-all shadow-lg"
      >
        <X className="text-red-500" size={24} />
      </Button>
      
      <Button
        onClick={onLike}
        size="lg"
        className="w-16 h-16 rounded-full matchwork-gradient-primary hover:scale-110 transition-transform matchwork-pulse shadow-xl"
      >
        <Heart className="text-white" size={24} />
      </Button>
    </div>
  );
};

export default SwipeActions;
