import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHabitSchema } from "@shared/schema";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Loader2 } from "lucide-react";

// Create extended schema with validation
const formSchema = insertHabitSchema.extend({
  frequency: z.array(z.string()).min(1, { message: "Select at least one day" }),
});

type FormValues = z.infer<typeof formSchema>;

interface EditHabitFormProps {
  habitId: number;
}

export default function EditHabitForm({ habitId }: EditHabitFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { data: habit, isLoading } = useQuery<any>({
    queryKey: [`/api/habits/${habitId}`],
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: user?.id,
      name: "",
      description: "",
      type: "good",
      frequency: [],
      time: "07:00",
      difficulty: "easy",
      reminderEnabled: true,
      icon: "default",
      color: "primary",
    },
  });
  
  useEffect(() => {
    if (habit) {
      form.reset({
        userId: habit.userId,
        name: habit.name,
        description: habit.description || "",
        type: habit.type || "good",
        frequency: habit.frequency || [],
        time: habit.time || "07:00",
        difficulty: habit.difficulty || "medium",
        reminderEnabled: habit.reminderEnabled === false ? false : true,
        icon: habit.icon || "default",
        color: habit.color || "primary",
      });
    }
  }, [habit, form]);
  
  const updateHabitMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("PUT", `/api/habits/${habitId}`, values);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update habit");
      }
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Habit updated",
        description: "Your habit has been updated successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/habits/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: [`/api/habits/${habitId}`] });
      
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update habit. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const deleteHabitMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/habits/${habitId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete habit");
      }
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Habit deleted",
        description: "Your habit has been deleted successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/habits/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete habit. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsDeleting(false);
    }
  });
  
  const onSubmit = (values: FormValues) => {
    updateHabitMutation.mutate(values);
  };
  
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this habit? This action cannot be undone.")) {
      setIsDeleting(true);
      deleteHabitMutation.mutate();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Habit</CardTitle>
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
                      className="grid grid-cols-2 gap-3"
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <div className={`border ${field.value === 'good' ? 'border-primary bg-primary bg-opacity-5' : 'border-neutral-200'} p-3 rounded-lg flex items-center cursor-pointer`}>
                        <RadioGroupItem value="good" id="good" className="sr-only" />
                        <label htmlFor="good" className="text-sm font-medium cursor-pointer flex items-center w-full">
                          <div className={`w-4 h-4 border-2 rounded-full mr-2 flex items-center justify-center ${field.value === 'good' ? 'border-primary' : 'border-neutral-300'}`}>
                            {field.value === 'good' && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          Build Good Habit
                        </label>
                      </div>
                      <div className={`border ${field.value === 'bad' ? 'border-primary bg-primary bg-opacity-5' : 'border-neutral-200'} p-3 rounded-lg flex items-center cursor-pointer`}>
                        <RadioGroupItem value="bad" id="bad" className="sr-only" />
                        <label htmlFor="bad" className="text-sm font-medium cursor-pointer flex items-center w-full">
                          <div className={`w-4 h-4 border-2 rounded-full mr-2 flex items-center justify-center ${field.value === 'bad' ? 'border-primary' : 'border-neutral-300'}`}>
                            {field.value === 'bad' && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          Break Bad Habit
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
                    <Input type="time" {...field} />
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
                      defaultValue={field.value}
                      value={field.value}
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
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Enable reminders</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 pt-4">
              <Button 
                type="button" 
                onClick={handleDelete} 
                variant="destructive" 
                className="sm:flex-1"
                disabled={isDeleting || updateHabitMutation.isPending}
              >
                {isDeleting ? "Deleting..." : "Delete Habit"}
              </Button>
              <Button 
                type="button" 
                onClick={() => navigate("/")} 
                variant="outline" 
                className="sm:flex-1"
                disabled={isDeleting || updateHabitMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isDeleting || updateHabitMutation.isPending} 
                className="sm:flex-1"
              >
                {updateHabitMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}