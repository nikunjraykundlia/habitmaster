import { useQuery } from "@tanstack/react-query";
import { Lightbulb, PlusCircle, Flame } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AIRecommendations() {
  const { toast } = useToast();
  
  const { data: insights, isLoading } = useQuery({
    queryKey: ['/api/insights'],
  });
  
  const addHabitMutation = useMutation({
    mutationFn: async (habitSuggestion: any) => {
      return await apiRequest("POST", "/api/habits", habitSuggestion);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Habit added!",
        description: "The suggested habit has been added to your list.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add the suggested habit. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden mb-6">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <h2 className="text-lg font-semibold">Smart Insights</h2>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="p-5">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden mb-6">
      <div className="flex items-center justify-between p-5 border-b border-neutral-200">
        <h2 className="text-lg font-semibold">Smart Insights</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light bg-opacity-10 text-primary">
          AI Powered
        </span>
      </div>
      
      <div className="p-5">
        <div className="space-y-4">
          {insights?.length === 0 ? (
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <p className="text-sm text-neutral-500 text-center">
                Continue tracking your habits to receive personalized insights
              </p>
            </div>
          ) : (
            insights?.map((insight: any, index: number) => (
              <div key={index} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-start">
                  {insight.type === 'analysis' && (
                    <Lightbulb className="h-5 w-5 text-primary mt-0.5 mr-2" />
                  )}
                  {insight.type === 'suggestion' && (
                    <PlusCircle className="h-5 w-5 text-secondary mt-0.5 mr-2" />
                  )}
                  {insight.type === 'motivation' && (
                    <Flame className="h-5 w-5 text-accent mt-0.5 mr-2" />
                  )}
                  <div>
                    <h3 className="font-medium text-sm">{insight.title}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{insight.description}</p>
                    {insight.type === 'suggestion' && insight.habitSuggestion && (
                      <button 
                        className="mt-2 text-xs text-secondary font-medium"
                        onClick={() => addHabitMutation.mutate(insight.habitSuggestion)}
                      >
                        Add this habit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
