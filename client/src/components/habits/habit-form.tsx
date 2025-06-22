import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHabitSchema } from "@shared/schema";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Create extended schema with validation
const formSchema = insertHabitSchema.extend({
  frequency: z.array(z.string()).min(1, { message: "Select at least one day" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function HabitForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Pre-select weekdays by default
  const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: user?.id,
      name: "",
      description: "",
      type: "good",
      frequency: weekdays,
      time: "07:00",
      difficulty: "easy",
      reminderEnabled: true,
      icon: "default",
      color: "primary",
    },
  });
  
  const createHabitMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return await apiRequest("POST", "/api/habits", values);
    },
    onSuccess: () => {
      toast({
        title: "Habit created",
        description: "Your new habit has been created successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/habits/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create habit. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (values: FormValues) => {
    createHabitMutation.mutate(values);
  };
  
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Habit</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Morning Exercise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <FormItem>
                        <RadioGroupItem value="good" id="r1" className="peer sr-only" />
                        <FormLabel
                          htmlFor="r1"
                          className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 font-normal cursor-pointer hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                        >
                          Build Good Habit
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <RadioGroupItem value="bad" id="r2" className="peer sr-only" />
                        <FormLabel
                          htmlFor="r2"
                          className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 font-normal cursor-pointer hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                        >
                          Break Bad Habit
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="multiple"
                      className="grid grid-cols-7 gap-1"
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <ToggleGroupItem value="monday" className="text-xs py-2">M</ToggleGroupItem>
                      <ToggleGroupItem value="tuesday" className="text-xs py-2">T</ToggleGroupItem>
                      <ToggleGroupItem value="wednesday" className="text-xs py-2">W</ToggleGroupItem>
                      <ToggleGroupItem value="thursday" className="text-xs py-2">T</ToggleGroupItem>
                      <ToggleGroupItem value="friday" className="text-xs py-2">F</ToggleGroupItem>
                      <ToggleGroupItem value="saturday" className="text-xs py-2">S</ToggleGroupItem>
                      <ToggleGroupItem value="sunday" className="text-xs py-2">S</ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <FormControl>
                    <RadioGroup
                      className="flex items-center space-x-4"
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <div className="flex items-center">
                        <RadioGroupItem value="easy" id="easy" className="sr-only" />
                        <label htmlFor="easy" className="flex items-center cursor-pointer">
                          <div className={`w-4 h-4 border-2 rounded-full mr-2 flex items-center justify-center ${field.value === 'easy' ? 'border-primary' : 'border-neutral-300'}`}>
                            {field.value === 'easy' && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <span className="ml-1 text-sm">Easy</span>
                        </label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem value="medium" id="medium" className="sr-only" />
                        <label htmlFor="medium" className="flex items-center cursor-pointer">
                          <div className={`w-4 h-4 border-2 rounded-full mr-2 flex items-center justify-center ${field.value === 'medium' ? 'border-primary' : 'border-neutral-300'}`}>
                            {field.value === 'medium' && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <span className="ml-1 text-sm">Medium</span>
                        </label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem value="hard" id="hard" className="sr-only" />
                        <label htmlFor="hard" className="flex items-center cursor-pointer">
                          <div className={`w-4 h-4 border-2 rounded-full mr-2 flex items-center justify-center ${field.value === 'hard' ? 'border-primary' : 'border-neutral-300'}`}>
                            {field.value === 'hard' && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <span className="ml-1 text-sm">Hard</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes or details about this habit"
                      className="resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reminderEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Enable reminders</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-3 pt-4">
              <Button type="button" onClick={() => navigate("/")} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={createHabitMutation.isPending} className="flex-1">
                {createHabitMutation.isPending ? "Creating..." : "Create Habit"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
