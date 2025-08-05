import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabNavigation } from './TabNavigation';
import { MobileHeader } from './MobileHeader';
import { SkipLinks } from '../accessibility/FocusManager';
import { ScreenReaderText } from '../accessibility/ScreenReaderText';
import { UniversalSearch } from '../features/search/UniversalSearch';
import { PageTransition } from '../ui/PageTransition';
import { useAlarmsAdapter as useAlarms } from '@/hooks/useAlarmsAdapter';
import { useTimers } from '@/hooks/useTimers';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Main app layout with mobile-first navigation and accessibility features
 */
export function AppLayout({ children, className = '' }: AppLayoutProps) {
  const { alarms } = useAlarms();
  const { activeTimers } = useTimers();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Count active alarms for header badge
  const activeAlarms = alarms.filter(alarm => alarm.isActive).length;
  const activeTimerCount = activeTimers.length;

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleMenuClick = () => {
    setShowMenu(true);
  };

  const handleSearchNavigate = (type: string, data: any) => {
    // Navigate to the appropriate page based on search result type
    // Since this is a React app without Next.js routing, we'll use window.location
    const currentPath = window.location.pathname;
    
    switch (type) {
      case 'timer':
        if (currentPath !== '/timer') {
          window.location.href = '/timer';
        }
        break;
      case 'stopwatch':
        if (currentPath !== '/stopwatch') {
          window.location.href = '/stopwatch';
        }
        break;
      case 'worldclock':
        if (currentPath !== '/worldclock') {
          window.location.href = '/worldclock';
        }
        break;
      case 'alarm':
        if (currentPath !== '/') {
          window.location.href = '/';
        }
        break;
      default:
        console.log('Navigate to:', type, data);
    }
  };

  return (
    <div className={`min-h-screen bg-background-primary transition-colors duration-300 ${className}`}>
      {/* Skip Links for Accessibility */}
      <SkipLinks />
      
      {/* Mobile Header */}
      <MobileHeader 
        activeAlarms={activeAlarms}
        onSearchClick={handleSearchClick}
        onMenuClick={handleMenuClick}
      />
      
      {/* Main Content Area */}
      <main 
        className="pb-24 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        role="main"
        aria-label="Main content"
        tabIndex={-1} // Allows programmatic focus for skip links
      >
        <ScreenReaderText>
          Main content area. Use tab to navigate through alarm controls and settings.
        </ScreenReaderText>
        
        {/* Enhanced page transition animation */}
        <PageTransition
          transitionKey={typeof window !== 'undefined' ? window.location.pathname : 'default'}
          variant="slideAndFade"
          className="space-y-6"
        >
          {children}
        </PageTransition>
      </main>
      
      {/* Bottom Tab Navigation */}
      <TabNavigation 
        activeAlarms={activeAlarms}
        activeTimers={activeTimerCount}
      />
      
      {/* Universal Search */}
      <UniversalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleSearchNavigate}
      />
      
      {/* Global announcements for screen readers */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="global-announcements"
      />
      
      {/* High priority announcements */}
      <div 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only"
        id="urgent-announcements"
      />
    </div>
  );
}

/**
 * Layout for individual pages within the app
 */
interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageLayout({ 
  children, 
  title, 
  description, 
  actions,
  className = ''
}: PageLayoutProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Page Header */}
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {title}
          </h1>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-text-secondary text-sm sm:text-base max-w-2xl">
            {description}
          </p>
        )}
      </header>
      
      {/* Page Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

/**
 * Card layout component with accessibility features
 */
interface CardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

export function CardLayout({ 
  children, 
  title, 
  description, 
  actions,
  className = '',
  elevated = false
}: CardLayoutProps) {
  return (
    <motion.div
      className={`
        bg-background-secondary border border-border-color rounded-2xl
        ${elevated ? 'shadow-lg shadow-black/5' : 'shadow-sm shadow-black/5'}
        transition-all duration-200
        ${className}
      `}
      whileHover={{ 
        scale: 1.002, 
        boxShadow: elevated 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between p-6 border-b border-border-color">
          <div className="space-y-1">
            {title && (
              <h2 className="text-xl font-semibold text-text-primary">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-text-secondary">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </header>
      )}
      
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
}