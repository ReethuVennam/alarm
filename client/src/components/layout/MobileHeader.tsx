import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Sun, Search, MoreVertical, QrCode } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { tabs, Tab } from './TabNavigation';

interface MobileHeaderProps {
  activeAlarms?: number;
  onSearchClick?: () => void;
  onMenuClick?: () => void;
}

export function MobileHeader({ 
  activeAlarms = 0, 
  onSearchClick,
  onMenuClick 
}: MobileHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  
  // Get current tab info
  const getCurrentTab = (): Tab => {
    const currentTab = tabs.find(tab => {
      if (tab.path === '/' && (location === '/' || location === '/home')) return true;
      return location.startsWith(tab.path) && tab.path !== '/';
    });
    return currentTab || tabs[0]; // Default to alarms
  };

  const currentTab = getCurrentTab();
  const Icon = currentTab.icon;

  const handleThemeToggle = () => {
    // Haptic feedback simulation
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
    toggleTheme();
  };

  return (
    <header 
      className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg 
                 border-b border-gray-200 dark:border-gray-700 safe-area-top"
      role="banner"
    >
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left side - App branding with current section */}
          <div className="flex items-center space-x-3">
            {/* App Icon with current tab color */}
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: currentTab.color }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Icon className="w-6 h-6 text-white" />
              
              {/* Subtle gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </motion.div>
            
            {/* App title and current section */}
            <div className="min-w-0">
              <motion.h1 
                className="text-xl font-bold text-gray-900 dark:text-white truncate"
                key={currentTab.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {currentTab.label}
              </motion.h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                Smart Alarm & Timer
              </p>
            </div>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSearchClick}
                  className="w-10 h-10 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Search alarms, timers, and settings"
                >
                  <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Search</p>
              </TooltipContent>
            </Tooltip>
            
            {/* QR Code Link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/qr">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Mobile access and QR code"
                  >
                    <QrCode className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mobile Access & QR Code</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Theme Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleThemeToggle}
                  className="w-10 h-10 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  <motion.div
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    )}
                  </motion.div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Active Alarms Counter (only show if > 0) */}
            {activeAlarms > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center space-x-2 px-3 py-1.5 
                         bg-gradient-to-r from-primary/10 to-primary/5 
                         text-primary rounded-full border border-primary/20"
                role="status"
                aria-label={`${activeAlarms} active alarms`}
              >
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium tabular-nums">
                  {activeAlarms}
                </span>
              </motion.div>
            )}
            
            {/* More Menu */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMenuClick}
                  className="w-10 h-10 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="More options"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>More options</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
}