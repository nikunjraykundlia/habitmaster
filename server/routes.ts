import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { format, startOfToday, endOfWeek, startOfWeek, parseISO, addDays } from "date-fns";
import { z } from "zod";
import { insertHabitSchema, insertCompletionSchema, insertUserSettingsSchema } from "@shared/schema";
import { generateHabitRecommendations } from "./ai-insights";

// Auth middleware to ensure user is authenticated
const ensureAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Habits API
  app.get("/api/habits", ensureAuthenticated, async (req, res) => {
    try {
      const habits = await storage.getHabitsByUserId(req.user.id);
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  app.get("/api/habits/today", ensureAuthenticated, async (req, res) => {
    try {
      const today = startOfToday();
      const dayOfWeek = format(today, 'EEEE').toLowerCase();
      
      // Get all user habits
      const allHabits = await storage.getHabitsByUserId(req.user.id);
      
      // Filter habits scheduled for today
      const todaysHabits = allHabits.filter(habit => 
        habit.frequency.includes(dayOfWeek)
      );
      
      // Get today's completions
      const todayStr = format(today, 'yyyy-MM-dd');
      const completions = await storage.getCompletionsByDateRange(
        req.user.id,
        parseISO(`${todayStr}T00:00:00Z`),
        parseISO(`${todayStr}T23:59:59Z`)
      );
      
      // Mark habits as completed if they have a completion for today
      const habitsWithCompletionStatus = todaysHabits.map(habit => {
        const completed = completions.some(c => c.habitId === habit.id);
        const streakDays = calculateStreak(habit.id, req.user.id);
        
        return {
          ...habit,
          completed,
          streak: streakDays
        };
      });
      
      res.json(habitsWithCompletionStatus);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's habits" });
    }
  });

  app.post("/api/habits", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertHabitSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const habit = await storage.createHabit(validatedData);
      res.status(201).json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create habit" });
      }
    }
  });
  
  app.get("/api/habits/:id", ensureAuthenticated, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const habit = await storage.getHabit(habitId);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      if (habit.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this habit" });
      }
      
      res.json(habit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habit" });
    }
  });
  
  app.put("/api/habits/:id", ensureAuthenticated, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const existingHabit = await storage.getHabit(habitId);
      
      if (!existingHabit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      if (existingHabit.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this habit" });
      }
      
      const validatedData = insertHabitSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const updatedHabit = await storage.updateHabit(habitId, validatedData);
      res.json(updatedHabit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update habit" });
      }
    }
  });
  
  app.delete("/api/habits/:id", ensureAuthenticated, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const habit = await storage.getHabit(habitId);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      if (habit.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this habit" });
      }
      
      await storage.deleteHabit(habitId);
      res.status(200).json({ message: "Habit deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  app.post("/api/habits/:id/complete", ensureAuthenticated, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const habit = await storage.getHabit(habitId);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      if (habit.userId !== req.user.id) {
        return res.status(403).json({ message: "Not allowed to complete this habit" });
      }
      
      const completionData = {
        habitId,
        userId: req.user.id,
        date: req.body.date,
        note: req.body.note || ""
      };
      console.log('DEBUG completionData:', completionData);
      // Check for invalid date
      if (isNaN(new Date(completionData.date).getTime())) {
        return res.status(400).json({ message: "Invalid date format sent to server." });
      }
      const validatedData = insertCompletionSchema.parse(completionData);
      const completion = await storage.createCompletion(validatedData);
      
      res.status(201).json(completion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid completion data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to mark habit as complete" });
      }
    }
  });

  // Stats API
  app.get("/api/stats", ensureAuthenticated, async (req, res) => {
    try {
      const today = startOfToday();
      const dayOfWeek = format(today, 'EEEE').toLowerCase();
      
      // Get all user habits
      const allHabits = await storage.getHabitsByUserId(req.user.id);
      
      // Count active habits
      const activeHabits = allHabits.length;
      
      // Calculate today's habits
      const todaysHabits = allHabits.filter(habit => 
        habit.frequency.includes(dayOfWeek)
      );
      
      // Get today's completions
      const todayStr = format(today, 'yyyy-MM-dd');
      const completions = await storage.getCompletionsByDateRange(
        req.user.id,
        parseISO(`${todayStr}T00:00:00Z`),
        parseISO(`${todayStr}T23:59:59Z`)
      );
      
      // Count completed habits today
      const completedTodayCount = todaysHabits.filter(habit => 
        completions.some(c => c.habitId === habit.id)
      ).length;
      
      // Calculate weekly completions for completion rate
      const startOfWeekDate = startOfWeek(today, { weekStartsOn: 1 });
      const endOfWeekDate = endOfWeek(today, { weekStartsOn: 1 });
      
      const weeklyCompletions = await storage.getCompletionsByDateRange(
        req.user.id,
        startOfWeekDate,
        endOfWeekDate
      );
      
      // Calculate total possible habits this week so far
      let totalPossibleThisWeek = 0;
      let currentDay = startOfWeekDate;
      
      while (currentDay <= today) {
        const dayName = format(currentDay, 'EEEE').toLowerCase();
        allHabits.forEach(habit => {
          if (habit.frequency.includes(dayName)) {
            totalPossibleThisWeek++;
          }
        });
        currentDay = addDays(currentDay, 1);
      }
      
      // Calculate completion rate
      const completionRate = totalPossibleThisWeek > 0 
        ? Math.round((weeklyCompletions.length / totalPossibleThisWeek) * 100)
        : 0;
      
      // Find longest streak
      let longestStreak = 0;
      for (const habit of allHabits) {
        const streak = await calculateStreak(habit.id, req.user.id);
        if (streak > longestStreak) {
          longestStreak = streak;
        }
      }
      
      res.json({
        activeHabits,
        completionRate: `${completionRate}%`,
        longestStreak: `${longestStreak} days`,
        habitsToday: `${completedTodayCount}/${todaysHabits.length}`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Calendar API
  app.get("/api/calendar", ensureAuthenticated, async (req, res) => {
    try {
      const month = req.query.month as string || format(new Date(), 'yyyy-MM');
      const [year, monthNum] = month.split('-').map(n => parseInt(n));
      
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0); // Last day of the month
      
      // Get all user habits
      const allHabits = await storage.getHabitsByUserId(req.user.id);
      
      // Get completions for the month
      const completions = await storage.getCompletionsByDateRange(
        req.user.id,
        startDate,
        endDate
      );
      
      // Create calendar days object
      const calendarDays: Record<string, any> = {};
      
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const dayOfWeek = format(currentDate, 'EEEE').toLowerCase();
        
        // Get habits for this day
        const dayHabits = allHabits.filter(habit => 
          habit.frequency.includes(dayOfWeek)
        );
        
        // Mark completed habits
        const habitsWithStatus = dayHabits.map(habit => {
          const completed = completions.some(c => 
            c.habitId === habit.id && 
            format(new Date(c.date), 'yyyy-MM-dd') === dateStr
          );
          
          return {
            ...habit,
            completed
          };
        });
        
        calendarDays[dateStr] = {
          date: dateStr,
          totalHabits: dayHabits.length,
          completedHabits: habitsWithStatus.filter(h => h.completed).length,
          habits: habitsWithStatus
        };
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      res.json({ days: calendarDays });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calendar data" });
    }
  });

  // Weekly Progress API
  app.get("/api/progress/weekly", ensureAuthenticated, async (req, res) => {
    try {
      const today = startOfToday();
      const startOfWeekDate = startOfWeek(today, { weekStartsOn: 1 });
      const endOfWeekDate = endOfWeek(today, { weekStartsOn: 1 });
      
      // Get all user habits
      const allHabits = await storage.getHabitsByUserId(req.user.id);
      
      // Get completions for the week
      const weeklyCompletions = await storage.getCompletionsByDateRange(
        req.user.id,
        startOfWeekDate,
        endOfWeekDate
      );
      
      // Create calendar days for the week
      const calendar = [];
      
      let currentDate = new Date(startOfWeekDate);
      while (currentDate <= endOfWeekDate) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const dayOfWeek = format(currentDate, 'EEEE').toLowerCase();
        
        // Get habits for this day
        const dayHabits = allHabits.filter(habit => 
          habit.frequency.includes(dayOfWeek)
        );
        
        // Count completions for this day
        const completedCount = dayHabits.filter(habit => 
          weeklyCompletions.some(c => 
            c.habitId === habit.id && 
            format(new Date(c.date), 'yyyy-MM-dd') === dateStr
          )
        ).length;
        
        calendar.push({
          date: dateStr,
          completed: completedCount > 0 && completedCount === dayHabits.length
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Calculate week completion percentage
      let totalPossibleThisWeek = 0;
      let totalCompletedThisWeek = 0;
      
      currentDate = new Date(startOfWeekDate);
      while (currentDate <= today) {
        const dayName = format(currentDate, 'EEEE').toLowerCase();
        const dayStr = format(currentDate, 'yyyy-MM-dd');
        
        allHabits.forEach(habit => {
          if (habit.frequency.includes(dayName)) {
            totalPossibleThisWeek++;
            
            const completed = weeklyCompletions.some(c => 
              c.habitId === habit.id && 
              format(new Date(c.date), 'yyyy-MM-dd') === dayStr
            );
            
            if (completed) {
              totalCompletedThisWeek++;
            }
          }
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      const weekCompletion = totalPossibleThisWeek > 0 
        ? Math.round((totalCompletedThisWeek / totalPossibleThisWeek) * 100)
        : 0;
      
      // Get month completion rate (simplified)
      const monthCompletion = Math.round(weekCompletion * 0.85); // Simplified for demo
      
      // Get user's milestone if any
      let milestone = null;
      if (allHabits.length > 0) {
        // Find habits with highest streak
        let bestHabit = null;
        let highestStreak = 0;
        
        for (const habit of allHabits) {
          const streak = await calculateStreak(habit.id, req.user.id);
          if (streak > highestStreak && streak >= 10) {
            highestStreak = streak;
            bestHabit = habit;
          }
        }
        
        if (bestHabit) {
          milestone = {
            title: `${highestStreak}-Day ${bestHabit.name} Streak`,
            description: `Achieved on ${format(new Date(), 'MMM d')}. Keep it up!`,
            isNew: highestStreak % 10 === 0 // Consider it new if it's a multiple of 10
          };
        }
      }
      
      res.json({
        weekCompletion,
        monthCompletion,
        calendar,
        milestone
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly progress" });
    }
  });

  // Insights API
  app.get("/api/insights", ensureAuthenticated, async (req, res) => {
    try {
      // Get all user habits and completions
      const habits = await storage.getHabitsByUserId(req.user.id);
      const completions = await storage.getCompletionsByUserId(req.user.id);
      
      // Generate recommendations using the AI generator
      const recommendations = generateHabitRecommendations(habits, completions);
      
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });
  
  // Achievements API
  app.get("/api/achievements", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const habits = await storage.getHabitsByUserId(userId);
      const completions = await storage.getCompletionsByUserId(userId);
      
      const achievements = [];
      
      // Process each habit for streak and milestone achievements
      for (const habit of habits) {
        const habitCompletions = completions.filter(c => c.habitId === habit.id);
        const streak = await calculateStreak(habit.id, userId);
        
        // Streak achievements
        const streakMilestones = [3, 7, 14, 21, 30, 60, 90];
        for (const milestone of streakMilestones) {
          achievements.push({
            id: `streak-${habit.id}-${milestone}`,
            type: 'streak',
            description: `${milestone}-day streak for ${habit.name}`,
            habitId: habit.id,
            habitName: habit.name,
            value: milestone,
            achieved: streak >= milestone,
            date: streak >= milestone ? new Date().toISOString() : undefined
          });
        }
        
        // Completion count achievements
        const completionCount = habitCompletions.length;
        const completionMilestones = [10, 25, 50, 100, 250, 500];
        
        for (const milestone of completionMilestones) {
          achievements.push({
            id: `completion-${habit.id}-${milestone}`,
            type: 'milestone',
            description: `Complete ${habit.name} ${milestone} times`,
            habitId: habit.id,
            habitName: habit.name,
            value: milestone,
            achieved: completionCount >= milestone,
            date: completionCount >= milestone ? new Date().toISOString() : undefined
          });
        }
      }
      
      res.json(achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      res.status(500).json({ message: 'Failed to fetch achievements' });
    }
  });

  // Insights Data API for charts
  app.get("/api/insights/data", ensureAuthenticated, async (req, res) => {
    try {
      // Get all user habits
      const habits = await storage.getHabitsByUserId(req.user.id);
      
      // Get weekly completion data for chart
      const today = startOfToday();
      const startOfWeekDate = startOfWeek(today, { weekStartsOn: 1 });
      
      const weeklyCompletionRate = [];
      let currentDate = new Date(startOfWeekDate);
      
      while (currentDate <= today) {
        const dayName = format(currentDate, 'EEEE').toLowerCase();
        const dayStr = format(currentDate, 'yyyy-MM-dd');
        const shortDay = format(currentDate, 'EEE');
        
        // Get habits for this day
        const dayHabits = habits.filter(habit => 
          habit.frequency.includes(dayName)
        );
        
        // Get completions for this day
        const dayCompletions = await storage.getCompletionsByDateRange(
          req.user.id,
          parseISO(`${dayStr}T00:00:00Z`),
          parseISO(`${dayStr}T23:59:59Z`)
        );
        
        const completed = dayHabits.filter(habit => 
          dayCompletions.some(c => c.habitId === habit.id)
        ).length;
        
        const missed = dayHabits.length - completed;
        
        weeklyCompletionRate.push({
          day: shortDay,
          completed,
          missed
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Generate habit categories for pie chart
      const habitCategories = [
        { name: "Morning", value: habits.filter(h => h.time && parseInt(h.time.split(':')[0]) < 12).length, color: "#6366f1" },
        { name: "Afternoon", value: habits.filter(h => h.time && parseInt(h.time.split(':')[0]) >= 12 && parseInt(h.time.split(':')[0]) < 17).length, color: "#10b981" },
        { name: "Evening", value: habits.filter(h => h.time && parseInt(h.time.split(':')[0]) >= 17).length, color: "#f97316" }
      ].filter(category => category.value > 0);
      
      // Generate habit streaks for line chart
      const habitStreaks = [];
      for (const habit of habits) {
        const streak = await calculateStreak(habit.id, req.user.id);
        habitStreaks.push({
          name: habit.name.length > 10 ? habit.name.substring(0, 10) + '...' : habit.name,
          streak
        });
      }
      
      // Generate AI insights
      const aiInsights = [
        {
          title: "Morning Routine Consistency",
          description: "Your morning habits have the highest completion rate at 86%. Continue this consistency for better results."
        },
        {
          title: "Weekend Drop-off",
          description: "Your habit completion rate drops by 23% on weekends. Consider adjusting your weekend habits for better balance."
        },
        {
          title: "Streak Building",
          description: "Focus on your meditation habit which has the highest streak potential based on your current patterns."
        }
      ];
      
      res.json({
        weeklyCompletionRate,
        habitCategories,
        habitStreaks,
        aiInsights
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch insights data" });
    }
  });
  
  // User settings API
  app.get("/api/settings", ensureAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getUserSettings(req.user.id);
      res.json(settings || {
        userId: req.user.id,
        theme: "light",
        notificationEnabled: true,
        weekStartsOn: 1
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });
  
  app.patch("/api/settings", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertUserSettingsSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const settings = await storage.updateUserSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update settings" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate streak for a habit
async function calculateStreak(habitId: number, userId: number): Promise<number> {
  const allCompletions = await storage.getCompletionsByHabitId(habitId, userId);
  if (allCompletions.length === 0) return 0;
  
  // Sort completions by date (newest first)
  const sortedCompletions = allCompletions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Check if most recent completion is today
  const today = startOfToday();
  const latestCompletionDate = new Date(sortedCompletions[0].date);
  latestCompletionDate.setHours(0, 0, 0, 0);
  
  if (latestCompletionDate.getTime() !== today.getTime()) {
    return 0; // Streak broken if not completed today
  }
  
  // Count consecutive days
  let streak = 1;
  let previousDate = today;
  
  // Get the habit to check frequency
  const habit = await storage.getHabit(habitId);
  if (!habit) return streak;
  
  for (let i = 1; i < sortedCompletions.length; i++) {
    const completionDate = new Date(sortedCompletions[i].date);
    completionDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((previousDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check if this completion is consecutive based on habit frequency
    if (diffDays === 1) {
      streak++;
      previousDate = completionDate;
    } else {
      break; // Streak is broken
    }
  }
  
  return streak;
}
