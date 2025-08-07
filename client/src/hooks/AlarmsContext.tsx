import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { validateAlarmTime, createSnoozeAlarm } from '@/lib/alarmUtils';
import type { Alarm, InsertAlarm } from '@shared/schema';

// LocalStorage keys
const ALARMS_KEY = 'smart-alarm-alarms';
const COUNTER_KEY = 'smart-alarm-counter';

const getStoredAlarms = (): Alarm[] => {
  try {
    const stored = localStorage.getItem(ALARMS_KEY);
    if (!stored) return [];
    const alarms = JSON.parse(stored);
    return alarms.map((alarm: any) => ({
      ...alarm,
      triggerTime: new Date(alarm.triggerTime),
      createdAt: new Date(alarm.createdAt),
      updatedAt: new Date(alarm.updatedAt)
    }));
  } catch {
    return [];
  }
};

const saveAlarms = (alarms: Alarm[]): void => {
  try {
    localStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
  } catch {}
};

const getNextId = (): number => {
  try {
    const stored = localStorage.getItem(COUNTER_KEY);
    const currentId = stored ? parseInt(stored) : 1;
    localStorage.setItem(COUNTER_KEY, (currentId + 1).toString());
    return currentId;
  } catch {
    return Date.now();
  }
};


type AlarmsContextType = {
  alarms: Alarm[];
  createAlarm: (alarmData: InsertAlarm) => Promise<Alarm>;
  deleteAlarm: (id: number) => Promise<void>;
  updateAlarm: (update: { id: number } & Partial<InsertAlarm>) => Promise<void>;
  refetch: () => void;
};

const AlarmsContext = createContext<AlarmsContextType | undefined>(undefined);

import { ReactNode } from 'react';

export function AlarmsProvider({ children }: { children: ReactNode }) {
  const [alarms, setAlarms] = useState<Alarm[]>(getStoredAlarms());

  useEffect(() => {
    saveAlarms(alarms);
  }, [alarms]);

  const createAlarm = useCallback(async (alarmData: InsertAlarm) => {
    const validation = validateAlarmTime(new Date(alarmData.triggerTime));
    if (!validation.isValid) throw new Error(validation.error);
    const id = getNextId();
    const now = new Date();
    const newAlarm: Alarm = {
      ...alarmData,
      id,
      description: alarmData.description || null,
      repeatType: alarmData.repeatType || 'none',
      repeatValue: alarmData.repeatValue || null,
      soundEnabled: alarmData.soundEnabled ?? true,
      isActive: alarmData.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    setAlarms(prev => [...prev, newAlarm]);
    return newAlarm;
  }, []);

  const deleteAlarm = useCallback(async (id: number) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  }, []);

  const updateAlarm = useCallback(async (update: { id: number } & Partial<InsertAlarm>) => {
    setAlarms(prev => prev.map(a => a.id === update.id ? { ...a, ...update, updatedAt: new Date() } : a));
  }, []);

  const refetch = useCallback(() => {
    setAlarms(getStoredAlarms());
  }, []);

  return (
    <AlarmsContext.Provider value={{ alarms, createAlarm, deleteAlarm, updateAlarm, refetch }}>
      {children}
    </AlarmsContext.Provider>
  );
}

export function useAlarmsContext() {
  const ctx = useContext(AlarmsContext);
  if (ctx === undefined) throw new Error('useAlarmsContext must be used within AlarmsProvider');
  return ctx;
}
