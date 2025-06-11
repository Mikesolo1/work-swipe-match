
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 px-6"
    >
      <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-3xl flex items-center justify-center">
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="matchwork-subheading mb-3">
        {title}
      </h3>
      <p className="matchwork-text text-balance mb-6 max-w-md mx-auto">
        {description}
      </p>
      {actionText && onAction && (
        <Button 
          onClick={onAction}
          className="matchwork-button-primary"
        >
          {actionText}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
