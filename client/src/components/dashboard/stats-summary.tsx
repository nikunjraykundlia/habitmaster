import { BarChart3, Activity, Flame, Calendar as CalendarIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type StatsItem = {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
};

export default function StatsSummary() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const statsItems: StatsItem[] = [
    {
      title: "Active Habits",
      value: stats?.activeHabits || "0",
      icon: <BarChart3 className="h-6 w-6" />,
      bgColor: "bg-primary-light bg-opacity-10",
      iconColor: "text-primary"
    },
    {
      title: "Completion Rate",
      value: stats?.completionRate || "0%",
      icon: <Activity className="h-6 w-6" />,
      bgColor: "bg-success bg-opacity-10",
      iconColor: "text-success"
    },
    {
      title: "Longest Streak",
      value: stats?.longestStreak || "0 days",
      icon: <Flame className="h-6 w-6" />,
      bgColor: "bg-accent bg-opacity-10",
      iconColor: "text-accent"
    },
    {
      title: "Habits Today",
      value: stats?.habitsToday || "0/0",
      icon: <CalendarIcon className="h-6 w-6" />,
      bgColor: "bg-neutral-200",
      iconColor: "text-neutral-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-neutral-200 h-24 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsItems.map((item, index) => (
        <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 font-medium">{item.title}</p>
              <p className="text-2xl font-bold mt-1">{item.value}</p>
            </div>
            <div className={`p-3 rounded-full ${item.bgColor}`}>
              <div className={item.iconColor}>
                {item.icon}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
