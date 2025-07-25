import { type Alarm, type InsertAlarm } from '../../shared/schema';

// LocalStorage-based storage for development and quick prototyping
// This runs on the client-side, so serverless functions will return mock data
// and the real storage happens in the browser

export class LocalStorageService {
  private static readonly ALARMS_KEY = 'smart-alarm-alarms';
  private static readonly COUNTER_KEY = 'smart-alarm-counter';

  // Get alarms from localStorage
  static getAlarms(): Alarm[] {
    if (typeof window === 'undefined') {
      // Server-side: return empty array, client will hydrate
      return [];
    }

    try {
      const stored = localStorage.getItem(this.ALARMS_KEY);
      if (!stored) return [];
      
      const alarms = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      return alarms.map((alarm: any) => ({
        ...alarm,
        triggerTime: new Date(alarm.triggerTime),
        createdAt: new Date(alarm.createdAt),
        updatedAt: new Date(alarm.updatedAt)
      }));
    } catch (error) {
      console.error('Error reading alarms from localStorage:', error);
      return [];
    }
  }

  // Save alarms to localStorage
  static saveAlarms(alarms: Alarm[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.ALARMS_KEY, JSON.stringify(alarms));
    } catch (error) {
      console.error('Error saving alarms to localStorage:', error);
    }
  }

  // Get next ID counter
  static getNextId(): number {
    if (typeof window === 'undefined') return 1;

    try {
      const stored = localStorage.getItem(this.COUNTER_KEY);
      const currentId = stored ? parseInt(stored) : 1;
      localStorage.setItem(this.COUNTER_KEY, (currentId + 1).toString());
      return currentId;
    } catch (error) {
      console.error('Error getting next ID:', error);
      return Date.now(); // Fallback to timestamp
    }
  }

  // Create new alarm
  static createAlarm(insertAlarm: InsertAlarm): Alarm {
    const alarms = this.getAlarms();
    const id = this.getNextId();
    const now = new Date();

    const newAlarm: Alarm = {
      ...insertAlarm,
      id,
      description: insertAlarm.description || null,
      repeatType: insertAlarm.repeatType || "none",
      repeatValue: insertAlarm.repeatValue || null,
      soundEnabled: insertAlarm.soundEnabled ?? true,
      isActive: insertAlarm.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };

    alarms.push(newAlarm);
    this.saveAlarms(alarms);
    
    console.log('Alarm created in localStorage:', newAlarm);
    return newAlarm;
  }

  // Get alarm by ID
  static getAlarmById(id: number): Alarm | undefined {
    const alarms = this.getAlarms();
    return alarms.find(alarm => alarm.id === id);
  }

  // Update alarm
  static updateAlarm(id: number, updateData: Partial<InsertAlarm>): Alarm | undefined {
    const alarms = this.getAlarms();
    const index = alarms.findIndex(alarm => alarm.id === id);
    
    if (index === -1) return undefined;

    const updatedAlarm: Alarm = {
      ...alarms[index],
      ...updateData,
      updatedAt: new Date()
    };

    alarms[index] = updatedAlarm;
    this.saveAlarms(alarms);
    
    console.log('Alarm updated in localStorage:', updatedAlarm);
    return updatedAlarm;
  }

  // Delete alarm (soft delete)
  static deleteAlarm(id: number): boolean {
    const alarms = this.getAlarms();
    const index = alarms.findIndex(alarm => alarm.id === id);
    
    if (index === -1) return false;

    alarms[index] = {
      ...alarms[index],
      isActive: false,
      updatedAt: new Date()
    };

    this.saveAlarms(alarms);
    console.log('Alarm soft-deleted in localStorage:', id);
    return true;
  }

  // Get active alarms only
  static getActiveAlarms(): Alarm[] {
    return this.getAlarms().filter(alarm => alarm.isActive);
  }

  // Export data (for future database migration)
  static exportData(): { alarms: Alarm[], version: string, exportedAt: string } {
    return {
      alarms: this.getAlarms(),
      version: '1.0',
      exportedAt: new Date().toISOString()
    };
  }

  // Import data (for database migration)
  static importData(data: { alarms: Alarm[] }): void {
    try {
      const processedAlarms = data.alarms.map(alarm => ({
        ...alarm,
        triggerTime: new Date(alarm.triggerTime),
        createdAt: new Date(alarm.createdAt),
        updatedAt: new Date(alarm.updatedAt)
      }));
      
      this.saveAlarms(processedAlarms);
      
      // Update counter to highest ID + 1
      const maxId = Math.max(...processedAlarms.map(a => a.id), 0);
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.COUNTER_KEY, (maxId + 1).toString());
      }
      
      console.log(`Imported ${processedAlarms.length} alarms`);
    } catch (error) {
      console.error('Error importing data:', error);
    }
  }
}