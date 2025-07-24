import { alarms, users, type Alarm, type InsertAlarm, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Alarm methods
  createAlarm(alarm: InsertAlarm): Promise<Alarm>;
  getAlarms(): Promise<Alarm[]>;
  getAlarmById(id: number): Promise<Alarm | undefined>;
  updateAlarm(id: number, alarm: Partial<InsertAlarm>): Promise<Alarm | undefined>;
  deleteAlarm(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private alarms: Map<number, Alarm>;
  private currentUserId: number;
  private currentAlarmId: number;

  constructor() {
    this.users = new Map();
    this.alarms = new Map();
    this.currentUserId = 1;
    this.currentAlarmId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAlarm(insertAlarm: InsertAlarm): Promise<Alarm> {
    const id = this.currentAlarmId++;
    const now = new Date();
    const alarm: Alarm = {
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
    this.alarms.set(id, alarm);
    return alarm;
  }

  async getAlarms(): Promise<Alarm[]> {
    return Array.from(this.alarms.values()).filter(alarm => alarm.isActive);
  }

  async getAlarmById(id: number): Promise<Alarm | undefined> {
    return this.alarms.get(id);
  }

  async updateAlarm(id: number, updateData: Partial<InsertAlarm>): Promise<Alarm | undefined> {
    const alarm = this.alarms.get(id);
    if (!alarm) return undefined;

    const updatedAlarm: Alarm = {
      ...alarm,
      ...updateData,
      updatedAt: new Date()
    };
    this.alarms.set(id, updatedAlarm);
    return updatedAlarm;
  }

  async deleteAlarm(id: number): Promise<boolean> {
    const alarm = this.alarms.get(id);
    if (!alarm) return false;

    const updatedAlarm = {
      ...alarm,
      isActive: false,
      updatedAt: new Date()
    };
    this.alarms.set(id, updatedAlarm);
    return true;
  }
}

export const storage = new MemStorage();
