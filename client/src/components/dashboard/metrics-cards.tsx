import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Gem, Clock, Calendar, ArrowUp, Users, Truck, Award, FileText, CheckCircle, DollarSign, AlertTriangle } from "lucide-react";

interface MetricsCardsProps {
  metrics?: {
    // Sales metrics
    monthlySales: number;
    totalRevenue: number;
    totalSales: number;
    avgSaleValue: number;
    pendingPayments: number;
    
    // Inventory metrics
    inventoryValue: number;
    totalStones: number;
    availableStones: number;
    soldStones: number;
    lowStockItems: number;
    
    // Client metrics
    totalClients: number;
    activeClients: number;
    trustworthyClients: number;
    
    // Supplier metrics
    totalSuppliers: number;
    domesticSuppliers: number;
    internationalSuppliers: number;
    highQualitySuppliers: number;
    
    // Certification metrics
    pendingCerts: number;
    totalCertifications: number;
    
    // Consultation metrics
    todayConsultations: number;
    totalConsultations: number;
    
    // Task metrics
    followups: number;
    highPriority: number;
    pendingTasks: number;
    overdueTasks: number;
  };
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!metrics) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {/* Monthly Sales */}
      <Card className="card-shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-0">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Monthly Sales</p>
              <p className="text-lg md:text-2xl font-bold text-foreground truncate">
                {formatCurrency(metrics.monthlySales)}
              </p>
              <p className="text-xs md:text-sm text-green-600 dark:text-green-400 mt-1 flex items-center">
                <ArrowUp className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{metrics.totalSales} total sales</span>
              </p>
            </div>
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <TrendingUp className="text-white text-sm md:text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Inventory Value */}
      <Card className="card-shadow-lg bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 border-0">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Inventory Value</p>
              <p className="text-lg md:text-2xl font-bold text-foreground truncate">
                {formatCurrency(metrics.inventoryValue)}
              </p>
              <p className="text-xs md:text-sm text-blue-600 dark:text-blue-400 mt-1 truncate">
                {metrics.availableStones} available, {metrics.lowStockItems} low stock
              </p>
            </div>
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Gem className="text-white text-sm md:text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Active Clients */}
      <Card className="card-shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-0">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Active Clients</p>
              <p className="text-lg md:text-2xl font-bold text-foreground">{metrics.activeClients}</p>
              <p className="text-xs md:text-sm text-purple-600 dark:text-purple-400 mt-1 truncate">
                {metrics.totalClients} total, {metrics.trustworthyClients} trustworthy
              </p>
            </div>
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Users className="text-white text-sm md:text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Pending Payments */}
      <Card className="card-shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-0">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Pending Payments</p>
              <p className="text-lg md:text-2xl font-bold text-foreground">{metrics.pendingPayments}</p>
              <p className="text-xs md:text-sm text-orange-600 dark:text-orange-400 mt-1 truncate">
                {formatCurrency(metrics.pendingPayments * metrics.avgSaleValue)} value
              </p>
            </div>
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <DollarSign className="text-white text-sm md:text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Pending Certifications */}
      <Card className="card-shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-0">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Pending Certifications</p>
              <p className="text-lg md:text-2xl font-bold text-foreground">{metrics.pendingCerts}</p>
              <p className="text-xs md:text-sm text-indigo-600 dark:text-indigo-400 mt-1 truncate">
                {metrics.totalCertifications} total pending
              </p>
            </div>
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Award className="text-white text-sm md:text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* High Priority Tasks */}
      <Card className="card-shadow-lg bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-0">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">High Priority Tasks</p>
              <p className="text-lg md:text-2xl font-bold text-foreground">{metrics.highPriority}</p>
              <p className="text-xs md:text-sm text-red-600 dark:text-red-400 mt-1 truncate">
                {metrics.overdueTasks} overdue, {metrics.pendingTasks} pending
              </p>
            </div>
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <AlertTriangle className="text-white text-sm md:text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Today's Consultations */}
      <Card className="card-shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border-0">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Today's Consultations</p>
              <p className="text-lg md:text-2xl font-bold text-foreground">{metrics.todayConsultations}</p>
              <p className="text-xs md:text-sm text-teal-600 dark:text-teal-400 mt-1 truncate">
                {metrics.totalConsultations} total consultations
              </p>
            </div>
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <FileText className="text-white text-sm md:text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Average Sale Value */}
      <Card className="card-shadow-lg bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-0">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Avg Sale Value</p>
              <p className="text-lg md:text-2xl font-bold text-foreground truncate">
                {formatCurrency(metrics.avgSaleValue)}
              </p>
              <p className="text-xs md:text-sm text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                {metrics.totalRevenue > 0 ? `${((metrics.monthlySales / metrics.totalRevenue) * 100).toFixed(1)}%` : '0%'} of total
              </p>
            </div>
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <CheckCircle className="text-white text-sm md:text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
