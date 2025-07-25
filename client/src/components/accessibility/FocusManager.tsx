import React, { useEffect, useRef } from 'react';

interface FocusManagerProps {
  children: React.ReactNode;
  restoreFocus?: boolean;
  autoFocus?: boolean;
  trapFocus?: boolean;
}

/**
 * Component to manage focus for accessibility
 * Handles focus trapping, restoration, and auto-focus
 */
export function FocusManager({ 
  children, 
  restoreFocus = true, 
  autoFocus = false,
  trapFocus = false 
}: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Auto focus the first focusable element if requested
    if (autoFocus && containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0];
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }

    // Cleanup: restore focus if requested
    return () => {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [autoFocus, restoreFocus]);

  // Handle focus trapping
  useEffect(() => {
    if (!trapFocus || !containerRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(containerRef.current!);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [trapFocus]);

  return (
    <div ref={containerRef} className="focus-manager">
      {children}
    </div>
  );
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    '[tabindex]:not([tabindex="-1"])',
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[contenteditable="true"]',
  ];

  const elements = container.querySelectorAll(focusableSelectors.join(', '));
  return Array.from(elements).filter((element) => {
    return (element as HTMLElement).offsetParent !== null; // Visible elements only
  }) as HTMLElement[];
}

/**
 * Hook to manage skip links for keyboard navigation
 */
export function useSkipLinks() {
  const skipToContent = () => {
    const main = document.querySelector('main');
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const skipToNavigation = () => {
    const nav = document.querySelector('nav[role="tablist"], nav[aria-label="Main navigation"]');
    if (nav) {
      (nav as HTMLElement).focus();
      nav.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return { skipToContent, skipToNavigation };
}

/**
 * Component for skip links (WCAG 2.1 requirement)
 */
export function SkipLinks() {
  const { skipToContent, skipToNavigation } = useSkipLinks();

  return (
    <div className="skip-links fixed top-0 left-0 z-[100]">
      <button
        onClick={skipToContent}
        className="
          sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2
          bg-primary text-white px-4 py-2 rounded-md
          focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
          transition-all duration-200
        "
        onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth' })}
      >
        Skip to main content
      </button>
      <button
        onClick={skipToNavigation}
        className="
          sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-32
          bg-primary text-white px-4 py-2 rounded-md
          focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
          transition-all duration-200
        "
        onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth' })}
      >
        Skip to navigation
      </button>
    </div>
  );
}