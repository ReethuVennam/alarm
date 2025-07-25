import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Trash2, Plus, Minus, Share, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimerRing, MiniTimerRing } from '@/components/ui/TimerRing';
import { Timer, formatDuration, getTimerProgress } from '@/hooks/useTimers';
import { ScreenReaderText } from '@/components/accessibility/ScreenReaderText';

interface TimerCardProps {
  timer: Timer;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTime: (id: string, minutes: number) => void;
  onShare?: (timer: Timer) => void;
  onExport?: (timer: Timer) => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function TimerCard({
  timer,
  onStart,
  onPause,
  onReset,
  onDelete,
  onAddTime,
  onShare,
  onExport,
  size = 'medium',
  className = ''
}: TimerCardProps) {
  const progress = getTimerProgress(timer);
  const isActive = timer.isRunning && !timer.isPaused;
  
  const sizeClasses = {
    small: {
      card: 'p-4',
      ring: 120,
      text: 'text-lg',
      buttons: 'w-8 h-8',
      iconSize: 'w-4 h-4'
    },
    medium: {
      card: 'p-6',
      ring: 160,
      text: 'text-2xl',
      buttons: 'w-10 h-10',
      iconSize: 'w-5 h-5'
    },
    large: {
      card: 'p-8',
      ring: 200,
      text: 'text-3xl',
      buttons: 'w-12 h-12',
      iconSize: 'w-6 h-6'
    }
  };

  const sizeConfig = sizeClasses[size];

  return (
    <motion.div
      className={`
        bg-background-secondary border border-border-color rounded-2xl
        transition-all duration-200 relative overflow-hidden
        ${sizeConfig.card} ${className}
        ${timer.isCompleted ? 'ring-2 ring-green-500 ring-opacity-50' : ''}
        ${isActive ? 'shadow-lg shadow-accent-primary/20' : 'shadow-sm'}
      `}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      role="region"
      aria-label={`${timer.name} timer`}
    >
      {/* Background pattern for completed timers */}
      {timer.isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
      )}
      
      {/* Active timer glow */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: timer.color }}
              aria-hidden="true"
            />
            <h3 className="font-semibold text-text-primary truncate">
              {timer.name}
            </h3>
          </div>
          
          <div className="flex items-center space-x-1">
            {size !== 'small' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddTime(timer.id, -1)}
                  disabled={timer.remainingTime <= 60 || timer.isRunning}
                  className="w-6 h-6 p-0 rounded-full hover:bg-background-tertiary"
                  aria-label="Remove 1 minute"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddTime(timer.id, 1)}
                  disabled={timer.isRunning}
                  className="w-6 h-6 p-0 rounded-full hover:bg-background-tertiary"
                  aria-label="Add 1 minute"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(timer.id)}
              className="w-6 h-6 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
              aria-label="Delete timer"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center justify-center mb-6">
          <TimerRing
            progress={progress}
            size={sizeConfig.ring}
            color={timer.color}
            className="mb-4"
          >
            <div className="text-center">
              <div className={`font-mono font-bold text-text-primary ${sizeConfig.text}`}>
                {formatDuration(timer.remainingTime)}
              </div>
              {size !== 'small' && (
                <div className="text-sm text-text-secondary mt-1">
                  {timer.isCompleted ? 'Completed!' : 
                   timer.isPaused ? 'Paused' :
                   timer.isRunning ? 'Running' : 'Ready'}
                </div>
              )}
            </div>
          </TimerRing>

          {/* Progress info for screen readers */}
          <ScreenReaderText>
            Timer progress: {Math.round(progress)}% complete. 
            {timer.remainingTime > 0 
              ? `${formatDuration(timer.remainingTime)} remaining`
              : 'Timer completed'
            }
          </ScreenReaderText>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-3">
          {!timer.isCompleted && (
            <>
              {timer.isRunning ? (
                <Button
                  onClick={() => onPause(timer.id)}
                  className={`${sizeConfig.buttons} rounded-full bg-red-500 hover:bg-red-600 text-white`}
                  aria-label="Pause timer"
                >
                  <Pause className={sizeConfig.iconSize} />
                </Button>
              ) : (
                <Button
                  onClick={() => onStart(timer.id)}
                  className={`${sizeConfig.buttons} rounded-full`}
                  style={{ backgroundColor: timer.color }}
                  aria-label="Start timer"
                >
                  <Play className={sizeConfig.iconSize} />
                </Button>
              )}
            </>
          )}
          
          <Button
            variant="outline"
            onClick={() => onReset(timer.id)}
            className={`${sizeConfig.buttons} rounded-full`}
            aria-label="Reset timer"
          >
            <RotateCcw className={sizeConfig.iconSize} />
          </Button>

          {/* Share/Export buttons for larger sizes */}
          {size !== 'small' && (
            <>
              {onShare && (
                <Button
                  variant="outline"
                  onClick={() => onShare(timer)}
                  className={`${sizeConfig.buttons} rounded-full`}
                  aria-label="Share timer"
                >
                  <Share className={sizeConfig.iconSize} />
                </Button>
              )}
              {onExport && (
                <Button
                  variant="outline"
                  onClick={() => onExport(timer)}
                  className={`${sizeConfig.buttons} rounded-full`}
                  aria-label="Export timer data"
                >
                  <Download className={sizeConfig.iconSize} />
                </Button>
              )}
            </>
          )}
        </div>

        {/* Category badge */}
        {size !== 'small' && (
          <div className="mt-4 text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-tertiary text-text-secondary capitalize">
              {timer.category}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface CompactTimerCardProps {
  timer: Timer;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onDelete: (id: string) => void;
  onShare?: (timer: Timer) => void;
  onExport?: (timer: Timer) => void;
  className?: string;
}

export function CompactTimerCard({
  timer,
  onStart,
  onPause,
  onDelete,
  onShare,
  onExport,
  className = ''
}: CompactTimerCardProps) {
  const progress = getTimerProgress(timer);
  const isActive = timer.isRunning && !timer.isPaused;

  return (
    <motion.div
      className={`
        flex items-center space-x-3 p-3 bg-background-secondary 
        border border-border-color rounded-xl transition-all duration-200
        ${isActive ? 'border-accent-primary/30 bg-accent-primary/5' : ''}
        ${className}
      `}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Mini progress ring */}
      <MiniTimerRing progress={progress} color={timer.color} />
      
      {/* Timer info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-text-primary truncate">
            {timer.name}
          </span>
          <span className="text-xs text-text-secondary uppercase tracking-wide">
            {timer.category}
          </span>
        </div>
        <div className="font-mono text-sm text-text-secondary">
          {formatDuration(timer.remainingTime)}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center space-x-1">
        {!timer.isCompleted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => timer.isRunning ? onPause(timer.id) : onStart(timer.id)}
            className="w-8 h-8 p-0 rounded-full"
            aria-label={timer.isRunning ? "Pause timer" : "Start timer"}
          >
            {timer.isRunning ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3" />
            )}
          </Button>
        )}
        {onShare && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare(timer)}
            className="w-8 h-8 p-0 rounded-full hover:bg-background-tertiary"
            aria-label="Share timer"
          >
            <Share className="w-3 h-3" />
          </Button>
        )}
        {onExport && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onExport(timer)}
            className="w-8 h-8 p-0 rounded-full hover:bg-background-tertiary"
            aria-label="Export timer"
          >
            <Download className="w-3 h-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(timer.id)}
          className="w-8 h-8 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
          aria-label="Delete timer"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );
}