import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import CreateHabit from "@/pages/create-habit";
import EditHabit from "@/pages/edit-habit";
import Calendar from "@/pages/calendar"; 
import Insights from "@/pages/insights";
import Settings from "@/pages/settings";
import Achievements from "@/pages/achievements";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/create-habit" component={CreateHabit} />
      <ProtectedRoute path="/edit-habit/:id" component={EditHabit} />
      <ProtectedRoute path="/calendar" component={Calendar} />
      <ProtectedRoute path="/insights" component={Insights} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/achievements" component={Achievements} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  );
}

export default App;
