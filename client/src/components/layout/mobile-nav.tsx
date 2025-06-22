import { Link } from "wouter";
import { useLocation } from "wouter";
import { Home, PlusCircle, Calendar, User } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 flex justify-around items-center p-3 z-10">
      <Link href="/">
        <div className={`flex flex-col items-center cursor-pointer ${isActive("/") ? "text-primary" : "text-neutral-500"}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </div>
      </Link>
      <Link href="/create-habit">
        <div className={`flex flex-col items-center cursor-pointer ${isActive("/create-habit") ? "text-primary" : "text-neutral-500"}`}>
          <PlusCircle className="h-6 w-6" />
          <span className="text-xs mt-1">Create</span>
        </div>
      </Link>
      <Link href="/calendar">
        <div className={`flex flex-col items-center cursor-pointer ${isActive("/calendar") ? "text-primary" : "text-neutral-500"}`}>
          <Calendar className="h-6 w-6" />
          <span className="text-xs mt-1">Calendar</span>
        </div>
      </Link>
      <Link href="/settings">
        <div className={`flex flex-col items-center cursor-pointer ${isActive("/settings") ? "text-primary" : "text-neutral-500"}`}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </div>
      </Link>
    </nav>
  );
}
