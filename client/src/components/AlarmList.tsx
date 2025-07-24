import { useEffect, useState } from "react";
import { Edit2, Trash2, Clock, Play, Search, BellOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAlarms } from "@/hooks/useAlarms";
import { formatTimeRemaining } from "@/lib/alarmUtils";
import { useToast } from "@/hooks/use-toast";

export function AlarmList() {
  const { alarms, deleteAlarm } = useAlarms();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [dndEndTime, setDndEndTime] = useState<Date | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Check DND status
      const storedDndEndTime = localStorage.getItem('dndEndTime');
      if (storedDndEndTime) {
        const endTime = new Date(storedDndEndTime);
        if (endTime > new Date()) {
          setDndEndTime(endTime);
        } else {
          setDndEndTime(null);
          localStorage.removeItem('dndEndTime');
        }
      } else {
        setDndEndTime(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDeleteAlarm = async (id: number) => {
    try {
      await deleteAlarm(id);
      toast({
        title: "Success",
        description: "Alarm deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete alarm. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSnoozeAlarm = (id: number) => {
    // TODO: Implement snooze functionality
    toast({
      title: "Snooze",
      description: "Alarm snoozed for 10 minutes",
    });
  };

  const getRepeatDisplay = (repeatType: string, repeatValue: string | null) => {
    switch (repeatType) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      default:
        return "One-time";
    }
  };

  // Check if an alarm will be blocked by DND
  const isAlarmBlockedByDND = (alarmTime: string) => {
    if (!dndEndTime) return false;
    const triggerTime = new Date(alarmTime);
    return triggerTime <= dndEndTime;
  };

  // Filter alarms based on search query
  const filteredAlarms = alarms.filter(alarm => {
    const searchLower = searchQuery.toLowerCase();
    return alarm.title.toLowerCase().includes(searchLower) ||
           (alarm.description && alarm.description.toLowerCase().includes(searchLower)) ||
           new Date(alarm.triggerTime).toLocaleString().toLowerCase().includes(searchLower);
  });

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-gray-900 dark:text-white">
            <Clock className="w-5 h-5 text-secondary mr-3" />
            Active Alarms
          </CardTitle>
        </div>
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search alarms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {filteredAlarms.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active alarms</p>
              <p className="text-sm mt-1">Create your first alarm to get started!</p>
            </div>
          ) : (
            filteredAlarms.map((alarm) => {
              const isBlocked = isAlarmBlockedByDND(alarm.triggerTime);
              return (
                <div
                  key={alarm.id}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 transition-colors last:border-b-0 ${
                    isBlocked 
                      ? 'opacity-50 bg-gray-100 dark:bg-gray-800' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                      {/* Show meaningful titles based on content */}
                      {(() => {
                        const title = alarm.title.trim();
                        // Check if it's a generic timer/alarm title
                        if (title.toLowerCase().match(/^(set\s+)?(a\s+)?(timer|alarm)(\s+for)?$/i) || 
                            title.toLowerCase() === 'alarm' ||
                            title.toLowerCase().startsWith('alarm in')) {
                          return 'Alarm';
                        }
                        // Capitalize first letter of meaningful titles
                        return title.charAt(0).toUpperCase() + title.slice(1);
                      })()}
                      </h3>
                      {isBlocked && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                          <BellOff className="w-4 h-4" />
                          <span>Blocked by DND</span>
                        </div>
                      )}
                    </div>
                    {alarm.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                        {alarm.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {getRepeatDisplay(alarm.repeatType, alarm.repeatValue)} at{" "}
                      {new Date(alarm.triggerTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-accent animate-pulse" />
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next trigger:</div>
                  <div className="text-lg font-mono text-primary">
                    {formatTimeRemaining(alarm.triggerTime, currentTime)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isBlocked}
                      className={`p-2 ${isBlocked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-primary hover:bg-primary/10'}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isBlocked}
                      onClick={() => !isBlocked && handleSnoozeAlarm(alarm.id)}
                      className={`p-2 ${isBlocked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-accent hover:bg-accent/10'}`}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAlarm(alarm.id)}
                    className="p-2 text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
