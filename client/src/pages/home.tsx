import { AlarmForm } from "@/components/AlarmForm";
import { AlarmList } from "@/components/AlarmList";
import { AlarmModal } from "@/components/AlarmModal";
import { DoNotDisturb } from "@/components/DoNotDisturb";
import { AppLayout, PageLayout, CardLayout } from "@/components/layout/AppLayout";

export default function Home() {
  return (
    <AppLayout>
      <PageLayout
        title="Smart Alarms"
        description="Create and manage your alarms with natural language or traditional controls"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <CardLayout 
              title="Create New Alarm"
              description="Use voice commands or manual settings"
              elevated
            >
              <AlarmForm />
            </CardLayout>
            
            <CardLayout
              title="Do Not Disturb"
              description="Temporarily disable all notifications"
            >
              <DoNotDisturb />
            </CardLayout>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CardLayout
              title="Active Alarms"
              description="Your scheduled alarms and reminders"
              elevated
            >
              <AlarmList />
            </CardLayout>
          </div>
        </div>
      </PageLayout>
      
      {/* Global alarm modal */}
      <AlarmModal />
    </AppLayout>
  );
}
