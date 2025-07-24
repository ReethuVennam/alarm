import { useState, useEffect } from "react";
import { BellOff, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function DoNotDisturb() {
  const { toast } = useToast();
  const [isDNDActive, setIsDNDActive] = useState(false);
  const [dndEndTime, setDndEndTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState("");
  const [unit, setUnit] = useState("minutes");

  useEffect(() => {
    // Check if DND is active from localStorage
    const savedDNDEndTime = localStorage.getItem('dndEndTime');
    if (savedDNDEndTime) {
      const endTime = new Date(savedDNDEndTime);
      if (endTime > new Date()) {
        setIsDNDActive(true);
        setDndEndTime(endTime);
      } else {
        // DND expired, clear it
        localStorage.removeItem('dndEndTime');
      }
    }
  }, []);

  useEffect(() => {
    if (isDNDActive && dndEndTime) {
      const checkInterval = setInterval(() => {
        if (new Date() >= dndEndTime) {
          deactivateDND();
        }
      }, 1000);

      return () => clearInterval(checkInterval);
    }
  }, [isDNDActive, dndEndTime]);

  const activateDND = () => {
    const durationNum = parseInt(duration);
    if (!durationNum || durationNum <= 0) {
      toast({
        title: "Invalid duration",
        description: "Please enter a valid duration",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const endTime = new Date(now);

    switch (unit) {
      case "minutes":
        endTime.setMinutes(endTime.getMinutes() + durationNum);
        break;
      case "hours":
        endTime.setHours(endTime.getHours() + durationNum);
        break;
      case "days":
        endTime.setDate(endTime.getDate() + durationNum);
        break;
    }

    setDndEndTime(endTime);
    setIsDNDActive(true);
    localStorage.setItem('dndEndTime', endTime.toISOString());

    toast({
      title: "Do Not Disturb activated",
      description: `All notifications blocked until ${endTime.toLocaleString()}`,
    });
  };

  const deactivateDND = () => {
    setIsDNDActive(false);
    setDndEndTime(null);
    localStorage.removeItem('dndEndTime');
    
    toast({
      title: "Do Not Disturb deactivated",
      description: "You will now receive alarm notifications",
    });
  };

  const getTimeRemaining = () => {
    if (!dndEndTime) return "";
    
    const now = new Date();
    const diff = dndEndTime.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="flex items-center text-gray-900 dark:text-white">
          {isDNDActive ? (
            <BellOff className="w-5 h-5 text-red-500 mr-3" />
          ) : (
            <Bell className="w-5 h-5 text-primary mr-3" />
          )}
          Do Not Disturb
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {isDNDActive ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Do Not Disturb is active
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                All alarm notifications are blocked
              </p>
              <p className="text-lg font-mono text-red-600 dark:text-red-400 mt-2">
                Time remaining: {getTimeRemaining()}
              </p>
            </div>
            <Button 
              onClick={deactivateDND}
              variant="destructive"
              className="w-full"
            >
              <BellOff className="w-4 h-4 mr-2" />
              Turn Off Do Not Disturb
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="duration" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Duration
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="duration"
                  type="number"
                  placeholder="Enter duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="flex-1"
                />
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={activateDND}
              className="w-full"
            >
              <BellOff className="w-4 h-4 mr-2" />
              Activate Do Not Disturb
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}