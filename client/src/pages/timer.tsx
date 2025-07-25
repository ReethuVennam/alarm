import React from 'react';
import { Timer, Play, Pause, RotateCcw, Plus } from 'lucide-react';
import { AppLayout, PageLayout, CardLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';

export default function TimerPage() {
  return (
    <AppLayout>
      <PageLayout
        title="Timer"
        description="Focus timers and Pomodoro sessions"
        actions={
          <Button className="bg-accent-primary hover:bg-accent-secondary text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Timer
          </Button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Timer */}
          <CardLayout
            title="Active Timer"
            description="25:00 Pomodoro Session"
            elevated
            className="lg:col-span-2"
          >
            <div className="flex flex-col items-center justify-center py-12">
              {/* Timer Display */}
              <div className="relative w-64 h-64 mb-8">
                <div className="absolute inset-0 rounded-full border-8 border-background-tertiary">
                  {/* Progress ring would go here */}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-mono font-bold text-text-primary mb-2">
                      25:00
                    </div>
                    <div className="text-text-secondary text-lg">
                      Focus Time
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Timer Controls */}
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
                  <Pause className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full w-12 h-12"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardLayout>
          
          {/* Timer Presets */}
          <CardLayout
            title="Quick Presets"
            description="Common timer durations"
          >
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Pomodoro', duration: '25m', color: '#f59e0b' },
                { name: 'Short Break', duration: '5m', color: '#10b981' },
                { name: 'Long Break', duration: '15m', color: '#8b5cf6' },
                { name: 'Deep Focus', duration: '90m', color: '#ef4444' },
              ].map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center hover:border-accent-primary"
                  style={{ borderColor: preset.color + '20' }}
                >
                  <div 
                    className="w-3 h-3 rounded-full mb-2"
                    style={{ backgroundColor: preset.color }}
                  />
                  <div className="font-medium text-sm">{preset.name}</div>
                  <div className="text-xs text-text-secondary">{preset.duration}</div>
                </Button>
              ))}
            </div>
          </CardLayout>
          
          {/* Active Timers */}
          <CardLayout
            title="Running Timers"
            description="Multiple simultaneous timers"
          >
            <div className="text-center py-8 text-text-secondary">
              <Timer className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active timers</p>
              <p className="text-sm mt-1">Start a timer to see it here</p>
            </div>
          </CardLayout>
        </div>
      </PageLayout>
    </AppLayout>
  );
}