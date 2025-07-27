import { format } from 'date-fns';
import { zonedTimeToUtc, toZonedTime } from 'date-fns-tz';

export interface TimezoneInfo {
  id: string;
  city: string;
  country: string;
  timezone: string;
  offset: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  population?: number;
  isCapital?: boolean;
  aliases?: string[];
}

// Major world cities with timezone information
export const worldCities: TimezoneInfo[] = [
  {
    id: 'new-york',
    city: 'New York',
    country: 'United States',
    timezone: 'America/New_York',
    offset: 'GMT-5',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    population: 8336817,
    aliases: ['NYC', 'New York City']
  },
  {
    id: 'los-angeles',
    city: 'Los Angeles',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    offset: 'GMT-8',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    population: 3979576,
    aliases: ['LA', 'Los Angeles']
  },
  {
    id: 'chicago',
    city: 'Chicago',
    country: 'United States',
    timezone: 'America/Chicago',
    offset: 'GMT-6',
    coordinates: { lat: 41.8781, lng: -87.6298 },
    population: 2693976
  },
  {
    id: 'london',
    city: 'London',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    offset: 'GMT+0',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    population: 9540576,
    isCapital: true,
    aliases: ['London, UK']
  },
  {
    id: 'paris',
    city: 'Paris',
    country: 'France',
    timezone: 'Europe/Paris',
    offset: 'GMT+1',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    population: 2165423,
    isCapital: true
  },
  {
    id: 'berlin',
    city: 'Berlin',
    country: 'Germany',
    timezone: 'Europe/Berlin',
    offset: 'GMT+1',
    coordinates: { lat: 52.5200, lng: 13.4050 },
    population: 3669491,
    isCapital: true
  },
  {
    id: 'tokyo',
    city: 'Tokyo',
    country: 'Japan',
    timezone: 'Asia/Tokyo',
    offset: 'GMT+9',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    population: 13960000,
    isCapital: true
  },
  {
    id: 'seoul',
    city: 'Seoul',
    country: 'South Korea',
    timezone: 'Asia/Seoul',
    offset: 'GMT+9',
    coordinates: { lat: 37.5665, lng: 126.9780 },
    population: 9720846,
    isCapital: true
  },
  {
    id: 'beijing',
    city: 'Beijing',
    country: 'China',
    timezone: 'Asia/Shanghai',
    offset: 'GMT+8',
    coordinates: { lat: 39.9042, lng: 116.4074 },
    population: 21540000,
    isCapital: true
  },
  {
    id: 'shanghai',
    city: 'Shanghai',
    country: 'China',
    timezone: 'Asia/Shanghai',
    offset: 'GMT+8',
    coordinates: { lat: 31.2304, lng: 121.4737 },
    population: 24870000
  },
  {
    id: 'mumbai',
    city: 'Mumbai',
    country: 'India',
    timezone: 'Asia/Kolkata',
    offset: 'GMT+5:30',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    population: 20411274
  },
  {
    id: 'delhi',
    city: 'Delhi',
    country: 'India',
    timezone: 'Asia/Kolkata',
    offset: 'GMT+5:30',
    coordinates: { lat: 28.7041, lng: 77.1025 },
    population: 32941308,
    isCapital: true
  },
  {
    id: 'dubai',
    city: 'Dubai',
    country: 'United Arab Emirates',
    timezone: 'Asia/Dubai',
    offset: 'GMT+4',
    coordinates: { lat: 25.2048, lng: 55.2708 },
    population: 3331420
  },
  {
    id: 'sydney',
    city: 'Sydney',
    country: 'Australia',
    timezone: 'Australia/Sydney',
    offset: 'GMT+11',
    coordinates: { lat: -33.8688, lng: 151.2093 },
    population: 5312163
  },
  {
    id: 'melbourne',
    city: 'Melbourne',
    country: 'Australia',
    timezone: 'Australia/Melbourne',
    offset: 'GMT+11',
    coordinates: { lat: -37.8136, lng: 144.9631 },
    population: 5078193
  },
  {
    id: 'singapore',
    city: 'Singapore',
    country: 'Singapore',
    timezone: 'Asia/Singapore',
    offset: 'GMT+8',
    coordinates: { lat: 1.3521, lng: 103.8198 },
    population: 5685807,
    isCapital: true
  },
  {
    id: 'hong-kong',
    city: 'Hong Kong',
    country: 'Hong Kong',
    timezone: 'Asia/Hong_Kong',
    offset: 'GMT+8',
    coordinates: { lat: 22.3193, lng: 114.1694 },
    population: 7481800
  },
  {
    id: 'moscow',
    city: 'Moscow',
    country: 'Russia',
    timezone: 'Europe/Moscow',
    offset: 'GMT+3',
    coordinates: { lat: 55.7558, lng: 37.6176 },
    population: 12506468,
    isCapital: true
  },
  {
    id: 'istanbul',
    city: 'Istanbul',
    country: 'Turkey',
    timezone: 'Europe/Istanbul',
    offset: 'GMT+3',
    coordinates: { lat: 41.0082, lng: 28.9784 },
    population: 15462452
  },
  {
    id: 'cairo',
    city: 'Cairo',
    country: 'Egypt',
    timezone: 'Africa/Cairo',
    offset: 'GMT+2',
    coordinates: { lat: 30.0444, lng: 31.2357 },
    population: 20901000,
    isCapital: true
  },
  {
    id: 'sao-paulo',
    city: 'São Paulo',
    country: 'Brazil',
    timezone: 'America/Sao_Paulo',
    offset: 'GMT-3',
    coordinates: { lat: -23.5505, lng: -46.6333 },
    population: 12325232
  },
  {
    id: 'mexico-city',
    city: 'Mexico City',
    country: 'Mexico',
    timezone: 'America/Mexico_City',
    offset: 'GMT-6',
    coordinates: { lat: 19.4326, lng: -99.1332 },
    population: 21804515,
    isCapital: true
  },
  {
    id: 'toronto',
    city: 'Toronto',
    country: 'Canada',
    timezone: 'America/Toronto',
    offset: 'GMT-5',
    coordinates: { lat: 43.6532, lng: -79.3832 },
    population: 2930000
  },
  {
    id: 'vancouver',
    city: 'Vancouver',
    country: 'Canada',
    timezone: 'America/Vancouver',
    offset: 'GMT-8',
    coordinates: { lat: 49.2827, lng: -123.1207 },
    population: 2463431
  }
];

