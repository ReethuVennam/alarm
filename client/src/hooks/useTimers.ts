import { useState, useEffect, useCallback, useRef } from 'react';
import { useScreenReaderAnnouncement } from '@/components/accessibility/ScreenReaderText';

export interface Timer {
  id: string;
  name: string;
  originalDuration: number; // in seconds
  remainingTime: number; // in seconds
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  color: string;
  createdAt: Date;
  completedAt?: Date;
  category: 'pomodoro' | 'break' | 'study' | 'workout' | 'cooking' | 'custom';
}

interface TimerPreset {
  name: string;
  duration: number; // in minutes
  category: Timer['category'];
  color: string;
}

export const timerPresets: TimerPreset[] = [
  { name: 'Pomodoro', duration: 25, category: 'pomodoro', color: '#f59e0b' },
  { name: 'Short Break', duration: 5, category: 'break', color: '#10b981' },
  { name: 'Long Break', duration: 15, category: 'break', color: '#8b5cf6' },
  { name: 'Deep Focus', duration: 90, category: 'study', color: '#ef4444' },
  { name: 'Study Session', duration: 45, category: 'study', color: '#3b82f6' },
  { name: 'Workout', duration: 30, category: 'workout', color: '#f97316' },
  { name: 'Cooking', duration: 20, category: 'cooking', color: '#84cc16' },
];

