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

// Utility functions
export function getCurrentTimeInTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone);
}

export function formatTimeInTimezone(timezone: string, formatStr: string = 'HH:mm'): string {
  const zonedTime = getCurrentTimeInTimezone(timezone);
  return format(zonedTime, formatStr, { timeZone: timezone });
}

export function getTimezoneOffset(timezone: string): string {
  const now = new Date();
  const zonedTime = toZonedTime(now, timezone);
  const offset = (zonedTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  const sign = offset >= 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(offset));
  const minutes = Math.round((Math.abs(offset) - hours) * 60);
  
  if (minutes === 0) {
    return `GMT${sign}${hours}`;
  }
  return `GMT${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
}

export function isDaytime(timezone: string): boolean {
  const time = getCurrentTimeInTimezone(timezone);
  const hour = time.getHours();
  return hour >= 6 && hour < 18; // 6 AM to 6 PM is considered daytime
}

export function searchCities(query: string): TimezoneInfo[] {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase().trim();
  
  return worldCities.filter(city => {
    const cityMatch = city.city.toLowerCase().includes(searchTerm);
    const countryMatch = city.country.toLowerCase().includes(searchTerm);
    const timezoneMatch = city.timezone.toLowerCase().includes(searchTerm);
    const aliasMatch = city.aliases?.some(alias => 
      alias.toLowerCase().includes(searchTerm)
    ) || false;
    
    return cityMatch || countryMatch || timezoneMatch || aliasMatch;
  }).sort((a, b) => {
    // Prioritize exact matches and capitals
    const aExact = a.city.toLowerCase() === searchTerm || a.country.toLowerCase() === searchTerm;
    const bExact = b.city.toLowerCase() === searchTerm || b.country.toLowerCase() === searchTerm;
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    if (a.isCapital && !b.isCapital) return -1;
    if (!a.isCapital && b.isCapital) return 1;
    
    // Sort by population (larger cities first)
    return (b.population || 0) - (a.population || 0);
  });
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

export function findOptimalMeetingTime(timezones: string[], startHour: number = 9, endHour: number = 17): Date | null {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrow.setHours(0, 0, 0, 0);
  
  // Try each hour of the day
  for (let hour = 0; hour < 24; hour++) {
    const testTime = new Date(tomorrow.getTime() + hour * 60 * 60 * 1000);
    
    let allInBusinessHours = true;
    for (const timezone of timezones) {
      const localTime = toZonedTime(testTime, timezone);
      const localHour = localTime.getHours();
      
      if (localHour < startHour || localHour > endHour) {
        allInBusinessHours = false;
        break;
      }
    }
    
    if (allInBusinessHours) {
      return testTime;
    }
  }
  
  return null; // No optimal time found
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