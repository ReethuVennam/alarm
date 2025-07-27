import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Briefcase, Coffee, Home, Calendar, X, Edit2, Sunrise, Sunset, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WorldClockData } from '@/hooks/useWorldClock';
import { ScreenReaderText } from '@/components/accessibility/ScreenReaderText';
import { 
  getSunriseSunset, 
  getTimezoneAbbreviation, 
  formatTimeWithOptions,
  isWeekend 
} from '@/utils/timezone';

interface WorldClockCardProps {
  location: WorldClockData;
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
  onNicknameUpdate?: (id: string, nickname: string) => void;
  size?: 'small' | 'medium' | 'large';
  showControls?: boolean;
  showEnhancedInfo?: boolean;
  timeFormat?: '12h' | '24h';
  className?: string;
}

export function WorldClockCard({
  location,
  onRemove,
  onEdit,
  onNicknameUpdate,
  size = 'medium',
  showControls = true,
  showEnhancedInfo = false,
  timeFormat = '24h',
  className = ''
}: WorldClockCardProps) {
  // Input validation and safe defaults
  const safeLocation = (() => {
    try {
      if (!location || typeof location !== 'object') {
        throw new Error('Invalid location data');
      }
      
      if (!location.timezoneInfo || !location.timezoneInfo.timezone) {
        throw new Error('Missing timezone information');
      }
      
      return location;
    } catch (error) {
      console.error('WorldClockCard: Invalid location data:', error);
      // Return minimal fallback data
      const fallbackTime = new Date();
      return {
        id: 'error',
        timezoneInfo: {
          id: 'error',
          city: 'Unknown',
          country: 'Unknown',
          timezone: 'UTC',
          offset: 'GMT+0'
        },
        isDefault: false,
        addedAt: fallbackTime,
        currentTime: fallbackTime,
        formattedTime: 'Error',
        formattedDate: 'Error',
        isDaytime: true,
        businessStatus: 'business' as const,
        relativeTime: 'Error'
      };
    }
  })();
  
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameValue, setNicknameValue] = useState(() => {
    try {
      return safeLocation.nickname || safeLocation.timezoneInfo?.city || 'Unknown';
    } catch (error) {
      console.error('Error initializing nickname:', error);
      return 'Unknown';
    }
  });
  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  const textSizes = {
    small: { time: 'text-2xl', location: 'text-sm', date: 'text-xs' },
    medium: { time: 'text-3xl', location: 'text-base', date: 'text-sm' },
    large: { time: 'text-4xl', location: 'text-lg', date: 'text-base' }
  };

  const getStatusIcon = () => {
    try {
      const businessStatus = safeLocation.businessStatus || 'business';
      const isDaytime = Boolean(safeLocation.isDaytime);
      
      if (businessStatus === 'weekend') {
        return <Home className="w-4 h-4" />;
      }
      
      switch (businessStatus) {
        case 'business':
          return <Briefcase className="w-4 h-4" />;
        case 'early':
          return <Coffee className="w-4 h-4" />;
        case 'late':
          return isDaytime ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />;
        default:
          return isDaytime ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />;
      }
    } catch (error) {
      console.error('Error getting status icon:', error);
      return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    try {
      const businessStatus = safeLocation.businessStatus || 'business';
      
      switch (businessStatus) {
        case 'business':
          return 'text-green-600 dark:text-green-400';
        case 'early':
          return 'text-blue-600 dark:text-blue-400';
        case 'late':
          return 'text-orange-600 dark:text-orange-400';
        case 'weekend':
          return 'text-purple-600 dark:text-purple-400';
        default:
          return 'text-gray-600 dark:text-gray-400';
      }
    } catch (error) {
      console.error('Error getting status color:', error);
      return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusText = () => {
    try {
      const businessStatus = safeLocation.businessStatus || 'business';
      const isDaytime = Boolean(safeLocation.isDaytime);
      
      switch (businessStatus) {
        case 'business':
          return 'Business Hours';
        case 'early':
          return 'Early Morning';
        case 'late':
          return 'After Hours';
        case 'weekend':
          return 'Weekend';
        default:
          return isDaytime ? 'Daytime' : 'Nighttime';
      }
    } catch (error) {
      console.error('Error getting status text:', error);
      return 'Unknown Status';
    }
  };

  const handleNicknameSubmit = () => {
    try {
      if (!onNicknameUpdate) {
        console.warn('onNicknameUpdate callback not provided');
        setIsEditingNickname(false);
        return;
      }
      
      if (typeof nicknameValue !== 'string') {
        console.error('Invalid nickname value type');
        setIsEditingNickname(false);
        return;
      }
      
      const trimmedNickname = nicknameValue.trim();
      const currentValue = safeLocation.nickname || safeLocation.timezoneInfo?.city || '';
      
      if (trimmedNickname !== currentValue) {
        // Validate nickname length
        if (trimmedNickname.length > 50) {
          console.warn('Nickname too long, truncating to 50 characters');
        }
        
        const validNickname = trimmedNickname.slice(0, 50);
        onNicknameUpdate(safeLocation.id, validNickname);
      }
      
      setIsEditingNickname(false);
    } catch (error) {
      console.error('Error submitting nickname:', error);
      setIsEditingNickname(false);
    }
  };

  const handleNicknameKeyPress = (e: React.KeyboardEvent) => {
    try {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNicknameSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        const originalValue = safeLocation.nickname || safeLocation.timezoneInfo?.city || 'Unknown';
        setNicknameValue(originalValue);
        setIsEditingNickname(false);
      }
    } catch (error) {
      console.error('Error handling nickname key press:', error);
      setIsEditingNickname(false);
    }
  };

  // Enhanced info calculations with error handling
  const sunriseSunset = (() => {
    try {
      return showEnhancedInfo && safeLocation.timezoneInfo?.timezone 
        ? getSunriseSunset(safeLocation.timezoneInfo.timezone) 
        : null;
    } catch (error) {
      console.error('Error getting sunrise/sunset:', error);
      return null;
    }
  })();
  
  const timezoneAbbr = (() => {
    try {
      return showEnhancedInfo && safeLocation.timezoneInfo?.timezone 
        ? getTimezoneAbbreviation(safeLocation.timezoneInfo.timezone) 
        : null;
    } catch (error) {
      console.error('Error getting timezone abbreviation:', error);
      return null;
    }
  })();
  
  const isWeekendDay = (() => {
    try {
      return showEnhancedInfo && safeLocation.timezoneInfo?.timezone 
        ? isWeekend(safeLocation.timezoneInfo.timezone) 
        : false;
    } catch (error) {
      console.error('Error checking weekend:', error);
      return false;
    }
  })();
  
  const formattedTime = (() => {
    try {
      if (!safeLocation.timezoneInfo?.timezone) {
        return safeLocation.formattedTime || 'Error';
      }
      
      // Validate timeFormat parameter
      const validTimeFormat = ['12h', '24h'].includes(timeFormat) ? timeFormat : '24h';
      
      return formatTimeWithOptions(safeLocation.timezoneInfo.timezone, {
        format: validTimeFormat,
        showSeconds: size === 'large'
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return safeLocation.formattedTime || 'Error';
    }
  })();

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl border border-border-color
        transition-all duration-200 hover:shadow-lg
        ${sizeClasses[size]} ${className}
        ${safeLocation.isDaytime 
          ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30' 
          : 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30'
        }
      `}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      role="region"
      aria-label={`${safeLocation.timezoneInfo?.city || 'Unknown'} time zone information`}
    >
      {/* Background gradient overlay */}
      <div
        className={`absolute inset-0 opacity-5 ${
          safeLocation.isDaytime
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
            : 'bg-gradient-to-br from-indigo-900 to-purple-900'
        }`}
      />

      {/* Controls */}
      {showControls && !safeLocation.isDefault && (
        <div className="absolute top-3 right-3 flex space-x-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                try {
                  onEdit(safeLocation.id);
                } catch (error) {
                  console.error('Error calling onEdit:', error);
                }
              }}
              className="w-8 h-8 p-0 rounded-full hover:bg-background-secondary/80"
              aria-label="Edit location"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                try {
                  onRemove(safeLocation.id);
                } catch (error) {
                  console.error('Error calling onRemove:', error);
                }
              }}
              className="w-8 h-8 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
              aria-label="Remove location"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}

      <div className="relative z-10">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
          {safeLocation.relativeTime !== 'Local' && (
            <div className="text-xs text-text-secondary bg-background-secondary/50 px-2 py-1 rounded-full">
              {safeLocation.relativeTime || 'Unknown'}
            </div>
          )}
        </div>

        {/* Location Name */}
        <div className="mb-4">
          {isEditingNickname ? (
            <Input
              value={nicknameValue}
              onChange={(e) => setNicknameValue(e.target.value)}
              onBlur={handleNicknameSubmit}
              onKeyDown={handleNicknameKeyPress}
              className={`font-bold bg-transparent border-0 shadow-none p-0 ${textSizes[size].location}`}
              autoFocus
            />
          ) : (
            <h3 
              className={`font-bold text-text-primary ${textSizes[size].location} ${onNicknameUpdate ? 'cursor-pointer hover:text-accent-primary' : ''}`}
              onClick={() => {
                try {
                  if (onNicknameUpdate) {
                    setIsEditingNickname(true);
                  }
                } catch (error) {
                  console.error('Error starting nickname edit:', error);
                }
              }}
              title={onNicknameUpdate ? "Click to edit nickname" : undefined}
            >
              {safeLocation.nickname || safeLocation.timezoneInfo?.city || 'Unknown'}
            </h3>
          )}
          <div className="flex items-center space-x-2">
            <p className={`text-text-secondary ${textSizes[size].date}`}>
              {safeLocation.timezoneInfo?.country || 'Unknown'}
            </p>
            {isWeekendDay && (
              <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                Weekend
              </span>
            )}
          </div>
        </div>

        {/* Time Display */}
        <div className="mb-4">
          <div className={`font-mono font-bold text-text-primary ${textSizes[size].time}`}>
            {formattedTime}
          </div>
          <div className={`text-text-secondary flex items-center space-x-2 ${textSizes[size].date}`}>
            <Calendar className="w-3 h-3" />
            <span>{safeLocation.formattedDate || 'Error'}</span>
            {timezoneAbbr && (
              <span className="text-xs bg-background-tertiary px-2 py-1 rounded">
                {timezoneAbbr}
              </span>
            )}
          </div>
        </div>

        {/* Enhanced Info */}
        {showEnhancedInfo && sunriseSunset && (
          <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
              <Sunrise className="w-3 h-3" />
              <span>
                {(() => {
                  try {
                    return sunriseSunset.sunrise && !isNaN(sunriseSunset.sunrise.getTime()) 
                      ? sunriseSunset.sunrise.toTimeString().slice(0, 5)
                      : '06:00';
                  } catch (error) {
                    console.error('Error formatting sunrise time:', error);
                    return '06:00';
                  }
                })()}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
              <Sunset className="w-3 h-3" />
              <span>
                {(() => {
                  try {
                    return sunriseSunset.sunset && !isNaN(sunriseSunset.sunset.getTime()) 
                      ? sunriseSunset.sunset.toTimeString().slice(0, 5)
                      : '18:00';
                  } catch (error) {
                    console.error('Error formatting sunset time:', error);
                    return '18:00';
                  }
                })()}
              </span>
            </div>
          </div>
        )}

        {/* Timezone Info */}
        <div className="text-xs text-text-secondary">
          {safeLocation.timezoneInfo?.offset || 'GMT+0'} • {(() => {
            try {
              return safeLocation.timezoneInfo?.timezone?.split('/')[1]?.replace('_', ' ') || 'UTC';
            } catch (error) {
              console.error('Error formatting timezone display:', error);
              return 'UTC';
            }
          })()}
        </div>

        {/* Screen reader information */}
        <ScreenReaderText>
          {safeLocation.timezoneInfo?.city || 'Unknown'}, {safeLocation.timezoneInfo?.country || 'Unknown'}. 
          Current time: {safeLocation.formattedTime || 'Error'}. 
          Date: {safeLocation.formattedDate || 'Error'}. 
          Status: {getStatusText()}.
          {safeLocation.relativeTime !== 'Local' && safeLocation.relativeTime && ` Time difference: ${safeLocation.relativeTime}.`}
        </ScreenReaderText>
      </div>
    </motion.div>
  );
}

interface CompactWorldClockCardProps {
  location: WorldClockData;
  onRemove?: (id: string) => void;
  className?: string;
}

export function CompactWorldClockCard({
  location,
  onRemove,
  className = ''
}: CompactWorldClockCardProps) {
  // Input validation and safe defaults
  const safeLocation = (() => {
    try {
      if (!location || typeof location !== 'object') {
        throw new Error('Invalid location data');
      }
      
      if (!location.timezoneInfo || !location.timezoneInfo.timezone) {
        throw new Error('Missing timezone information');
      }
      
      return location;
    } catch (error) {
      console.error('CompactWorldClockCard: Invalid location data:', error);
      // Return minimal fallback data
      const fallbackTime = new Date();
      return {
        id: 'error',
        timezoneInfo: {
          id: 'error',
          city: 'Unknown',
          country: 'Unknown',
          timezone: 'UTC',
          offset: 'GMT+0'
        },
        isDefault: false,
        addedAt: fallbackTime,
        currentTime: fallbackTime,
        formattedTime: 'Error',
        formattedDate: 'Error',
        isDaytime: true,
        businessStatus: 'business' as const,
        relativeTime: 'Error'
      };
    }
  })();
  
  return (
    <motion.div
      className={`
        flex items-center justify-between p-3 bg-background-secondary 
        border border-border-color rounded-xl transition-all duration-200
        hover:bg-background-tertiary/50 ${className}
      `}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Status & Location */}
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${
          safeLocation.isDaytime ? 'bg-yellow-400' : 'bg-indigo-400'
        }`} />
        
        <div className="min-w-0">
          <div className="font-medium text-text-primary truncate">
            {safeLocation.nickname || safeLocation.timezoneInfo?.city || 'Unknown'}
          </div>
          <div className="text-xs text-text-secondary truncate">
            {safeLocation.timezoneInfo?.country || 'Unknown'}
          </div>
        </div>
      </div>

      {/* Time & Controls */}
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="font-mono font-medium text-text-primary">
            {safeLocation.formattedTime || 'Error'}
          </div>
          <div className="text-xs text-text-secondary">
            {safeLocation.relativeTime || 'Unknown'}
          </div>
        </div>

        {onRemove && !safeLocation.isDefault && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              try {
                onRemove(safeLocation.id);
              } catch (error) {
                console.error('Error calling onRemove:', error);
              }
            }}
            className="w-6 h-6 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
            aria-label="Remove location"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}