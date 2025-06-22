import { getDateRange, isSameDate } from './dates';

interface Habit {
  id: number;
  name: string;
  frequency: string[];
  time?: string;
  difficulty?: string;
  type: string;
  icon?: string;
  color?: string;
}

interface Completion {
  habitId: number;
  date: Date | string;
}

export function calculateCompletionRate(
  habits: Habit[],
  completions: Completion[],
  dateRange: { start: Date; end: Date } = getDateRange('week')
): number {
  let totalPossible = 0;
  let totalCompleted = 0;

  habits.forEach(habit => {
    // For each day in the range, check if the habit should be performed
    // This simplified logic assumes habits are tracked on specific days of week
    // In a real app, you'd handle more complex frequency rules
    
    for (let d = dateRange.start; d <= dateRange.end; d.setDate(d.getDate() + 1)) {
      const dayName = d.toLocaleDateString('en-US', { weekday: 'lowercase' });
      if (habit.frequency.includes(dayName)) {
        totalPossible++;
        
        // Check if this habit was completed on this date
        const wasCompleted = completions.some(c => 
          c.habitId === habit.id && isSameDate(new Date(c.date), d)
        );
        
        if (wasCompleted) {
          totalCompleted++;
        }
      }
    }
  });

  // Avoid division by zero
  if (totalPossible === 0) return 0;
  
  return Math.round((totalCompleted / totalPossible) * 100);
}

export function calculateCurrentStreak(
  habit: Habit,
  completions: Completion[]
): number {
  // This is a simplified version - a real implementation would be more complex
  // to handle frequency rules and multiple day gaps
  
  const habitCompletions = completions
    .filter(c => c.habitId === habit.id)
    .map(c => new Date(c.date))
    .sort((a, b) => b.getTime() - a.getTime()); // Sort descending (newest first)
  
  if (habitCompletions.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentDay = new Date(today);
  let streak = 0;
  
  // Check if the habit has been completed today
  const completedToday = habitCompletions.some(date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  
  if (!completedToday) {
    return 0; // Streak is broken if not completed today
  }
  
  // Count consecutive days
  while (true) {
    const dayName = currentDay.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    // Only check for completion if the habit was scheduled for this day
    if (habit.frequency.includes(dayName)) {
      const wasCompleted = habitCompletions.some(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === currentDay.getTime();
      });
      
      if (wasCompleted) {
        streak++;
      } else {
        break; // Streak is broken
      }
    }
    
    // Move to previous day
    currentDay.setDate(currentDay.getDate() - 1);
    
    // Safety limit to prevent infinite loops
    if (streak > 365) break;
  }
  
  return streak;
}

// Generates habit recommendations based on behavior patterns
export function generateHabitRecommendations(
  habits: Habit[],
  completions: Completion[]
): { title: string; description: string; type: string; habitSuggestion?: any }[] {
  const recommendations = [];

  // This is a very simplified mock of what an AI recommendation system might do
  // In a real app, you'd have a much more sophisticated algorithm or API

  // Check if user has exercise habits
  const hasExerciseHabit = habits.some(h => 
    h.name.toLowerCase().includes('exercise') || 
    h.name.toLowerCase().includes('workout') ||
    h.name.toLowerCase().includes('run')
  );

  // Check if user has water tracking habits
  const hasWaterHabit = habits.some(h => 
    h.name.toLowerCase().includes('water') || 
    h.name.toLowerCase().includes('hydrate')
  );

  // Suggest water habit if user exercises but doesn't track water
  if (hasExerciseHabit && !hasWaterHabit) {
    recommendations.push({
      title: "Suggested habit: Drink water reminder",
      description: "Adding a water reminder to your existing exercise routine can help improve hydration and recovery.",
      type: "suggestion",
      habitSuggestion: {
        name: "Drink Water",
        type: "good",
        frequency: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        time: "08:00",
        difficulty: "easy",
        icon: "water",
        color: "blue",
        reminderEnabled: true
      }
    });
  }

  // Add general insights based on habits
  if (habits.length > 0) {
    // Find habits with high completion rates
    const habitWithGoodStreak = habits.reduce((best, current) => {
      const currentStreak = calculateCurrentStreak(current, completions);
      const bestStreak = best ? calculateCurrentStreak(best, completions) : 0;
      return currentStreak > bestStreak ? current : best;
    }, null as Habit | null);

    if (habitWithGoodStreak) {
      recommendations.push({
        title: `${habitWithGoodStreak.name} habit gaining momentum`,
        description: "You're building consistency with this habit. Keep it up to reach a new personal best!",
        type: "motivation"
      });
    }

    // Add insight about morning routine if applicable
    const morningHabits = habits.filter(h => h.time && parseInt(h.time.split(':')[0]) < 10);
    if (morningHabits.length >= 2) {
      const morningCompletionRate = calculateCompletionRate(morningHabits, completions);
      recommendations.push({
        title: `Your morning routine is ${morningCompletionRate}% consistent`,
        description: "Great job maintaining your morning routine! You've been most consistent with your early habits.",
        type: "analysis"
      });
    }
  }

  // Suggest meditation if user seems to have a busy schedule
  if (habits.length >= 4 && !habits.some(h => h.name.toLowerCase().includes('meditat'))) {
    recommendations.push({
      title: "Consider adding a meditation habit",
      description: "With your busy schedule, a short daily meditation could help reduce stress and improve focus.",
      type: "suggestion",
      habitSuggestion: {
        name: "5-Minute Meditation",
        type: "good",
        frequency: ["monday", "wednesday", "friday"],
        time: "07:30",
        difficulty: "easy",
        icon: "meditation",
        color: "secondary",
        reminderEnabled: true
      }
    });
  }

  return recommendations.slice(0, 3); // Return only up to 3 recommendations
}
