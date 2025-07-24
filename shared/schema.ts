import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Existing Alarms Schema ---
export const alarms = pgTable("alarms", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  triggerTime: timestamp("trigger_time", { withTimezone: true }).notNull(),
  repeatType: text("repeat_type").notNull().default("none"), // none, daily, weekly, monthly
  repeatValue: text("repeat_value"), // JSON string for repeat configuration (e.g., day of month for monthly)
  soundEnabled: boolean("sound_enabled").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const insertAlarmSchema = createInsertSchema(alarms).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertAlarm = z.infer<typeof insertAlarmSchema>;
export type Alarm = typeof alarms.$inferSelect;

// --- Existing Users Schema ---
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;


// --- NEW: Timer Sessions Schema ---
export const timerSessions = pgTable('timer_sessions', {
  id: serial('id').primaryKey(),
  activity: text('activity').notNull(), // e.g., "Meditation", "Reading"
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }), // Nullable: set when timer stops
  notes: text('notes'), // Optional session notes
  mood: text('mood'),   // Optional emoji/mood
  duration: integer('duration'), // Duration in seconds, nullable until timer stops
  goalTime: integer('goal_time'), // Optional goal for the session, in seconds
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const insertTimerSessionSchema = createInsertSchema(timerSessions).omit({
  id: true,
  endTime: true, // Frontend sends startTime, backend sets endTime
  duration: true, // Backend calculates duration
  createdAt: true,
  updatedAt: true
});

export type InsertTimerSession = z.infer<typeof insertTimerSessionSchema>;
export type TimerSession = typeof timerSessions.$inferSelect;

// --- NEW: Activity Types Schema (Optional but Recommended for Customization Features) ---
// This table will store your custom activity types (e.g., "Meditation", "Workout", "Journaling")
// It allows you to define properties like default durations for each activity.
export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(), // e.g., "Meditation", "Reading", "Custom Activity"
  defaultDuration: integer('default_duration'), // Optional: default length for this activity, in seconds
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;