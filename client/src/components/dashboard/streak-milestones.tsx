import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Flame, Award, Star, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Achievement {
  id: number;
  type: 'streak' | 'milestone';
  description: string;
  habitId: number;
  habitName: string;
  value: number;
  achieved: boolean;
  date?: string;
}

export default function StreakMilestones() {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['/api/achievements'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Streak Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-3 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const getAchievementIcon = (type: string, value: number) => {
    if (type === 'milestone') {
      if (value >= 100) return <Trophy className="h-5 w-5 text-amber-500" />;
      if (value >= 50) return <Award className="h-5 w-5 text-indigo-500" />;
      if (value >= 30) return <Star className="h-5 w-5 text-blue-500" />;
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    } else {
      return <Flame className="h-5 w-5 text-rose-500" />;
    }
  };
  
  // Group achievements by habit
  const habitAchievements = achievements ? achievements.reduce((acc: any, achievement: Achievement) => {
    if (!acc[achievement.habitId]) {
      acc[achievement.habitId] = {
        habitName: achievement.habitName,
        items: []
      };
    }
    acc[achievement.habitId].items.push(achievement);
    return acc;
  }, {}) : {};
  
  // Sort by most recent achievements
  const sortedHabits = Object.values(habitAchievements || {})
    .sort((a: any, b: any) => {
      const aLatest = a.items.reduce((max: Date, item: Achievement) => {
        const date = item.date ? new Date(item.date) : new Date(0);
        return date > max ? date : max;
      }, new Date(0));
      
      const bLatest = b.items.reduce((max: Date, item: Achievement) => {
        const date = item.date ? new Date(item.date) : new Date(0);
        return date > max ? date : max;
      }, new Date(0));
      
      return bLatest.getTime() - aLatest.getTime();
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Streak Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedHabits && sortedHabits.length > 0 ? (
          <div className="space-y-6">
            {sortedHabits.map((habitData: any) => (
              <div key={habitData.habitName} className="space-y-3">
                <h3 className="font-medium text-sm text-neutral-500">
                  {habitData.habitName}
                </h3>
                <div className="space-y-2">
                  {habitData.items
                    .sort((a: Achievement, b: Achievement) => {
                      if (a.achieved !== b.achieved) return a.achieved ? -1 : 1;
                      return b.value - a.value;
                    })
                    .map((achievement: Achievement) => (
                      <div key={achievement.id} className="flex items-center p-2 rounded-md bg-background border">
                        <div className="p-2 rounded-full bg-primary/10">
                          {getAchievementIcon(achievement.type, achievement.value)}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium">{achievement.description}</p>
                          <p className="text-xs text-neutral-500">
                            {achievement.achieved 
                              ? `Achieved ${achievement.date ? `on ${new Date(achievement.date).toLocaleDateString()}` : ''}` 
                              : 'In progress'}
                          </p>
                        </div>
                        <Badge variant={achievement.achieved ? "success" : "outline"}>
                          {achievement.value} {achievement.type === 'streak' ? 'days' : 'times'}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-neutral-500">
            <div className="flex justify-center mb-3">
              <Trophy className="h-10 w-10 opacity-20" />
            </div>
            <p>Complete habits consistently to earn achievements</p>
            <p className="text-sm mt-1">Your streak milestones will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}