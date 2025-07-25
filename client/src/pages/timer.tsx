import React, { useState } from 'react';
import { Timer, Plus, Activity, Clock, Pause, Play } from 'lucide-react';
import { AppLayout, PageLayout, CardLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { TimerCard, CompactTimerCard } from '@/components/features/timer/TimerCard';
import { TimerCreationModal } from '@/components/features/timer/TimerCreationModal';
import { useTimers, timerPresets } from '@/hooks/useTimers';
import { motion, AnimatePresence } from 'framer-motion';

export default function TimerPage() {
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const {
    timers,
    activeTimers,
    completedTimers,
    pausedTimers,
    createTimer,
    createTimerFromPreset,
    startTimer,
    pauseTimer,
    resetTimer,
    deleteTimer,
    addTime,
  } = useTimers();

  const handleQuickPreset = (preset: typeof timerPresets[0]) => {
    const timer = createTimerFromPreset(preset);
    startTimer(timer.id);
  };

  // Get the most recent active timer for main display
  const mainTimer = activeTimers[0] || pausedTimers[0] || timers[0];

  return (
    <AppLayout>
      <PageLayout
        title="Timer"
        description="Focus timers and Pomodoro sessions"
        actions={
          <Button 
            onClick={() => setIsCreationModalOpen(true)}
            className="bg-accent-primary hover:bg-accent-secondary text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Timer
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Main Timer Display */}
          {mainTimer && (
            <CardLayout
              title="Focus Timer"
              description={mainTimer.isRunning ? "Currently running" : mainTimer.isPaused ? "Paused" : "Ready to start"}
              elevated
            >
              <div className="flex justify-center">
                <TimerCard
                  timer={mainTimer}
                  onStart={startTimer}
                  onPause={pauseTimer}
                  onReset={resetTimer}
                  onDelete={deleteTimer}
                  onAddTime={addTime}
                  size="large"
                />
              </div>
            </CardLayout>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Presets */}
            <CardLayout
              title="Quick Presets"
              description="Start popular timer types instantly"
            >
              <div className="grid grid-cols-2 gap-3">
                {timerPresets.slice(0, 6).map((preset) => (
                  <motion.button
                    key={preset.name}
                    onClick={() => handleQuickPreset(preset)}
                    className="p-4 text-left border border-border-color rounded-xl hover:border-accent-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span className="font-medium text-text-primary text-sm">
                        {preset.name}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary">
                      {preset.duration} minutes
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardLayout>

            {/* Timer Stats */}
            <CardLayout
              title="Timer Statistics"
              description="Your timer activity overview"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Play className="w-6 h-6 text-accent-primary" />
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {activeTimers.length}
                  </div>
                  <div className="text-sm text-text-secondary">Active</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Pause className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {pausedTimers.length}
                  </div>
                  <div className="text-sm text-text-secondary">Paused</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Activity className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {completedTimers.length}
                  </div>
                  <div className="text-sm text-text-secondary">Completed</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Timer className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {timers.length}
                  </div>
                  <div className="text-sm text-text-secondary">Total</div>
                </div>
              </div>
            </CardLayout>
          </div>

          {/* All Timers */}
          {timers.length > 1 && (
            <CardLayout
              title="All Timers" 
              description="Manage all your active and completed timers"
            >
              <div className="space-y-3">
                <AnimatePresence>
                  {timers
                    .filter(timer => timer.id !== mainTimer?.id)
                    .map((timer) => (
                      <motion.div
                        key={timer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CompactTimerCard
                          timer={timer}
                          onStart={startTimer}
                          onPause={pauseTimer}
                          onDelete={deleteTimer}
                        />
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </CardLayout>
          )}

          {/* Empty State */}
          {timers.length === 0 && (
            <CardLayout
              title="No Timers Yet"
              description="Create your first timer to get started"
              elevated
            >
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Timer className="w-8 h-8 text-accent-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Ready to Focus?
                </h3>
                <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                  Create a timer to boost your productivity with focused work sessions
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => handleQuickPreset(timerPresets[0])}
                    className="bg-accent-primary hover:bg-accent-secondary text-white"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Quick Pomodoro (25min)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreationModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Custom Timer
                  </Button>
                </div>
              </div>
            </CardLayout>
          )}
        </div>
      </PageLayout>

      {/* Timer Creation Modal */}
      <TimerCreationModal
        isOpen={isCreationModalOpen}
        onClose={() => setIsCreationModalOpen(false)}
        onCreateTimer={createTimer}
        onCreateFromPreset={createTimerFromPreset}
      />
    </AppLayout>
  );
}