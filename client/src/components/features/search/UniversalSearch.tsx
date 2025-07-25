import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Timer, Globe, AlarmClock, X, Mic, Filter, Star, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FocusManager } from '@/components/accessibility/FocusManager';
import { ScreenReaderText } from '@/components/accessibility/ScreenReaderText';
import { useTimers, Timer as TimerType } from '@/hooks/useTimers';
import { useStopwatch } from '@/hooks/useStopwatch';
import { useWorldClock } from '@/hooks/useWorldClock';

interface SearchableItem {
  id: string;
  type: 'timer' | 'stopwatch' | 'worldclock' | 'alarm';
  title: string;
  subtitle?: string;
  category?: string;
  status?: string;
  tags: string[];
  data: any;
  relevanceScore: number;
}

interface UniversalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (type: string, data: any) => void;
}

export function UniversalSearch({
  isOpen,
  onClose,
  onNavigate
}: UniversalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hooks for data
  const { timers } = useTimers();
  const { sessions } = useStopwatch();
  const { locations } = useWorldClock();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('smart-alarm-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      }
    }
  }, []);

  // Save recent searches
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('smart-alarm-recent-searches', JSON.stringify(updated));
  };

  // Create searchable items from all data
  const searchableItems = useMemo((): SearchableItem[] => {
    const items: SearchableItem[] = [];

    // Add timers
    timers.forEach(timer => {
      items.push({
        id: timer.id,
        type: 'timer',
        title: timer.name,
        subtitle: `${Math.round(timer.originalDuration / 60)} minutes`,
        category: timer.category,
        status: timer.isRunning ? 'Running' : timer.isPaused ? 'Paused' : timer.isCompleted ? 'Completed' : 'Ready',
        tags: [timer.category, timer.name.toLowerCase(), 'timer', 'focus', 'productivity'],
        data: timer,
        relevanceScore: 0
      });
    });

    // Add stopwatch sessions
    sessions.forEach(session => {
      items.push({
        id: session.id,
        type: 'stopwatch',
        title: session.name,
        subtitle: `${session.laps.length} laps`,
        category: 'stopwatch',
        status: session.isRunning ? 'Running' : 'Stopped',
        tags: [session.name.toLowerCase(), 'stopwatch', 'timing', 'laps'],
        data: session,
        relevanceScore: 0
      });
    });

    // Add world clock locations
    locations.forEach(location => {
      items.push({
        id: location.id,
        type: 'worldclock',
        title: location.nickname || location.timezoneInfo.city,
        subtitle: `${location.timezoneInfo.country} - ${location.formattedTime}`,
        category: 'timezone',
        status: location.businessStatus,
        tags: [
          location.timezoneInfo.city.toLowerCase(),
          location.timezoneInfo.country.toLowerCase(),
          'timezone',
          'worldclock',
          'time',
          location.businessStatus
        ],
        data: location,
        relevanceScore: 0
      });
    });

    return items;
  }, [timers, sessions, locations]);

  // Filter and search items
  const filteredItems = useMemo(() => {
    let filtered = searchableItems;

    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === activeFilter);
    }

    // Apply search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      
      filtered = filtered.map(item => {
        let score = 0;
        
        // Title exact match (highest score)
        if (item.title.toLowerCase() === searchTerm) {
          score += 100;
        }
        // Title starts with query
        else if (item.title.toLowerCase().startsWith(searchTerm)) {
          score += 80;
        }
        // Title contains query
        else if (item.title.toLowerCase().includes(searchTerm)) {
          score += 60;
        }
        
        // Subtitle matches
        if (item.subtitle?.toLowerCase().includes(searchTerm)) {
          score += 40;
        }
        
        // Category matches
        if (item.category?.toLowerCase().includes(searchTerm)) {
          score += 30;
        }
        
        // Status matches
        if (item.status?.toLowerCase().includes(searchTerm)) {
          score += 20;
        }
        
        // Tags match
        const tagMatches = item.tags.filter(tag => tag.includes(searchTerm)).length;
        score += tagMatches * 10;

        return { ...item, relevanceScore: score };
      }).filter(item => item.relevanceScore > 0);
    }

    // Sort by relevance score (highest first) and then by type priority
    return filtered.sort((a, b) => {
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      
      // Type priority: timer > stopwatch > worldclock > alarm
      const typePriority = { timer: 4, stopwatch: 3, worldclock: 2, alarm: 1 };
      return (typePriority[b.type] || 0) - (typePriority[a.type] || 0);
    });
  }, [searchableItems, query, activeFilter]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredItems.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredItems[selectedIndex]) {
            handleSelectItem(filteredItems[selectedIndex]);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeFilter]);

  const handleSelectItem = (item: SearchableItem) => {
    saveRecentSearch(query);
    onNavigate(item.type, item.data);
    onClose();
  };

  const handleRecentSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser');
      return;
    }

    setIsVoiceSearch(true);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsVoiceSearch(false);
    };

    recognition.onerror = () => {
      setIsVoiceSearch(false);
    };

    recognition.onend = () => {
      setIsVoiceSearch(false);
    };

    recognition.start();
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'timer': return <Timer className="w-4 h-4" />;
      case 'stopwatch': return <Clock className="w-4 h-4" />;
      case 'worldclock': return <Globe className="w-4 h-4" />;
      case 'alarm': return <AlarmClock className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'timer': return 'text-red-500';
      case 'stopwatch': return 'text-blue-500';
      case 'worldclock': return 'text-green-500';
      case 'alarm': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const filters = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'timer', label: 'Timers', icon: Timer },
    { id: 'stopwatch', label: 'Stopwatch', icon: Clock },
    { id: 'worldclock', label: 'World Clock', icon: Globe },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-2xl p-0 overflow-hidden border-0 bg-transparent shadow-none"
        aria-labelledby="universal-search-title"
      >
        <FocusManager trapFocus autoFocus>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-background-secondary border border-border-color rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-4 border-b border-border-color">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search timers, stopwatch, locations..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 pr-20 text-lg py-3 border-0 bg-transparent focus:ring-0"
                  aria-label="Universal search"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVoiceSearch}
                    disabled={isVoiceSearch}
                    className="w-8 h-8 p-0 rounded-full"
                    aria-label="Voice search"
                  >
                    <Mic className={`w-3 h-3 ${isVoiceSearch ? 'text-red-500 animate-pulse' : ''}`} />
                  </Button>
                  {query && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuery('')}
                      className="w-8 h-8 p-0 rounded-full"
                      aria-label="Clear search"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 py-2 border-b border-border-color">
              <div className="flex space-x-2 overflow-x-auto">
                {filters.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = activeFilter === filter.id;
                  
                  return (
                    <Button
                      key={filter.id}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveFilter(filter.id)}
                      className={`flex items-center space-x-2 whitespace-nowrap ${
                        isActive ? 'bg-accent-primary text-white' : ''
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{filter.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {/* Search Results */}
              {query.trim() && (
                <div className="p-4">
                  <h3 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wide flex items-center">
                    <Search className="w-4 h-4 mr-1" />
                    Search Results ({filteredItems.length})
                  </h3>
                  
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No results found for "{query}"</p>
                      <p className="text-sm mt-1">Try searching for timers, locations, or categories</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence>
                        {filteredItems.map((item, index) => {
                          const isSelected = index === selectedIndex;
                          
                          return (
                            <motion.button
                              key={item.id}
                              onClick={() => handleSelectItem(item)}
                              className={`
                                w-full flex items-center justify-between p-3 text-left rounded-xl transition-all
                                hover:bg-background-tertiary focus:bg-background-tertiary focus:outline-none
                                ${isSelected ? 'bg-background-tertiary ring-2 ring-accent-primary ring-opacity-50' : ''}
                              `}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.1, delay: index * 0.05 }}
                              whileHover={{ x: 4 }}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div className={`${getItemColor(item.type)}`}>
                                  {getItemIcon(item.type)}
                                </div>
                                
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-text-primary truncate">
                                    {item.title}
                                  </div>
                                  {item.subtitle && (
                                    <div className="text-sm text-text-secondary truncate">
                                      {item.subtitle}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right flex items-center space-x-2">
                                {item.status && (
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    item.status === 'Running' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
                                    item.status === 'Paused' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' :
                                    'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
                                  }`}>
                                    {item.status}
                                  </span>
                                )}
                                <span className="text-xs text-text-secondary capitalize">
                                  {item.type}
                                </span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Searches (shown when no search query) */}
              {!query.trim() && recentSearches.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wide flex items-center">
                    <History className="w-4 h-4 mr-1" />
                    Recent Searches
                  </h3>
                  
                  <div className="space-y-2">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <button
                        key={search}
                        onClick={() => handleRecentSearch(search)}
                        className="w-full flex items-center space-x-3 p-3 text-left rounded-xl hover:bg-background-tertiary focus:bg-background-tertiary focus:outline-none transition-all"
                      >
                        <History className="w-4 h-4 text-text-secondary" />
                        <span className="text-text-primary">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!query.trim() && recentSearches.length === 0 && (
                <div className="p-8 text-center text-text-secondary">
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Universal Search
                  </h3>
                  <p className="mb-4 max-w-sm mx-auto">
                    Search across all your timers, stopwatch sessions, and world clock locations
                  </p>
                  <div className="text-sm">
                    <div>Try searching for:</div>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                      <span className="bg-background-tertiary px-2 py-1 rounded">work timer</span>
                      <span className="bg-background-tertiary px-2 py-1 rounded">running session</span>
                      <span className="bg-background-tertiary px-2 py-1 rounded">New York</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-3 border-t border-border-color bg-background-tertiary/50">
              <div className="flex items-center space-x-2 text-xs text-text-secondary">
                <kbd className="px-2 py-1 bg-background-primary border border-border-color rounded text-xs">
                  ↑↓
                </kbd>
                <span>Navigate</span>
                <kbd className="px-2 py-1 bg-background-primary border border-border-color rounded text-xs">
                  ↵
                </kbd>
                <span>Select</span>
              </div>
              
              <div className="text-xs text-text-secondary">
                {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
              </div>
            </div>
          </motion.div>
        </FocusManager>

        {/* Screen reader announcements */}
        <ScreenReaderText>
          Universal search opened. {filteredItems.length} results found.
        </ScreenReaderText>
      </DialogContent>
    </Dialog>
  );
}