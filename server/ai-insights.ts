// This file contains logic for generating AI-powered habit recommendations
// In a real-world scenario, this would connect to an actual ML/AI system

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

// Generates habit recommendations based on behavior patterns
export function generateHabitRecommendations(
  habits: Habit[],
  completions: Completion[]
): { title: string; description: string; type: string; habitSuggestion?: any }[] {
  const recommendations = [];

  // This is a simplified mock of what an AI recommendation system might do
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
    const habitCompletionCounts = habits.map(habit => {
      const habitCompletions = completions.filter(c => c.habitId === habit.id).length;
      return { habit, completions: habitCompletions };
    });
    
    const bestHabit = habitCompletionCounts.sort((a, b) => b.completions - a.completions)[0];
    
    if (bestHabit && bestHabit.completions > 0) {
      recommendations.push({
        title: `${bestHabit.habit.name} habit gaining momentum`,
        description: "You're building consistency with this habit. Keep it up to reach a new personal best!",
        type: "motivation"
      });
    }

    // Add insight about morning routine if applicable
    const morningHabits = habits.filter(h => h.time && parseInt(h.time.split(':')[0]) < 10);
    if (morningHabits.length >= 2) {
      const morningHabitCompletions = completions.filter(c => 
        morningHabits.some(h => h.id === c.habitId)
      ).length;
      
      const morningCompletionRate = Math.min(
        Math.round((morningHabitCompletions / (morningHabits.length * 7)) * 100),
        100
      );
      
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

  // Add recommendation about consistency if user has many habits
  if (habits.length > 0) {
    recommendations.push({
      title: "Focus on consistency",
      description: "Research shows that consistency is more important than intensity when building habits. Try to maintain your streak even if you can only do a minimal version of your habit.",
      type: "analysis"
    });
  }

  return recommendations.slice(0, 3); // Return only up to 3 recommendations
}
