import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  Receipt,
  CreditCard,
  Building,
  Car,
  Plane,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: Date;
  type: "business" | "personal" | "mixed";
  paymentMethod: string;
  receipt?: string;
}

interface ProfitMargin {
  stoneId: string;
  stoneName: string;
  purchasePrice: number;
  sellingPrice: number;
  profit: number;
  margin: number;
  category: string;
}

interface CashFlow {
  date: string;
  income: number;
  expenses: number;
  net: number;
}

export default function FinancialDashboard() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profitMargins, setProfitMargins] = useState<ProfitMargin[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlow[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [newExpense, setNewExpense] = useState({
    category: "",
    amount: "",
    description: "",
    type: "business" as const,
    paymentMethod: "cash"
  });

  // Simulated data
  useEffect(() => {
    const mockExpenses: Expense[] = [
      {
        id: "1",
        category: "Travel",
        amount: 15000,
        description: "Jaipur supplier visit",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        type: "business",
        paymentMethod: "credit_card"
      },
      {
        id: "2",
        category: "Certification",
        amount: 5000,
        description: "IGI certification fees",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        type: "business",
        paymentMethod: "bank_transfer"
      },
      {
        id: "3",
        category: "Office Supplies",
        amount: 2500,
        description: "Gemstone loupes and tools",
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        type: "business",
        paymentMethod: "cash"
      }
    ];

    const mockProfitMargins: ProfitMargin[] = [
      {
        stoneId: "1",
        stoneName: "Ruby 5.2ct",
        purchasePrice: 75000,
        sellingPrice: 120000,
        profit: 45000,
        margin: 60,
        category: "Ruby"
      },
      {
        stoneId: "2",
        stoneName: "Blue Sapphire 6.8ct",
        purchasePrice: 120000,
        sellingPrice: 180000,
        profit: 60000,
        margin: 50,
        category: "Blue Sapphire"
      },
      {
        stoneId: "3",
        stoneName: "Yellow Sapphire 4.5ct",
        purchasePrice: 45000,
        sellingPrice: 72000,
        profit: 27000,
        margin: 60,
        category: "Yellow Sapphire"
      }
    ];

    const mockCashFlow: CashFlow[] = [
      { date: "Jan", income: 450000, expenses: 125000, net: 325000 },
      { date: "Feb", income: 380000, expenses: 98000, net: 282000 },
      { date: "Mar", income: 520000, expenses: 145000, net: 375000 },
      { date: "Apr", income: 410000, expenses: 110000, net: 300000 },
      { date: "May", income: 480000, expenses: 135000, net: 345000 },
      { date: "Jun", income: 550000, expenses: 150000, net: 400000 }
    ];

    setExpenses(mockExpenses);
    setProfitMargins(mockProfitMargins);
    setCashFlow(mockCashFlow);
  }, []);

  const expenseCategories = [
    "Travel", "Certification", "Office Supplies", "Marketing", "Insurance",
    "Rent", "Utilities", "Professional Fees", "Equipment", "Other"
  ];

  const paymentMethods = [
    "cash", "credit_card", "bank_transfer", "upi", "cheque"
  ];

  const addExpense = () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      date: new Date(),
      type: newExpense.type,
      paymentMethod: newExpense.paymentMethod
    };

    setExpenses(prev => [expense, ...prev]);
    
    // Reset form
    setNewExpense({
      category: "",
      amount: "",
      description: "",
      type: "business",
      paymentMethod: "cash"
    });

    toast({
      title: "Expense Added",
      description: `₹${expense.amount.toLocaleString()} added to ${expense.category}`,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "travel": return <Plane className="h-4 w-4" />;
      case "certification": return <FileText className="h-4 w-4" />;
      case "office supplies": return <Building className="h-4 w-4" />;
      case "marketing": return <BarChart3 className="h-4 w-4" />;
      case "insurance": return <Shield className="h-4 w-4" />;
      default: return <Receipt className="h-4 w-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card": return <CreditCard className="h-4 w-4" />;
      case "bank_transfer": return <Building className="h-4 w-4" />;
      case "upi": return <Smartphone className="h-4 w-4" />;
      case "cheque": return <FileText className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const businessExpenses = expenses.filter(exp => exp.type === "business").reduce((sum, exp) => sum + exp.amount, 0);
  const totalProfit = profitMargins.reduce((sum, pm) => sum + pm.profit, 0);
  const avgMargin = profitMargins.length > 0 ? profitMargins.reduce((sum, pm) => sum + pm.margin, 0) / profitMargins.length : 0;

  const pieChartData = [
    { name: "Travel", value: expenses.filter(e => e.category === "Travel").reduce((sum, e) => sum + e.amount, 0) },
    { name: "Certification", value: expenses.filter(e => e.category === "Certification").reduce((sum, e) => sum + e.amount, 0) },
    { name: "Office Supplies", value: expenses.filter(e => e.category === "Office Supplies").reduce((sum, e) => sum + e.amount, 0) },
    { name: "Other", value: expenses.filter(e => !["Travel", "Certification", "Office Supplies"].includes(e.category)).reduce((sum, e) => sum + e.amount, 0) }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Financial Dashboard
        </h2>
        <p className="text-muted-foreground">
          Track expenses, analyze profits, and monitor cash flow
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{cashFlow.reduce((sum, cf) => sum + cf.income, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +15.7% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Margin</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="profits">Profit Analysis</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cash Flow Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={cashFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Expense Form */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Add Expense
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newExpense.category} onValueChange={(value) => setNewExpense(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    placeholder="Expense description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={newExpense.type} onValueChange={(value: "business" | "personal" | "mixed") => setNewExpense(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={newExpense.paymentMethod} onValueChange={(value) => setNewExpense(prev => ({ ...prev, paymentMethod: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map(method => (
                          <SelectItem key={method} value={method}>
                            {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={addExpense} className="w-full">
                  Add Expense
                </Button>
              </CardContent>
            </Card>

            {/* Expense List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenses.map(expense => (
                    <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(expense.category)}
                        <div>
                          <div className="font-medium">{expense.category}</div>
                          <div className="text-sm text-muted-foreground">{expense.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {expense.date.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant={expense.type === "business" ? "default" : "secondary"}>
                          {expense.type}
                        </Badge>
                        <div className="text-right">
                          <div className="font-bold">₹{expense.amount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {getPaymentMethodIcon(expense.paymentMethod)}
                            {expense.paymentMethod.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit Margin Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profitMargins.map(pm => (
                  <div key={pm.stoneId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{pm.stoneName}</div>
                      <div className="text-sm text-muted-foreground">{pm.category}</div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Purchase</div>
                          <div className="font-medium">₹{pm.purchasePrice.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Sale</div>
                          <div className="font-medium">₹{pm.sellingPrice.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Profit</div>
                          <div className="font-bold text-green-600">₹{pm.profit.toLocaleString()}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {pm.margin}% Margin
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} name="Income" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} name="Expenses" />
                  <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} name="Net" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Missing icon components
const Shield = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const Smartphone = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);
