import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabNavigation } from './TabNavigation';
import { MobileHeader } from './MobileHeader';
import { SkipLinks } from '../accessibility/FocusManager';
import { ScreenReaderText } from '../accessibility/ScreenReaderText';
import { SearchModal } from '../ui/SearchModal';
import { useLocalStorageAlarms as useAlarms } from '@/hooks/useLocalStorageAlarms';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Main app layout with mobile-first navigation and accessibility features
 */
export function AppLayout({ children, className = '' }: AppLayoutProps) {
  const { alarms } = useAlarms();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Count active alarms for header badge
  const activeAlarms = alarms.filter(alarm => alarm.isActive).length;

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleMenuClick = () => {
    setShowMenu(true);
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
        
        {/* Page transition animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key="main-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.2, 
              ease: [0.4, 0, 0.2, 1] // Custom easing for smooth feel
            }}
            className="space-y-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Bottom Tab Navigation */}
      <TabNavigation 
        activeAlarms={activeAlarms}
        activeTimers={0} // TODO: Implement timer count
      />
      
      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
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