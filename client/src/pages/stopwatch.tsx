import React, { useEffect } from 'react';
import { Activity, Clock, Trophy, Plus } from 'lucide-react';
import { AppLayout, PageLayout, CardLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { StopwatchDisplay } from '@/components/features/stopwatch/StopwatchDisplay';
import { LapTracker } from '@/components/features/stopwatch/LapTracker';
import { useStopwatch } from '@/hooks/useStopwatch';

export default function StopwatchPage() {
  const {
    currentTime,
    isRunning,
    isPaused,
    currentSession,
    sessions,
    activeSessions,
    completedSessions,
    startStopwatch,
    pauseStopwatch,
    stopStopwatch,
    resetStopwatch,
    addLap,
    createNewSession,
  } = useStopwatch();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ':
          event.preventDefault();
          if (isRunning) {
            pauseStopwatch();
          } else {
            startStopwatch();
          }
          break;
        case 'l':
          event.preventDefault();
          if (isRunning || currentTime > 0) {
            addLap();
          }
          break;
        case 'r':
          event.preventDefault();
          if (!isRunning && !isPaused) {
            resetStopwatch();
          }
          break;
        case 'n':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            createNewSession(`Session ${sessions.length + 1}`);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, isPaused, currentTime, sessions.length, startStopwatch, pauseStopwatch, addLap, resetStopwatch, createNewSession]);

  const handleQuickStart = () => {
    if (!currentSession) {
      createNewSession(`Session ${sessions.length + 1}`);
    }
    startStopwatch();
  };

  return (
    <AppLayout>
      <PageLayout
        title="Stopwatch"
        description="Precision timing with lap tracking"
        actions={
          <Button 
            onClick={() => createNewSession(`Session ${sessions.length + 1}`)}
            className="bg-accent-primary hover:bg-accent-secondary text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Main Stopwatch Display */}
          <CardLayout
            title={currentSession ? currentSession.name : "Stopwatch"}
            description="Millisecond precision timing"
            elevated
          >
            <StopwatchDisplay
              currentTime={currentTime}
              isRunning={isRunning}
              isPaused={isPaused}
              lapCount={currentSession?.lapTimes.length || 0}
              onStart={handleQuickStart}
              onPause={pauseStopwatch}
              onStop={stopStopwatch}
              onReset={resetStopwatch}
              onLap={addLap}
              className="py-8"
            />
          </CardLayout>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lap Times */}
            <CardLayout
              title="Lap Times"
              description="Split time tracking and analysis"
              className="lg:col-span-2"
            >
              <LapTracker 
                lapTimes={currentSession?.lapTimes || []}
              />
            </CardLayout>

            {/* Statistics */}
            <CardLayout
              title="Statistics"
              description="Session overview"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="text-center p-3 bg-background-tertiary rounded-lg">
                    <div className="w-10 h-10 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Activity className="w-5 h-5 text-accent-primary" />
                    </div>
                    <div className="text-xl font-bold text-text-primary">
                      {activeSessions.length}
                    </div>
                    <div className="text-sm text-text-secondary">Active</div>
                  </div>
                  
                  <div className="text-center p-3 bg-background-tertiary rounded-lg">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Trophy className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-xl font-bold text-text-primary">
                      {completedSessions.length}
                    </div>
                    <div className="text-sm text-text-secondary">Completed</div>
                  </div>
                  
                  <div className="text-center p-3 bg-background-tertiary rounded-lg">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-xl font-bold text-text-primary">
                      {sessions.length}
                    </div>
                    <div className="text-sm text-text-secondary">Total</div>
                  </div>
                </div>

                {/* Current Session Info */}
                {currentSession && (
                  <div className="mt-4 p-3 bg-accent-primary/10 rounded-lg">
                    <div className="text-sm font-medium text-text-primary mb-1">
                      Current Session
                    </div>
                    <div className="text-xs text-text-secondary capitalize">
                      {currentSession.category} • Started {currentSession.startTime.toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </div>
            </CardLayout>
          </div>

          {/* Empty State */}
          {sessions.length === 0 && (
            <CardLayout
              title="Ready to Time?"
              description="Start your first stopwatch session"
              elevated
            >
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-accent-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Precision Timing
                </h3>
                <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                  Track time with millisecond precision, record laps, and analyze your performance
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleQuickStart}
                    className="bg-accent-primary hover:bg-accent-secondary text-white"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Start Stopwatch
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => createNewSession(`Session ${sessions.length + 1}`)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Session
                  </Button>
                </div>
                
                <div className="mt-6 text-xs text-text-secondary">
                  <div className="space-x-4">
                    <span><kbd className="px-2 py-1 bg-background-tertiary border border-border-color rounded text-xs">Space</kbd> Start/Pause</span>
                    <span><kbd className="px-2 py-1 bg-background-tertiary border border-border-color rounded text-xs">L</kbd> Lap</span>
                    <span><kbd className="px-2 py-1 bg-background-tertiary border border-border-color rounded text-xs">R</kbd> Reset</span>
                  </div>
                </div>
              </div>
            </CardLayout>
          )}
        </div>
      </PageLayout>
    </AppLayout>
  );
}