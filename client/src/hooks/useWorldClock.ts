import { useState, useEffect, useCallback } from 'react';
import { useScreenReaderAnnouncement } from '@/components/accessibility/ScreenReaderText';
import { 
  WorldClockLocation, 
  TimezoneInfo, 
  getDefaultCities, 
  getCurrentTimeInTimezone,
  formatTimeInTimezone,
  formatTimeWithOptions,
  isDaytime,
  getBusinessHoursStatus,
  formatRelativeTime
} from '@/utils/timezone';
import { WorldClockPreferences } from '@/components/features/worldclock/WorldClockSettings';

export interface WorldClockData extends WorldClockLocation {
  currentTime: Date;
  formattedTime: string;
  formattedDate: string;
  isDaytime: boolean;
  businessStatus: 'business' | 'early' | 'late' | 'weekend';
  relativeTime: string;
}

export function useWorldClock(preferences?: WorldClockPreferences) {
  const [locations, setLocations] = useState<WorldClockLocation[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { announce } = useScreenReaderAnnouncement();

  // Load locations from localStorage on mount
  useEffect(() => {
    const savedLocations = localStorage.getItem('smart-alarm-worldclock-locations');
    if (savedLocations) {
      try {
        const parsed = JSON.parse(savedLocations);
        const validLocations = parsed.map((location: any) => ({
          ...location,
          addedAt: new Date(location.addedAt),
        }));
        setLocations(validLocations);
      } catch (error) {
        console.error('Failed to load world clock locations from localStorage:', error);
        // Load default cities if parsing fails
        loadDefaultCities();
      }
    } else {
      // Load default cities on first visit
      loadDefaultCities();
    }
  }, []);

  // Save locations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('smart-alarm-worldclock-locations', JSON.stringify(locations));
  }, [locations]);

  // Update current time based on preferences
  useEffect(() => {
    if (!preferences?.autoRefresh) return;
    
    const intervalMs = (preferences?.refreshInterval || 1) * 1000;
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, intervalMs);

    return () => clearInterval(interval);
  }, [preferences?.autoRefresh, preferences?.refreshInterval]);

  const loadDefaultCities = useCallback(() => {
    const defaultCities = getDefaultCities();
    const defaultLocations: WorldClockLocation[] = defaultCities.map((city, index) => ({
      id: city.id,
      timezoneInfo: city,
      isDefault: true,
      addedAt: new Date(),
    }));
    setLocations(defaultLocations);
  }, []);

  const addLocation = useCallback((timezoneInfo: TimezoneInfo, nickname?: string) => {
    // Check if location already exists
    const exists = locations.some(loc => loc.timezoneInfo.timezone === timezoneInfo.timezone);
    if (exists) {
      announce(`${timezoneInfo.city} is already in your world clock`, 'polite');
      return false;
    }

    const newLocation: WorldClockLocation = {
      id: `${timezoneInfo.id}-${Date.now()}`,
      timezoneInfo,
      isDefault: false,
      addedAt: new Date(),
      nickname,
    };

    setLocations(prev => [...prev, newLocation]);
    announce(`Added ${timezoneInfo.city} to world clock`, 'polite');
    return true;
  }, [locations, announce]);

  const removeLocation = useCallback((locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return;

    setLocations(prev => prev.filter(loc => loc.id !== locationId));
    announce(`Removed ${location.timezoneInfo.city} from world clock`, 'polite');
  }, [locations, announce]);

  const updateLocationNickname = useCallback((locationId: string, nickname: string) => {
    setLocations(prev => prev.map(loc => 
      loc.id === locationId 
        ? { ...loc, nickname: nickname.trim() || undefined }
        : loc
    ));
  }, []);

  const reorderLocations = useCallback((fromIndex: number, toIndex: number) => {
    setLocations(prev => {
      const newLocations = [...prev];
      const [removed] = newLocations.splice(fromIndex, 1);
      newLocations.splice(toIndex, 0, removed);
      return newLocations;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    loadDefaultCities();
    announce('Reset to default world clock locations', 'polite');
  }, [loadDefaultCities, announce]);

  // Get enhanced location data with current time information
  const getLocationData = useCallback((location: WorldClockLocation): WorldClockData => {
    const timezone = location.timezoneInfo.timezone;
    const currentTimeInZone = getCurrentTimeInTimezone(timezone);
    
    // Use preferences for formatting if available
    const timeFormat = preferences?.timeFormat || '24h';
    const showSeconds = preferences?.showSeconds || false;
    const dateFormat = preferences?.dateFormat || 'medium';
    
    const dateFormats = {
      short: 'MMM dd',
      medium: 'MMM dd, yyyy',
      long: 'EEEE, MMMM dd, yyyy'
    };
    
    return {
      ...location,
      currentTime: currentTimeInZone,
      formattedTime: formatTimeWithOptions(timezone, {
        format: timeFormat,
        showSeconds
      }),
      formattedDate: formatTimeInTimezone(timezone, dateFormats[dateFormat]),
      isDaytime: isDaytime(timezone),
      businessStatus: getBusinessHoursStatus(timezone),
      relativeTime: formatRelativeTime(timezone),
    };
  }, [preferences?.timeFormat, preferences?.showSeconds, preferences?.dateFormat]);

  // Get all locations with enhanced data
  const locationData = locations.map(getLocationData);

  // Get user's local timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const userLocation: WorldClockData = {
    id: 'user-local',
    timezoneInfo: {
      id: 'user-local',
      city: 'Your Location',
      country: 'Local Time',
      timezone: userTimezone,
      offset: formatRelativeTime(userTimezone, 'UTC'),
    },
    isDefault: true,
    addedAt: new Date(),
    currentTime: currentTime,
    formattedTime: formatTimeInTimezone(userTimezone, 'HH:mm'),
    formattedDate: formatTimeInTimezone(userTimezone, 'MMM dd, yyyy'),
    isDaytime: isDaytime(userTimezone),
    businessStatus: getBusinessHoursStatus(userTimezone),
    relativeTime: 'Local',
  };

  // Statistics
  const totalLocations = locations.length;
  const businessHoursCount = locationData.filter(loc => loc.businessStatus === 'business').length;
  const daytimeCount = locationData.filter(loc => loc.isDaytime).length;

  return {
    // Data
    locations: locationData,
    userLocation,
    currentTime,
    
    // Statistics
    totalLocations,
    businessHoursCount,
    daytimeCount,
    
    // Actions
    addLocation,
    removeLocation,
    updateLocationNickname,
    reorderLocations,
    resetToDefaults,
    getLocationData,
  };
}