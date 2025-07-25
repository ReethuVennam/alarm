import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { validateAlarmTime, createSnoozeAlarm } from "@/lib/alarmUtils";
import type { Alarm, InsertAlarm } from "@shared/schema";

// LocalStorage keys
const ALARMS_KEY = 'smart-alarm-alarms';
const COUNTER_KEY = 'smart-alarm-counter';

// LocalStorage utilities
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
  } catch (error) {
    console.error('Error reading alarms from localStorage:', error);
    return [];
  }
};

const saveAlarms = (alarms: Alarm[]): void => {
  try {
    localStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
  } catch (error) {
    console.error('Error saving alarms to localStorage:', error);
  }
};

const getNextId = (): number => {
  try {
    const stored = localStorage.getItem(COUNTER_KEY);
    const currentId = stored ? parseInt(stored) : 1;
    localStorage.setItem(COUNTER_KEY, (currentId + 1).toString());
    return currentId;
  } catch (error) {
    console.error('Error getting next ID:', error);
    return Date.now();
  }
};

// Custom hook for localStorage-based alarm management
export function useLocalStorageAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Load alarms from localStorage on mount
  useEffect(() => {
    const loadAlarms = () => {
      const storedAlarms = getStoredAlarms();
      setAlarms(storedAlarms);
      setIsLoading(false);
      console.log(`Loaded ${storedAlarms.length} alarms from localStorage`);
    };

    loadAlarms();
  }, []);

  // Save to localStorage whenever alarms change
  useEffect(() => {
    if (!isLoading) {
      saveAlarms(alarms);
    }
  }, [alarms, isLoading]);

  // Create alarm mutation
  const createAlarmMutation = useMutation({
    mutationFn: async (alarmData: InsertAlarm) => {
      // Validate alarm time
      const validation = validateAlarmTime(new Date(alarmData.triggerTime));
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      console.log('Creating alarm:', alarmData);
      
      const id = getNextId();
      const now = new Date();

      const newAlarm: Alarm = {
        ...alarmData,
        id,
        description: alarmData.description || null,
        repeatType: alarmData.repeatType || "none",
        repeatValue: alarmData.repeatValue || null,
        soundEnabled: alarmData.soundEnabled ?? true,
        isActive: alarmData.isActive ?? true,
        createdAt: now,
        updatedAt: now
      };

      return newAlarm;
    },
    onSuccess: (newAlarm: Alarm) => {
      console.log('Alarm created successfully:', newAlarm);
      setAlarms(prev => [...prev, newAlarm]);
      
      // Invalidate queries to trigger refetch in other components
      queryClient.invalidateQueries({ queryKey: ["/api/alarms"] });
    },
    onError: (error) => {
      console.error('Failed to create alarm:', error);
    },
  });

  // Update alarm mutation
  const updateAlarmMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertAlarm>) => {
      // Validate alarm time if it's being updated
      if (updates.triggerTime) {
        const validation = validateAlarmTime(new Date(updates.triggerTime));
        if (!validation.isValid) {
          throw new Error(validation.error);
        }
      }

      const currentAlarms = getStoredAlarms();
      const alarmIndex = currentAlarms.findIndex(alarm => alarm.id === id);
      
      if (alarmIndex === -1) {
        throw new Error('Alarm not found');
      }

      const updatedAlarm: Alarm = {
        ...currentAlarms[alarmIndex],
        ...updates,
        updatedAt: new Date()
      };

      return updatedAlarm;
    },
    onSuccess: (updatedAlarm: Alarm) => {
      console.log('Alarm updated successfully:', updatedAlarm);
      setAlarms(prev => 
        prev.map(alarm => alarm.id === updatedAlarm.id ? updatedAlarm : alarm)
      );
      queryClient.invalidateQueries({ queryKey: ["/api/alarms"] });
    },
  });

  // Delete alarm mutation
  const deleteAlarmMutation = useMutation({
    mutationFn: async (id: number) => {
      const currentAlarms = getStoredAlarms();
      const alarmIndex = currentAlarms.findIndex(alarm => alarm.id === id);
      
      if (alarmIndex === -1) {
        throw new Error('Alarm not found');
      }

      return id;
    },
    onSuccess: (deletedId: number) => {
      console.log('Alarm deleted successfully:', deletedId);
      setAlarms(prev => 
        prev.map(alarm => 
          alarm.id === deletedId 
            ? { ...alarm, isActive: false, updatedAt: new Date() }
            : alarm
        )
      );
      queryClient.invalidateQueries({ queryKey: ["/api/alarms"] });
    },
  });

  // Snooze alarm function
  const snoozeAlarm = useCallback(async (alarm: Alarm, snoozeMinutes: number = 5) => {
    try {
      // Deactivate the original alarm
      await updateAlarmMutation.mutateAsync({ 
        id: alarm.id, 
        isActive: false 
      });
      
      // Create a new snoozed alarm
      const snoozeAlarmData = createSnoozeAlarm(alarm, snoozeMinutes);
      await createAlarmMutation.mutateAsync(snoozeAlarmData);
      
      console.log(`Alarm snoozed for ${snoozeMinutes} minutes`);
    } catch (error) {
      console.error('Failed to snooze alarm:', error);
      throw error;
    }
  }, [updateAlarmMutation, createAlarmMutation]);

  // Toggle alarm active state
  const toggleAlarm = useCallback(async (id: number, isActive: boolean) => {
    await updateAlarmMutation.mutateAsync({ id, isActive });
  }, [updateAlarmMutation]);

  // Helper functions for calculated values
  const formatTimeRemaining = (triggerTime: Date | string): string => {
    const trigger = new Date(triggerTime);
    const now = new Date();
    const diff = trigger.getTime() - now.getTime();
    
    if (diff <= 0) return "Now";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const calculateNextTriggerTime = (alarm: Alarm): Date => {
    const now = new Date();
    const triggerTime = new Date(alarm.triggerTime);
    
    if (alarm.repeatType === "none") {
      return triggerTime;
    }
    
    let nextTrigger = new Date(triggerTime);
    
    while (nextTrigger <= now) {
      switch (alarm.repeatType) {
        case "daily":
          nextTrigger.setDate(nextTrigger.getDate() + 1);
          break;
        case "weekly":
          nextTrigger.setDate(nextTrigger.getDate() + 7);
          break;
        case "monthly":
          nextTrigger.setMonth(nextTrigger.getMonth() + 1);
          break;
      }
    }
    
    return nextTrigger;
  };

  // Get active alarms with time remaining
  const activeAlarms = alarms
    .filter(alarm => alarm.isActive)
    .map(alarm => ({
      ...alarm,
      timeRemaining: formatTimeRemaining(alarm.triggerTime),
      nextTrigger: calculateNextTriggerTime(alarm),
    }))
    .sort((a, b) => new Date(a.nextTrigger).getTime() - new Date(b.nextTrigger).getTime());

  // Get upcoming alarms (next 24 hours)
  const upcomingAlarms = activeAlarms.filter(alarm => {
    const triggerTime = new Date(alarm.nextTrigger);
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return triggerTime <= twentyFourHoursFromNow;
  });

  // Export/Import functions for future database migration
  const exportData = useCallback(() => {
    return {
      alarms: getStoredAlarms(),
      version: '1.0',
      exportedAt: new Date().toISOString()
    };
  }, []);

  const importData = useCallback((data: { alarms: Alarm[] }) => {
    try {
      const processedAlarms = data.alarms.map(alarm => ({
        ...alarm,
        triggerTime: new Date(alarm.triggerTime),
        createdAt: new Date(alarm.createdAt),
        updatedAt: new Date(alarm.updatedAt)
      }));
      
      setAlarms(processedAlarms);
      
      // Update counter to highest ID + 1
      const maxId = Math.max(...processedAlarms.map(a => a.id), 0);
      localStorage.setItem(COUNTER_KEY, (maxId + 1).toString());
      
      console.log(`Imported ${processedAlarms.length} alarms`);
    } catch (error) {
      console.error('Error importing data:', error);
    }
  }, []);

  return {
    // Data
    alarms,
    activeAlarms,
    upcomingAlarms,
    
    // Loading states
    isLoading,
    error: null,
    isCreating: createAlarmMutation.isPending,
    isUpdating: updateAlarmMutation.isPending,
    isDeleting: deleteAlarmMutation.isPending,
    
    // Actions
    createAlarm: createAlarmMutation.mutateAsync,
    updateAlarm: updateAlarmMutation.mutateAsync,
    deleteAlarm: deleteAlarmMutation.mutateAsync,
    snoozeAlarm,
    toggleAlarm,
    refetch: () => {
      const storedAlarms = getStoredAlarms();
      setAlarms(storedAlarms);
    },
    
    // Migration utilities
    exportData,
    importData,
    
    // Utility functions
    requestNotificationPermission: () => {
      if ('Notification' in window) {
        return Notification.requestPermission();
      }
      return Promise.resolve('denied');
    },
  };
}