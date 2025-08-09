import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Bot, 
  Send, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Calendar,
  Lightbulb,
  BarChart3,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Plus,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  CalendarDays,
  User,
  Tag,
  X
} from "lucide-react";
import { type Sale, type Inventory, type Client, type Certification, type Task } from "@shared/schema";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  analysis?: any;
  suggestions?: string[];
  insights?: string[];
}

interface BusinessMetrics {
  totalRevenue: number;
  totalProfit: number;
  totalSales: number;
  totalInventory: number;
  totalClients: number;
  avgSaleValue: number;
  profitMargin: number;
  topPerformingStone: string;
  recentGrowth: number;
  pendingCertifications: number;
}

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  assignedTo: string;
}

export default function AIAnalysis() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI business analyst. I can help you understand your gemstone business data. Ask me anything about your sales, inventory, clients, or business performance. For example:\n\n• Show me my top performing gemstones\n• What's my profit margin this month?\n• Which clients are my best customers?\n• How is my inventory performing?\n• Give me a business overview",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    assignedTo: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch all business data
  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
    refetchInterval: 30000,
  });

  const { data: inventory = [] } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
    refetchInterval: 30000,
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    refetchInterval: 30000,
  });

  const { data: certifications = [] } = useQuery<Certification[]>({
    queryKey: ["/api/certifications"],
    refetchInterval: 30000,
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    refetchInterval: 30000,
  });

  // Task mutations
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: TaskFormData) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) throw new Error('Failed to create task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setShowTaskDialog(false);
      resetTaskForm();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TaskFormData }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setShowTaskDialog(false);
      setEditingTask(null);
      resetTaskForm();
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const resetTaskForm = () => {
    setTaskFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      dueDate: '',
      assignedTo: ''
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormData({
      title: task.title || '',
      description: task.description || '',
      priority: (task.priority as 'low' | 'medium' | 'high') || 'medium',
      status: (task.status as 'pending' | 'in-progress' | 'completed') || 'pending',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      assignedTo: task.assignedTo || ''
    });
    setShowTaskDialog(true);
  };

  const handleSubmitTask = () => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data: taskFormData });
    } else {
      createTaskMutation.mutate(taskFormData);
    }
  };

  // Calculate business metrics
  const businessMetrics: BusinessMetrics = {
    totalRevenue: sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || '0'), 0),
    totalProfit: sales.reduce((sum, sale) => {
      const saleAmount = parseFloat(sale.totalAmount || '0');
      const quantity = sale.quantity || 1;
      const inventoryItem = inventory.find(item => item.id === sale.stoneId);
      const costPerUnit = parseFloat(inventoryItem?.totalPrice || '0');
      const totalCost = costPerUnit * quantity;
      return sum + (saleAmount - totalCost);
    }, 0),
    totalSales: sales.length,
    totalInventory: inventory.length,
    totalClients: clients.length,
    avgSaleValue: sales.length > 0 ? sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || '0'), 0) / sales.length : 0,
    profitMargin: sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || '0'), 0) > 0 
      ? (sales.reduce((sum, sale) => {
          const saleAmount = parseFloat(sale.totalAmount || '0');
          const quantity = sale.quantity || 1;
          const inventoryItem = inventory.find(item => item.id === sale.stoneId);
          const costPerUnit = parseFloat(inventoryItem?.totalPrice || '0');
          const totalCost = costPerUnit * quantity;
          return sum + (saleAmount - totalCost);
        }, 0) / sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || '0'), 0)) * 100
      : 0,
    topPerformingStone: getTopPerformingStone(),
    recentGrowth: calculateRecentGrowth(),
    pendingCertifications: certifications.filter(c => c.status === 'Pending').length
  };

  function getTopPerformingStone(): string {
    const stoneSales = new Map<string, number>();
    
    sales.forEach(sale => {
      const inventoryItem = inventory.find(item => item.id === sale.stoneId);
      const stoneName = inventoryItem?.gemId || inventoryItem?.type || 'Unknown';
      const amount = parseFloat(sale.totalAmount || '0');
      stoneSales.set(stoneName, (stoneSales.get(stoneName) || 0) + amount);
    });

    if (stoneSales.size === 0) return "No sales data";
    
    const topStone = Array.from(stoneSales.entries()).reduce((a, b) => a[1] > b[1] ? a : b);
    return topStone[0];
  }

  function calculateRecentGrowth(): number {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentSales = sales.filter(sale => new Date(sale.date) >= thirtyDaysAgo);
    const previousSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= sixtyDaysAgo && saleDate < thirtyDaysAgo;
    });

    const recentRevenue = recentSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || '0'), 0);
    const previousRevenue = previousSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || '0'), 0);

    return previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  // AI Analysis function using Gemini API
  const analyzeQuery = async (query: string): Promise<{ content: string; analysis?: any; suggestions?: string[]; insights?: string[] }> => {
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          context: 'Gemstone business analysis'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI analysis');
      }

      const result = await response.json();
      return {
        content: result.content,
        analysis: result.analysis,
        suggestions: result.suggestions,
        insights: result.insights
      };
    } catch (error) {
      console.error('AI Analysis error:', error);
      
      // Fallback to local analysis if AI fails
      const lowerQuery = query.toLowerCase();
      
      if (lowerQuery.includes('overview') || lowerQuery.includes('summary') || lowerQuery.includes('business')) {
        return {
          content: `📊 Business Overview\n\n` +
            `• Revenue: ${formatCurrency(businessMetrics.totalRevenue)}\n` +
            `• Profit: ${formatCurrency(businessMetrics.totalProfit)}\n` +
            `• Profit Margin: ${businessMetrics.profitMargin.toFixed(1)}%\n` +
            `• Total Sales: ${formatNumber(businessMetrics.totalSales)}\n` +
            `• Inventory Items: ${formatNumber(businessMetrics.totalInventory)}\n` +
            `• Active Clients: ${formatNumber(businessMetrics.totalClients)}\n` +
            `• Average Sale Value: ${formatCurrency(businessMetrics.avgSaleValue)}\n` +
            `• Recent Growth: ${businessMetrics.recentGrowth > 0 ? '+' : ''}${businessMetrics.recentGrowth.toFixed(1)}%\n` +
            `• Pending Certifications: ${businessMetrics.pendingCertifications}`,
          analysis: { type: 'overview', metrics: businessMetrics }
        };
      }

      return {
        content: `🤖 AI Assistant\n\nI can help you analyze:\n\n` +
          `• Business Overview - Ask for "business overview"\n` +
          `• Top Performers - Ask for "top performing gemstones"\n` +
          `• Profit Analysis - Ask about "profit margin"\n` +
          `• Client Analysis - Ask about "best clients"\n` +
          `• Inventory Analysis - Ask about "inventory status"\n` +
          `• Growth Trends - Ask about "growth trends"\n` +
          `• Certifications - Ask about "certification status"\n\n` +
          `Try asking specific questions about your business data!`,
        analysis: { type: 'help' }
      };
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await analyzeQuery(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.content,
        timestamp: new Date(),
        analysis: response.analysis,
        suggestions: response.suggestions,
        insights: response.insights
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "Sorry, I encountered an error while analyzing your data. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages.length]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Business Analyst</h1>
            <p className="text-muted-foreground">Get intelligent insights about your gemstone business</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="lg:hidden"
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col min-h-0 lg:mr-0">
          <Card className="flex-1 mx-6 my-4 flex flex-col border-0 shadow-lg bg-background/80 backdrop-blur-xl">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-purple-500/5">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              <ScrollArea className="flex-1 p-4" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex animate-in slide-in-from-bottom-2 duration-300 ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 break-words ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'bg-muted shadow-md'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                        
                        {/* AI Suggestions and Insights */}
                        {message.type === 'ai' && (message.suggestions || message.insights) && (
                          <div className="mt-3 space-y-2">
                            {message.suggestions && message.suggestions.length > 0 && (
                              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                                <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
                                  <Lightbulb className="h-3 w-3" />
                                  AI Suggestions
                                </h4>
                                <ul className="text-xs space-y-1">
                                  {message.suggestions.slice(0, 3).map((suggestion, index) => (
                                    <li key={index} className="text-blue-600 dark:text-blue-400">
                                      • {suggestion}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {message.insights && message.insights.length > 0 && (
                              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                                <h4 className="text-xs font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  Key Insights
                                </h4>
                                <ul className="text-xs space-y-1">
                                  {message.insights.slice(0, 2).map((insight, index) => (
                                    <li key={index} className="text-green-600 dark:text-green-400">
                                      • {insight}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Quick actions for AI messages */}
                        {message.type === 'ai' && (
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const firstLine = (message.content.split('\n').find(l => l.trim()) || '').slice(0, 80);
                                setEditingTask(null);
                                setTaskFormData({
                                  title: firstLine || 'AI Insight Task',
                                  description: message.content,
                                  priority: 'medium',
                                  status: 'pending',
                                  dueDate: '',
                                  assignedTo: ''
                                });
                                setShowTaskDialog(true);
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              Create Task
                            </Button>
                          </div>
                        )}
                        <div className="text-xs opacity-70 mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-muted rounded-lg p-3 shadow-md">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-sm">Analyzing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="border-t p-4 bg-gradient-to-r from-primary/5 to-purple-500/5">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your business..."
                    className="flex-1 resize-none transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:flex w-80 flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Insights */}
          <Card className="animate-in slide-in-from-right-2 duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Revenue</p>
                  <p className="text-lg font-bold">{formatCurrency(businessMetrics.totalRevenue)}</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Profit</p>
                  <p className="text-lg font-bold">{formatCurrency(businessMetrics.totalProfit)}</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Sales</p>
                  <p className="text-lg font-bold">{formatNumber(businessMetrics.totalSales)}</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Clients</p>
                  <p className="text-lg font-bold">{formatNumber(businessMetrics.totalClients)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card className="animate-in slide-in-from-right-2 duration-500 delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Profit Margin</span>
                <Badge variant={businessMetrics.profitMargin > 20 ? "default" : "secondary"}>
                  {businessMetrics.profitMargin.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Sale Value</span>
                <span className="text-sm font-medium">{formatCurrency(businessMetrics.avgSaleValue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Growth Rate</span>
                <Badge variant={businessMetrics.recentGrowth > 0 ? "default" : "destructive"}>
                  {businessMetrics.recentGrowth > 0 ? '+' : ''}{businessMetrics.recentGrowth.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Top Stone</span>
                <span className="text-sm font-medium">{businessMetrics.topPerformingStone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Management */}
          <Card className="animate-in slide-in-from-right-2 duration-500 delay-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Tasks
                </CardTitle>
                <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-8 w-8 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={taskFormData.title}
                          onChange={(e) => setTaskFormData({...taskFormData, title: e.target.value})}
                          placeholder="Enter task title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={taskFormData.description}
                          onChange={(e) => setTaskFormData({...taskFormData, description: e.target.value})}
                          placeholder="Enter task description"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Priority</label>
                          <Select value={taskFormData.priority} onValueChange={(value: any) => setTaskFormData({...taskFormData, priority: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Status</label>
                          <Select value={taskFormData.status} onValueChange={(value: any) => setTaskFormData({...taskFormData, status: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Due Date</label>
                        <Input
                          type="date"
                          value={taskFormData.dueDate}
                          onChange={(e) => setTaskFormData({...taskFormData, dueDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Assigned To</label>
                        <Input
                          value={taskFormData.assignedTo}
                          onChange={(e) => setTaskFormData({...taskFormData, assignedTo: e.target.value})}
                          placeholder="Enter assignee name"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSubmitTask} className="flex-1">
                          {editingTask ? 'Update Task' : 'Add Task'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="p-3 border rounded-lg transition-all duration-300 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={() => updateTaskMutation.mutate({
                            id: task.id,
                            data: {
                              ...taskFormData,
                              status: task.status === 'completed' ? 'pending' : 'completed'
                            }
                          })}
                          className="transition-colors duration-200"
                        >
                          {task.status === 'completed' ? (
                            <CheckSquare className="h-4 w-4 text-green-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        <span className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getPriorityColor(task.priority || 'medium')}`}>
                          {task.priority}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(task.status || 'pending')}`}>
                          {task.status}
                        </Badge>
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditTask(task)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTaskMutation.mutate(task.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tasks yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="animate-in slide-in-from-right-2 duration-500 delay-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/ai/insights');
                    if (response.ok) {
                      const data = await response.json();
                      const insightMessage: Message = {
                        id: Date.now().toString(),
                        type: 'ai',
                        content: `💡 **AI Business Insights**\n\n${data.insights?.map((insight: string, index: number) => `${index + 1}. ${insight}`).join('\n\n') || 'No insights available'}`,
                        timestamp: new Date(),
                        insights: data.insights
                      };
                      setMessages(prev => [...prev, insightMessage]);
                    }
                  } catch (error) {
                    console.error('Failed to get insights:', error);
                  }
                }}
                className="w-full"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Generate Insights
              </Button>
              
              {/* Quick Analysis Buttons */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput("Show me my business overview")}
                  className="w-full text-left justify-start"
                >
                  📊 Business Overview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput("What's my profit margin?")}
                  className="w-full text-left justify-start"
                >
                  💰 Profit Analysis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput("Which clients are my best customers?")}
                  className="w-full text-left justify-start"
                >
                  👥 Client Analysis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput("How is my inventory performing?")}
                  className="w-full text-left justify-start"
                >
                  📦 Inventory Status
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="animate-in slide-in-from-right-2 duration-500 delay-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {businessMetrics.pendingCertifications > 0 && (
                <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg animate-in slide-in-from-right-2 duration-300">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">{businessMetrics.pendingCertifications} pending certifications</span>
                </div>
              )}
              {businessMetrics.recentGrowth < 0 && (
                <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-lg animate-in slide-in-from-right-2 duration-300">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Sales declining - consider marketing</span>
                </div>
              )}
              {businessMetrics.profitMargin < 15 && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg animate-in slide-in-from-right-2 duration-300">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Low profit margin - review pricing</span>
                </div>
              )}
              {businessMetrics.totalSales === 0 && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg animate-in slide-in-from-right-2 duration-300">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">No sales recorded yet</span>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileSidebar(false)} />
            <div className="absolute right-0 top-0 h-full w-80 bg-background shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Business Insights</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileSidebar(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Quick Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Quick Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
                        <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Revenue</p>
                        <p className="text-lg font-bold">{formatCurrency(businessMetrics.totalRevenue)}</p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Profit</p>
                        <p className="text-lg font-bold">{formatCurrency(businessMetrics.totalProfit)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Key Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Profit Margin</span>
                      <Badge variant={businessMetrics.profitMargin > 20 ? "default" : "secondary"}>
                        {businessMetrics.profitMargin.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Growth Rate</span>
                      <Badge variant={businessMetrics.recentGrowth > 0 ? "default" : "destructive"}>
                        {businessMetrics.recentGrowth > 0 ? '+' : ''}{businessMetrics.recentGrowth.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
