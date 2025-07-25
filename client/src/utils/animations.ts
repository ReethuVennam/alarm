import { Variants, Transition } from 'framer-motion';

// GenZ-appealing spring configurations
export const springConfigs = {
  // Gentle spring for regular interactions
  gentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
    mass: 1
  },
  
  // Bouncy spring for fun interactions
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 15,
    mass: 0.8
  },
  
  // Snappy spring for responsive interactions
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 20,
    mass: 0.6
  },
  
  // Elastic spring for playful interactions
  elastic: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 12,
    mass: 0.4
  },
  
  // Smooth transition for professional feel
  smooth: {
    type: 'tween' as const,
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1] // Custom cubic-bezier
  }
};

// Page transition variants
export const pageTransitions: Record<string, Variants> = {
  slideRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 }
  },
  
  slideLeft: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 }
  },
  
  slideUp: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 }
  },
  
  slideDown: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 }
  },
  
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 }
  },
  
  rotate: {
    initial: { rotate: -10, scale: 0.9, opacity: 0 },
    animate: { rotate: 0, scale: 1, opacity: 1 },
    exit: { rotate: 10, scale: 0.9, opacity: 0 }
  }
};

// Micro-interaction variants
export const microInteractions: Record<string, Variants> = {
  // Button hover/press animations
  buttonPress: {
    idle: { scale: 1 },
    hover: { scale: 1.05 },
    press: { scale: 0.95 }
  },
  
  // Card hover animations
  cardHover: {
    idle: { 
      scale: 1, 
      y: 0,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    hover: { 
      scale: 1.02, 
      y: -4,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }
  },
  
  // Icon bounce animation
  iconBounce: {
    idle: { scale: 1, rotate: 0 },
    hover: { scale: 1.2, rotate: 15 },
    tap: { scale: 0.9, rotate: -15 }
  },
  
  // Pulse animation for notifications
  pulse: {
    idle: { scale: 1, opacity: 1 },
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  
  // Shake animation for errors
  shake: {
    idle: { x: 0 },
    shake: {
      x: [-10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: 'easeInOut'
      }
    }
  },
  
  // Wiggle animation for playful interactions
  wiggle: {
    idle: { rotate: 0 },
    wiggle: {
      rotate: [-3, 3, -3, 3, 0],
      transition: {
        duration: 0.5,
        ease: 'easeInOut'
      }
    }
  },
  
  // Float animation for floating elements
  float: {
    idle: { y: 0 },
    float: {
      y: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }
};

// List item stagger animations
export const staggerAnimations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  
  item: {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: springConfigs.gentle
    }
  }
};

// Loading animations
export const loadingAnimations: Record<string, Variants> = {
  spinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  },
  
  dots: {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  
  pulse: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }
};

// Success/Error animations
export const feedbackAnimations: Record<string, Variants> = {
  success: {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: [0, 1.2, 1], 
      rotate: 0,
      transition: {
        duration: 0.6,
        ease: 'backOut'
      }
    }
  },
  
  error: {
    initial: { scale: 0, rotate: 180 },
    animate: { 
      scale: [0, 1.2, 1], 
      rotate: 0,
      transition: {
        duration: 0.6,
        ease: 'backOut'
      }
    }
  },
  
  warning: {
    initial: { scale: 0, y: -20 },
    animate: { 
      scale: [0, 1.1, 1], 
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'backOut'
      }
    }
  }
};

// Modal/Dialog animations
export const modalAnimations: Record<string, Variants> = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  modal: {
    initial: { 
      scale: 0.9, 
      opacity: 0,
      y: 20
    },
    animate: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      transition: springConfigs.bouncy
    },
    exit: { 
      scale: 0.9, 
      opacity: 0,
      y: 20,
      transition: springConfigs.smooth
    }
  },
  
  slideUp: {
    initial: { y: '100%', opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: springConfigs.snappy
    },
    exit: { 
      y: '100%', 
      opacity: 0,
      transition: springConfigs.smooth
    }
  }
};

// Utility function to create custom spring transition
export function createSpringTransition(
  stiffness: number = 300,
  damping: number = 25,
  mass: number = 1
): Transition {
  return {
    type: 'spring',
    stiffness,
    damping,
    mass
  };
}

// Utility function to create custom tween transition
export function createTweenTransition(
  duration: number = 0.3,
  ease: string | number[] = 'easeOut'
): Transition {
  return {
    type: 'tween',
    duration,
    ease
  };
}

// Stagger utility for animating lists
export function createStaggerContainer(
  staggerChildren: number = 0.1,
  delayChildren: number = 0
) {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren
      }
    }
  };
}

// Easing functions for custom animations
export const easingFunctions = {
  // Material Design easing
  standard: [0.4, 0, 0.2, 1],
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
  
  // Bouncy easings
  backOut: [0.34, 1.56, 0.64, 1],
  backIn: [0.36, 0, 0.66, -0.56],
  backInOut: [0.68, -0.6, 0.32, 1.6],
  
  // Elastic easings
  elasticOut: [0.68, -0.55, 0.265, 1.55],
  elasticIn: [0.55, 0.085, 0.68, 0.53],
  elasticInOut: [0.445, 0.05, 0.55, 0.95]
};

// Animation presets for common use cases
export const animationPresets = {
  // Quick micro-interactions
  quickTap: {
    scale: [1, 0.95, 1],
    transition: { duration: 0.15 }
  },
  
  // Satisfying button press
  buttonPress: {
    scale: [1, 0.98, 1.02, 1],
    transition: { 
      duration: 0.3,
      times: [0, 0.3, 0.7, 1]
    }
  },
  
  // Gentle hover
  gentleHover: {
    scale: 1.05,
    transition: springConfigs.gentle
  },
  
  // Bouncy entrance
  bouncyEntrance: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 1],
    transition: {
      duration: 0.5,
      times: [0, 0.6, 1],
      ease: 'backOut'
    }
  }
};