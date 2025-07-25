import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { alarms, type Alarm, type InsertAlarm } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Initialize database connection
function createDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql);
}

// Database storage implementation for serverless functions
export class DatabaseStorage {
  private db;
  
  constructor() {
    this.db = createDbConnection();
  }

  async createAlarm(insertAlarm: InsertAlarm): Promise<Alarm> {
    try {
      console.log('Creating alarm in database:', insertAlarm);
      
      const result = await this.db
        .insert(alarms)
        .values({
          ...insertAlarm,
          description: insertAlarm.description || null,
          repeatType: insertAlarm.repeatType || "none",
          repeatValue: insertAlarm.repeatValue || null,
          soundEnabled: insertAlarm.soundEnabled ?? true,
          isActive: insertAlarm.isActive ?? true,
        })
        .returning();
      
      if (result.length === 0) {
        throw new Error('Failed to create alarm: no data returned');
      }
      
      console.log('Alarm created successfully:', result[0]);
      return result[0];
    } catch (error) {
      console.error('Database error creating alarm:', error);
      throw error;
    }
  }

  async getAlarms(): Promise<Alarm[]> {
    try {
      const result = await this.db
        .select()
        .from(alarms)
        .where(eq(alarms.isActive, true));
      
      console.log(`Retrieved ${result.length} active alarms`);
      return result;
    } catch (error) {
      console.error('Database error getting alarms:', error);
      throw error;
    }
  }

  async getAlarmById(id: number): Promise<Alarm | undefined> {
    try {
      const result = await this.db
        .select()
        .from(alarms)
        .where(eq(alarms.id, id))
        .limit(1);
      
      return result[0] || undefined;
    } catch (error) {
      console.error('Database error getting alarm by ID:', error);
      throw error;
    }
  }

  async updateAlarm(id: number, updateData: Partial<InsertAlarm>): Promise<Alarm | undefined> {
    try {
      const result = await this.db
        .update(alarms)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(alarms.id, id))
        .returning();
      
      return result[0] || undefined;
    } catch (error) {
      console.error('Database error updating alarm:', error);
      throw error;
    }
  }

  async deleteAlarm(id: number): Promise<boolean> {
    try {
      // Soft delete by setting isActive to false
      const result = await this.db
        .update(alarms)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(alarms.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Database error deleting alarm:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();