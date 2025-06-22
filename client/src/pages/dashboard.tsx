import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import StatsSummary from "@/components/dashboard/stats-summary";
import TodaysHabits from "@/components/dashboard/todays-habits";
import AIRecommendations from "@/components/dashboard/ai-recommendations";
import WeeklyProgress from "@/components/dashboard/weekly-progress";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex space-x-2">
              <Button size="icon" variant="outline" className="p-2 rounded-full bg-white shadow-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-50">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button size="icon" variant="outline" className="p-2 rounded-full bg-white shadow-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-50">
                <Edit className="h-5 w-5" />
                <span className="sr-only">Edit Habits</span>
              </Button>
            </div>
          </div>

          <StatsSummary />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TodaysHabits />
            </div>
            
            <div>
              <AIRecommendations />
              <WeeklyProgress />
            </div>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
