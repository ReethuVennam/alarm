import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, Plus, X, MapPin, Sun, Moon, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CardLayout } from '@/components/layout/AppLayout';
import { FocusManager } from '@/components/accessibility/FocusManager';
import { ScreenReaderText } from '@/components/accessibility/ScreenReaderText';
import { 
  TimezoneInfo, 
  findOptimalMeetingTime, 
  formatTimeInTimezone, 
  getBusinessHoursStatus, 
  isDaytime,
  calculateTimeDifference 
} from '@/utils/timezone';
import { WorldClockData } from '@/hooks/useWorldClock';

interface MeetingPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  locations: WorldClockData[];
  userLocation: WorldClockData;
}

interface MeetingTimeSlot {
  utcTime: Date;
  localTimes: {
    location: WorldClockData;
    time: string;
    date: string;
    isBusinessHours: boolean;
    isDaytime: boolean;
    status: string;
  }[];
  suitabilityScore: number;
  conflicts: string[];
}

export function MeetingPlanner({
  isOpen,
  onClose,
  locations,
  userLocation
}: MeetingPlannerProps) {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [duration, setDuration] = useState(60); // minutes
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [timeSlots, setTimeSlots] = useState<MeetingTimeSlot[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // All locations including user location
  const allLocations = [userLocation, ...locations];

  const analyzeOptimalTimes = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const slots: MeetingTimeSlot[] = [];
      const selectedDateObj = new Date(selectedDate);
      
      // Generate time slots for the selected day (every hour from 6 AM to 10 PM UTC)
      for (let hour = 6; hour <= 22; hour++) {
        const utcTime = new Date(selectedDateObj);
        utcTime.setUTCHours(hour, 0, 0, 0);
        
        const localTimes = allLocations.map(location => {
          const timezone = location.timezoneInfo.timezone;
          const localTime = formatTimeInTimezone(timezone, 'HH:mm');
          const localDate = formatTimeInTimezone(timezone, 'MMM dd');
          const businessStatus = getBusinessHoursStatus(timezone);
          const isDay = isDaytime(timezone);
          
          return {
            location,
            time: localTime,
            date: localDate,
            isBusinessHours: businessStatus === 'business',
            isDaytime: isDay,
            status: getStatusText(businessStatus, isDay)
          };
        });
        
        // Calculate suitability score (0-100)
        const businessHoursCount = localTimes.filter(lt => lt.isBusinessHours).length;
        const daytimeCount = localTimes.filter(lt => lt.isDaytime).length;
        const suitabilityScore = Math.round(
          (businessHoursCount * 40 + daytimeCount * 30 + (allLocations.length - Math.abs(allLocations.length - businessHoursCount)) * 30) / allLocations.length
        );
        
        // Identify conflicts
        const conflicts: string[] = [];
        const weekendCount = localTimes.filter(lt => lt.status === 'Weekend').length;
        const lateHoursCount = localTimes.filter(lt => lt.status === 'After Hours').length;
        const earlyHoursCount = localTimes.filter(lt => lt.status === 'Early Morning').length;
        
        if (weekendCount > 0) {
          conflicts.push(`${weekendCount} location(s) on weekend`);
        }
        if (lateHoursCount > 0) {
          conflicts.push(`${lateHoursCount} location(s) after hours`);
        }
        if (earlyHoursCount > 0) {
          conflicts.push(`${earlyHoursCount} location(s) early morning`);
        }
        
        slots.push({
          utcTime,
          localTimes,
          suitabilityScore,
          conflicts
        });
      }
      
      // Sort by suitability score (highest first)
      slots.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
      setTimeSlots(slots);
      setIsAnalyzing(false);
    }, 1500); // Simulate analysis time
  };

  const getStatusText = (businessStatus: string, isDaytime: boolean): string => {
    switch (businessStatus) {
      case 'business':
        return 'Business Hours';
      case 'early':
        return 'Early Morning';
      case 'late':
        return 'After Hours';
      case 'weekend':
        return 'Weekend';
      default:
        return isDaytime ? 'Daytime' : 'Nighttime';
    }
  };

  const getSuitabilityColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getSuitabilityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4" />;
    if (score >= 40) return <AlertCircle className="w-4 h-4" />;
    return <X className="w-4 h-4" />;
  };

  const handleCreateMeeting = (slot: MeetingTimeSlot) => {
    const meetingData = {
      title: meetingTitle || 'Team Meeting',
      utcTime: slot.utcTime,
      duration,
      locations: slot.localTimes,
      suitabilityScore: slot.suitabilityScore
    };

    // In a real app, this would create the meeting
    console.log('Creating meeting:', meetingData);
    
    // Copy meeting details to clipboard
    const meetingText = generateMeetingText(meetingData);
    navigator.clipboard?.writeText(meetingText);
    
    onClose();
  };

  const generateMeetingText = (meetingData: any): string => {
    const lines = [
      `📅 ${meetingData.title}`,
      `⏰ Duration: ${meetingData.duration} minutes`,
      `🌍 Times across locations:`,
      '',
      ...meetingData.locations.map((lt: any) => 
        `${lt.location.timezoneInfo.city}: ${lt.time} ${lt.date} (${lt.status})`
      ),
      '',
      `Suitability Score: ${meetingData.suitabilityScore}%`,
      '',
      'Generated with Smart Alarm Timer App'
    ];
    
    return lines.join('\n');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-4xl p-0 overflow-hidden border-0 bg-transparent shadow-none max-h-[90vh] overflow-y-auto"
        aria-labelledby="meeting-planner-title"
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
              <DialogTitle id="meeting-planner-title" className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-accent-primary" />
                Meeting Planner
              </DialogTitle>
              <p className="text-sm text-text-secondary mt-1">
                Find optimal meeting times across {allLocations.length} timezone{allLocations.length > 1 ? 's' : ''}
              </p>
            </DialogHeader>

            <div className="p-6">
              {/* Meeting Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Meeting Title
                  </label>
                  <Input
                    type="text"
                    placeholder="Team standup"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    min="15"
                    max="480"
                    step="15"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Analyze Button */}
              <div className="flex justify-center mb-6">
                <Button
                  onClick={analyzeOptimalTimes}
                  disabled={isAnalyzing}
                  className="bg-accent-primary hover:bg-accent-secondary text-white px-8"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Find Optimal Times
                    </>
                  )}
                </Button>
              </div>

              {/* Participants Preview */}
              <CardLayout
                title="Meeting Participants"
                description={`${allLocations.length} timezone${allLocations.length > 1 ? 's' : ''} included`}
                className="mb-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allLocations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center space-x-3 p-3 bg-background-tertiary rounded-lg"
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        location.isDaytime ? 'bg-yellow-400' : 'bg-indigo-400'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-text-primary text-sm truncate">
                          {location.nickname || location.timezoneInfo.city}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {location.formattedTime}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardLayout>

              {/* Results */}
              {timeSlots.length > 0 && (
                <CardLayout
                  title="Recommended Meeting Times"
                  description="Sorted by suitability score"
                >
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {timeSlots.slice(0, 8).map((slot, index) => (
                        <motion.div
                          key={slot.utcTime.toISOString()}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.1 }}
                          className="border border-border-color rounded-xl p-4 hover:border-accent-primary/30 transition-all"
                        >
                          {/* Time Slot Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`flex items-center space-x-2 ${getSuitabilityColor(slot.suitabilityScore)}`}>
                                {getSuitabilityIcon(slot.suitabilityScore)}
                                <span className="font-medium">
                                  {slot.suitabilityScore}% suitable
                                </span>
                              </div>
                              {slot.conflicts.length === 0 && (
                                <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                                  Perfect match
                                </span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleCreateMeeting(slot)}
                              className="bg-accent-primary hover:bg-accent-secondary text-white"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Create
                            </Button>
                          </div>

                          {/* Location Times Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
                            {slot.localTimes.map((lt) => (
                              <div
                                key={lt.location.id}
                                className="flex items-center justify-between p-2 bg-background-tertiary rounded-lg text-sm"
                              >
                                <div className="flex items-center space-x-2 min-w-0">
                                  <div className={`w-2 h-2 rounded-full ${
                                    lt.isDaytime ? 'bg-yellow-400' : 'bg-indigo-400'
                                  }`} />
                                  <span className="font-medium text-text-primary truncate">
                                    {lt.location.timezoneInfo.city}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="font-mono font-medium text-text-primary">
                                    {lt.time}
                                  </div>
                                  <div className={`text-xs ${
                                    lt.isBusinessHours 
                                      ? 'text-green-600 dark:text-green-400' 
                                      : 'text-orange-600 dark:text-orange-400'
                                  }`}>
                                    {lt.status}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Conflicts */}
                          {slot.conflicts.length > 0 && (
                            <div className="flex items-center space-x-2 text-xs text-orange-600 dark:text-orange-400">
                              <AlertCircle className="w-3 h-3" />
                              <span>Conflicts: {slot.conflicts.join(', ')}</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardLayout>
              )}

              {/* Empty State */}
              {timeSlots.length === 0 && !isAnalyzing && (
                <div className="text-center py-12 text-text-secondary">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Ready to Plan
                  </h3>
                  <p className="mb-4 max-w-sm mx-auto">
                    Configure your meeting details and click "Find Optimal Times" to get personalized recommendations
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-border-color bg-background-tertiary/50">
              <div className="text-xs text-text-secondary">
                Times are optimized for business hours and daylight across all locations
              </div>
              <Button
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </FocusManager>

        {/* Screen reader announcements */}
        <ScreenReaderText>
          Meeting planner opened. Configure meeting details and analyze optimal times across {allLocations.length} timezone{allLocations.length > 1 ? 's' : ''}.
        </ScreenReaderText>
      </DialogContent>
    </Dialog>
  );
}