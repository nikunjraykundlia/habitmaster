import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import HabitItem from "@/components/dashboard/habit-item";
import { Skeleton } from "@/components/ui/skeleton";

// Define a proper type for the habit
interface Habit {
  id: number;
  name: string;
  time: string;
  completed: boolean;
  streak: number;
  icon?: string;
  color?: string;
}

export default function TodaysHabits() {
  const today = format(new Date(), "EEE, MMM d");
  
  const { data: habits = [], isLoading } = useQuery<Habit[]>({
    queryKey: ['/api/habits/today'],
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-neutral-200">
        <h2 className="text-lg font-semibold">Today's Habits</h2>
        <div className="text-sm text-neutral-500">
          <span>{today}</span>
        </div>
      </div>
      
      <div className="px-5">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="py-4 border-b border-neutral-100 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="w-10 h-10 rounded-full mr-3" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            ))}
          </>
        ) : habits.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-neutral-500 mb-4">No habits scheduled for today</p>
            <Link href="/create-habit">
              <div className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Create your first habit
              </div>
            </Link>
          </div>
        ) : (
          habits.map((habit: Habit) => (
            <HabitItem key={habit.id} habit={habit} />
          ))
        )}
      </div>
      
      <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-center">
        <Link href="/create-habit">
          <div className="flex items-center text-sm text-primary font-medium cursor-pointer">
            <Plus className="h-4 w-4 mr-1" />
            Create New Habit
          </div>
        </Link>
      </div>
    </div>
  );
}
