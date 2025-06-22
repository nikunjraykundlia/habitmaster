import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "good" or "bad"
  frequency: json("frequency").notNull(), // ["monday", "tuesday", etc.]
  time: text("time"), // "07:00"
  difficulty: text("difficulty"), // "easy", "medium", "hard"
  reminderEnabled: boolean("reminder_enabled").default(false),
  icon: text("icon"),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHabitSchema = createInsertSchema(habits).pick({
  userId: true,
  name: true,
  description: true,
  type: true,
  frequency: true,
  time: true,
  difficulty: true,
  reminderEnabled: true,
  icon: true,
  color: true,
});

export const completions = pgTable("completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  note: text("note"),
});

export const insertCompletionSchema = createInsertSchema(completions).pick({
  habitId: true,
  userId: true,
  date: true,
  note: true,
}).extend({
  date: z.preprocess((val) => {
    if (typeof val === "string" || val instanceof Date) {
      return new Date(val);
    }
    return val;
  }, z.date())
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  theme: text("theme").default("light"),
  notificationEnabled: boolean("notification_enabled").default(true),
  weekStartsOn: integer("week_starts_on").default(0), // 0: Sunday, 1: Monday, etc.
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).pick({
  userId: true,
  theme: true,
  notificationEnabled: true,
  weekStartsOn: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

export type InsertCompletion = z.infer<typeof insertCompletionSchema>;
export type Completion = typeof completions.$inferSelect;

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
