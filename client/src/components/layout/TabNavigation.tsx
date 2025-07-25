import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Timer, Play, Globe, Settings } from 'lucide-react';
import { useLocation } from 'wouter';

interface Tab {
  id: string;
  icon: React.ElementType;
  label: string;
  color: string;
  path: string;
  ariaLabel: string;
}

const tabs: Tab[] = [
  { 
    id: 'alarms', 
    icon: Bell, 
    label: 'Alarms', 
    color: '#6366f1', 
    path: '/',
    ariaLabel: 'Navigate to Alarms section'
  },
  { 
    id: 'timer', 
    icon: Timer, 
    label: 'Timer', 
    color: '#f59e0b', 
    path: '/timer',
    ariaLabel: 'Navigate to Timer section'
  },
  { 
    id: 'stopwatch', 
    icon: Play, 
    label: 'Stopwatch', 
    color: '#10b981', 
    path: '/stopwatch',
    ariaLabel: 'Navigate to Stopwatch section'
  },
  { 
    id: 'worldclock', 
    icon: Globe, 
    label: 'World', 
    color: '#8b5cf6', 
    path: '/worldclock',
    ariaLabel: 'Navigate to World Clock section'
  },
  { 
    id: 'settings', 
    icon: Settings, 
    label: 'Settings', 
    color: '#6b7280', 
    path: '/settings',
    ariaLabel: 'Navigate to Settings section'
  }
];

interface TabNavigationProps {
  activeAlarms?: number;
  activeTimers?: number;
}

export function TabNavigation({ activeAlarms = 0, activeTimers = 0 }: TabNavigationProps) {
  const [location, setLocation] = useLocation();
  
  const handleTabPress = (tab: Tab) => {
    // Haptic feedback simulation (would use actual haptic on mobile)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    setLocation(tab.path);
  };

  const getCurrentTab = () => {
    if (location === '/' || location === '/home') return 'alarms';
    if (location.startsWith('/timer')) return 'timer';
    if (location.startsWith('/stopwatch')) return 'stopwatch';
    if (location.startsWith('/worldclock')) return 'worldclock';
    if (location.startsWith('/settings')) return 'settings';
    return 'alarms';
  };

  const activeTab = getCurrentTab();

  const getBadgeCount = (tabId: string) => {
    switch (tabId) {
      case 'alarms':
        return activeAlarms;
      case 'timer':
        return activeTimers;
      default:
        return 0;
    }
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700"
      role="tablist"
      aria-label="Main navigation"
    >
      {/* Navigation Container */}
      <div className="flex justify-around items-center px-4 py-2 safe-area-bottom">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const badgeCount = getBadgeCount(tab.id);
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => handleTabPress(tab)}
              className={`
                relative flex flex-col items-center justify-center 
                min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                ${isActive 
                  ? 'text-white' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }
              `}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.ariaLabel}
              aria-describedby={badgeCount > 0 ? `${tab.id}-badge` : undefined}
            >
              {/* Active Tab Background */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: tab.color }}
                  layoutId="activeTabBackground"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                />
              )}
              
              {/* Icon */}
              <div className="relative z-10 mb-1">
                <Icon 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                
                {/* Badge for active items */}
                {badgeCount > 0 && (
                  <motion.div
                    id={`${tab.id}-badge`}
                    className="absolute -top-2 -right-2 min-w-[18px] h-[18px] 
                             bg-red-500 text-white text-xs font-medium
                             rounded-full flex items-center justify-center
                             ring-2 ring-white dark:ring-gray-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    role="status"
                    aria-label={`${badgeCount} active ${tab.label.toLowerCase()}`}
                  >
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </motion.div>
                )}
              </div>
              
              {/* Label */}
              <span 
                className={`
                  text-xs font-medium leading-none relative z-10
                  transition-all duration-200
                  ${isActive ? 'transform scale-105' : ''}
                `}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      
      {/* Safe area for iOS devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg" />
    </nav>
  );
}

// Export tab configuration for use in other components
export { tabs };
export type { Tab };