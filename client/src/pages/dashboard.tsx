import { useQuery } from "@tanstack/react-query";
import MetricsCards from "@/components/dashboard/metrics-cards";
import SalesChart from "@/components/dashboard/sales-chart";
import TopClients from "@/components/dashboard/top-clients";
import RecentInventory from "@/components/dashboard/recent-inventory";
import TasksWidget from "@/components/dashboard/tasks-widget";
import QuickActions from "@/components/dashboard/quick-actions";
import TopSuppliers from "@/components/dashboard/top-suppliers";
import RecentSales from "@/components/dashboard/recent-sales";
import TopPerformingStones from "@/components/dashboard/top-performing-stones";
import AIInsights from "@/components/dashboard/ai-insights";
import SocialTraffic from "@/components/dashboard/social-traffic";

interface Metrics {
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
  
  // Additional data
  topPerformingSuppliers?: any[];
  recentSales?: any[];
}

export default function Dashboard() {
  const { data: metrics, isLoading } = useQuery<Metrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-8">
        <div className="animate-pulse space-y-4 md:space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 md:h-32 bg-muted rounded-[var(--radius)]"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 h-60 md:h-80 bg-muted rounded-[var(--radius)]"></div>
            <div className="h-60 md:h-80 bg-muted rounded-[var(--radius)]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Welcome to Anantya
        </h1>
        <p className="text-muted-foreground text-sm md:text-lg">
          Your premium gemstone business dashboard
        </p>
      </div>

      {/* 8 Metric Cards */}
      <MetricsCards metrics={metrics} />
      
      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div className="order-first lg:order-last">
          <SocialTraffic />
        </div>
      </div>
      
      {/* Quick Actions and Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <QuickActions />
        <TasksWidget />
      </div>
      
      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <RecentInventory />
        <RecentSales />
      </div>
      
      {/* Analytics and Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <TopClients />
        <TopSuppliers />
      </div>
      
      {/* Performance and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <TopPerformingStones />
        <AIInsights />
      </div>
    </div>
  );
}