export interface WorldClockLocation {
  id: string;
  timezoneInfo: TimezoneInfo;
  isDefault: boolean;
  addedAt: Date;
  nickname?: string;
}

// Utility functions with robust error handling
export function getCurrentTimeInTimezone(timezone: string): Date {
  try {
    if (!timezone || typeof timezone !== 'string') {
      throw new Error('Invalid timezone provided');
    }
    return toZonedTime(new Date(), timezone);
  } catch (error) {
    console.error(`Error getting current time for timezone "${timezone}":`, error);
    // Fallback to local time
    return new Date();
  }
}

export function formatTimeInTimezone(timezone: string, formatStr: string = 'HH:mm'): string {
  try {
    if (!timezone || typeof timezone !== 'string') {
      throw new Error('Invalid timezone provided');
    }
    if (!formatStr || typeof formatStr !== 'string') {
      formatStr = 'HH:mm';
    }
    
    const zonedTime = getCurrentTimeInTimezone(timezone);
    return format(zonedTime, formatStr);
  } catch (error) {
    console.error(`Error formatting time for timezone "${timezone}":`, error);
    // Fallback to current local time
    try {
      return format(new Date(), formatStr);
    } catch (formatError) {
      console.error('Error with format string:', formatError);
      return new Date().toLocaleTimeString();
    }
  }
}

