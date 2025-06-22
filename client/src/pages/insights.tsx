import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

export default function Insights() {
  const { data: insightsData, isLoading } = useQuery({
    queryKey: ['/api/insights/data'],
  });
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Insights</h1>
            <p className="text-neutral-500 mt-1">
              Analyze your habits and track progress over time
            </p>
          </div>
          
          <Tabs defaultValue="weekly" className="mb-6">
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly" className="pt-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-72 w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-72 w-full" />
                    <Skeleton className="h-72 w-full" />
                  </div>
                </div>
              ) : (
                <>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Weekly Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={insightsData?.weeklyCompletionRate}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="completed" fill="#6366f1" name="Completed" />
                            <Bar dataKey="missed" fill="#e11d48" name="Missed" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Habit Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={insightsData?.habitCategories}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {insightsData?.habitCategories.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Habit Streaks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={insightsData?.habitStreaks}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Line 
                                type="monotone" 
                                dataKey="streak" 
                                stroke="#6366f1" 
                                activeDot={{ r: 8 }} 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="monthly" className="pt-6">
              <div className="text-center py-12">
                <p className="text-neutral-500">
                  Continue tracking your habits to see monthly insights
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="yearly" className="pt-6">
              <div className="text-center py-12">
                <p className="text-neutral-500">
                  Continue tracking your habits to see yearly insights
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : (
                <div className="space-y-4">
                  {insightsData?.aiInsights.map((insight: any, index: number) => (
                    <div key={index} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <h3 className="font-medium mb-2">{insight.title}</h3>
                      <p className="text-neutral-600 text-sm">{insight.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
