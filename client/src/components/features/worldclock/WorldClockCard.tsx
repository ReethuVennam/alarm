import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Briefcase, Coffee, Home, Calendar, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorldClockData } from '@/hooks/useWorldClock';
import { ScreenReaderText } from '@/components/accessibility/ScreenReaderText';

interface WorldClockCardProps {
  location: WorldClockData;
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
  size?: 'small' | 'medium' | 'large';
  showControls?: boolean;
  className?: string;
}

export function WorldClockCard({
  location,
  onRemove,
  onEdit,
  size = 'medium',
  showControls = true,
  className = ''
}: WorldClockCardProps) {
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
    if (location.businessStatus === 'weekend') {
      return <Home className="w-4 h-4" />;
    }
    switch (location.businessStatus) {
      case 'business':
        return <Briefcase className="w-4 h-4" />;
      case 'early':
        return <Coffee className="w-4 h-4" />;
      case 'late':
        return location.isDaytime ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />;
      default:
        return location.isDaytime ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (location.businessStatus) {
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
  };

  const getStatusText = () => {
    switch (location.businessStatus) {
      case 'business':
        return 'Business Hours';
      case 'early':
        return 'Early Morning';
      case 'late':
        return 'After Hours';
      case 'weekend':
        return 'Weekend';
      default:
        return location.isDaytime ? 'Daytime' : 'Nighttime';
    }
  };

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl border border-border-color
        transition-all duration-200 hover:shadow-lg
        ${sizeClasses[size]} ${className}
        ${location.isDaytime 
          ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30' 
          : 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30'
        }
      `}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      role="region"
      aria-label={`${location.timezoneInfo.city} time zone information`}
    >
      {/* Background gradient overlay */}
      <div
        className={`absolute inset-0 opacity-5 ${
          location.isDaytime
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
            : 'bg-gradient-to-br from-indigo-900 to-purple-900'
        }`}
      />

      {/* Controls */}
      {showControls && !location.isDefault && (
        <div className="absolute top-3 right-3 flex space-x-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(location.id)}
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
              onClick={() => onRemove(location.id)}
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
          {location.relativeTime !== 'Local' && (
            <div className="text-xs text-text-secondary bg-background-secondary/50 px-2 py-1 rounded-full">
              {location.relativeTime}
            </div>
          )}
        </div>

        {/* Location Name */}
        <div className="mb-4">
          <h3 className={`font-bold text-text-primary ${textSizes[size].location}`}>
            {location.nickname || location.timezoneInfo.city}
          </h3>
          <p className={`text-text-secondary ${textSizes[size].date}`}>
            {location.timezoneInfo.country}
          </p>
        </div>

        {/* Time Display */}
        <div className="mb-4">
          <div className={`font-mono font-bold text-text-primary ${textSizes[size].time}`}>
            {location.formattedTime}
          </div>
          <div className={`text-text-secondary flex items-center space-x-2 ${textSizes[size].date}`}>
            <Calendar className="w-3 h-3" />
            <span>{location.formattedDate}</span>
          </div>
        </div>

        {/* Timezone Info */}
        <div className="text-xs text-text-secondary">
          {location.timezoneInfo.offset} • {location.timezoneInfo.timezone.split('/')[1]?.replace('_', ' ')}
        </div>

        {/* Screen reader information */}
        <ScreenReaderText>
          {location.timezoneInfo.city}, {location.timezoneInfo.country}. 
          Current time: {location.formattedTime}. 
          Date: {location.formattedDate}. 
          Status: {getStatusText()}.
          {location.relativeTime !== 'Local' && ` Time difference: ${location.relativeTime}.`}
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
          location.isDaytime ? 'bg-yellow-400' : 'bg-indigo-400'
        }`} />
        
        <div className="min-w-0">
          <div className="font-medium text-text-primary truncate">
            {location.nickname || location.timezoneInfo.city}
          </div>
          <div className="text-xs text-text-secondary truncate">
            {location.timezoneInfo.country}
          </div>
        </div>
      </div>

      {/* Time & Controls */}
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="font-mono font-medium text-text-primary">
            {location.formattedTime}
          </div>
          <div className="text-xs text-text-secondary">
            {location.relativeTime}
          </div>
        </div>

        {onRemove && !location.isDefault && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(location.id)}
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