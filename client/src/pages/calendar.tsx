import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Check, 
  X, 
  Trophy,
  Flame
} from "lucide-react";
import { 
  format, 
  startOfToday, 
  endOfMonth, 
  addMonths, 
  subMonths, 
  isSameDay,
  isToday,
  isBefore
} from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Calendar() {
  const [date, setDate] = useState<Date>(startOfToday());
  const [month, setMonth] = useState<Date>(startOfToday());
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const endOfCurrentMonth = endOfMonth(month);
  
  // Get all habits for the filter dropdown
  const { data: allHabits } = useQuery({
    queryKey: ['/api/habits'],
  });
  
  // Get calendar data with completion status
  const { data: habitCalendar, isLoading } = useQuery({
    queryKey: ['/api/calendar', format(month, 'yyyy-MM'), selectedHabitId],
  });
  
  const handlePrevMonth = () => {
    setMonth(subMonths(month, 1));
  };
  
  const handleNextMonth = () => {
    setMonth(addMonths(month, 1));
  };
  
  // Custom day rendering for the calendar
  const renderDay = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const dayData = habitCalendar?.days?.[dateString];
    
    let completedCount = 0;
    let totalCount = 0;
    let hasStreak = false;
    let isMilestone = false;
    
    if (dayData) {
      totalCount = dayData.totalHabits || 0;
      completedCount = dayData.completedHabits || 0;
      hasStreak = dayData.streakDay || false;
      isMilestone = dayData.milestone || false;
    }
    
    // Calculate background style based on completion status
    let bgStyle = "";
    let textColor = "";
    
    if (completedCount === totalCount && totalCount > 0) {
      bgStyle = "bg-success bg-opacity-15"; // All completed
      textColor = isToday(day) ? "text-white font-bold" : "";
    } else if (completedCount > 0) {
      bgStyle = "bg-amber-400 bg-opacity-15"; // Partially completed
    }
    
    // If today, highlight differently
    if (isToday(day)) {
      bgStyle = `${bgStyle} border-2 border-primary`;
    }
    
    return (
      <div className={`w-full h-full relative flex items-center justify-center ${bgStyle} rounded-md`}>
        <div className={`flex flex-col items-center justify-center h-full w-full ${textColor}`}>
          <div className={`text-sm ${isToday(day) ? "font-bold" : ""}`}>
            {day.getDate()}
          </div>
          
          {totalCount > 0 && (
            <div className="text-xs mt-1">
              <span className={`px-1 py-0.5 rounded-sm ${
                completedCount === totalCount && totalCount > 0 
                  ? 'bg-success text-white' 
                  : completedCount > 0 
                    ? 'bg-amber-400 text-white' 
                    : 'bg-gray-200 text-gray-700'
              }`}>
                {completedCount}/{totalCount}
              </span>
            </div>
          )}
          
          {/* Show streak or milestone indicators */}
          <div className="absolute top-0 right-0">
            {isMilestone && (
              <div className="text-primary">
                <Trophy className="h-3 w-3" />
              </div>
            )}
            {hasStreak && !isMilestone && (
              <div className="text-amber-500">
                <Flame className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Habit Calendar</h1>
            <p className="text-neutral-500 mt-1">
              Track your habits over time and identify patterns
            </p>
          </div>
          
          <Card className="mb-6">
            <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 items-start sm:items-center justify-between pb-2">
              <div>
                <CardTitle className="text-md font-medium">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                    <span>{format(month, 'MMMM yyyy')}</span>
                  </div>
                </CardTitle>
                <CardDescription className="mt-1">
                  Filter by habit to see completion patterns
                </CardDescription>
              </div>
              
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <Select
                  value={selectedHabitId || "all"}
                  onValueChange={(value) => setSelectedHabitId(value === "all" ? null : value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select habit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All habits</SelectItem>
                    {allHabits?.map((habit: any) => (
                      <SelectItem key={habit.id} value={habit.id.toString()}>
                        {habit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={handlePrevMonth} 
                    variant="ghost" 
                    size="icon"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={() => setMonth(startOfToday())} 
                    variant="outline" 
                    size="sm"
                  >
                    Today
                  </Button>
                  <Button 
                    onClick={handleNextMonth} 
                    variant="ghost" 
                    size="icon"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                month={month}
                onMonthChange={setMonth}
                className="rounded-md border"
                components={{
                  Day: ({ date, ...props }) => (
                    <div {...props} className="h-14 w-14 p-0 relative">
                      {renderDay(date)}
                    </div>
                  )
                }}
              />
            </CardContent>
          </Card>
          
          {/* Selected day details */}
          {habitCalendar?.days && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md font-medium">
                  {format(date, 'EEEE, MMMM do, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : (
                  <div>
                    {/* Day details will be loaded here */}
                    {habitCalendar?.days[format(date, 'yyyy-MM-dd')]?.habits?.length > 0 ? (
                      <div className="space-y-4">
                        {habitCalendar.days[format(date, 'yyyy-MM-dd')].habits.map((habit: any) => (
                          <div key={habit.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full ${habit.completed ? 'bg-success' : 'bg-neutral-300'} mr-3`}></div>
                              <div>
                                <p className="font-medium">{habit.name}</p>
                                <p className="text-sm text-neutral-500">{habit.time}</p>
                              </div>
                            </div>
                            <div>
                              <Button
                                variant={habit.completed ? "outline" : "default"}
                                size="sm"
                                className={habit.completed ? "text-success" : ""}
                                onClick={() => {
                                  if (!habit.completed) {
                                    if (!habit.id) {
                                      alert('Habit ID is missing!');
                                      return;
                                    }
                                    console.log('Mark Complete habit:', habit);
                                    fetch(`/api/habits/${habit.id}/complete`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ 
                                        date: format(date, 'yyyy-MM-dd')
                                      })
                                    }).then(() => {
                                      // Invalidate relevant queries
                                      queryClient.invalidateQueries({ queryKey: ['/api/calendar'] });
                                      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
                                      queryClient.invalidateQueries({ queryKey: ['/api/insights/data'] });
                                      queryClient.invalidateQueries({ queryKey: ['/api/insights'] });
                                      queryClient.invalidateQueries({ queryKey: ['/api/habits/today'] });
                                    });
                                  }
                                }}
                              >
                                {habit.completed ? "Completed" : "Mark Complete"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-neutral-500">
                        No habits scheduled for this day
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
