import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";

// Profile schema
const profileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
});

// Notification settings schema
const notificationSchema = z.object({
  notificationEnabled: z.boolean(),
  weekStartsOn: z.string(),
});

type ProfileValues = z.infer<typeof profileSchema>;
type NotificationValues = z.infer<typeof notificationSchema>;

export default function Settings() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();

  // Fetch user settings
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: () => apiRequest("GET", "/api/settings"),
  });

  // Profile form
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      username: user?.username ?? "",
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  });

  // Notification form
  const notificationForm = useForm<NotificationValues>({
    resolver: zodResolver(notificationSchema),
    values: {
      notificationEnabled: settings?.notificationEnabled ?? true,
      weekStartsOn: (settings?.weekStartsOn ?? "1").toString(),
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileValues) => {
      return await apiRequest("PATCH", "/api/user", values);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (values: NotificationValues) => {
      const transformedValues = {
        ...values,
        weekStartsOn: parseInt(values.weekStartsOn, 10),
      };
      return await apiRequest("PATCH", "/api/settings", transformedValues);
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onProfileSubmit = (values: ProfileValues) => {
    updateProfileMutation.mutate(values);
  };

  const onSettingsSubmit = (values: NotificationValues) => {
    updateSettingsMutation.mutate(values);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-neutral-500 mt-1">
              Manage your account and preferences
            </p>
          </div>

          <Tabs defaultValue="profile" className="mb-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your public display name
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your app experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select onValueChange={setTheme} value={theme}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-neutral-500">
                      Choose how you want the app to look.
                    </p>
                  </div>

                  <Separator />

                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                      <FormField
                        control={notificationForm.control}
                        name="notificationEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Enable Notifications</FormLabel>
                              <FormDescription>
                                Receive reminders for your habits.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={notificationForm.control}
                        name="weekStartsOn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Week Starts On</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a day" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0">Sunday</SelectItem>
                                <SelectItem value="1">Monday</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={updateSettingsMutation.isPending}>
                        {updateSettingsMutation.isPending ? "Saving..." : "Save Preferences"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>
                    Manage your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <p className="text-sm text-neutral-500 mb-4">
                      Update your password to keep your account secure
                    </p>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                    <p className="text-sm text-neutral-500 mb-4">
                      These actions are irreversible
                    </p>
                    <div className="flex space-x-4">
                      <Button 
                        variant="destructive" 
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                      >
                        {logoutMutation.isPending ? "Logging out..." : "Log Out"}
                      </Button>
                      <Button variant="outline" className="text-destructive">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      

    </div>
  );
}
