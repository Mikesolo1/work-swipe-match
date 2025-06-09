
import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import TinderCard from 'react-tinder-card';

interface TinderCardWrapperProps {
  children: React.ReactNode;
  onSwipe: (direction: string) => void;
  onCardLeftScreen?: () => void;
  preventSwipe?: string[];
}

export interface TinderCardRef {
  swipe: (direction?: string) => void;
}

const TinderCardWrapper = forwardRef<TinderCardRef, TinderCardWrapperProps>(
  ({ children, onSwipe, onCardLeftScreen, preventSwipe = [] }, ref) => {
    const cardRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      swipe: (direction = 'left') => {
        if (cardRef.current) {
          cardRef.current.swipe(direction);
        }
      }
    }));

    return (
      <TinderCard
        ref={cardRef}
        onSwipe={onSwipe}
        onCardLeftScreen={onCardLeftScreen}
        preventSwipe={preventSwipe}
        className="absolute inset-0"
      >
        {children}
      </TinderCard>
    );
  }
);

TinderCardWrapper.displayName = 'TinderCardWrapper';

export default TinderCardWrapper;
