import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Button as BaseButton, ButtonProps } from '@/components/ui/button';

interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode;
  hapticFeedback?: boolean;
  scaleOnPress?: boolean;
  rippleEffect?: boolean;
  glowOnHover?: boolean;
  springConfig?: {
    stiffness: number;
    damping: number;
    mass: number;
  };
  className?: string;
}

// Default spring configuration for GenZ-appealing animations
const defaultSpringConfig = {
  stiffness: 300,
  damping: 25,
  mass: 0.8
};

// Button animation variants
const buttonVariants: Variants = {
  idle: {
    scale: 1,
    rotate: 0,
    filter: 'brightness(1) drop-shadow(0 0 0px rgba(0,0,0,0))',
  },
  hover: {
    scale: 1.02,
    filter: 'brightness(1.1) drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  },
  press: {
    scale: 0.95,
    filter: 'brightness(0.95)',
    transition: {
      type: 'spring',
      stiffness: 600,
      damping: 30,
      mass: 0.5
    }
  },
  tap: {
    scale: [1, 0.95, 1.02, 1],
    transition: {
      duration: 0.3,
      times: [0, 0.2, 0.6, 1],
      type: 'spring'
    }
  },
  disabled: {
    scale: 1,
    opacity: 0.6,
    filter: 'brightness(0.8) grayscale(0.3)',
  }
};

// Ripple effect variants
const rippleVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0.8,
  },
  animate: {
    scale: 2.5,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

// Glow effect variants
const glowVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  hover: {
    opacity: 0.6,
    scale: 1.2,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

export function AnimatedButton({
  children,
  hapticFeedback = true,
  scaleOnPress = true,
  rippleEffect = true,
  glowOnHover = false,
  springConfig = defaultSpringConfig,
  className = '',
  disabled = false,
  onClick,
  ...props
}: AnimatedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Haptic feedback simulation
  const triggerHapticFeedback = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    setIsPressed(true);
    triggerHapticFeedback();

    // Create ripple effect
    if (rippleEffect) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const newRipple = {
        id: Date.now(),
        x,
        y
      };
      
      setRipples(prev => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    triggerHapticFeedback();
    onClick?.(event);
  };

  const currentVariant = disabled ? 'disabled' : 
                        isPressed && scaleOnPress ? 'press' : 'idle';

  return (
    <motion.div
      className="relative inline-block"
      variants={buttonVariants}
      initial="idle"
      animate={currentVariant}
      whileHover={!disabled ? 'hover' : undefined}
      whileTap={!disabled && scaleOnPress ? 'tap' : undefined}
      transition={{
        type: 'spring',
        ...springConfig
      }}
    >
      {/* Glow effect */}
      {glowOnHover && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-accent-primary blur-lg"
          variants={glowVariants}
          initial="initial"
          whileHover="hover"
          style={{ zIndex: -1 }}
        />
      )}

      <BaseButton
        {...props}
        className={`relative overflow-hidden ${className}`}
        disabled={disabled}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          WebkitTapHighlightColor: 'transparent', // Remove default mobile tap highlight
        }}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
            variants={rippleVariants}
            initial="initial"
            animate="animate"
          />
        ))}

        {/* Button content */}
        <motion.span
          className="relative z-10 flex items-center justify-center"
          animate={isPressed ? { y: 1 } : { y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30
          }}
        >
          {children}
        </motion.span>
      </BaseButton>
    </motion.div>
  );
}

// Specialized animated button variants for different use cases

export function PrimaryAnimatedButton(props: AnimatedButtonProps) {
  return (
    <AnimatedButton
      {...props}
      glowOnHover={true}
      className={`bg-accent-primary hover:bg-accent-secondary text-white font-medium ${props.className || ''}`}
      springConfig={{
        stiffness: 350,
        damping: 20,
        mass: 0.6
      }}
    />
  );
}

export function SecondaryAnimatedButton(props: AnimatedButtonProps) {
  return (
    <AnimatedButton
      {...props}
      rippleEffect={false}
      className={`border-2 border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-white transition-colors ${props.className || ''}`}
      springConfig={{
        stiffness: 300,
        damping: 25,
        mass: 0.8
      }}
    />
  );
}

export function FloatingActionButton(props: AnimatedButtonProps) {
  return (
    <AnimatedButton
      {...props}
      glowOnHover={true}
      className={`fixed bottom-20 right-6 w-14 h-14 rounded-full bg-accent-primary text-white shadow-lg z-50 ${props.className || ''}`}
      springConfig={{
        stiffness: 400,
        damping: 15,
        mass: 0.5
      }}
    />
  );
}

export function IconAnimatedButton(props: AnimatedButtonProps) {
  return (
    <AnimatedButton
      {...props}
      scaleOnPress={true}
      rippleEffect={true}
      className={`w-12 h-12 rounded-full flex items-center justify-center ${props.className || ''}`}
      springConfig={{
        stiffness: 500,
        damping: 20,
        mass: 0.4
      }}
    />
  );
}

// Pulse animation button for important actions
export function PulseAnimatedButton(props: AnimatedButtonProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      <AnimatedButton
        {...props}
        glowOnHover={true}
        className={`bg-red-500 hover:bg-red-600 text-white font-bold ${props.className || ''}`}
      />
    </motion.div>
  );
}

// Success button with checkmark animation
export function SuccessAnimatedButton(props: AnimatedButtonProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsSuccess(true);
    props.onClick?.(event);
    
    // Reset success state after animation
    setTimeout(() => setIsSuccess(false), 2000);
  };

  return (
    <AnimatedButton
      {...props}
      onClick={handleClick}
      className={`transition-colors duration-300 ${
        isSuccess 
          ? 'bg-green-500 hover:bg-green-600 text-white' 
          : `bg-accent-primary hover:bg-accent-secondary text-white ${props.className || ''}`
      }`}
    >
      <motion.span
        animate={isSuccess ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isSuccess ? '✓' : props.children}
      </motion.span>
    </AnimatedButton>
  );
}