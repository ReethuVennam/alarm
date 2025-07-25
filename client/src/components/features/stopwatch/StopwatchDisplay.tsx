import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, RotateCcw, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime, formatLongTime } from '@/hooks/useStopwatch';
import { ScreenReaderText } from '@/components/accessibility/ScreenReaderText';

interface StopwatchDisplayProps {
  currentTime: number;
  isRunning: boolean;
  isPaused: boolean;
  lapCount: number;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  onLap: () => void;
  className?: string;
}

export function StopwatchDisplay({
  currentTime,
  isRunning,
  isPaused,
  lapCount,
  onStart,
  onPause,
  onStop,
  onReset,
  onLap,
  className = ''
}: StopwatchDisplayProps) {
  const formatDisplayTime = (time: number) => {
    // Use long format if over an hour
    return time >= 3600000 ? formatLongTime(time) : formatTime(time);
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Main Time Display */}
      <div className="text-center mb-8">
        <motion.div
          className="text-6xl sm:text-7xl md:text-8xl font-mono font-bold text-text-primary mb-4"
          animate={{
            scale: isRunning ? [1, 1.02, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: isRunning ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {formatDisplayTime(currentTime)}
        </motion.div>
        
        <div className="text-lg text-text-secondary mb-2">
          {isRunning ? 'Running' : isPaused ? 'Paused' : 'Ready'}
        </div>
        
        {lapCount > 0 && (
          <div className="text-sm text-text-secondary">
            {lapCount} lap{lapCount !== 1 ? 's' : ''} recorded
          </div>
        )}

        {/* Screen reader time announcement */}
        <ScreenReaderText>
          Current time: {formatDisplayTime(currentTime)}. 
          Status: {isRunning ? 'Running' : isPaused ? 'Paused' : 'Stopped'}.
          {lapCount > 0 && ` ${lapCount} laps recorded.`}
        </ScreenReaderText>
      </div>
      
      {/* Control Buttons */}
      <div className="flex items-center space-x-4">
        {/* Start/Pause Button */}
        {!isRunning ? (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onStart}
              size="lg"
              className="bg-accent-primary hover:bg-accent-secondary text-white rounded-full w-16 h-16 shadow-lg"
              aria-label="Start stopwatch"
            >
              <Play className="w-8 h-8" />
            </Button>
          </motion.div>
        ) : (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onPause}
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16 shadow-lg"
              aria-label="Pause stopwatch"
            >
              <Pause className="w-8 h-8" />
            </Button>
          </motion.div>
        )}
        
        {/* Lap Button - Only shown when running or paused with time */}
        {(isRunning || (isPaused && currentTime > 0)) && (
          <motion.div 
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Button
              onClick={onLap}
              variant="outline"
              size="lg"
              className="rounded-full w-12 h-12 border-2 border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-white"
              aria-label="Record lap time"
            >
              <Flag className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
        
        {/* Stop Button - Only shown when running or paused */}
        {(isRunning || isPaused) && (
          <motion.div 
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Button
              onClick={onStop}
              variant="outline"
              size="lg"
              className="rounded-full w-12 h-12 border-2 border-gray-400 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Stop stopwatch"
            >
              <Square className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
        
        {/* Reset Button - Only shown when stopped and has time */}
        {!isRunning && !isPaused && currentTime > 0 && (
          <motion.div 
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Button
              onClick={onReset}
              variant="outline"
              size="lg"
              className="rounded-full w-12 h-12"
              aria-label="Reset stopwatch"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </div>
      
      {/* Keyboard Shortcuts Hint */}
      <div className="mt-6 text-xs text-text-secondary text-center max-w-md">
        <div className="space-x-4">
          <span><kbd className="px-2 py-1 bg-background-tertiary border border-border-color rounded text-xs">Space</kbd> Start/Pause</span>
          <span><kbd className="px-2 py-1 bg-background-tertiary border border-border-color rounded text-xs">L</kbd> Lap</span>
          <span><kbd className="px-2 py-1 bg-background-tertiary border border-border-color rounded text-xs">R</kbd> Reset</span>
        </div>
      </div>
    </div>
  );
}