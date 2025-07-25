import React, { useState } from 'react';
import { Timer, Plus, Activity, Clock, Pause, Play, Download } from 'lucide-react';
import { AppLayout, PageLayout, CardLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { PrimaryAnimatedButton, AnimatedButton } from '@/components/ui/AnimatedButton';
import { TimerCard, CompactTimerCard } from '@/components/features/timer/TimerCard';
import { TimerCreationModal } from '@/components/features/timer/TimerCreationModal';
import { useTimers, timerPresets } from '@/hooks/useTimers';
import { motion, AnimatePresence } from 'framer-motion';
import { shareTimer, downloadTimerData, exportMultipleTimers } from '@/utils/timerExport';
import { useScreenReaderAnnouncement } from '@/components/accessibility/ScreenReaderText';
import { staggerAnimations } from '@/utils/animations';

export default function TimerPage() {
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const { announce } = useScreenReaderAnnouncement();
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

  const handleShareTimer = async (timer: any) => {
    try {
      await shareTimer(timer);
      announce(`Timer "${timer.name}" shared successfully`, 'polite');
    } catch (error) {
      console.error('Share failed:', error);
      announce('Failed to share timer', 'polite');
    }
  };

  const handleExportTimer = (timer: any) => {
    try {
      downloadTimerData(timer, 'json');
      announce(`Timer "${timer.name}" exported successfully`, 'polite');
    } catch (error) {
      console.error('Export failed:', error);
      announce('Failed to export timer', 'polite');
    }
  };

  const handleExportAllTimers = (format: 'json' | 'csv' = 'json') => {
    if (timers.length === 0) {
      announce('No timers to export', 'polite');
      return;
    }
    
    try {
      exportMultipleTimers(timers, format);
      announce(`All timers exported as ${format.toUpperCase()}`, 'polite');
    } catch (error) {
      console.error('Export failed:', error);
      announce('Failed to export timers', 'polite');
    }
  };

  // Get the most recent active timer for main display
  const mainTimer = activeTimers[0] || pausedTimers[0] || timers[0];

  return (
    <AppLayout>
      <PageLayout
        title="Timer"
        description="Focus timers and Pomodoro sessions"
        actions={
          <PrimaryAnimatedButton 
            onClick={() => setIsCreationModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Timer
          </PrimaryAnimatedButton>
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
                  onShare={handleShareTimer}
                  onExport={handleExportTimer}
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
              <motion.div 
                className="grid grid-cols-2 gap-3"
                variants={staggerAnimations.container}
                initial="hidden"
                animate="visible"
              >
                {timerPresets.slice(0, 6).map((preset, index) => (
                  <motion.div
                    key={preset.name}
                    variants={staggerAnimations.item}
                  >
                    <AnimatedButton
                      onClick={() => handleQuickPreset(preset)}
                      className="w-full p-4 text-left border border-border-color rounded-xl hover:border-accent-primary/30 bg-background-secondary"
                      scaleOnPress={true}
                      rippleEffect={true}
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
                    </AnimatedButton>
                  </motion.div>
                ))}
              </motion.div>
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
              actions={
                <div className="flex space-x-2">
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportAllTimers('csv')}
                    className="text-xs"
                    scaleOnPress={true}
                    hapticFeedback={true}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    CSV
                  </AnimatedButton>
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportAllTimers('json')}
                    className="text-xs"
                    scaleOnPress={true}
                    hapticFeedback={true}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    JSON
                  </AnimatedButton>
                </div>
              }
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
                          onShare={handleShareTimer}
                          onExport={handleExportTimer}
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