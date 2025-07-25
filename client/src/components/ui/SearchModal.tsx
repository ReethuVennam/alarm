import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, Timer, Globe, Mic } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FocusManager } from '../accessibility/FocusManager';
import { ScreenReaderText } from '../accessibility/ScreenReaderText';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  type: 'alarm' | 'timer' | 'setting' | 'location';
  title: string;
  description?: string;
  icon: React.ElementType;
  color: string;
  action: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock search results - will be replaced with actual search logic
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'alarm',
      title: 'Morning Alarm',
      description: 'Daily at 7:00 AM',
      icon: Clock,
      color: '#6366f1',
      action: () => console.log('Navigate to alarm')
    },
    {
      id: '2',
      type: 'timer',
      title: 'Pomodoro Timer',
      description: '25 minutes focus time',
      icon: Timer,
      color: '#f59e0b',
      action: () => console.log('Start timer')
    },
    {
      id: '3',
      type: 'location',
      title: 'New York',
      description: 'GMT-5, 2:30 PM',
      icon: Globe,
      color: '#8b5cf6',
      action: () => console.log('Show timezone')
    }
  ];

  // Filter results based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const filtered = mockResults.filter(result =>
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.description?.toLowerCase().includes(query.toLowerCase())
    );
    
    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          event.preventDefault();
          if (results[selectedIndex]) {
            results[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent 
            className="sm:max-w-2xl p-0 overflow-hidden border-0 bg-transparent shadow-none"
            aria-labelledby="search-title"
            aria-describedby="search-description"
          >
            <FocusManager trapFocus autoFocus>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-background-secondary border border-border-color rounded-2xl shadow-2xl"
              >
                {/* Search Header */}
                <div className="flex items-center p-4 border-b border-border-color">
                  <Search className="w-5 h-5 text-text-secondary mr-3" />
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search alarms, timers, settings..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 border-0 bg-transparent text-text-primary placeholder:text-text-secondary focus-visible:ring-0 focus-visible:ring-offset-0"
                    aria-label="Search input"
                    aria-describedby="search-help"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="ml-2 w-8 h-8 p-0 rounded-lg hover:bg-background-tertiary"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <ScreenReaderText id="search-help">
                  Use arrow keys to navigate results, Enter to select, Escape to close
                </ScreenReaderText>

                {/* Search Results */}
                <div className="max-h-96 overflow-y-auto">
                  {query.trim() && results.length === 0 && (
                    <div className="p-8 text-center">
                      <Search className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
                      <p className="text-text-secondary">
                        No results found for "{query}"
                      </p>
                      <p className="text-sm text-text-secondary mt-2">
                        Try searching for alarms, timers, or settings
                      </p>
                    </div>
                  )}

                  {results.length > 0 && (
                    <div 
                      className="py-2"
                      role="listbox"
                      aria-label="Search results"
                    >
                      {results.map((result, index) => {
                        const Icon = result.icon;
                        const isSelected = index === selectedIndex;
                        
                        return (
                          <motion.button
                            key={result.id}
                            onClick={() => {
                              result.action();
                              handleClose();
                            }}
                            className={`
                              w-full flex items-center p-4 text-left transition-colors
                              hover:bg-background-tertiary focus:bg-background-tertiary
                              focus:outline-none
                              ${isSelected ? 'bg-background-tertiary' : ''}
                            `}
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.1 }}
                            role="option"
                            aria-selected={isSelected}
                          >
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center mr-3"
                              style={{ backgroundColor: result.color }}
                            >
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-text-primary truncate">
                                {result.title}
                              </p>
                              {result.description && (
                                <p className="text-sm text-text-secondary truncate">
                                  {result.description}
                                </p>
                              )}
                            </div>
                            
                            <div className="text-xs text-text-secondary uppercase tracking-wide">
                              {result.type}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {!query.trim() && (
                    <div className="p-8 text-center">
                      <div className="flex justify-center space-x-2 mb-4">
                        <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse delay-100" />
                        <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse delay-200" />
                      </div>
                      <p className="text-text-secondary mb-2">
                        Start typing to search
                      </p>
                      <div className="flex items-center justify-center space-x-4 text-xs text-text-secondary">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Alarms</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Timer className="w-3 h-3" />
                          <span>Timers</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <span>Locations</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Footer with Voice Search */}
                <div className="flex items-center justify-between p-4 border-t border-border-color bg-background-tertiary/50">
                  <div className="flex items-center space-x-2 text-xs text-text-secondary">
                    <kbd className="px-2 py-1 bg-background-primary border border-border-color rounded text-xs">
                      ↑↓
                    </kbd>
                    <span>Navigate</span>
                    <kbd className="px-2 py-1 bg-background-primary border border-border-color rounded text-xs">
                      ↵
                    </kbd>
                    <span>Select</span>
                    <kbd className="px-2 py-1 bg-background-primary border border-border-color rounded text-xs">
                      ESC
                    </kbd>
                    <span>Close</span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-accent-primary hover:text-accent-secondary"
                    aria-label="Voice search"
                  >
                    <Mic className="w-4 h-4 mr-1" />
                    <span className="text-xs">Voice</span>
                  </Button>
                </div>
              </motion.div>
            </FocusManager>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}