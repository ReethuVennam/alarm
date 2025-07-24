import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";
import { AlarmScheduler, NotificationManager, createSnoozeAlarm, validateAlarmTime } from "@/lib/alarmUtils";
import type { Alarm, InsertAlarm } from "@shared/schema";

// Custom hook for managing alarms with scheduling
export function useAlarms() {
  const queryClient = useQueryClient();
  const schedulerRef = useRef<AlarmScheduler | null>(null);
  const notificationManagerRef = useRef<NotificationManager | null>(null);

  // Initialize managers
  useEffect(() => {
    if (!schedulerRef.current) {
      schedulerRef.current = new AlarmScheduler((alarm) => {
        // Handle alarm trigger
        console.log(`🔔 Alarm triggered: ${alarm.title}`);
        // You can add custom logic here, like showing a modal
        // or playing a sound through your audioManager
      });
    }

    if (!notificationManagerRef.current) {
      notificationManagerRef.current = NotificationManager.getInstance();
      // Request notification permission on first load
      notificationManagerRef.current.requestPermission();
    }
  }, []);

  // Fetch alarms
  const {
    data: alarms = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Alarm[]>({
    queryKey: ["/api/alarms"],
    staleTime: 30000, // Consider data stale after 30 seconds
    refetchInterval: 60000, // Refetch every minute to keep alarms in sync
  });

  // Schedule active alarms when data changes
  useEffect(() => {
    if (schedulerRef.current && alarms.length > 0) {
      // Clear existing schedules
      schedulerRef.current.clearAllAlarms();
      
      // Schedule active alarms
      alarms
        .filter(alarm => alarm.isActive)
        .forEach(alarm => {
          schedulerRef.current?.scheduleAlarm(alarm);
        });
    }
  }, [alarms]);

  // Create alarm mutation with validation
  const createAlarmMutation = useMutation({
    mutationFn: async (alarmData: InsertAlarm) => {
      // Validate alarm time
      const validation = validateAlarmTime(new Date(alarmData.triggerTime));
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      console.log('Creating alarm:', alarmData);
      const response = await apiRequest("POST", "/api/alarms", alarmData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create alarm: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: async (newAlarm: Alarm) => {
      console.log('Alarm created successfully:', newAlarm);
      
      // Schedule the new alarm immediately
      if (schedulerRef.current && newAlarm.isActive) {
        schedulerRef.current.scheduleAlarm(newAlarm);
      }
      
      // Update cache
      await queryClient.invalidateQueries({ queryKey: ["/api/alarms"] });
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

      const response = await apiRequest("PATCH", `/api/alarms/${id}`, updates);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update alarm: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: async (updatedAlarm: Alarm) => {
      console.log('Alarm updated successfully:', updatedAlarm);
      
      // Update scheduler
      if (schedulerRef.current) {
        schedulerRef.current.clearAlarm(updatedAlarm.id);
        if (updatedAlarm.isActive) {
          schedulerRef.current.scheduleAlarm(updatedAlarm);
        }
      }
      
      await queryClient.invalidateQueries({ queryKey: ["/api/alarms"] });
    },
  });

  // Delete alarm mutation
  const deleteAlarmMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/alarms/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to delete alarm: ${response.status}`);
      }
      
      return { id };
    },
    onSuccess: async (data) => {
      console.log('Alarm deleted successfully:', data.id);
      
      // Clear from scheduler
      if (schedulerRef.current) {
        schedulerRef.current.clearAlarm(data.id);
      }
      
      await queryClient.invalidateQueries({ queryKey: ["/api/alarms"] });
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (schedulerRef.current) {
        schedulerRef.current.clearAllAlarms();
      }
    };
  }, []);

  return {
    // Data
    alarms,
    activeAlarms,
    upcomingAlarms,
    
    // Loading states
    isLoading,
    error,
    isCreating: createAlarmMutation.isPending,
    isUpdating: updateAlarmMutation.isPending,
    isDeleting: deleteAlarmMutation.isPending,
    
    // Actions
    createAlarm: createAlarmMutation.mutateAsync,
    updateAlarm: updateAlarmMutation.mutateAsync,
    deleteAlarm: deleteAlarmMutation.mutateAsync,
    snoozeAlarm,
    toggleAlarm,
    refetch,
    
    // Utility functions
    requestNotificationPermission: () => notificationManagerRef.current?.requestPermission(),
  };
}

// Helper functions (moved from alarmUtils for consistency)
function formatTimeRemaining(triggerTime: Date | string): string {
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
}

function calculateNextTriggerTime(alarm: Alarm): Date {
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
}