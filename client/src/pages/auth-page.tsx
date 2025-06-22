import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { CheckCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Extend the schema with validation rules
const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = insertUserSchema.extend({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional().or(z.literal("")),
  name: z.string().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, navigate] = useLocation();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      name: "",
    },
  });
  
  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };
  
  const onRegisterSubmit = (values: RegisterValues) => {
    registerMutation.mutate(values);
  };
  
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <div className="flex flex-col md:flex-row w-full">
        {/* Form Section */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-center mb-6">HabitTracker</h1>
              
              <Tabs defaultValue="login">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Log In"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Info Section */}
        <div className="flex-1 bg-primary text-white p-12 hidden md:flex md:flex-col md:justify-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-6">Build Better Habits, One Day at a Time</h2>
            <p className="mb-8">
              HabitTracker helps you build positive routines and break bad habits with intelligent tracking, 
              personalized insights, and motivating streaks.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-white bg-opacity-20 p-2 rounded-full mr-4">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Track Your Progress</h3>
                  <p className="text-white text-opacity-80">
                    Monitor your habits daily and visualize your progress with beautiful charts.
                  </p>
                </div>
              </div>
              
              <Separator className="bg-white bg-opacity-20" />
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-white bg-opacity-20 p-2 rounded-full mr-4">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Build Streaks</h3>
                  <p className="text-white text-opacity-80">
                    Stay motivated with streaks and milestones that celebrate your consistency.
                  </p>
                </div>
              </div>
              
              <Separator className="bg-white bg-opacity-20" />
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-white bg-opacity-20 p-2 rounded-full mr-4">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Get Smart Insights</h3>
                  <p className="text-white text-opacity-80">
                    Receive AI-powered recommendations to improve your habits and achieve your goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
