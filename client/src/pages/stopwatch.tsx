import React from 'react';
import { Play, Pause, RotateCcw, Flag, Download } from 'lucide-react';
import { AppLayout, PageLayout, CardLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';

export default function StopwatchPage() {
  return (
    <AppLayout>
      <PageLayout
        title="Stopwatch"
        description="Precision timing with lap tracking"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stopwatch */}
          <CardLayout
            title="Stopwatch"
            description="Millisecond precision timing"
            elevated
            className="lg:col-span-2"
          >
            <div className="flex flex-col items-center justify-center py-12">
              {/* Stopwatch Display */}
              <div className="text-center mb-8">
                <div className="text-7xl font-mono font-bold text-text-primary mb-2">
                  00:00.00
                </div>
                <div className="text-text-secondary text-lg">
                  Minutes : Seconds . Milliseconds
                </div>
              </div>
              
              {/* Stopwatch Controls */}
              <div className="flex items-center space-x-4">
                <Button
                  size="lg"
                  className="bg-accent-primary hover:bg-accent-secondary text-white rounded-full w-16 h-16"
                >
                  <Play className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full w-12 h-12"
                >
                  <Flag className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full w-12 h-12"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="mt-6 text-sm text-text-secondary">
                Press space to start/stop, L for lap
              </div>
            </div>
          </CardLayout>
          
          {/* Lap Times */}
          <CardLayout
            title="Lap Times"
            description="Split time tracking"
            actions={
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            }
          >
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {/* Mock lap times */}
              {[
                { lap: 1, time: '00:15.23', split: '+00:15.23' },
                { lap: 2, time: '00:32.15', split: '+00:16.92' },
                { lap: 3, time: '00:48.67', split: '+00:16.52' },
              ].map((lap) => (
                <div
                  key={lap.lap}
                  className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent-primary/20 text-accent-primary rounded-full flex items-center justify-center text-sm font-medium">
                      {lap.lap}
                    </div>
                    <div>
                      <div className="font-mono font-medium">{lap.time}</div>
                      <div className="text-xs text-text-secondary">{lap.split}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Empty state when no laps */}
            <div className="text-center py-8 text-text-secondary opacity-0">
              <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No laps recorded</p>
              <p className="text-sm mt-1">Start the stopwatch and press lap</p>
            </div>
          </CardLayout>
        </div>
      </PageLayout>
    </AppLayout>
  );
}