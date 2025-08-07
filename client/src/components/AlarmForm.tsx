import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Clock, Plus, Zap, Volume2, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAlarmsContext } from "@/hooks/AlarmsContext";
import { parseNaturalLanguage } from "@/lib/alarmUtils";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  repeatType: z.enum(["none", "daily", "weekly", "monthly"]).default("none"),
  repeatValue: z.string().optional(),
  soundEnabled: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

export function AlarmForm() {
  const [naturalInput, setNaturalInput] = useState("");
  const [parsedResult, setParsedResult] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { createAlarm, refetch } = useAlarmsContext();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      repeatType: "none",
      repeatValue: "",
      soundEnabled: true,
    },
  });

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNaturalInput(transcript);
        setIsListening(false);

        // Auto-parse and create alarm after voice input
        const parsed = parseNaturalLanguage(transcript);
        if (parsed) {
          // Check if it's a Do Not Disturb command
          if ('isDND' in parsed && parsed.isDND) {
            activateDoNotDisturb(parsed.amount, parsed.unit);
            return;
          }

          setParsedResult(parsed.summary);

          // Only access alarm fields if not DND
          if ('triggerTime' in parsed) {
            const triggerTime = new Date(parsed.triggerTime);
            const dateString = triggerTime.toISOString().split('T')[0]; // YYYY-MM-DD format
            const timeString = triggerTime.toTimeString().slice(0, 5); // HH:MM format

            form.setValue("title", parsed.title);
            form.setValue("description", parsed.description || "");
            form.setValue("date", dateString);
            form.setValue("time", timeString);
            form.setValue("repeatType", parsed.repeatType);
            form.setValue("repeatValue", parsed.repeatValue || "");

            // Auto-submit the form after successful voice recognition
            toast({
              title: "Creating alarm...",
              description: parsed.summary,
            });

            // Wait a moment for form values to update, then submit
            setTimeout(() => {
              form.handleSubmit(onSubmit)();
            }, 200);
          }
        } else {
          toast({
            title: "Could not understand",
            description: "Please try again with a clearer command like 'remind me to call mom in 5 minutes'",
            variant: "destructive",
          });
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not process voice input. Please try again or type manually.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const activateDoNotDisturb = (amount: number, unit: string) => {
    const now = new Date();
    const endTime = new Date(now);

    switch (unit) {
      case "minute":
        endTime.setMinutes(endTime.getMinutes() + amount);
        break;
      case "hour":
        endTime.setHours(endTime.getHours() + amount);
        break;
      case "day":
        endTime.setDate(endTime.getDate() + amount);
        break;
    }

    localStorage.setItem('dndEndTime', endTime.toISOString());
    
    toast({
      title: "Do Not Disturb activated",
      description: `All notifications blocked until ${endTime.toLocaleString()}`,
    });
    
    // Force a page reload to update the DND component
    window.location.reload();
  };

  const toggleVoiceRecognition = () => {
    if (!speechSupported) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition. Please type manually.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleNaturalLanguageParse = () => {
    if (!naturalInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a natural language command",
        variant: "destructive",
      });
      return;
    }

    const parsed = parseNaturalLanguage(naturalInput);
    if (parsed) {
      // Check if it's a Do Not Disturb command
      if ('isDND' in parsed && parsed.isDND) {
        activateDoNotDisturb(parsed.amount, parsed.unit);
        setNaturalInput("");
        return;
      }

      setParsedResult(parsed.summary);

      // Only access alarm fields if not DND
      if ('triggerTime' in parsed) {
        const triggerTime = new Date(parsed.triggerTime);
        const dateString = triggerTime.toISOString().split('T')[0]; // YYYY-MM-DD format
        const timeString = triggerTime.toTimeString().slice(0, 5); // HH:MM format

        form.setValue("title", parsed.title);
        form.setValue("description", parsed.description || "");
        form.setValue("date", dateString);
        form.setValue("time", timeString);
        form.setValue("repeatType", parsed.repeatType);
        form.setValue("repeatValue", parsed.repeatValue || "");
      }
    } else {
      toast({
        title: "Parse Error",
        description: "Could not parse the natural language input. Please try again or use traditional controls.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const triggerTime = new Date(`${data.date}T${data.time}`);
      
      console.log('Creating alarm with data:', {
        title: data.title,
        description: data.description || null,
        triggerTime,
        repeatType: data.repeatType,
        repeatValue: data.repeatValue || null,
        soundEnabled: data.soundEnabled,
        isActive: true,
      });
      
      const result = await createAlarm({
        title: data.title,
        description: data.description || null,
        triggerTime,
        repeatType: data.repeatType,
        repeatValue: data.repeatValue || null,
        soundEnabled: data.soundEnabled,
        isActive: true,
      });
      
      console.log('Alarm created successfully:', result);

      // Refetch alarms to update the list immediately
      if (typeof refetch === 'function') {
        await refetch();
      }

      toast({
        title: "Success",
        description: "Alarm created successfully!",
      });

      // Reset form
      form.reset();
      setNaturalInput("");
      setParsedResult(null);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to create alarm. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="flex items-center text-gray-900 dark:text-white">
          <Clock className="w-6 h-6 text-primary mr-3" />
          Create New Alarm
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Use natural language or traditional controls
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Natural Language Input */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Natural Language Input
          </Label>
          <div className="relative">
            <Input
              type="text"
              placeholder={isListening ? "Listening..." : "e.g., 'Remind me to pay credit card bill every 2nd of the month at 6pm'"}
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              className="pr-20"
              disabled={isListening}
            />
            <div className="absolute right-2 top-2 flex space-x-1">
              {speechSupported && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      onClick={toggleVoiceRecognition}
                      size="sm"
                      className={`h-8 w-8 p-0 ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isListening ? 'Recording... Speak now!' : 'Click to speak, alarm will be created automatically'}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Button
                type="button"
                onClick={handleNaturalLanguageParse}
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Zap className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {isListening && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 flex items-center">
              <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Listening for voice input...
            </p>
          )}
        </div>

        {/* Parse Preview */}
        {parsedResult && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <div className="flex items-center mb-2">
              <div className="w-5 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-full flex items-center justify-center mr-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Parsed Result</span>
            </div>
            <p className="text-emerald-700 dark:text-emerald-300">{parsedResult}</p>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
          <span className="px-4 text-sm text-gray-500 dark:text-gray-400">OR</span>
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
        </div>

        {/* Traditional Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alarm Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter alarm description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="repeatType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat Options</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select repeat option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">One-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="soundEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sound Notification
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button type="submit" className="w-full">
                <Plus className="w-5 h-5 mr-2" />
                Create Alarm
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
