import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import StreakMilestones from "@/components/dashboard/streak-milestones";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Calendar, Award, Star, BadgeCheck } from "lucide-react";

export default function Achievements() {
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });
  
  const achievements = [
    {
      title: "Daily Streaks",
      description: "Consecutive days of completing habits",
      icon: <Calendar className="h-8 w-8 text-primary" />,
      value: stats?.longestStreak || 0,
      label: "Longest streak"
    },
    {
      title: "Consistency",
      description: "Overall habit completion rate",
      icon: <BadgeCheck className="h-8 w-8 text-green-500" />,
      value: stats?.completionRate || "0%",
      label: "Completion rate"
    },
    {
      title: "Milestones",
      description: "Special achievements earned",
      icon: <Trophy className="h-8 w-8 text-amber-500" />,
      value: stats?.totalMilestones || 0,
      label: "Milestones earned"
    }
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Achievements & Streaks</h1>
            <p className="text-neutral-500 mt-1">
              Track your progress and celebrate milestones
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {achievements.map((achievement) => (
              <Card key={achievement.title}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-md font-medium">{achievement.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">{achievement.description}</CardDescription>
                    </div>
                    <div className="p-2 rounded-md bg-background border">
                      {achievement.icon}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">{achievement.value}</span>
                    <span className="text-sm text-neutral-500">{achievement.label}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <StreakMilestones />
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Upcoming Milestones</CardTitle>
              <CardDescription>Keep up the momentum to unlock these achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-3 border rounded-md bg-neutral-50">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">Perfect Week</p>
                    <p className="text-xs text-neutral-500">Complete all habits for 7 consecutive days</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">3/7</span> days
                  </div>
                </div>
                
                <div className="flex items-center p-3 border rounded-md bg-neutral-50">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">Habit Master</p>
                    <p className="text-xs text-neutral-500">Maintain a 30-day streak on any habit</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">12/30</span> days
                  </div>
                </div>
                
                <div className="flex items-center p-3 border rounded-md bg-neutral-50">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">Centennial Club</p>
                    <p className="text-xs text-neutral-500">Complete a habit 100 times</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">43/100</span> completions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}