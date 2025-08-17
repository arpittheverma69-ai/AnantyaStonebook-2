import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { type Task } from "@shared/schema";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Users,
  Target,
  Zap,
  BarChart3,
  Filter,
  Download,
  RefreshCw,
  Play,
  Pause,
  StopCircle,
  Timer,
  Brain,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Award,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import TaskForm from "@/components/forms/task-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  highPriorityTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  productivityScore: number;
  weeklyProgress: number;
  monthlyTrend: number;
}

interface TimeTracking {
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  isActive: boolean;
}

export default function TasksEnhanced() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "analytics">("list");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [timeTracking, setTimeTracking] = useState<TimeTracking[]>([]);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // AI Task Suggestions
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const generateAISuggestions = async () => {
    setIsGeneratingSuggestions(true);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: "Based on my current business data, suggest 5 important tasks I should prioritize for my gemstone business. Focus on sales, inventory management, client relationships, and business growth.",
          context: "task-suggestions"
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const suggestions = data.content.split('\n')
          .filter((line: string) => line.includes('•') || line.includes('-'))
          .map((line: string) => line.replace(/^[•\-\s]+/, '').trim())
          .filter((suggestion: string) => suggestion.length > 10)
          .slice(0, 5);
        
        setAiSuggestions(suggestions);
        toast({
          title: "AI Suggestions Generated",
          description: "Check out the new task suggestions below!",
        });
      }
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI suggestions",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  // Time Tracking Functions
  const startTimer = (taskId: string) => {
    const newTracking: TimeTracking = {
      taskId,
      startTime: new Date(),
      duration: 0,
      isActive: true
    };
    setTimeTracking(prev => [...prev, newTracking]);
    setActiveTimer(taskId);
    toast({
      title: "Timer Started",
      description: "Time tracking has begun for this task",
    });
  };

  const stopTimer = (taskId: string) => {
    setTimeTracking(prev => prev.map(tracking => 
      tracking.taskId === taskId 
        ? { ...tracking, endTime: new Date(), isActive: false, duration: Date.now() - tracking.startTime.getTime() }
        : tracking
    ));
    setActiveTimer(null);
    toast({
      title: "Timer Stopped",
      description: "Time tracking has been completed",
    });
  };

  const getTaskDuration = (taskId: string) => {
    const tracking = timeTracking.find(t => t.taskId === taskId);
    if (!tracking) return 0;
    
    if (tracking.isActive) {
      return Date.now() - tracking.startTime.getTime();
    }
    return tracking.duration;
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Analytics Calculations
  const calculateAnalytics = (): TaskAnalytics => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => !t.completed && isOverdue(t.dueDate)).length;
    const highPriority = tasks.filter(t => !t.completed && t.priority === 'High').length;
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const productivityScore = Math.min(100, completionRate + (highPriority === 0 ? 20 : 0) + (overdue === 0 ? 30 : 0));
    
    return {
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      overdueTasks: overdue,
      highPriorityTasks: highPriority,
      completionRate,
      averageCompletionTime: 2.5,
      productivityScore,
      weeklyProgress: 15,
      monthlyTrend: 8.5
    };
  };

  const analytics = calculateAnalytics();

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      return apiRequest(`/api/tasks/${id}`, { method: "PATCH", body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/tasks/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "completed" && task.completed) ||
      (statusFilter === "pending" && !task.completed);
    
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleTaskToggle = (id: string, completed: boolean) => {
    updateTaskMutation.mutate({ 
      id, 
      data: { 
        completed,
        status: completed ? "Done" : "Pending"
      }
    });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string | null) => {
    switch (priority) {
      case 'High': return <AlertCircle className="h-3 w-3" />;
      case 'Medium': return <Clock className="h-3 w-3" />;
      case 'Low': return <CheckCircle2 className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-IN');
  };

  const formatDateTime = (date: string | Date | null) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleString('en-IN');
  };

  const isOverdue = (dueDate: string | Date | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !tasks.find(t => t.dueDate === dueDate)?.completed;
  };

  const exportTasks = () => {
    const csvContent = [
      ['Title', 'Description', 'Priority', 'Status', 'Due Date', 'Related To', 'Completed'],
      ...filteredTasks.map(task => [
        task.title,
        task.description || '',
        task.priority || 'Medium',
        task.status || 'Pending',
        formatDate(task.dueDate),
        task.relatedTo || '',
        task.completed ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: "Tasks have been exported to CSV",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Task Management</h1>
          <p className="text-gray-600">AI-powered task organization with time tracking and analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={generateAISuggestions} disabled={isGeneratingSuggestions}>
            <Brain className="h-4 w-4 mr-2" />
            {isGeneratingSuggestions ? 'Generating...' : 'AI Suggestions'}
          </Button>
          <Button variant="outline" onClick={exportTasks}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? "Edit Task" : "Create New Task"}
                </DialogTitle>
              </DialogHeader>
              <TaskForm 
                task={editingTask} 
                onClose={handleFormClose}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Lightbulb className="h-5 w-5" />
              AI-Powered Task Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <Star className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalTasks}</p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="text-green-600">+{analytics.weeklyProgress}%</span> this week
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="text-blue-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.completionRate.toFixed(1)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${analytics.completionRate}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Productivity Score</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.productivityScore.toFixed(0)}/100</p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="text-purple-600">+{analytics.monthlyTrend}%</span> vs last month
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="text-purple-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overdueTasks}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.overdueTasks > 0 ? 'Needs attention' : 'All caught up!'}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-red-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" onClick={() => setViewMode("list")}>List View</TabsTrigger>
          <TabsTrigger value="kanban" onClick={() => setViewMode("kanban")}>Kanban Board</TabsTrigger>
          <TabsTrigger value="analytics" onClick={() => setViewMode("analytics")}>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Task List with Time Tracking</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? "No tasks match your search criteria" : "Start by creating your first task"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setIsFormOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Task
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Done</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time Tracked</TableHead>
                        <TableHead>Related To</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map((task) => (
                        <TableRow 
                          key={task.id} 
                          className={task.completed ? 'bg-green-50' : isOverdue(task.dueDate) ? 'bg-red-50' : ''}
                        >
                          <TableCell>
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={(checked) => handleTaskToggle(task.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(task.priority)}>
                              <span className="flex items-center space-x-1">
                                {getPriorityIcon(task.priority)}
                                <span>{task.priority || 'Medium'}</span>
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
                              {formatDateTime(task.dueDate)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={task.completed ? "default" : "secondary"}>
                              {task.status || (task.completed ? "Done" : "Pending")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">
                                {formatDuration(getTaskDuration(task.id))}
                              </span>
                              {activeTimer === task.id ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => stopTimer(task.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <StopCircle className="h-3 w-3 text-red-500" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startTimer(task.id)}
                                  className="h-6 w-6 p-0"
                                  disabled={activeTimer !== null}
                                >
                                  <Play className="h-3 w-3 text-green-500" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {task.relatedType && task.relatedTo ? (
                              <Badge variant="outline">
                                {task.relatedType}
                              </Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(task)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kanban Board</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* To Do */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">To Do</h3>
                    <Badge variant="secondary">
                      {filteredTasks.filter(t => !t.completed && t.status === 'Pending').length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {filteredTasks
                      .filter(task => !task.completed && task.status === 'Pending')
                      .map(task => (
                        <div key={task.id} className="p-4 bg-white border rounded-lg shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-500 mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {formatDate(task.dueDate)}
                            </span>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(task)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* In Progress */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">In Progress</h3>
                    <Badge variant="secondary">
                      {filteredTasks.filter(t => !t.completed && t.status === 'In Progress').length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {filteredTasks
                      .filter(task => !task.completed && task.status === 'In Progress')
                      .map(task => (
                        <div key={task.id} className="p-4 bg-white border rounded-lg shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-500 mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {formatDate(task.dueDate)}
                            </span>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(task)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Done */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">Done</h3>
                    <Badge variant="secondary">
                      {filteredTasks.filter(t => t.completed).length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {filteredTasks
                      .filter(task => task.completed)
                      .map(task => (
                        <div key={task.id} className="p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm line-through text-gray-500">{task.title}</h4>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-400 mb-2 line-through">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              Completed {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Productivity Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Productivity Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Weekly Progress</span>
                    <span className="text-sm font-medium text-green-600">+{analytics.weeklyProgress}%</span>
                  </div>
                  <Progress value={analytics.weeklyProgress} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monthly Trend</span>
                    <span className="text-sm font-medium text-blue-600">+{analytics.monthlyTrend}%</span>
                  </div>
                  <Progress value={analytics.monthlyTrend * 10} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="text-sm font-medium text-purple-600">{analytics.completionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={analytics.completionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Task Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Task Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">High Priority</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${(analytics.highPriorityTasks / analytics.totalTasks) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{analytics.highPriorityTasks}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overdue</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${(analytics.overdueTasks / analytics.totalTasks) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{analytics.overdueTasks}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(analytics.completedTasks / analytics.totalTasks) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{analytics.completedTasks}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
