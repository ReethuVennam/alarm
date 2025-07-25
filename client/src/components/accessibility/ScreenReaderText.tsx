import React from 'react';

interface ScreenReaderTextProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Component for text that should only be read by screen readers
 * Follows WCAG 2.1 guidelines for visually hidden content
 */
export function ScreenReaderText({ children, className = '' }: ScreenReaderTextProps) {
  return (
    <span 
      className={`
        sr-only absolute 
        w-px h-px p-0 -m-px 
        border-0 overflow-hidden 
        whitespace-nowrap clip-path-inset-50
        ${className}
      `}
      style={{
        clipPath: 'inset(50%)',
        // Fallback for browsers that don't support clip-path
        clip: 'rect(0, 0, 0, 0)',
      }}
    >
      {children}
    </span>
  );
}

/**
 * Hook to announce dynamic content changes to screen readers
 */
export function useScreenReaderAnnouncement() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return { announce };
}