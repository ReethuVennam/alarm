import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, Globe, RotateCcw, Calendar, Sunrise, Sunset, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CardLayout } from '@/components/layout/AppLayout';
import { FocusManager } from '@/components/accessibility/FocusManager';
import { 
  TimezoneInfo, 
  worldCities,
  formatTimeWithOptions,
  convertTimeToTimezone,
  getSunriseSunset,
  getTimezoneAbbreviation,
  calculateTimeDifference,
  getBusinessHoursStatus
} from '@/utils/timezone';

interface TimeConverterProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocations?: TimezoneInfo[];
}

export function TimeConverter({
  isOpen,
  onClose,
  initialLocations = []
}: TimeConverterProps) {
  const [sourceTimezone, setSourceTimezone] = useState<TimezoneInfo | null>(null);
  const [targetTimezone, setTargetTimezone] = useState<TimezoneInfo | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('24h');
  const [showSeconds, setShowSeconds] = useState(false);

  // Initialize with user's local timezone with error handling
  useEffect(() => {
    if (isOpen && !sourceTimezone) {
      try {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        if (!userTimezone) {
          throw new Error('Unable to detect user timezone');
        }
        
        const userCity = worldCities.find(city => city.timezone === userTimezone) || {
          id: 'user-local',
          city: 'Your Location',
          country: 'Local Time',
          timezone: userTimezone,
          offset: 'Local'
        };
        setSourceTimezone(userCity);
        
        // Set current time with validation
        const now = new Date();
        if (isNaN(now.getTime())) {
          throw new Error('Invalid current time');
        }
        
        const timeString = now.toTimeString().slice(0, 5);
        // Validate time format (HH:MM)
        if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(timeString)) {
          console.warn('Invalid time format, using fallback');
          setSelectedTime('12:00');
        } else {
          setSelectedTime(timeString);
        }
      } catch (error) {
        console.error('Error initializing TimeConverter:', error);
        // Fallback initialization
        setSourceTimezone({
          id: 'utc',
          city: 'UTC',
          country: 'Coordinated Universal Time',
          timezone: 'UTC',
          offset: 'GMT+0'
        });
        setSelectedTime('12:00');
      }
    }
  }, [isOpen, sourceTimezone]);

  const swapTimezones = () => {
    try {
      if (!sourceTimezone || !targetTimezone) {
        console.warn('Cannot swap: one or both timezones are not selected');
        return;
      }
      
      const temp = sourceTimezone;
      setSourceTimezone(targetTimezone);
      setTargetTimezone(temp);
    } catch (error) {
      console.error('Error swapping timezones:', error);
    }
  };

  const convertTime = () => {
    if (!sourceTimezone || !targetTimezone || !selectedTime) return null;

    try {
      // Validate inputs
      if (!selectedTime.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)) {
        console.error('Invalid time format:', selectedTime);
        return null;
      }
      
      if (!selectedDate || !selectedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.error('Invalid date format:', selectedDate);
        return null;
      }

      const [hours, minutes] = selectedTime.split(':').map(Number);
      
      // Validate time components
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error('Invalid time components:', { hours, minutes });
        return null;
      }
      
      const sourceDate = new Date(selectedDate);
      
      // Validate date creation
      if (isNaN(sourceDate.getTime())) {
        console.error('Invalid source date:', selectedDate);
        return null;
      }
      
      sourceDate.setHours(hours, minutes, 0, 0);
      
      // Validate timezone information
      if (!sourceTimezone.timezone || !targetTimezone.timezone) {
        console.error('Missing timezone information');
        return null;
      }

      const convertedTime = convertTimeToTimezone(
        sourceDate,
        sourceTimezone.timezone,
        targetTimezone.timezone
      );
      
      // Validate conversion result
      if (!convertedTime || isNaN(convertedTime.getTime())) {
        console.error('Invalid conversion result');
        return null;
      }

      return convertedTime;
    } catch (error) {
      console.error('Time conversion error:', error);
      return null;
    }
  };

  const convertedTime = convertTime();

  const getTimeDetails = (timezone: TimezoneInfo, time: Date) => {
    try {
      // Validate inputs
      if (!timezone || !timezone.timezone) {
        throw new Error('Invalid timezone information');
      }
      
      if (!time || isNaN(time.getTime())) {
        throw new Error('Invalid time provided');
      }
      
      const { sunrise, sunset } = getSunriseSunset(timezone.timezone, time);
      const abbreviation = getTimezoneAbbreviation(timezone.timezone, time);
      const businessStatus = getBusinessHoursStatus(timezone.timezone);
      
      const hour = time.getHours();
      if (isNaN(hour)) {
        throw new Error('Invalid hour from time');
      }
      
      const isDaytime = hour >= 6 && hour < 18;
      
      // Validate sunrise/sunset times
      const sunriseTime = sunrise && !isNaN(sunrise.getTime()) 
        ? sunrise.toTimeString().slice(0, 5) 
        : '06:00';
      const sunsetTime = sunset && !isNaN(sunset.getTime()) 
        ? sunset.toTimeString().slice(0, 5) 
        : '18:00';
      
      return {
        abbreviation: abbreviation || timezone.timezone.split('/')[1] || 'UTC',
        businessStatus: businessStatus || 'business',
        isDaytime,
        sunrise: sunriseTime,
        sunset: sunsetTime
      };
    } catch (error) {
      console.error('Error getting time details:', error);
      // Return safe fallback
      return {
        abbreviation: 'UTC',
        businessStatus: 'business' as const,
        isDaytime: true,
        sunrise: '06:00',
        sunset: '18:00'
      };
    }
  };

  const availableTimezones = (() => {
    try {
      // Validate initial locations
      const validInitialLocations = Array.isArray(initialLocations) 
        ? initialLocations.filter(loc => 
            loc && 
            typeof loc === 'object' && 
            loc.id && 
            loc.timezone && 
            loc.city
          )
        : [];
      
      // Filter out duplicates and invalid cities
      const validWorldCities = worldCities.filter(city => 
        city && 
        city.id && 
        city.timezone && 
        city.city &&
        !validInitialLocations.some(loc => loc.timezone === city.timezone)
      );
      
      return [
        ...validInitialLocations,
        ...validWorldCities
      ];
    } catch (error) {
      console.error('Error creating available timezones list:', error);
      // Fallback to world cities only
      return worldCities.filter(city => city && city.id && city.timezone && city.city) || [];
    }
  })();

  const timeDifference = (() => {
    try {
      if (!sourceTimezone?.timezone || !targetTimezone?.timezone) {
        return 0;
      }
      
      const diff = calculateTimeDifference(targetTimezone.timezone, sourceTimezone.timezone);
      
      // Validate result
      if (isNaN(diff) || !isFinite(diff)) {
        console.warn('Invalid time difference calculated');
        return 0;
      }
      
      return diff;
    } catch (error) {
      console.error('Error calculating time difference:', error);
      return 0;
    }
  })();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-4xl p-0 overflow-hidden border-0 bg-transparent shadow-none max-h-[90vh] overflow-y-auto"
        aria-labelledby="time-converter-title"
      >
        <FocusManager trapFocus autoFocus>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-background-secondary border border-border-color rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <DialogHeader className="p-6 border-b border-border-color">
              <DialogTitle id="time-converter-title" className="flex items-center">
                <Timer className="w-5 h-5 mr-2 text-accent-primary" />
                Time Zone Converter
              </DialogTitle>
              <p className="text-sm text-text-secondary mt-1">
                Convert time between different time zones
              </p>
            </DialogHeader>

            <div className="p-6">
              {/* Input Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Source Timezone */}
                <CardLayout title="From" description="Source timezone">
                  <div className="space-y-4">
                    <Select 
                      value={sourceTimezone?.id || ''} 
                      onValueChange={(value) => {
                        try {
                          if (!value || typeof value !== 'string') {
                            console.warn('Invalid timezone selection value');
                            return;
                          }
                          
                          const timezone = availableTimezones.find(tz => tz?.id === value);
                          if (timezone) {
                            setSourceTimezone(timezone);
                          } else {
                            console.warn('Selected timezone not found in available list:', value);
                          }
                        } catch (error) {
                          console.error('Error setting source timezone:', error);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimezones.map((timezone) => (
                          <SelectItem key={timezone.id} value={timezone.id}>
                            {timezone.city}, {timezone.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                          Date
                        </label>
                        <Input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => {
                            try {
                              const newDate = e.target.value;
                              // Validate date format
                              if (newDate && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
                                const testDate = new Date(newDate);
                                if (!isNaN(testDate.getTime())) {
                                  setSelectedDate(newDate);
                                } else {
                                  console.warn('Invalid date selected:', newDate);
                                }
                              } else if (newDate === '') {
                                // Allow clearing the date
                                setSelectedDate(new Date().toISOString().split('T')[0]);
                              }
                            } catch (error) {
                              console.error('Error setting date:', error);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                          Time
                        </label>
                        <Input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => {
                            try {
                              const newTime = e.target.value;
                              // Validate time format (HH:MM)
                              if (newTime && /^([01]?\d|2[0-3]):([0-5]\d)$/.test(newTime)) {
                                setSelectedTime(newTime);
                              } else if (newTime === '') {
                                // Allow clearing the time
                                setSelectedTime('12:00');
                              } else {
                                console.warn('Invalid time format:', newTime);
                              }
                            } catch (error) {
                              console.error('Error setting time:', error);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardLayout>

                {/* Target Timezone */}
                <CardLayout title="To" description="Target timezone">
                  <div className="space-y-4">
                    <Select 
                      value={targetTimezone?.id || ''} 
                      onValueChange={(value) => {
                        try {
                          if (!value || typeof value !== 'string') {
                            console.warn('Invalid timezone selection value');
                            return;
                          }
                          
                          const timezone = availableTimezones.find(tz => tz?.id === value);
                          if (timezone) {
                            setTargetTimezone(timezone);
                          } else {
                            console.warn('Selected timezone not found in available list:', value);
                          }
                        } catch (error) {
                          console.error('Error setting target timezone:', error);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimezones.map((timezone) => (
                          <SelectItem key={timezone.id} value={timezone.id}>
                            {timezone.city}, {timezone.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={swapTimezones}
                        disabled={!sourceTimezone || !targetTimezone}
                        className="flex items-center space-x-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Swap</span>
                      </Button>
                    </div>
                  </div>
                </CardLayout>
              </div>

              {/* Format Options */}
              <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-background-tertiary rounded-xl">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-text-primary">Format:</label>
                  <Select value={timeFormat} onValueChange={(value: '12h' | '24h') => setTimeFormat(value)}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12h</SelectItem>
                      <SelectItem value="24h">24h</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showSeconds}
                    onChange={(e) => setShowSeconds(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-text-primary">Show seconds</span>
                </label>
              </div>

              {/* Conversion Result */}
              {convertedTime && sourceTimezone && targetTimezone && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardLayout
                      title="Conversion Result"
                      description={`Time difference: ${Math.abs(timeDifference)}h ${timeDifference > 0 ? 'ahead' : 'behind'}`}
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Source Time Details */}
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-3xl font-mono font-bold text-text-primary mb-2">
                              {formatTimeWithOptions(sourceTimezone.timezone, {
                                format: timeFormat,
                                showSeconds,
                                showDate: true,
                                dateFormat: 'medium'
                              })}
                            </div>
                            <div className="text-sm text-text-secondary">
                              {sourceTimezone.city}, {sourceTimezone.country}
                            </div>
                            <div className="text-xs text-text-secondary">
                              {getTimeDetails(sourceTimezone, new Date(`${selectedDate}T${selectedTime}`)).abbreviation}
                            </div>
                          </div>

                          {(() => {
                            const details = getTimeDetails(sourceTimezone, new Date(`${selectedDate}T${selectedTime}`));
                            return (
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="flex items-center space-x-2">
                                  <Sunrise className="w-4 h-4 text-orange-500" />
                                  <span>Sunrise: {details.sunrise}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Sunset className="w-4 h-4 text-purple-500" />
                                  <span>Sunset: {details.sunset}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center justify-center lg:col-span-1">
                          <div className="flex items-center space-x-2 text-accent-primary">
                            <ArrowRight className="w-6 h-6" />
                            <span className="text-sm font-medium">
                              {timeDifference > 0 ? `+${timeDifference}h` : `${timeDifference}h`}
                            </span>
                          </div>
                        </div>

                        {/* Target Time Details */}
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-3xl font-mono font-bold text-text-primary mb-2">
                              {formatTimeWithOptions(targetTimezone.timezone, {
                                format: timeFormat,
                                showSeconds,
                                showDate: true,
                                dateFormat: 'medium'
                              })}
                            </div>
                            <div className="text-sm text-text-secondary">
                              {targetTimezone.city}, {targetTimezone.country}
                            </div>
                            <div className="text-xs text-text-secondary">
                              {getTimeDetails(targetTimezone, convertedTime).abbreviation}
                            </div>
                          </div>

                          {(() => {
                            const details = getTimeDetails(targetTimezone, convertedTime);
                            return (
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="flex items-center space-x-2">
                                  <Sunrise className="w-4 h-4 text-orange-500" />
                                  <span>Sunrise: {details.sunrise}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Sunset className="w-4 h-4 text-purple-500" />
                                  <span>Sunset: {details.sunset}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </CardLayout>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Quick Time Slots */}
              {targetTimezone && sourceTimezone && (
                <CardLayout
                  title="Quick Reference"
                  description="Common times converted"
                  className="mt-6"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[9, 12, 15, 18].map((hour) => {
                      try {
                        const testDate = new Date(selectedDate);
                        if (isNaN(testDate.getTime())) {
                          throw new Error('Invalid selected date');
                        }
                        
                        testDate.setHours(hour, 0, 0, 0);
                        
                        if (!sourceTimezone?.timezone || !targetTimezone?.timezone) {
                          throw new Error('Missing timezone information');
                        }
                        
                        const converted = convertTimeToTimezone(
                          testDate,
                          sourceTimezone.timezone,
                          targetTimezone.timezone
                        );
                        
                        if (!converted || isNaN(converted.getTime())) {
                          throw new Error('Invalid conversion result');
                        }
                        
                        return (
                          <div key={hour} className="text-center p-3 bg-background-tertiary rounded-lg">
                            <div className="text-sm font-medium text-text-primary">
                              {hour.toString().padStart(2, '0')}:00
                            </div>
                            <div className="text-xs text-accent-primary">
                              {converted.toTimeString().slice(0, 5)}
                            </div>
                          </div>
                        );
                      } catch (error) {
                        console.error(`Error converting time for hour ${hour}:`, error);
                        return (
                          <div key={hour} className="text-center p-3 bg-background-tertiary rounded-lg">
                            <div className="text-sm font-medium text-text-primary">
                              {hour.toString().padStart(2, '0')}:00
                            </div>
                            <div className="text-xs text-red-500">
                              Error
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                </CardLayout>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-border-color bg-background-tertiary/50">
              <div className="text-xs text-text-secondary">
                All times are calculated based on current DST rules
              </div>
              <Button
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </FocusManager>
      </DialogContent>
    </Dialog>
  );
}