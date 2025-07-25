import { useState, useEffect, useCallback, useRef } from 'react';
import { useScreenReaderAnnouncement } from '@/components/accessibility/ScreenReaderText';

export interface LapTime {
  id: string;
  lapNumber: number;
  lapTime: number; // Total time at this lap (milliseconds)
  splitTime: number; // Time for this lap only (milliseconds)
  timestamp: Date;
}

export interface StopwatchSession {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  totalTime: number; // milliseconds
  lapTimes: LapTime[];
  isRunning: boolean;
  isPaused: boolean;
  color: string;
  category: 'workout' | 'study' | 'race' | 'meeting' | 'custom';
}

const sessionColors = [
  '#f59e0b', // amber
  '#10b981', // emerald  
  '#8b5cf6', // violet
  '#ef4444', // red
  '#3b82f6', // blue
  '#f97316', // orange
  '#84cc16', // lime
];

export function useStopwatch() {
  const [sessions, setSessions] = useState<StopwatchSession[]>([]);
  const [currentTime, setCurrentTime] = useState(0); // Current session time in milliseconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const { announce } = useScreenReaderAnnouncement();

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('smart-alarm-stopwatch-sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        const validSessions = parsed.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
          lapTimes: session.lapTimes.map((lap: any) => ({
            ...lap,
            timestamp: new Date(lap.timestamp),
          })),
        }));
        setSessions(validSessions);
      } catch (error) {
        console.error('Failed to load stopwatch sessions from localStorage:', error);
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('smart-alarm-stopwatch-sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Update current time when stopwatch is running
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        setCurrentTime(now - startTimeRef.current + pausedTimeRef.current);
      }, 10); // Update every 10ms for smooth display
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const startStopwatch = useCallback((sessionName?: string, category: StopwatchSession['category'] = 'custom') => {
    if (isRunning) return;

    const now = Date.now();
    startTimeRef.current = now;
    pausedTimeRef.current = currentTime;
    setIsRunning(true);

    // Create new session if none exists or if explicitly requested
    if (!currentSessionId || sessionName) {
      const newSession: StopwatchSession = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: sessionName || `Session ${sessions.length + 1}`,
        startTime: new Date(now),
        totalTime: 0,
        lapTimes: [],
        isRunning: true,
        isPaused: false,
        color: sessionColors[sessions.length % sessionColors.length],
        category,
      };

      setSessions(prev => [...prev, newSession]);
      setCurrentSessionId(newSession.id);
      setCurrentTime(0);
      pausedTimeRef.current = 0;
      startTimeRef.current = now;
      
      announce(`Started ${newSession.name} stopwatch`, 'polite');
    } else {
      // Resume existing session
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, isRunning: true, isPaused: false }
          : session
      ));
      
      announce('Resumed stopwatch', 'polite');
    }
  }, [isRunning, currentSessionId, currentTime, sessions, announce]);

  const pauseStopwatch = useCallback(() => {
    if (!isRunning) return;

    setIsRunning(false);
    pausedTimeRef.current = currentTime;

    if (currentSessionId) {
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, isRunning: false, isPaused: true, totalTime: currentTime }
          : session
      ));
    }

    announce('Paused stopwatch', 'polite');
  }, [isRunning, currentTime, currentSessionId, announce]);

  const stopStopwatch = useCallback(() => {
    setIsRunning(false);
    
    if (currentSessionId) {
      const now = new Date();
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { 
              ...session, 
              isRunning: false, 
              isPaused: false, 
              totalTime: currentTime,
              endTime: now,
            }
          : session
      ));
    }

    setCurrentTime(0);
    pausedTimeRef.current = 0;
    setCurrentSessionId(null);
    
    announce('Stopped stopwatch', 'polite');
  }, [currentSessionId, currentTime, announce]);

  const resetStopwatch = useCallback(() => {
    setIsRunning(false);
    setCurrentTime(0);
    pausedTimeRef.current = 0;
    
    if (currentSessionId) {
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { 
              ...session, 
              isRunning: false, 
              isPaused: false, 
              totalTime: 0,
              lapTimes: [],
            }
          : session
      ));
    }

    announce('Reset stopwatch', 'polite');
  }, [currentSessionId, announce]);

  const addLap = useCallback(() => {
    if (!currentSessionId || currentTime === 0) return;

    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (!currentSession) return;

    const lapNumber = currentSession.lapTimes.length + 1;
    const previousLapTime = currentSession.lapTimes[currentSession.lapTimes.length - 1]?.lapTime || 0;
    const splitTime = currentTime - previousLapTime;

    const newLap: LapTime = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      lapNumber,
      lapTime: currentTime,
      splitTime,
      timestamp: new Date(),
    };

    setSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { ...session, lapTimes: [...session.lapTimes, newLap] }
        : session
    ));

    announce(`Lap ${lapNumber} recorded: ${formatTime(splitTime)}`, 'polite');
  }, [currentSessionId, currentTime, sessions, announce]);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setCurrentTime(0);
      setIsRunning(false);
      pausedTimeRef.current = 0;
    }

    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      announce(`Deleted ${session.name} session`, 'polite');
    }
  }, [currentSessionId, sessions, announce]);

  const createNewSession = useCallback((name: string, category: StopwatchSession['category'] = 'custom') => {
    const newSession: StopwatchSession = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      startTime: new Date(),
      totalTime: 0,
      lapTimes: [],
      isRunning: false,
      isPaused: false,
      color: sessionColors[sessions.length % sessionColors.length],
      category,
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
    setCurrentTime(0);
    setIsRunning(false);
    pausedTimeRef.current = 0;

    announce(`Created new session: ${name}`, 'polite');
    return newSession;
  }, [sessions, announce]);

  // Computed values
  const currentSession = currentSessionId ? sessions.find(s => s.id === currentSessionId) : null;
  const activeSessions = sessions.filter(s => s.isRunning);
  const completedSessions = sessions.filter(s => s.endTime && !s.isRunning);
  const totalSessions = sessions.length;

  return {
    // State
    sessions,
    currentSession,
    currentTime,
    isRunning,
    isPaused: currentSession?.isPaused || false,
    
    // Computed
    activeSessions,
    completedSessions,
    totalSessions,
    
    // Actions
    startStopwatch,
    pauseStopwatch,
    stopStopwatch,
    resetStopwatch,
    addLap,
    deleteSession,
    createNewSession,
  };
}

// Helper function to format time (milliseconds to MM:SS.ms)
export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((milliseconds % 1000) / 10); // Show only 2 decimal places

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

// Helper function to format time for longer durations (show hours if needed)
export function formatLongTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((milliseconds % 1000) / 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
  
  return formatTime(milliseconds);
}

// Helper function to get average lap time
export function getAverageLapTime(lapTimes: LapTime[]): number {
  if (lapTimes.length === 0) return 0;
  
  const totalSplitTime = lapTimes.reduce((sum, lap) => sum + lap.splitTime, 0);
  return totalSplitTime / lapTimes.length;
}

// Helper function to get fastest/slowest lap
export function getFastestLap(lapTimes: LapTime[]): LapTime | null {
  if (lapTimes.length === 0) return null;
  
  return lapTimes.reduce((fastest, current) => 
    current.splitTime < fastest.splitTime ? current : fastest
  );
}

export function getSlowestLap(lapTimes: LapTime[]): LapTime | null {
  if (lapTimes.length === 0) return null;
  
  return lapTimes.reduce((slowest, current) => 
    current.splitTime > slowest.splitTime ? current : slowest
  );
}