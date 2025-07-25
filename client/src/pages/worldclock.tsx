import React, { useState, useEffect } from 'react';
import { Globe, Search, Plus, Sun, Moon, Calendar } from 'lucide-react';
import { AppLayout, PageLayout, CardLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TimeZoneData {
  city: string;
  country: string;
  timezone: string;
  time: string;
  date: string;
  isDaytime: boolean;
  offset: string;
}

export default function WorldClockPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  // Mock timezone data
  const timeZones: TimeZoneData[] = [
    {
      city: 'New York',
      country: 'United States',
      timezone: 'EST',
      time: '2:30 PM',
      date: 'Jan 25, 2025',
      isDaytime: true,
      offset: 'GMT-5'
    },
    {
      city: 'London',
      country: 'United Kingdom', 
      timezone: 'GMT',
      time: '7:30 PM',
      date: 'Jan 25, 2025',
      isDaytime: false,
      offset: 'GMT+0'
    },
    {
      city: 'Tokyo',
      country: 'Japan',
      timezone: 'JST',
      time: '4:30 AM',
      date: 'Jan 26, 2025',
      isDaytime: false,
      offset: 'GMT+9'
    },
    {
      city: 'Sydney',
      country: 'Australia',
      timezone: 'AEDT',
      time: '6:30 AM',
      date: 'Jan 26, 2025',
      isDaytime: true,
      offset: 'GMT+11'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const filteredTimeZones = timeZones.filter(tz =>
    tz.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tz.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <PageLayout
        title="World Clock"
        description="Track time across different time zones"
        actions={
          <Button className="bg-accent-primary hover:bg-accent-secondary text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Search */}
          <CardLayout>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input
                type="text"
                placeholder="Search cities or countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardLayout>

          {/* Time Zone Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTimeZones.map((tz, index) => (
              <CardLayout
                key={`${tz.city}-${index}`}
                className="relative overflow-hidden"
                elevated
              >
                {/* Background gradient based on day/night */}
                <div
                  className={`absolute inset-0 opacity-10 ${
                    tz.isDaytime
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                      : 'bg-gradient-to-br from-indigo-900 to-purple-900'
                  }`}
                />
                
                <div className="relative z-10 p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        tz.isDaytime ? 'bg-yellow-400' : 'bg-indigo-400'
                      }`} />
                      <span className="text-sm text-text-secondary">
                        {tz.timezone}
                      </span>
                    </div>
                    {tz.isDaytime ? (
                      <Sun className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-text-primary">
                      {tz.city}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {tz.country}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="mb-2">
                    <div className="text-2xl font-mono font-bold text-text-primary">
                      {tz.time}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {tz.date}
                    </div>
                  </div>

                  {/* Offset */}
                  <div className="text-xs text-text-secondary">
                    {tz.offset}
                  </div>
                </div>
              </CardLayout>
            ))}
          </div>

          {/* Meeting Planner */}
          <CardLayout
            title="Meeting Planner"
            description="Find the best time for global meetings"
            actions={
              <Button variant="ghost" size="sm">
                <Calendar className="w-4 h-4 mr-1" />
                Plan Meeting
              </Button>
            }
          >
            <div className="text-center py-8 text-text-secondary">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Meeting planner coming soon</p>
              <p className="text-sm mt-1">
                Schedule meetings across time zones efficiently
              </p>
            </div>
          </CardLayout>
        </div>
      </PageLayout>
    </AppLayout>
  );
}