export function useTimers() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const intervalRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const { announce } = useScreenReaderAnnouncement();

  // Load timers from localStorage on mount
  useEffect(() => {
    const savedTimers = localStorage.getItem('smart-alarm-timers');
    if (savedTimers) {
      try {
        const parsed = JSON.parse(savedTimers);
        const validTimers = parsed.map((timer: any) => ({
          ...timer,
          createdAt: new Date(timer.createdAt),
          completedAt: timer.completedAt ? new Date(timer.completedAt) : undefined,
        }));
        setTimers(validTimers);
      } catch (error) {
        console.error('Failed to load timers from localStorage:', error);
      }
    }
  }, []);

  // Save timers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('smart-alarm-timers', JSON.stringify(timers));
  }, [timers]);

  // Manage timer intervals
  useEffect(() => {
    timers.forEach(timer => {
      if (timer.isRunning && !timer.isPaused && !timer.isCompleted) {
        if (!intervalRefs.current.has(timer.id)) {
          const interval = setInterval(() => {
            setTimers(prev => prev.map(t => {
              if (t.id === timer.id) {
                const newRemainingTime = Math.max(0, t.remainingTime - 1);
                const isCompleted = newRemainingTime === 0;
                
                if (isCompleted && !t.isCompleted) {
                  // Timer completed
                  announce(`${t.name} timer completed`, 'assertive');
                  
                  // Play notification sound if supported
                  if ('vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200, 100, 200]);
                  }
                  
                  // Show browser notification
                  if (Notification.permission === 'granted') {
                    new Notification(`${t.name} Timer Completed!`, {
                      body: `Your ${formatDuration(t.originalDuration)} timer has finished.`,
                      icon: '/favicon.ico',
                      tag: `timer-${t.id}`,
                    });
                  }
                  
                  return {
                    ...t,
                    remainingTime: newRemainingTime,
                    isRunning: false,
                    isCompleted: true,
                    completedAt: new Date(),
                  };
                }
                
                return {
                  ...t,
                  remainingTime: newRemainingTime,
                };
              }
              return t;
            }));
          }, 1000);
          
          intervalRefs.current.set(timer.id, interval);
        }
      } else {
        // Clear interval if timer is not running
        const interval = intervalRefs.current.get(timer.id);
        if (interval) {
          clearInterval(interval);
          intervalRefs.current.delete(timer.id);
        }
      }
    });

    // Cleanup intervals for removed timers
    const timerIds = new Set(timers.map(t => t.id));
    intervalRefs.current.forEach((interval, timerId) => {
      if (!timerIds.has(timerId)) {
        clearInterval(interval);
        intervalRefs.current.delete(timerId);
      }
    });

    // Cleanup on unmount
    return () => {
      intervalRefs.current.forEach(interval => clearInterval(interval));
      intervalRefs.current.clear();
    };
  }, [timers, announce]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const createTimer = useCallback((
    name: string,
    durationMinutes: number,
    category: Timer['category'] = 'custom',
    color: string = '#6366f1'
  ) => {
    const timer: Timer = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      originalDuration: durationMinutes * 60,
      remainingTime: durationMinutes * 60,
      isRunning: false,
      isPaused: false,
      isCompleted: false,
      color,
      createdAt: new Date(),
      category,
    };

    setTimers(prev => [...prev, timer]);
    announce(`Created ${name} timer for ${durationMinutes} minutes`, 'polite');
    
    return timer;
  }, [announce]);

  const createTimerFromPreset = useCallback((preset: TimerPreset) => {
    return createTimer(preset.name, preset.duration, preset.category, preset.color);
  }, [createTimer]);

  const startTimer = useCallback((id: string) => {
    setTimers(prev => prev.map(timer => 
      timer.id === id 
        ? { ...timer, isRunning: true, isPaused: false }
        : timer
    ));
    
    const timer = timers.find(t => t.id === id);
    if (timer) {
      announce(`Started ${timer.name} timer`, 'polite');
    }
  }, [timers, announce]);

  const pauseTimer = useCallback((id: string) => {
    setTimers(prev => prev.map(timer => 
      timer.id === id 
        ? { ...timer, isRunning: false, isPaused: true }
        : timer
    ));
    
    const timer = timers.find(t => t.id === id);
    if (timer) {
      announce(`Paused ${timer.name} timer`, 'polite');
    }
  }, [timers, announce]);

  const resetTimer = useCallback((id: string) => {
    setTimers(prev => prev.map(timer => 
      timer.id === id 
        ? { 
            ...timer, 
            remainingTime: timer.originalDuration,
            isRunning: false,
            isPaused: false,
            isCompleted: false,
            completedAt: undefined,
          }
        : timer
    ));
    
    const timer = timers.find(t => t.id === id);
    if (timer) {
      announce(`Reset ${timer.name} timer`, 'polite');
    }
  }, [timers, announce]);

  const deleteTimer = useCallback((id: string) => {
    const timer = timers.find(t => t.id === id);
    setTimers(prev => prev.filter(t => t.id !== id));
    
    if (timer) {
      announce(`Deleted ${timer.name} timer`, 'polite');
    }
  }, [timers, announce]);

  const addTime = useCallback((id: string, minutes: number) => {
    setTimers(prev => prev.map(timer => 
      timer.id === id 
        ? { 
            ...timer, 
            remainingTime: timer.remainingTime + (minutes * 60),
            originalDuration: timer.originalDuration + (minutes * 60),
          }
        : timer
    ));
    
    const timer = timers.find(t => t.id === id);
    if (timer) {
      announce(`Added ${minutes} minutes to ${timer.name} timer`, 'polite');
    }
  }, [timers, announce]);

  // Computed values
  const activeTimers = timers.filter(t => t.isRunning && !t.isCompleted);
  const completedTimers = timers.filter(t => t.isCompleted);
  const pausedTimers = timers.filter(t => t.isPaused && !t.isCompleted);

  return {
    timers,
    activeTimers,
    completedTimers,
    pausedTimers,
    createTimer,
    createTimerFromPreset,
    startTimer,
    pauseTimer,
    resetTimer,
    deleteTimer,
    addTime,
    timerPresets,
  };
}

// Helper function to format duration
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Helper function to get timer progress percentage
export function getTimerProgress(timer: Timer): number {
  if (timer.originalDuration === 0) return 100;
  return ((timer.originalDuration - timer.remainingTime) / timer.originalDuration) * 100;
}