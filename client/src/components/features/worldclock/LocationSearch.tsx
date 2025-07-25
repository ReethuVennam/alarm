import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Clock, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FocusManager } from '@/components/accessibility/FocusManager';
import { TimezoneInfo, searchCities, getDefaultCities, formatTimeInTimezone, isDaytime } from '@/utils/timezone';

interface LocationSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: TimezoneInfo) => void;
  existingTimezones?: string[];
}

export function LocationSearch({
  isOpen,
  onClose,
  onSelectLocation,
  existingTimezones = []
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TimezoneInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search for cities
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setSelectedIndex(0);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      const results = searchCities(query)
        .filter(city => !existingTimezones.includes(city.timezone))
        .slice(0, 10); // Limit to 10 results
      setSearchResults(results);
      setSelectedIndex(0);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, existingTimezones]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          event.preventDefault();
          if (searchResults[selectedIndex]) {
            handleSelectLocation(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelectLocation = (location: TimezoneInfo) => {
    onSelectLocation(location);
    handleClose();
  };

  const handleClose = () => {
    setQuery('');
    setSearchResults([]);
    setSelectedIndex(0);
    onClose();
  };

  const popularCities = getDefaultCities().filter(city => 
    !existingTimezones.includes(city.timezone)
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-2xl p-0 overflow-hidden border-0 bg-transparent shadow-none"
        aria-labelledby="location-search-title"
      >
        <FocusManager trapFocus autoFocus>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-background-secondary border border-border-color rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <DialogHeader className="p-6 border-b border-border-color">
              <DialogTitle id="location-search-title" className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-accent-primary" />
                Add Location
              </DialogTitle>
            </DialogHeader>

            {/* Search Input */}
            <div className="p-6 border-b border-border-color">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search cities, countries, or timezones..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 pr-4"
                  aria-label="Search for locations"
                />
                {query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0 rounded-full"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {/* Search Results */}
              {query.trim() && (
                <div className="p-4">
                  <h3 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wide">
                    Search Results
                  </h3>
                  
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                      <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No locations found for "{query}"</p>
                      <p className="text-sm mt-1">Try searching for a city or country name</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence>
                        {searchResults.map((location, index) => {
                          const isSelected = index === selectedIndex;
                          const currentTime = formatTimeInTimezone(location.timezone, 'HH:mm');
                          const isDay = isDaytime(location.timezone);
                          
                          return (
                            <motion.button
                              key={location.id}
                              onClick={() => handleSelectLocation(location)}
                              className={`
                                w-full flex items-center justify-between p-4 text-left rounded-xl transition-all
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
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  isDay ? 'bg-yellow-400' : 'bg-indigo-400'
                                }`} />
                                
                                <div className="min-w-0">
                                  <div className="font-medium text-text-primary">
                                    {location.city}
                                  </div>
                                  <div className="text-sm text-text-secondary">
                                    {location.country}
                                    {location.isCapital && (
                                      <span className="ml-2 text-xs bg-accent-primary/20 text-accent-primary px-1.5 py-0.5 rounded">
                                        Capital
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-mono font-medium text-text-primary">
                                  {currentTime}
                                </div>
                                <div className="text-xs text-text-secondary">
                                  {location.offset}
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}

              {/* Popular Cities (shown when no search query) */}
              {!query.trim() && popularCities.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wide flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Popular Cities
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {popularCities.map((location) => {
                      const currentTime = formatTimeInTimezone(location.timezone, 'HH:mm');
                      const isDay = isDaytime(location.timezone);
                      
                      return (
                        <motion.button
                          key={location.id}
                          onClick={() => handleSelectLocation(location)}
                          className="flex items-center justify-between p-4 text-left rounded-xl hover:bg-background-tertiary focus:bg-background-tertiary focus:outline-none transition-all"
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              isDay ? 'bg-yellow-400' : 'bg-indigo-400'
                            }`} />
                            
                            <div>
                              <div className="font-medium text-text-primary">
                                {location.city}
                              </div>
                              <div className="text-sm text-text-secondary">
                                {location.country}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-mono font-medium text-text-primary">
                              {currentTime}
                            </div>
                            <div className="text-xs text-text-secondary">
                              {location.offset}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No popular cities message */}
              {!query.trim() && popularCities.length === 0 && (
                <div className="p-8 text-center text-text-secondary">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>All popular cities are already added</p>
                  <p className="text-sm mt-1">Search for more cities to add</p>
                </div>
              )}
            </div>

            {/* Footer */}
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
                variant="outline"
                size="sm"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </FocusManager>
      </DialogContent>
    </Dialog>
  );
}