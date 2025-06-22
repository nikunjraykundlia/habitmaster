import { users, type User, type InsertUser, habits, type Habit, type InsertHabit, completions, type Completion, type InsertCompletion, userSettings, type UserSettings, type InsertUserSettings } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Extend the interface with methods for habits, completions, and settings
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Habit methods
  getHabit(id: number): Promise<Habit | undefined>;
  getHabitsByUserId(userId: number): Promise<Habit[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habitData: Partial<Habit>): Promise<Habit>;
  deleteHabit(id: number): Promise<void>;
  
  // Completion methods
  getCompletion(id: number): Promise<Completion | undefined>;
  getCompletionsByHabitId(habitId: number, userId: number): Promise<Completion[]>;
  getCompletionsByUserId(userId: number): Promise<Completion[]>;
  getCompletionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Completion[]>;
  createCompletion(completion: InsertCompletion): Promise<Completion>;
  
  // Settings methods
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private habits: Map<number, Habit>;
  private completions: Map<number, Completion>;
  private settings: Map<number, UserSettings>;
  currentId: Record<string, number>;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.habits = new Map();
    this.completions = new Map();
    this.settings = new Map();
    this.currentId = {
      users: 1,
      habits: 1,
      completions: 1,
      settings: 1
    };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Habit Methods
  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async getHabitsByUserId(userId: number): Promise<Habit[]> {
    return Array.from(this.habits.values()).filter(
      (habit) => habit.userId === userId,
    );
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = this.currentId.habits++;
    const now = new Date();
    const habit: Habit = { ...insertHabit, id, createdAt: now };
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: number, habitData: Partial<Habit>): Promise<Habit> {
    const habit = await this.getHabit(id);
    if (!habit) throw new Error("Habit not found");
    
    const updatedHabit: Habit = { ...habit, ...habitData };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<void> {
    this.habits.delete(id);
  }

  // Completion Methods
  async getCompletion(id: number): Promise<Completion | undefined> {
    return this.completions.get(id);
  }

  async getCompletionsByHabitId(habitId: number, userId: number): Promise<Completion[]> {
    return Array.from(this.completions.values()).filter(
      (completion) => completion.habitId === habitId && completion.userId === userId,
    );
  }

  async getCompletionsByUserId(userId: number): Promise<Completion[]> {
    return Array.from(this.completions.values()).filter(
      (completion) => completion.userId === userId,
    );
  }

  async getCompletionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Completion[]> {
    return Array.from(this.completions.values()).filter(
      (completion) => {
        const completionDate = new Date(completion.date);
        return (
          completion.userId === userId &&
          completionDate >= startDate &&
          completionDate <= endDate
        );
      },
    );
  }

  async createCompletion(insertCompletion: InsertCompletion): Promise<Completion> {
    const id = this.currentId.completions++;
    const completion: Completion = { ...insertCompletion, id };
    this.completions.set(id, completion);
    return completion;
  }

  // Settings Methods
  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    return Array.from(this.settings.values()).find(
      (settings) => settings.userId === userId,
    );
  }

  async createUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const id = this.currentId.settings++;
    const settings: UserSettings = { ...insertSettings, id };
    this.settings.set(id, settings);
    return settings;
  }

  async updateUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const existingSettings = await this.getUserSettings(insertSettings.userId);
    
    if (existingSettings) {
      // Update existing settings
      const updatedSettings: UserSettings = { ...existingSettings, ...insertSettings };
      this.settings.set(existingSettings.id, updatedSettings);
      return updatedSettings;
    } else {
      // Create new settings
      return this.createUserSettings(insertSettings);
    }
  }
}

export const storage = new MemStorage();
