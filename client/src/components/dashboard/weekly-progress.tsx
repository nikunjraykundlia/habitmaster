import { useQuery } from "@tanstack/react-query";
import { Settings, Award } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function WeeklyProgress() {
  const { data: weeklyProgress, isLoading } = useQuery({
    queryKey: ['/api/progress/weekly'],
  });
  
  const renderCalendar = () => {
    if (!weeklyProgress?.calendar) return null;
    
    // Get start of week (assuming Sunday or Monday based on user settings)
    const startDay = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    
    return (
      <div className="habit-calendar flex flex-wrap gap-1 justify-between">
        {[...Array(7)].map((_, index) => {
          const date = addDays(startDay, index);
          const day = format(date, 'd');
          const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          
          // Determine calendar status for this day
          const calendarDay = weeklyProgress.calendar.find((c: any) => 
            format(new Date(c.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          );
          
          let className = "day rounded-md ";
          
          if (calendarDay?.completed) {
            className += "bg-success text-white ";
          } else {
            className += "bg-white border border-neutral-200 ";
          }
          
          if (isToday) {
            className += "font-medium border-2 border-primary ";
          }
          
          return (
            <div key={index} className={className}>
              {day}
            </div>
          );
        })}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <h2 className="text-lg font-semibold">Weekly Progress</h2>
          <Skeleton className="h-5 w-5 rounded" />
        </div>
        <div className="p-5">
          <div className="flex items-center justify-center space-x-6 mb-6">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="w-16 h-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-neutral-200">
        <h2 className="text-lg font-semibold">Weekly Progress</h2>
        <div className="text-sm text-neutral-500">
          <button className="hover:text-primary">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center justify-center space-x-6">
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16 mb-1">
              <svg className="w-16 h-16 habit-progress-ring">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="6" 
                  strokeDasharray="175.9" 
                  strokeDashoffset={175.9 * (1 - (weeklyProgress?.weekCompletion || 0) / 100)} 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-medium text-sm">
                {weeklyProgress?.weekCompletion || 0}%
              </div>
            </div>
            <span className="text-xs text-neutral-500">Week</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16 mb-1">
              <svg className="w-16 h-16 habit-progress-ring">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="6" 
                  strokeDasharray="175.9" 
                  strokeDashoffset={175.9 * (1 - (weeklyProgress?.monthCompletion || 0) / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-medium text-sm">
                {weeklyProgress?.monthCompletion || 0}%
              </div>
            </div>
            <span className="text-xs text-neutral-500">Month</span>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Habit Calendar</h3>
          {renderCalendar()}
        </div>
        
        {weeklyProgress?.milestone && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Milestone</h3>
              {weeklyProgress.milestone.isNew && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-light bg-opacity-10 text-secondary badge-pulse">
                  New!
                </span>
              )}
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-2 bg-secondary-light bg-opacity-10 rounded-full mr-3">
                  <Award className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{weeklyProgress.milestone.title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{weeklyProgress.milestone.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
