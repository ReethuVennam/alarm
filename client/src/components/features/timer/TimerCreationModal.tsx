import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FocusManager } from '@/components/accessibility/FocusManager';
import { Timer, timerPresets } from '@/hooks/useTimers';

interface TimerCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTimer: (name: string, duration: number, category: Timer['category'], color: string) => void;
  onCreateFromPreset: (preset: typeof timerPresets[0]) => void;
}

const categoryColors = {
  pomodoro: '#f59e0b',
  break: '#10b981',
  study: '#3b82f6',
  workout: '#f97316',
  cooking: '#84cc16',
  custom: '#6366f1'
};

export function TimerCreationModal({
  isOpen,
  onClose,
  onCreateTimer,
  onCreateFromPreset
}: TimerCreationModalProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [customName, setCustomName] = useState('');
  const [customDuration, setCustomDuration] = useState('25');
  const [customCategory, setCustomCategory] = useState<Timer['category']>('custom');

  const handleCreateCustom = () => {
    if (!customName.trim() || !customDuration) return;
    
    const duration = parseInt(customDuration);
    if (isNaN(duration) || duration <= 0) return;
    
    onCreateTimer(
      customName.trim(),
      duration,
      customCategory,
      categoryColors[customCategory]
    );
    
    // Reset form
    setCustomName('');
    setCustomDuration('25');
    setCustomCategory('custom');
    onClose();
  };

  const handlePresetClick = (preset: typeof timerPresets[0]) => {
    onCreateFromPreset(preset);
    onClose();
  };

  const handleClose = () => {
    setCustomName('');
    setCustomDuration('25');
    setCustomCategory('custom');
    setActiveTab('presets');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" aria-labelledby="timer-creation-title">
        <FocusManager trapFocus autoFocus>
          <DialogHeader>
            <DialogTitle id="timer-creation-title" className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-accent-primary" />
              Create New Timer
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-background-tertiary rounded-lg p-1">
              <button
                onClick={() => setActiveTab('presets')}
                className={`
                  flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all
                  ${activeTab === 'presets'
                    ? 'bg-background-primary text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                  }
                `}
              >
                Quick Presets
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`
                  flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all
                  ${activeTab === 'custom'
                    ? 'bg-background-primary text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                  }
                `}
              >
                Custom Timer
              </button>
            </div>

            {/* Presets Tab */}
            {activeTab === 'presets' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  {timerPresets.map((preset) => (
                    <motion.button
                      key={preset.name}
                      onClick={() => handlePresetClick(preset)}
                      className="p-4 text-left border border-border-color rounded-xl hover:border-accent-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span className="font-medium text-text-primary">
                          {preset.name}
                        </span>
                      </div>
                      <div className="text-sm text-text-secondary">
                        {preset.duration} minutes
                      </div>
                      <div className="text-xs text-text-secondary capitalize mt-1">
                        {preset.category}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Custom Tab */}
            {activeTab === 'custom' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="timer-name">Timer Name</Label>
                  <Input
                    id="timer-name"
                    type="text"
                    placeholder="Enter timer name..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="timer-duration">Duration (minutes)</Label>
                  <Input
                    id="timer-duration"
                    type="number"
                    min="1"
                    max="480"
                    placeholder="25"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="timer-category">Category</Label>
                  <Select value={customCategory} onValueChange={setCustomCategory}>
                    <SelectTrigger id="timer-category" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="pomodoro">Pomodoro</SelectItem>
                      <SelectItem value="break">Break</SelectItem>
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="workout">Workout</SelectItem>
                      <SelectItem value="cooking">Cooking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateCustom}
                    disabled={!customName.trim() || !customDuration}
                    className="flex-1 bg-accent-primary hover:bg-accent-secondary text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Timer
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </FocusManager>
      </DialogContent>
    </Dialog>
  );
}