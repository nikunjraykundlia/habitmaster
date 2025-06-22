import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { 
  Home, PlusCircle, Calendar, BarChart2, Settings, 
  CheckCircle, Trophy
} from "lucide-react";

export default function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    { path: "/", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
    { path: "/create-habit", icon: <PlusCircle className="h-5 w-5" />, label: "Create Habit" },
    { path: "/calendar", icon: <Calendar className="h-5 w-5" />, label: "Calendar" },
    { path: "/insights", icon: <BarChart2 className="h-5 w-5" />, label: "Insights" },
    { path: "/achievements", icon: <Trophy className="h-5 w-5" />, label: "Achievements" },
    { path: "/settings", icon: <Settings className="h-5 w-5" />, label: "Settings" },
  ];

  return (
    <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 border-r border-neutral-200 bg-white p-4">
      <div className="flex items-center space-x-2 mb-8">
        <CheckCircle className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold">HabitTracker</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium cursor-pointer ${
              isActive(item.path)
                ? "bg-primary-light bg-opacity-10 text-primary"
                : "hover:bg-neutral-100 text-neutral-500"
            }`}>
              {item.icon}
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
      
      <div className="border-t border-neutral-200 pt-4 mt-6">
        <div className="flex items-center px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center mr-3">
            {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name || user?.username}</p>
            <p className="text-xs text-neutral-500">{user?.email || ''}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
