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
    try {
      const savedLocations = localStorage.getItem('smart-alarm-worldclock-locations');
      if (savedLocations) {
        try {
          const parsed = JSON.parse(savedLocations);
          
          // Validate parsed data structure
          if (!Array.isArray(parsed)) {
            throw new Error('Invalid saved locations format');
          }
          
          const validLocations = parsed
            .filter(location => {
              // Validate each location has required fields
              return location && 
                     typeof location.id === 'string' &&
                     location.timezoneInfo &&
                     typeof location.timezoneInfo.timezone === 'string' &&
                     typeof location.timezoneInfo.city === 'string';
            })
            .map((location: any) => ({
              ...location,
              addedAt: new Date(location.addedAt || new Date()),
              isDefault: Boolean(location.isDefault),
            }));
          
          setLocations(validLocations);
          
          // If no valid locations found, load defaults
          if (validLocations.length === 0) {
            console.warn('No valid locations found in saved data, loading defaults');
            loadDefaultCities();
          }
        } catch (parseError) {
          console.error('Failed to parse world clock locations from localStorage:', parseError);
          // Clear corrupted data and load defaults
          localStorage.removeItem('smart-alarm-worldclock-locations');
          loadDefaultCities();
        }
      } else {
        // Load default cities on first visit
        loadDefaultCities();
      }
    } catch (storageError) {
      console.error('Failed to access localStorage:', storageError);
      // Load defaults if localStorage is not available
      loadDefaultCities();
    }
  }, []);

  // Save locations to localStorage whenever they change
  useEffect(() => {
    try {
      // Only save if locations array is valid
      if (Array.isArray(locations)) {
        localStorage.setItem('smart-alarm-worldclock-locations', JSON.stringify(locations));
      }
    } catch (storageError) {
      console.error('Failed to save world clock locations to localStorage:', storageError);
    }
  }, [locations]);

  // Update current time based on preferences
  useEffect(() => {
    if (!preferences?.autoRefresh) return;
    
    try {
      // Validate refresh interval to prevent performance issues
      const refreshInterval = preferences?.refreshInterval || 1;
      const safeInterval = Math.max(0.1, Math.min(refreshInterval, 3600)); // Between 0.1s and 1 hour
      const intervalMs = safeInterval * 1000;
      
      const interval = setInterval(() => {
        try {
          setCurrentTime(new Date());
        } catch (timeError) {
          console.error('Error updating current time:', timeError);
        }
      }, intervalMs);

      return () => {
        try {
          clearInterval(interval);
        } catch (clearError) {
          console.error('Error clearing interval:', clearError);
        }
      };
    } catch (intervalError) {
      console.error('Error setting up time update interval:', intervalError);
    }
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
    try {
      // Validate input
      if (!timezoneInfo || typeof timezoneInfo !== 'object') {
        console.error('Invalid timezone info provided');
        announce('Failed to add location: Invalid data', 'polite');
        return false;
      }
      
      if (!timezoneInfo.timezone || !timezoneInfo.city) {
        console.error('Missing required timezone or city information');
        announce('Failed to add location: Missing information', 'polite');
        return false;
      }

      // Check if location already exists
      const exists = locations.some(loc => 
        loc?.timezoneInfo?.timezone === timezoneInfo.timezone
      );
      if (exists) {
        announce(`${timezoneInfo.city} is already in your world clock`, 'polite');
        return false;
      }

      // Validate nickname if provided
      const validNickname = nickname && typeof nickname === 'string' 
        ? nickname.trim().slice(0, 50) // Limit length
        : undefined;

      const newLocation: WorldClockLocation = {
        id: `${timezoneInfo.id || 'location'}-${Date.now()}`,
        timezoneInfo,
        isDefault: false,
        addedAt: new Date(),
        nickname: validNickname,
      };

      setLocations(prev => {
        // Double-check to prevent duplicates due to race conditions
        if (prev.some(loc => loc?.timezoneInfo?.timezone === timezoneInfo.timezone)) {
          return prev;
        }
        return [...prev, newLocation];
      });
      
      announce(`Added ${timezoneInfo.city} to world clock`, 'polite');
      return true;
    } catch (error) {
      console.error('Error adding location:', error);
      announce('Failed to add location', 'polite');
      return false;
    }
  }, [locations, announce]);

  const removeLocation = useCallback((locationId: string) => {
    try {
      // Validate input
      if (!locationId || typeof locationId !== 'string') {
        console.error('Invalid location ID provided for removal');
        announce('Failed to remove location: Invalid ID', 'polite');
        return false;
      }

      const location = locations.find(loc => loc?.id === locationId);
      if (!location) {
        console.warn(`Location with ID "${locationId}" not found`);
        announce('Location not found', 'polite');
        return false;
      }

      // Prevent removal if it's the last location and user prefers to keep at least one
      if (locations.length === 1) {
        console.info('Cannot remove the last location');
        announce('Cannot remove the last location', 'polite');
        return false;
      }

      setLocations(prev => {
        // Double-check the location still exists to prevent race conditions
        const filteredLocations = prev.filter(loc => loc?.id !== locationId);
        if (filteredLocations.length === prev.length) {
          console.warn('Location was already removed or not found during removal');
          return prev;
        }
        return filteredLocations;
      });
      
      announce(`Removed ${location.timezoneInfo?.city || 'location'} from world clock`, 'polite');
      return true;
    } catch (error) {
      console.error('Error removing location:', error);
      announce('Failed to remove location', 'polite');
      return false;
    }
  }, [locations, announce]);

  const updateLocationNickname = useCallback((locationId: string, nickname: string) => {
    try {
      // Validate inputs
      if (!locationId || typeof locationId !== 'string') {
        console.error('Invalid location ID provided for nickname update');
        announce('Failed to update nickname: Invalid location', 'polite');
        return false;
      }

      if (typeof nickname !== 'string') {
        console.error('Invalid nickname provided');
        announce('Failed to update nickname: Invalid input', 'polite');
        return false;
      }

      // Sanitize and validate nickname
      const sanitizedNickname = nickname.trim();
      if (sanitizedNickname.length > 50) {
        console.warn('Nickname too long, truncating');
        announce('Nickname truncated to 50 characters', 'polite');
      }
      const validNickname = sanitizedNickname.slice(0, 50) || undefined;

      // Check if location exists
      const locationExists = locations.some(loc => loc?.id === locationId);
      if (!locationExists) {
        console.error(`Location with ID "${locationId}" not found for nickname update`);
        announce('Location not found for nickname update', 'polite');
        return false;
      }

      setLocations(prev => prev.map(loc => {
        if (loc?.id === locationId) {
          return { ...loc, nickname: validNickname };
        }
        return loc;
      }));
      
      announce(
        validNickname 
          ? `Updated nickname to "${validNickname}"` 
          : 'Removed nickname', 
        'polite'
      );
      return true;
    } catch (error) {
      console.error('Error updating location nickname:', error);
      announce('Failed to update nickname', 'polite');
      return false;
    }
  }, [locations, announce]);

  const reorderLocations = useCallback((fromIndex: number, toIndex: number) => {
    try {
      // Validate indices
      if (typeof fromIndex !== 'number' || typeof toIndex !== 'number') {
        console.error('Invalid indices provided for reordering');
        announce('Failed to reorder locations: Invalid parameters', 'polite');
        return false;
      }

      if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) {
        console.error('Indices must be integers');
        announce('Failed to reorder locations: Invalid indices', 'polite');
        return false;
      }

      if (fromIndex < 0 || toIndex < 0 || 
          fromIndex >= locations.length || toIndex >= locations.length) {
        console.error(`Invalid indices: fromIndex=${fromIndex}, toIndex=${toIndex}, length=${locations.length}`);
        announce('Failed to reorder locations: Invalid position', 'polite');
        return false;
      }

      if (fromIndex === toIndex) {
        // No change needed
        return true;
      }

      setLocations(prev => {
        try {
          const newLocations = [...prev];
          const [removed] = newLocations.splice(fromIndex, 1);
          
          if (!removed) {
            console.error('Failed to remove item during reordering');
            return prev;
          }
          
          newLocations.splice(toIndex, 0, removed);
          return newLocations;
        } catch (reorderError) {
          console.error('Error during reordering operation:', reorderError);
          return prev;
        }
      });
      
      announce('Locations reordered', 'polite');
      return true;
    } catch (error) {
      console.error('Error reordering locations:', error);
      announce('Failed to reorder locations', 'polite');
      return false;
    }
  }, [locations, announce]);

  const resetToDefaults = useCallback(() => {
    try {
      loadDefaultCities();
      announce('Reset to default world clock locations', 'polite');
      return true;
    } catch (error) {
      console.error('Error resetting to defaults:', error);
      announce('Failed to reset to defaults', 'polite');
      return false;
    }
  }, [loadDefaultCities, announce]);

  // Get enhanced location data with current time information
  const getLocationData = useCallback((location: WorldClockLocation): WorldClockData => {
    try {
      // Validate location input
      if (!location || typeof location !== 'object') {
        throw new Error('Invalid location provided');
      }
      
      if (!location.timezoneInfo?.timezone) {
        throw new Error('Missing timezone information');
      }

      const timezone = location.timezoneInfo.timezone;
      const currentTimeInZone = getCurrentTimeInTimezone(timezone);
      
      // Use preferences for formatting if available with safe defaults
      const timeFormat = preferences?.timeFormat || '24h';
      const showSeconds = Boolean(preferences?.showSeconds);
      const dateFormat = preferences?.dateFormat || 'medium';
      
      // Validate date format and provide fallback
      const validDateFormats = {
        short: 'MMM dd',
        medium: 'MMM dd, yyyy',
        long: 'EEEE, MMMM dd, yyyy'
      };
      const safeDateFormat = validDateFormats[dateFormat] || validDateFormats.medium;
      
      return {
        ...location,
        currentTime: currentTimeInZone,
        formattedTime: formatTimeWithOptions(timezone, {
          format: timeFormat,
          showSeconds
        }),
        formattedDate: formatTimeInTimezone(timezone, safeDateFormat),
        isDaytime: isDaytime(timezone),
        businessStatus: getBusinessHoursStatus(timezone),
        relativeTime: formatRelativeTime(timezone),
      };
    } catch (error) {
      console.error('Error getting location data for location:', location, error);
      
      // Return safe fallback data
      const fallbackTime = new Date();
      return {
        ...location,
        currentTime: fallbackTime,
        formattedTime: fallbackTime.toLocaleTimeString(),
        formattedDate: fallbackTime.toLocaleDateString(),
        isDaytime: fallbackTime.getHours() >= 6 && fallbackTime.getHours() < 18,
        businessStatus: 'business' as const,
        relativeTime: 'Unknown',
      };
    }
  }, [preferences?.timeFormat, preferences?.showSeconds, preferences?.dateFormat]);

  // Get all locations with enhanced data with error handling
  const locationData = locations
    .filter(location => {
      // Filter out invalid locations
      if (!location || !location.timezoneInfo?.timezone) {
        console.warn('Filtering out invalid location:', location);
        return false;
      }
      return true;
    })
    .map(location => {
      try {
        return getLocationData(location);
      } catch (error) {
        console.error('Error processing location data:', location, error);
        // Return minimal safe data for broken locations
        const fallbackTime = new Date();
        return {
          ...location,
          currentTime: fallbackTime,
          formattedTime: 'Error',
          formattedDate: 'Error',
          isDaytime: true,
          businessStatus: 'business' as const,
          relativeTime: 'Error',
        };
      }
    });

  // Get user's local timezone with error handling
  const getUserLocation = useCallback((): WorldClockData => {
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      if (!userTimezone) {
        throw new Error('Unable to detect user timezone');
      }

      const timeFormat = preferences?.timeFormat === '12h' ? 'h:mm a' : 'HH:mm';
      const dateFormat = preferences?.dateFormat === 'short' ? 'MMM dd' : 
                        preferences?.dateFormat === 'long' ? 'EEEE, MMMM dd, yyyy' : 
                        'MMM dd, yyyy';

      return {
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
        formattedTime: formatTimeInTimezone(userTimezone, timeFormat),
        formattedDate: formatTimeInTimezone(userTimezone, dateFormat),
        isDaytime: isDaytime(userTimezone),
        businessStatus: getBusinessHoursStatus(userTimezone),
        relativeTime: 'Local',
      };
    } catch (error) {
      console.error('Error creating user location data:', error);
      
      // Fallback user location
      return {
        id: 'user-local',
        timezoneInfo: {
          id: 'user-local',
          city: 'Your Location',
          country: 'Local Time',
          timezone: 'UTC',
          offset: 'GMT+0',
        },
        isDefault: true,
        addedAt: new Date(),
        currentTime: currentTime,
        formattedTime: currentTime.toLocaleTimeString(),
        formattedDate: currentTime.toLocaleDateString(),
        isDaytime: currentTime.getHours() >= 6 && currentTime.getHours() < 18,
        businessStatus: 'business' as const,
        relativeTime: 'Local',
      };
    }
  }, [currentTime, preferences?.timeFormat, preferences?.dateFormat]);

  const userLocation = getUserLocation();

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