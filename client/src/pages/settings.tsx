import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/large-text-switch.css';
import { Settings, Bell, Palette, Volume2, Shield, Info } from 'lucide-react';
import { AppLayout, PageLayout, CardLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme, accentColors } from '@/components/ThemeProvider';

// Add the following CSS to your global stylesheet (e.g., index.css):
// .large-text { font-size: 1.25em !important; }

export default function SettingsPage() {
  const { theme, accent, setTheme, setAccent } = useTheme();
  const validThemes = ["light", "dark", "auto"];
  const safeTheme = validThemes.includes(theme) ? theme : "light";
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  // Large Text state, initialized from localStorage
  const [largeText, setLargeText] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('large-text') === '1';
    }
    return false;
  });

  // Sync body class and localStorage when largeText changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (largeText) {
        document.body.classList.add('large-text');
        localStorage.setItem('large-text', '1');
      } else {
        document.body.classList.remove('large-text');
        localStorage.removeItem('large-text');
      }
    }
  }, [largeText]);

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
                <Select value={safeTheme} onValueChange={setTheme}>
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
                <Switch
                  checked={largeText}
                  onCheckedChange={setLargeText}
                />
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
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    try {
                      const data = { ...localStorage };
                      const json = JSON.stringify(data, null, 2);
                      const blob = new Blob([json], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'bytelyst-app-data.json';
                      document.body.appendChild(a);
                      a.click();
                      setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }, 100);
                    } catch (e) {
                      alert('Failed to export data.');
                    }
                  }}
                >
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all app data? This cannot be undone.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                >
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
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowPrivacy(true)}>
                  <Info className="w-4 h-4 mr-2" />
                  Privacy Policy
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowTerms(true)}>
                  <Info className="w-4 h-4 mr-2" />
                  Terms of Service
                </Button>
              </div>
            </div>
          </CardLayout>
        </div>
      </PageLayout>
    {/* Terms and Conditions Modal */}
    {showPrivacy && ReactDOM.createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg w-full p-6 relative">
          <h2 className="text-xl font-bold mb-4">Privacy Policy</h2>
          <div className="max-h-72 overflow-y-auto text-gray-800 dark:text-gray-200 mb-4">
            <p>Your privacy is important to us. This app does not collect or transmit any personal data to external servers.</p>
            <ul className="list-disc ml-6 mt-2">
              <li>All alarm and timer data is stored locally on your device.</li>
              <li>We do not track your usage or share your information with third parties.</li>
              <li>Notifications and permissions are only used to provide app functionality.</li>
              <li>You may clear your data at any time from the settings menu.</li>
              <li>By using this app, you consent to this privacy policy.</li>
            </ul>
            <p className="mt-3">For questions, contact the app developer.</p>
          </div>
          <Button variant="outline" onClick={() => setShowPrivacy(false)} className="absolute right-4 bottom-4">Close</Button>
        </div>
      </div>,
      document.body
    )}
    {showTerms && ReactDOM.createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg w-full p-6 relative">
          <h2 className="text-xl font-bold mb-4">Terms and Conditions</h2>
          <div className="max-h-72 overflow-y-auto text-gray-800 dark:text-gray-200 mb-4">
            <p>Welcome to our app! By using this application, you agree to the following terms and conditions:</p>
            <ul className="list-disc ml-6 mt-2">
              <li>You will use the app for lawful purposes only.</li>
              <li>Your data may be stored locally on your device.</li>
              <li>We are not responsible for any loss of data or missed alarms.</li>
              <li>Features may change or be removed at any time.</li>
              <li>By continuing to use the app, you accept these terms.</li>
            </ul>
            <p className="mt-3">If you do not agree with these terms, please discontinue use of the app.</p>
          </div>
          <Button variant="outline" onClick={() => setShowTerms(false)} className="absolute right-4 bottom-4">Close</Button>
        </div>
      </div>,
      document.body
    )}
    </AppLayout>
  );
}