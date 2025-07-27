import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Clock, Eye, EyeOff, RotateCcw, Download, Upload, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CardLayout } from '@/components/layout/AppLayout';
import { FocusManager } from '@/components/accessibility/FocusManager';

export interface WorldClockPreferences {
  timeFormat: '12h' | '24h';
  showSeconds: boolean;
  showEnhancedInfo: boolean;
  dateFormat: 'short' | 'medium' | 'long';
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  showUTCTime: boolean;
  compactView: boolean;
  sortBy: 'name' | 'timezone' | 'time' | 'custom';
  groupByRegion: boolean;
  theme: 'auto' | 'light' | 'dark';
}

const defaultPreferences: WorldClockPreferences = {
  timeFormat: '24h',
  showSeconds: false,
  showEnhancedInfo: true,
  dateFormat: 'medium',
  autoRefresh: true,
  refreshInterval: 1,
  showUTCTime: false,
  compactView: false,
  sortBy: 'custom',
  groupByRegion: false,
  theme: 'auto'
};

interface WorldClockSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: WorldClockPreferences;
  onPreferencesChange: (preferences: WorldClockPreferences) => void;
  onExportData?: () => void;
  onImportData?: (data: any) => void;
  onResetToDefaults?: () => void;
}

export function WorldClockSettings({
  isOpen,
  onClose,
  preferences,
  onPreferencesChange,
  onExportData,
  onImportData,
  onResetToDefaults
}: WorldClockSettingsProps) {
  const [localPreferences, setLocalPreferences] = useState<WorldClockPreferences>(preferences);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handlePreferenceChange = <K extends keyof WorldClockPreferences>(
    key: K,
    value: WorldClockPreferences[K]
  ) => {
    const newPreferences = { ...localPreferences, [key]: value };
    setLocalPreferences(newPreferences);
    onPreferencesChange(newPreferences);
  };

  const handleReset = () => {
    setLocalPreferences(defaultPreferences);
    onPreferencesChange(defaultPreferences);
    if (onResetToDefaults) {
      onResetToDefaults();
    }
  };

  const handleExport = () => {
    const dataToExport = {
      preferences: localPreferences,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worldclock-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (onExportData) {
      onExportData();
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.preferences) {
          setLocalPreferences(data.preferences);
          onPreferencesChange(data.preferences);
          if (onImportData) {
            onImportData(data);
          }
        }
      } catch (error) {
        console.error('Failed to import settings:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-2xl p-0 overflow-hidden border-0 bg-transparent shadow-none max-h-[90vh] overflow-y-auto"
        aria-labelledby="worldclock-settings-title"
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
              <DialogTitle id="worldclock-settings-title" className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-accent-primary" />
                World Clock Settings
              </DialogTitle>
              <p className="text-sm text-text-secondary mt-1">
                Customize your world clock display and behavior
              </p>
            </DialogHeader>

            <div className="p-6 space-y-6">
              {/* Time Display Settings */}
              <CardLayout title="Time Display" description="Configure how time is displayed">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-text-primary mb-2 block">
                        Time Format
                      </Label>
                      <Select 
                        value={localPreferences.timeFormat} 
                        onValueChange={(value: '12h' | '24h') => {
                          try {
                            if (['12h', '24h'].includes(value)) {
                              handlePreferenceChange('timeFormat', value);
                            } else {
                              console.warn('Invalid timeFormat value:', value);
                            }
                          } catch (error) {
                            console.error('Error changing time format:', error);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12 Hour (2:30 PM)</SelectItem>
                          <SelectItem value="24h">24 Hour (14:30)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-text-primary mb-2 block">
                        Date Format
                      </Label>
                      <Select 
                        value={localPreferences.dateFormat} 
                        onValueChange={(value: 'short' | 'medium' | 'long') => {
                          try {
                            if (['short', 'medium', 'long'].includes(value)) {
                              handlePreferenceChange('dateFormat', value);
                            } else {
                              console.warn('Invalid dateFormat value:', value);
                            }
                          } catch (error) {
                            console.error('Error changing date format:', error);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short (Jan 15)</SelectItem>
                          <SelectItem value="medium">Medium (Jan 15, 2024)</SelectItem>
                          <SelectItem value="long">Long (Monday, January 15, 2024)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-text-primary">Show Seconds</Label>
                        <p className="text-xs text-text-secondary">Display seconds in time format</p>
                      </div>
                      <Switch
                        checked={localPreferences.showSeconds}
                        onCheckedChange={(checked) => {
                          try {
                            handlePreferenceChange('showSeconds', Boolean(checked));
                          } catch (error) {
                            console.error('Error changing show seconds:', error);
                          }
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-text-primary">Enhanced Information</Label>
                        <p className="text-xs text-text-secondary">Show sunrise/sunset and timezone abbreviations</p>
                      </div>
                      <Switch
                        checked={localPreferences.showEnhancedInfo}
                        onCheckedChange={(checked) => {
                          try {
                            handlePreferenceChange('showEnhancedInfo', Boolean(checked));
                          } catch (error) {
                            console.error('Error changing show enhanced info:', error);
                          }
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-text-primary">Show UTC Time</Label>
                        <p className="text-xs text-text-secondary">Display UTC time alongside local times</p>
                      </div>
                      <Switch
                        checked={localPreferences.showUTCTime}
                        onCheckedChange={(checked) => {
                          try {
                            handlePreferenceChange('showUTCTime', Boolean(checked));
                          } catch (error) {
                            console.error('Error changing show UTC time:', error);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardLayout>

              {/* Layout & Organization */}
              <CardLayout title="Layout & Organization" description="Control how locations are organized">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-text-primary mb-2 block">
                        Sort By
                      </Label>
                      <Select 
                        value={localPreferences.sortBy} 
                        onValueChange={(value: 'name' | 'timezone' | 'time' | 'custom') => {
                          try {
                            if (['name', 'timezone', 'time', 'custom'].includes(value)) {
                              handlePreferenceChange('sortBy', value);
                            } else {
                              console.warn('Invalid sortBy value:', value);
                            }
                          } catch (error) {
                            console.error('Error changing sort by:', error);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom Order</SelectItem>
                          <SelectItem value="name">City Name</SelectItem>
                          <SelectItem value="timezone">Time Zone</SelectItem>
                          <SelectItem value="time">Current Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-text-primary mb-2 block">
                        Refresh Interval
                      </Label>
                      <Select 
                        value={localPreferences.refreshInterval.toString()} 
                        onValueChange={(value) => {
                          try {
                            const numValue = parseInt(value);
                            if (!isNaN(numValue) && numValue >= 1 && numValue <= 60) {
                              handlePreferenceChange('refreshInterval', numValue);
                            } else {
                              console.warn('Invalid refreshInterval value:', value);
                            }
                          } catch (error) {
                            console.error('Error changing refresh interval:', error);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Every Second</SelectItem>
                          <SelectItem value="5">Every 5 Seconds</SelectItem>
                          <SelectItem value="30">Every 30 Seconds</SelectItem>
                          <SelectItem value="60">Every Minute</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-text-primary">Compact View</Label>
                        <p className="text-xs text-text-secondary">Use smaller cards for more locations on screen</p>
                      </div>
                      <Switch
                        checked={localPreferences.compactView}
                        onCheckedChange={(checked) => {
                          try {
                            handlePreferenceChange('compactView', Boolean(checked));
                          } catch (error) {
                            console.error('Error changing compact view:', error);
                          }
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-text-primary">Group by Region</Label>
                        <p className="text-xs text-text-secondary">Organize locations by geographical regions</p>
                      </div>
                      <Switch
                        checked={localPreferences.groupByRegion}
                        onCheckedChange={(checked) => {
                          try {
                            handlePreferenceChange('groupByRegion', Boolean(checked));
                          } catch (error) {
                            console.error('Error changing group by region:', error);
                          }
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-text-primary">Auto Refresh</Label>
                        <p className="text-xs text-text-secondary">Automatically update times</p>
                      </div>
                      <Switch
                        checked={localPreferences.autoRefresh}
                        onCheckedChange={(checked) => {
                          try {
                            handlePreferenceChange('autoRefresh', Boolean(checked));
                          } catch (error) {
                            console.error('Error changing auto refresh:', error);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardLayout>

              {/* Data Management */}
              <CardLayout title="Data Management" description="Export, import, and reset your settings">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    className="flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Settings</span>
                  </Button>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Button
                      variant="outline"
                      className="w-full flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Import Settings</span>
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Defaults</span>
                  </Button>
                </div>
              </CardLayout>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-border-color bg-background-tertiary/50">
              <div className="text-xs text-text-secondary">
                Settings are automatically saved
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

// Hook for managing world clock preferences
export function useWorldClockPreferences() {
  const [preferences, setPreferences] = useState<WorldClockPreferences>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('smart-alarm-worldclock-preferences');
        return saved ? JSON.parse(saved) : defaultPreferences;
      } catch {
        return defaultPreferences;
      }
    }
    return defaultPreferences;
  });

  useEffect(() => {
    localStorage.setItem('smart-alarm-worldclock-preferences', JSON.stringify(preferences));
  }, [preferences]);

  return { preferences, setPreferences };
}