export function getTimezoneOffset(timezone: string): string {
  try {
    if (!timezone || typeof timezone !== 'string') {
      return 'GMT+0';
    }

    const now = new Date();
    
    // Use Intl.DateTimeFormat to get accurate offset including DST
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    });
    
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find(part => part.type === 'timeZoneName');
    
    if (offsetPart?.value && offsetPart.value.startsWith('GMT')) {
      return offsetPart.value;
    }
    
    // Fallback calculation
    const utc = new Date(now.toISOString());
    const local = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const diff = (local.getTime() - utc.getTime()) / (1000 * 60 * 60);
    
    const sign = diff >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(diff));
    const minutes = Math.round((Math.abs(diff) - hours) * 60);
    
    if (minutes === 0) {
      return `GMT${sign}${hours}`;
    }
    return `GMT${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error(`Error getting timezone offset for "${timezone}":`, error);
    return 'GMT+0';
  }
}

export function isDaytime(timezone: string): boolean {
  try {
    if (!timezone || typeof timezone !== 'string') {
      // Fallback to local time
      const hour = new Date().getHours();
      return hour >= 6 && hour < 18;
    }
    
    const time = getCurrentTimeInTimezone(timezone);
    const hour = time.getHours();
    return hour >= 6 && hour < 18; // 6 AM to 6 PM is considered daytime
  } catch (error) {
    console.error(`Error checking daytime for timezone "${timezone}":`, error);
    // Safe fallback
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18;
  }
}

export function searchCities(query: string): TimezoneInfo[] {
  try {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return [];
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    // Validate search term length to prevent performance issues
    if (searchTerm.length > 100) {
      console.warn('Search term too long, truncating');
      return [];
    }
    
    const results = worldCities.filter(city => {
      try {
        const cityMatch = city.city?.toLowerCase().includes(searchTerm) || false;
        const countryMatch = city.country?.toLowerCase().includes(searchTerm) || false;
        const timezoneMatch = city.timezone?.toLowerCase().includes(searchTerm) || false;
        const aliasMatch = city.aliases?.some(alias => 
          alias?.toLowerCase().includes(searchTerm)
        ) || false;
        
        return cityMatch || countryMatch || timezoneMatch || aliasMatch;
      } catch (filterError) {
        console.error('Error filtering city:', city, filterError);
        return false;
      }
    }).sort((a, b) => {
      try {
        // Prioritize exact matches and capitals
        const aExact = a.city?.toLowerCase() === searchTerm || a.country?.toLowerCase() === searchTerm;
        const bExact = b.city?.toLowerCase() === searchTerm || b.country?.toLowerCase() === searchTerm;
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        if (a.isCapital && !b.isCapital) return -1;
        if (!a.isCapital && b.isCapital) return 1;
        
        // Sort by population (larger cities first)
        return (b.population || 0) - (a.population || 0);
      } catch (sortError) {
        console.error('Error sorting cities:', sortError);
        return 0;
      }
    });
    
    // Limit results to prevent UI performance issues
    return results.slice(0, 50);
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
}

export function getDefaultCities(): TimezoneInfo[] {
  return [
    worldCities.find(c => c.id === 'new-york')!,
    worldCities.find(c => c.id === 'london')!,
    worldCities.find(c => c.id === 'tokyo')!,
    worldCities.find(c => c.id === 'sydney')!,
  ];
}

export function calculateTimeDifference(timezone1: string, timezone2: string): number {
  const now = new Date();
  const time1 = toZonedTime(now, timezone1);
  const time2 = toZonedTime(now, timezone2);
  
  return (time1.getTime() - time2.getTime()) / (1000 * 60 * 60); // Hours difference
}


export function getBusinessHoursStatus(timezone: string): 'business' | 'early' | 'late' | 'weekend' {
  const time = getCurrentTimeInTimezone(timezone);
  const hour = time.getHours();
  const day = time.getDay();
  
  // Weekend check (Saturday = 6, Sunday = 0)
  if (day === 0 || day === 6) {
    return 'weekend';
  }
  
  // Business hours: 9 AM to 5 PM
  if (hour >= 9 && hour <= 17) {
    return 'business';
  } else if (hour < 9) {
    return 'early';
  } else {
    return 'late';
  }
}

export function formatRelativeTime(timezone: string, referenceTimezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone): string {
  const diff = calculateTimeDifference(timezone, referenceTimezone);
  
  if (diff === 0) return 'Same time';
  
  const hours = Math.abs(diff);
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  let timeStr = '';
  if (wholeHours > 0) {
    timeStr += `${wholeHours}h`;
  }
  if (minutes > 0) {
    timeStr += `${minutes}m`;
  }
  
  return diff > 0 ? `+${timeStr}` : `-${timeStr}`;
}

// Enhanced time zone utilities
export function getSunriseSunset(timezone: string, date: Date = new Date()): { sunrise: Date; sunset: Date } {
  // Simplified sunrise/sunset calculation (6 AM / 6 PM)
  // In a real app, you'd use a proper solar calculation library
  const localDate = toZonedTime(date, timezone);
  const sunrise = new Date(localDate);
  const sunset = new Date(localDate);
  
  sunrise.setHours(6, 0, 0, 0);
  sunset.setHours(18, 0, 0, 0);
  
  return { sunrise, sunset };
}

export function formatTimeWithOptions(
  timezone: string, 
  options: {
    format?: '12h' | '24h';
    showSeconds?: boolean;
    showDate?: boolean;
    dateFormat?: 'short' | 'medium' | 'long';
  } = {}
): string {
  try {
    if (!timezone || typeof timezone !== 'string') {
      throw new Error('Invalid timezone provided');
    }

    const { 
      format = '24h', 
      showSeconds = false, 
      showDate = false, 
      dateFormat = 'short' 
    } = options;
    
    // Validate options
    if (!['12h', '24h'].includes(format)) {
      console.warn(`Invalid format "${format}", defaulting to 24h`);
    }
    if (!['short', 'medium', 'long'].includes(dateFormat)) {
      console.warn(`Invalid dateFormat "${dateFormat}", defaulting to short`);
    }
    
    let timeFormat = format === '12h' ? 'h:mm' : 'HH:mm';
    if (showSeconds) {
      timeFormat += ':ss';
    }
    if (format === '12h') {
      timeFormat += ' a';
    }
    
    let result = formatTimeInTimezone(timezone, timeFormat);
    
    if (showDate) {
      const dateFormats = {
        short: 'MMM dd',
        medium: 'MMM dd, yyyy',
        long: 'EEEE, MMMM dd, yyyy'
      };
      const validDateFormat = ['short', 'medium', 'long'].includes(dateFormat) ? dateFormat : 'short';
      const dateStr = formatTimeInTimezone(timezone, dateFormats[validDateFormat]);
      result = `${result} • ${dateStr}`;
    }
    
    return result;
  } catch (error) {
    console.error('Error formatting time with options:', error);
    // Safe fallback
    try {
      return new Date().toLocaleTimeString();
    } catch (fallbackError) {
      console.error('Fallback time formatting failed:', fallbackError);
      return '00:00';
    }
  }
}

export function getWeekendDays(timezone: string): number[] {
  // Most countries: Saturday (6) and Sunday (0)
  // Middle East: Friday (5) and Saturday (6)
  // Israel: Friday evening to Saturday evening
  
  // Simplified - just return Saturday and Sunday for now
  return [0, 6];
}

export function isWeekend(timezone: string, date: Date = new Date()): boolean {
  const localTime = toZonedTime(date, timezone);
  const dayOfWeek = localTime.getDay();
  const weekendDays = getWeekendDays(timezone);
  return weekendDays.includes(dayOfWeek);
}

export function getTimezoneAbbreviation(timezone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    
    const parts = formatter.formatToParts(date);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName');
    return timeZoneName?.value || timezone.split('/')[1]?.replace('_', ' ') || timezone;
  } catch {
    return timezone.split('/')[1]?.replace('_', ' ') || timezone;
  }
}

export function convertTimeToTimezone(
  sourceTime: Date,
  sourceTimezone: string,
  targetTimezone: string
): Date {
  try {
    // Validate inputs
    if (!sourceTime || !(sourceTime instanceof Date) || isNaN(sourceTime.getTime())) {
      throw new Error('Invalid source time provided');
    }
    if (!sourceTimezone || typeof sourceTimezone !== 'string') {
      throw new Error('Invalid source timezone provided');
    }
    if (!targetTimezone || typeof targetTimezone !== 'string') {
      throw new Error('Invalid target timezone provided');
    }

    // Convert source time to UTC, then to target timezone
    const utcTime = zonedTimeToUtc(sourceTime, sourceTimezone);
    const result = toZonedTime(utcTime, targetTimezone);
    
    // Validate result
    if (!result || isNaN(result.getTime())) {
      throw new Error('Invalid conversion result');
    }
    
    return result;
  } catch (error) {
    console.error('Error converting time between timezones:', error);
    // Return source time as fallback
    return sourceTime instanceof Date && !isNaN(sourceTime.getTime()) ? sourceTime : new Date();
  }
}

export function generateTimeSlots(
  timezone: string,
  startHour: number = 0,
  endHour: number = 23,
  interval: number = 1
): Array<{ time: string; hour: number; isBusinessHours: boolean; isDaytime: boolean }> {
  const slots = [];
  const now = new Date();
  
  for (let hour = startHour; hour <= endHour; hour += interval) {
    const testDate = new Date(now);
    testDate.setHours(hour, 0, 0, 0);
    
    const zonedTime = toZonedTime(testDate, timezone);
    const timeStr = format(zonedTime, 'HH:mm', { timeZone: timezone });
    const businessStatus = getBusinessHoursStatus(timezone);
    const isDaylight = isDaytime(timezone);
    
    slots.push({
      time: timeStr,
      hour,
      isBusinessHours: businessStatus === 'business',
      isDaytime: isDaylight
    });
  }
  
  return slots;
}