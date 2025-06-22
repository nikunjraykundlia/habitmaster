import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import HabitForm from "@/components/habits/habit-form";

export default function CreateHabit() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Create New Habit</h1>
            <p className="text-neutral-500 mt-1">
              Define the habit you want to build or break
            </p>
          </div>
          
          <HabitForm />
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
