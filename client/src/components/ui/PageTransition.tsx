import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { pageTransitions, springConfigs } from '@/utils/animations';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey: string; // Unique key for each page/route
  variant?: keyof typeof pageTransitions;
  duration?: number;
  className?: string;
}

// Enhanced page transition variants with more options
const enhancedPageTransitions: Record<string, Variants> = {
  ...pageTransitions,
  
  // Smooth slide with slight scale
  smoothSlide: {
    initial: { x: '100%', scale: 0.95, opacity: 0 },
    animate: { x: 0, scale: 1, opacity: 1 },
    exit: { x: '-100%', scale: 0.95, opacity: 0 }
  },
  
  // Elastic slide for playful feel
  elasticSlide: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 }
  },
  
  // Zoom in/out transition
  zoom: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 }
  },
  
  // Flip transition
  flip: {
    initial: { rotateY: -90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: 90, opacity: 0 }
  },
  
  // Slide and fade
  slideAndFade: {
    initial: { x: 50, opacity: 0, filter: 'blur(4px)' },
    animate: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: { x: -50, opacity: 0, filter: 'blur(4px)' }
  }
};

export function PageTransition({
  children,
  transitionKey,
  variant = 'slideRight',
  duration = 0.4,
  className = ''
}: PageTransitionProps) {
  const selectedVariant = enhancedPageTransitions[variant] || enhancedPageTransitions.slideRight;

  // Custom transition config based on variant
  const getTransitionConfig = () => {
    switch (variant) {
      case 'elasticSlide':
        return {
          type: 'spring',
          stiffness: 200,
          damping: 20,
          mass: 0.8
        };
      case 'bouncy':
        return springConfigs.bouncy;
      case 'smooth':
        return springConfigs.smooth;
      default:
        return {
          duration,
          ease: [0.4, 0, 0.2, 1]
        };
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={transitionKey}
        variants={selectedVariant}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={getTransitionConfig()}
        className={`w-full ${className}`}
        style={{
          transformOrigin: variant === 'flip' ? 'center center' : undefined
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Specialized page transition components

export function SlidePageTransition({
  children,
  transitionKey,
  direction = 'right',
  className = ''
}: {
  children: React.ReactNode;
  transitionKey: string;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}) {
  const variantMap = {
    right: 'slideRight',
    left: 'slideLeft',
    up: 'slideUp',
    down: 'slideDown'
  };

  return (
    <PageTransition
      transitionKey={transitionKey}
      variant={variantMap[direction] as keyof typeof pageTransitions}
      className={className}
    >
      {children}
    </PageTransition>
  );
}

export function FadePageTransition({
  children,
  transitionKey,
  duration = 0.3,
  className = ''
}: {
  children: React.ReactNode;
  transitionKey: string;
  duration?: number;
  className?: string;
}) {
  return (
    <PageTransition
      transitionKey={transitionKey}
      variant="fade"
      duration={duration}
      className={className}
    >
      {children}
    </PageTransition>
  );
}

export function ScalePageTransition({
  children,
  transitionKey,
  className = ''
}: {
  children: React.ReactNode;
  transitionKey: string;
  className?: string;
}) {
  return (
    <PageTransition
      transitionKey={transitionKey}
      variant="scale"
      className={className}
    >
      {children}
    </PageTransition>
  );
}

// Page transition with loading state
export function LoadingPageTransition({
  children,
  transitionKey,
  isLoading = false,
  loadingComponent,
  variant = 'slideRight',
  className = ''
}: {
  children: React.ReactNode;
  transitionKey: string;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  variant?: keyof typeof pageTransitions;
  className?: string;
}) {
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`flex items-center justify-center min-h-screen ${className}`}
      >
        {loadingComponent || (
          <div className="flex items-center space-x-2">
            <motion.div
              className="w-3 h-3 bg-accent-primary rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <motion.div
              className="w-3 h-3 bg-accent-primary rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2
              }}
            />
            <motion.div
              className="w-3 h-3 bg-accent-primary rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.4
              }}
            />
          </div>
        )}
      </motion.div>
    );
  }

  if (!showContent) return null;

  return (
    <PageTransition
      transitionKey={transitionKey}
      variant={variant}
      className={className}
    >
      {children}
    </PageTransition>
  );
}

// Hook for page transition control
export function usePageTransition(initialKey: string = 'default') {
  const [currentKey, setCurrentKey] = useState(initialKey);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTo = (newKey: string, delay: number = 0) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentKey(newKey);
      setIsTransitioning(false);
    }, delay);
  };

  return {
    currentKey,
    isTransitioning,
    transitionTo,
    setCurrentKey
  };
}