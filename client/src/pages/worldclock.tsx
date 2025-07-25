import React, { useState } from 'react';
import { Globe, Plus, Sun, Moon, Calendar, Users, MapPin, Clock } from 'lucide-react';
import { AppLayout, PageLayout, CardLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { WorldClockCard, CompactWorldClockCard } from '@/components/features/worldclock/WorldClockCard';
import { LocationSearch } from '@/components/features/worldclock/LocationSearch';
import { useWorldClock } from '@/hooks/useWorldClock';
import { TimezoneInfo } from '@/utils/timezone';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorldClockPage() {
  const [isLocationSearchOpen, setIsLocationSearchOpen] = useState(false);
  const {
    locations,
    userLocation,
    totalLocations,
    businessHoursCount,
    daytimeCount,
    addLocation,
    removeLocation,
  } = useWorldClock();

  const handleAddLocation = (timezoneInfo: TimezoneInfo) => {
    addLocation(timezoneInfo);
  };

  const existingTimezones = locations.map(loc => loc.timezoneInfo.timezone);

  return (
    <AppLayout>
      <PageLayout
        title="World Clock"
        description="Track time across different time zones"
        actions={
          <Button 
            onClick={() => setIsLocationSearchOpen(true)}
            className="bg-accent-primary hover:bg-accent-secondary text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        }
      >
        <div className="space-y-6">
          {/* User's Local Time */}
          <CardLayout
            title="Your Local Time"
            description="Current time in your timezone"
            elevated
          >
            <div className="flex justify-center">
              <WorldClockCard
                location={userLocation}
                size="large"
                showControls={false}
              />
            </div>
          </CardLayout>

          {/* Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <CardLayout className="text-center">
              <div className="w-12 h-12 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-6 h-6 text-accent-primary" />
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {totalLocations}
              </div>
              <div className="text-sm text-text-secondary">Locations</div>
            </CardLayout>

            <CardLayout className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {businessHoursCount}
              </div>
              <div className="text-sm text-text-secondary">Business Hours</div>
            </CardLayout>

            <CardLayout className="text-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sun className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {daytimeCount}
              </div>
              <div className="text-sm text-text-secondary">Daytime</div>
            </CardLayout>

            <CardLayout className="text-center">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Moon className="w-6 h-6 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {totalLocations - daytimeCount}
              </div>
              <div className="text-sm text-text-secondary">Nighttime</div>
            </CardLayout>
          </div>

          {/* World Clock Grid */}
          {locations.length > 0 ? (
            <CardLayout
              title="World Locations"
              description="Your saved timezone locations"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                  {locations.map((location) => (
                    <motion.div
                      key={location.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <WorldClockCard
                        location={location}
                        onRemove={removeLocation}
                        size="medium"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardLayout>
          ) : (
            <CardLayout
              title="No Locations Added"
              description="Add your first world clock location"
              elevated
            >
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-accent-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Track Global Time
                </h3>
                <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                  Add locations around the world to keep track of different time zones
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setIsLocationSearchOpen(true)}
                    className="bg-accent-primary hover:bg-accent-secondary text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Location
                  </Button>
                </div>
              </div>
            </CardLayout>
          )}

          {/* Compact List View */}
          {locations.length > 4 && (
            <CardLayout
              title="Quick View"
              description="All locations at a glance"
            >
              <div className="space-y-3">
                <AnimatePresence>
                  {locations.map((location) => (
                    <motion.div
                      key={`compact-${location.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.1 }}
                    >
                      <CompactWorldClockCard
                        location={location}
                        onRemove={removeLocation}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardLayout>
          )}

          {/* Meeting Planner */}
          <CardLayout
            title="Meeting Planner"
            description="Find optimal times for global meetings"
          >
            <div className="text-center py-8 text-text-secondary">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Coming Soon
              </h3>
              <p className="mb-4 max-w-sm mx-auto">
                Schedule meetings across time zones with automatic optimization for business hours
              </p>
              <div className="text-sm text-text-secondary">
                Features in development:
              </div>
              <div className="text-xs text-text-secondary mt-2 space-y-1">
                <div>• Find optimal meeting times across multiple time zones</div>
                <div>• Business hours consideration</div>
                <div>• Calendar integration</div>
                <div>• Meeting link generation</div>
              </div>
            </div>
          </CardLayout>
        </div>
      </PageLayout>

      {/* Location Search Modal */}
      <LocationSearch
        isOpen={isLocationSearchOpen}
        onClose={() => setIsLocationSearchOpen(false)}
        onSelectLocation={handleAddLocation}
        existingTimezones={existingTimezones}
      />
    </AppLayout>
  );
}