import { format, addDays, parseISO, isToday, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';

export function formatDate(date: Date | string, formatStr: string = 'EEE, MMM d'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function isDateToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isToday(dateObj);
}

export function isSameDate(date1: Date | string, date2: Date | string): boolean {
  const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(dateObj1, dateObj2);
}

export function getDateRange(rangeType: 'week' | 'month' = 'week', startDayOfWeek: number = 0): { start: Date, end: Date } {
  const today = new Date();
  
  if (rangeType === 'week') {
    const start = startOfWeek(today, { weekStartsOn: startDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
    const end = endOfWeek(today, { weekStartsOn: startDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
    return { start, end };
  } else {
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    return { start, end };
  }
}

export function getStreakFromDates(dates: Date[]): number {
  if (!dates.length) return 0;
  
  // Sort dates in descending order (newest first)
  const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime());
  
  // Check if the most recent date is today
  if (!isToday(sortedDates[0])) {
    return 0;
  }
  
  let streak = 1;
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const current = sortedDates[i];
    const next = sortedDates[i + 1];
    
    // If the difference between consecutive dates is exactly 1 day, continue the streak
    if (differenceInDays(current, next) === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export function generateCalendarDays(startDate: Date, days: number = 7): Date[] {
  return Array.from({ length: days }, (_, i) => addDays(startDate, i));
}
