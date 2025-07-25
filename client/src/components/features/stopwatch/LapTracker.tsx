import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trophy, TrendingDown, TrendingUp, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LapTime, formatTime, getAverageLapTime, getFastestLap, getSlowestLap } from '@/hooks/useStopwatch';

interface LapTrackerProps {
  lapTimes: LapTime[];
  onExport?: () => void;
  className?: string;
}

export function LapTracker({ lapTimes, onExport, className = '' }: LapTrackerProps) {
  const fastestLap = getFastestLap(lapTimes);
  const slowestLap = getSlowestLap(lapTimes);
  const averageTime = getAverageLapTime(lapTimes);

  const handleExport = () => {
    if (!onExport) {
      // Default export functionality
      const csvContent = [
        'Lap,Total Time,Split Time,Timestamp',
        ...lapTimes.map(lap => 
          `${lap.lapNumber},${formatTime(lap.lapTime)},${formatTime(lap.splitTime)},${lap.timestamp.toISOString()}`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stopwatch-laps-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      onExport();
    }
  };

  if (lapTimes.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-accent-primary opacity-50" />
        </div>
        <p className="text-text-secondary">No laps recorded</p>
        <p className="text-sm text-text-secondary mt-1">
          Start the stopwatch and press the lap button to track splits
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-background-tertiary rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Trophy className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-xs text-text-secondary uppercase tracking-wide">Fastest</span>
          </div>
          <div className="font-mono text-sm font-medium text-text-primary">
            {fastestLap ? formatTime(fastestLap.splitTime) : '--:--'}
          </div>
          {fastestLap && (
            <div className="text-xs text-text-secondary">
              Lap {fastestLap.lapNumber}
            </div>
          )}
        </div>

        <div className="bg-background-tertiary rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-xs text-text-secondary uppercase tracking-wide">Slowest</span>
          </div>
          <div className="font-mono text-sm font-medium text-text-primary">
            {slowestLap ? formatTime(slowestLap.splitTime) : '--:--'}
          </div>
          {slowestLap && (
            <div className="text-xs text-text-secondary">
              Lap {slowestLap.lapNumber}
            </div>
          )}
        </div>

        <div className="bg-background-tertiary rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <BarChart3 className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-xs text-text-secondary uppercase tracking-wide">Average</span>
          </div>
          <div className="font-mono text-sm font-medium text-text-primary">
            {averageTime > 0 ? formatTime(averageTime) : '--:--'}
          </div>
        </div>

        <div className="bg-background-tertiary rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-accent-primary mr-1" />
            <span className="text-xs text-text-secondary uppercase tracking-wide">Total</span>
          </div>
          <div className="font-mono text-sm font-medium text-text-primary">
            {lapTimes.length}
          </div>
          <div className="text-xs text-text-secondary">
            lap{lapTimes.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="text-xs"
        >
          <Download className="w-3 h-3 mr-1" />
          Export CSV
        </Button>
      </div>

      {/* Lap Times List */}
      <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-background-tertiary scrollbar-track-transparent">
        <AnimatePresence>
          {lapTimes
            .slice()
            .reverse() // Show most recent first
            .map((lap, index) => {
              const isLatest = index === 0;
              const isFastest = fastestLap?.id === lap.id;
              const isSlowest = slowestLap?.id === lap.id && lapTimes.length > 1;
              
              return (
                <motion.div
                  key={lap.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`
                    flex items-center justify-between p-3 rounded-lg transition-all
                    ${isLatest 
                      ? 'bg-accent-primary/10 border-l-4 border-l-accent-primary' 
                      : 'bg-background-tertiary hover:bg-background-tertiary/80'
                    }
                    ${isFastest ? 'ring-1 ring-green-500/30' : ''}
                    ${isSlowest ? 'ring-1 ring-red-500/30' : ''}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    {/* Lap Number */}
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${isLatest 
                        ? 'bg-accent-primary text-white' 
                        : 'bg-background-secondary text-text-secondary'
                      }
                    `}>
                      {lap.lapNumber}
                    </div>
                    
                    {/* Badges */}
                    <div className="flex items-center space-x-1">
                      {isFastest && (
                        <div className="flex items-center bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded text-xs">
                          <Trophy className="w-3 h-3 mr-1" />
                          Fastest
                        </div>
                      )}
                      {isSlowest && (
                        <div className="flex items-center bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded text-xs">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          Slowest
                        </div>
                      )}
                      {isLatest && (
                        <div className="bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded text-xs">
                          Latest
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {/* Split Time */}
                    <div className="font-mono font-medium text-text-primary">
                      {formatTime(lap.splitTime)}
                    </div>
                    {/* Total Time */}
                    <div className="text-xs text-text-secondary font-mono">
                      Total: {formatTime(lap.lapTime)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Performance Insights */}
      {lapTimes.length >= 3 && (
        <div className="mt-4 p-3 bg-background-tertiary/50 rounded-lg">
          <h4 className="text-sm font-medium text-text-primary mb-2 flex items-center">
            <BarChart3 className="w-4 h-4 mr-1" />
            Performance Insights
          </h4>
          <div className="text-xs text-text-secondary space-y-1">
            {fastestLap && slowestLap && (
              <p>
                • Range: {formatTime(slowestLap.splitTime - fastestLap.splitTime)} 
                ({(((slowestLap.splitTime - fastestLap.splitTime) / fastestLap.splitTime) * 100).toFixed(1)}% variation)
              </p>
            )}
            <p>
              • Consistency: {lapTimes.length >= 5 ? 'Good sample size for analysis' : 'Record more laps for better insights'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}