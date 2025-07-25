import React from 'react';
import { Settings, Bell, Palette, Volume2, Shield, Info } from 'lucide-react';
import { AppLayout, PageLayout, CardLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme, accentColors } from '@/components/ThemeProvider';

export default function SettingsPage() {
  const { theme, accent, setTheme, setAccent } = useTheme();

  return (
    <AppLayout>
      <PageLayout
        title="Settings"
        description="Customize your alarm and timer experience"
      >
        <div className="space-y-6">
          {/* Theme Settings */}
          <CardLayout
            title="Appearance"
            description="Customize the look and feel"
          >
            <div className="space-y-6">
              {/* Theme Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-text-primary">Theme Mode</h4>
                  <p className="text-sm text-text-secondary">
                    Choose your preferred theme or use auto-switching
                  </p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Accent Color */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-text-primary">Accent Color</h4>
                  <p className="text-sm text-text-secondary">
                    Choose your accent color theme
                  </p>
                </div>
                <div className="flex space-x-2">
                  {Object.entries(accentColors).map(([key, color]) => (
                    <button
                      key={key}
                      onClick={() => setAccent(key as any)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        accent === key 
                          ? 'border-text-primary scale-110' 
                          : 'border-border-color hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.primary }}
                      aria-label={`Select ${key} accent color`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardLayout>

          {/* Notification Settings */}
          <CardLayout
            title="Notifications"
            description="Control how you receive alerts"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-text-secondary" />
                  <div>
                    <h4 className="font-medium text-text-primary">Push Notifications</h4>
                    <p className="text-sm text-text-secondary">
                      Receive notifications when alarms trigger
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-text-secondary" />
                  <div>
                    <h4 className="font-medium text-text-primary">Sound Alerts</h4>
                    <p className="text-sm text-text-secondary">
                      Play sounds when alarms and timers trigger
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-text-primary">Default Volume</h4>
                  <p className="text-sm text-text-secondary">
                    Set the default volume for alarm sounds
                  </p>
                </div>
                <Select defaultValue="medium">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardLayout>

          {/* Accessibility */}
          <CardLayout
            title="Accessibility"
            description="Make the app work better for you"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-text-primary">Reduce Motion</h4>
                  <p className="text-sm text-text-secondary">
                    Minimize animations and transitions
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-text-primary">High Contrast</h4>
                  <p className="text-sm text-text-secondary">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-text-primary">Large Text</h4>
                  <p className="text-sm text-text-secondary">
                    Use larger font sizes throughout the app
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </CardLayout>

          {/* Privacy & Data */}
          <CardLayout
            title="Privacy & Data"
            description="Control your data and privacy"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-text-secondary" />
                  <div>
                    <h4 className="font-medium text-text-primary">Analytics</h4>
                    <p className="text-sm text-text-secondary">
                      Help improve the app by sharing usage data
                    </p>
                  </div>
                </div>
                <Switch />
              </div>

              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Export Data
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  Clear All Data
                </Button>
              </div>
            </div>
          </CardLayout>

          {/* About */}
          <CardLayout
            title="About"
            description="App information and links"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Version</span>
                <span className="font-mono text-text-primary">1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Build</span>
                <span className="font-mono text-text-primary">2025.01.25</span>
              </div>
              
              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Info className="w-4 h-4 mr-2" />
                  Privacy Policy
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Info className="w-4 h-4 mr-2" />
                  Terms of Service
                </Button>
              </div>
            </div>
          </CardLayout>
        </div>
      </PageLayout>
    </AppLayout>
  );
}