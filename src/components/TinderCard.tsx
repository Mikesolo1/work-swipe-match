
import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

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
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-30, 30]);
    const opacity = useTransform(x, [-200, -50, 0, 50, 200], [0, 1, 1, 1, 0]);

    useImperativeHandle(ref, () => ({
      swipe: (direction = 'left') => {
        const exitX = direction === 'right' ? 1000 : -1000;
        x.set(exitX);
        onSwipe(direction);
        setTimeout(() => {
          onCardLeftScreen?.();
        }, 300);
      }
    }));

    const handleDragEnd = (event: any, info: PanInfo) => {
      const offset = info.offset.x;
      const velocity = info.velocity.x;

      if (Math.abs(offset) > 100 || Math.abs(velocity) > 500) {
        const direction = offset > 0 ? 'right' : 'left';
        if (!preventSwipe.includes(direction)) {
          const exitX = direction === 'right' ? 1000 : -1000;
          x.set(exitX);
          onSwipe(direction);
          setTimeout(() => {
            onCardLeftScreen?.();
          }, 300);
        } else {
          x.set(0);
          y.set(0);
        }
      } else {
        x.set(0);
        y.set(0);
      }
    };

    const isDragDisabled = preventSwipe.includes('left') && preventSwipe.includes('right');

    return (
      <motion.div
        className="absolute inset-0"
        style={{
          x,
          y,
          rotate,
          opacity,
        }}
        drag={!isDragDisabled}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.02 }}
        initial={{ scale: 1 }}
        exit={{ x: x.get() > 0 ? 1000 : -1000, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {children}
      </motion.div>
    );
  }
);

TinderCardWrapper.displayName = 'TinderCardWrapper';

export default TinderCardWrapper;
