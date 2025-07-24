import { AlarmForm } from "@/components/AlarmForm";
import { AlarmList } from "@/components/AlarmList";
import { AlarmModal } from "@/components/AlarmModal";
import { DoNotDisturb } from "@/components/DoNotDisturb";
import { useTheme } from "@/hooks/useTheme";
import { useAlarms } from "@/hooks/useAlarms";
import { Bell, Moon, Sun, QrCode } from "lucide-react";
import { Link } from "wouter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { alarms } = useAlarms();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Smart Alarm</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Natural & Traditional</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* QR Code Link */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/qr">
                    <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <QrCode className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mobile Access & QR Code</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
              
              {/* Active Alarms Count */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary rounded-full">
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">{alarms.length}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AlarmForm />
            <DoNotDisturb />
          </div>
          <div className="lg:col-span-1">
            <AlarmList />
          </div>
        </div>
      </main>

      <AlarmModal />
    </div>
  );
}
