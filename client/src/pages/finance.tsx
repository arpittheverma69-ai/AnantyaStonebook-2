import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Sale, type Inventory } from "@shared/schema";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Target, 
  BarChart3, 
  PieChart, 
  Calendar,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Package,
  Activity
} from "lucide-react";
import { useState, useMemo } from "react";

export default function Finance() {
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: sales = [], isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: inventory = [], isLoading: inventoryLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
    refetchInterval: 30000,
  });

  // Dynamic time range filtering
  const filteredSales = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(selectedYear, 0, 1);
    const startOfMonth = new Date(selectedYear, now.getMonth(), 1);
    const startOfQuarter = new Date(selectedYear, Math.floor(now.getMonth() / 3) * 3, 1);

    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      switch (timeRange) {
        case 'month':
          return saleDate >= startOfMonth;
        case 'quarter':
          return saleDate >= startOfQuarter;
        case 'year':
          return saleDate >= startOfYear;
        default:
          return true; // all time
      }
    });
  }, [sales, timeRange, selectedYear]);

  // Enhanced financial calculations
  const financialMetrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || '0'), 0);
    const totalProfit = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.profit || '0'), 0);
    const totalCost = totalRevenue - totalProfit;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    // Payment status breakdown
    const paymentStatus = filteredSales.reduce((acc, sale) => {
      const status = sale.paymentStatus || 'Unpaid';
      acc[status] = (acc[status] || 0) + parseFloat(sale.totalAmount || '0');
      return acc;
    }, {} as Record<string, number>);

    // Monthly trends
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthSales = filteredSales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === i && saleDate.getFullYear() === selectedYear;
      });
      return {
        month: new Date(selectedYear, i).toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || '0'), 0),
        profit: monthSales.reduce((sum, sale) => sum + parseFloat(sale.profit || '0'), 0),
        count: monthSales.length
      };
    });

    return {
      totalRevenue,
      totalProfit,
      totalCost,
      profitMargin,
      paymentStatus,
      monthlyData,
      salesCount: filteredSales.length,
      avgSaleValue: filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0
    };
  }, [filteredSales, selectedYear]);

  // Enhanced inventory analytics
  const inventoryMetrics = useMemo(() => {
    const totalInventoryValue = inventory.reduce((sum, item) => {
      const price = parseFloat(item.pricePerCarat || '0') * parseFloat(item.carat || '0');
      return sum + price;
    }, 0);
    
    const totalInventoryCost = inventory.reduce((sum, item) => {
      // Estimate cost as 70% of selling price for demo
      const price = parseFloat(item.pricePerCarat || '0') * parseFloat(item.carat || '0');
      return sum + (price * 0.7);
    }, 0);

    const potentialProfit = totalInventoryValue - totalInventoryCost;
    const inventoryTurnover = financialMetrics.totalRevenue / totalInventoryValue;

    // Stock level analysis
    const stockLevels = inventory.reduce((acc, item) => {
      const value = parseFloat(item.pricePerCarat || '0') * parseFloat(item.carat || '0');
      if (value > 1000000) acc.high += 1;
      else if (value > 500000) acc.medium += 1;
      else acc.low += 1;
      return acc;
    }, { high: 0, medium: 0, low: 0 });

    return {
      totalValue: totalInventoryValue,
      totalCost: totalInventoryCost,
      potentialProfit,
      turnover: inventoryTurnover,
      stockLevels,
      itemCount: inventory.length
    };
  }, [inventory, financialMetrics.totalRevenue]);

  // Top performing analysis
  const topPerformers = useMemo(() => {
    const stoneStats = new Map<string, {
      revenue: number;
      profit: number;
      count: number;
      avgPrice: number;
      margin: number;
    }>();

    filteredSales.forEach(sale => {
      if (sale.stoneId) {
        const stone = inventory.find(item => item.id === sale.stoneId);
        if (stone) {
          const existing = stoneStats.get(stone.type) || {
            revenue: 0, profit: 0, count: 0, avgPrice: 0, margin: 0
          };
          const saleAmount = parseFloat(sale.totalAmount || '0');
          const saleProfit = parseFloat(sale.profit || '0');
          
          existing.revenue += saleAmount;
          existing.profit += saleProfit;
          existing.count += 1;
          existing.avgPrice = existing.revenue / existing.count;
          existing.margin = existing.revenue > 0 ? (existing.profit / existing.revenue) * 100 : 0;
          
          stoneStats.set(stone.type, existing);
        }
      }
    });

    return Array.from(stoneStats.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10);
  }, [filteredSales, inventory]);

  // Performance indicators
  const performanceIndicators = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    const currentMonthRevenue = financialMetrics.monthlyData[currentMonth]?.revenue || 0;
    const lastMonthRevenue = financialMetrics.monthlyData[lastMonth]?.revenue || 0;
    const revenueGrowth = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    const currentMonthProfit = financialMetrics.monthlyData[currentMonth]?.profit || 0;
    const lastMonthProfit = financialMetrics.monthlyData[lastMonth]?.profit || 0;
    const profitGrowth = lastMonthProfit > 0 ? ((currentMonthProfit - lastMonthProfit) / lastMonthProfit) * 100 : 0;

    return {
      revenueGrowth,
      profitGrowth,
      isRevenueGrowing: revenueGrowth > 0,
      isProfitGrowing: profitGrowth > 0
    };
  }, [financialMetrics.monthlyData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  if (salesLoading || inventoryLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
          <p className="text-gray-600">Monitor your business performance and profitability</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-shadow hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialMetrics.totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  {performanceIndicators.isRevenueGrowing ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${performanceIndicators.isRevenueGrowing ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(Math.abs(performanceIndicators.revenueGrowth))}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Profit</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialMetrics.totalProfit)}</p>
                <div className="flex items-center mt-1">
                  {performanceIndicators.isProfitGrowing ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${performanceIndicators.isProfitGrowing ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(Math.abs(performanceIndicators.profitGrowth))}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">{formatPercentage(financialMetrics.profitMargin)} margin</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Sales Count</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(financialMetrics.salesCount)}</p>
                <p className="text-sm text-purple-600 mt-1">
                  Avg: {formatCurrency(financialMetrics.avgSaleValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="text-purple-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(financialMetrics.paymentStatus['Unpaid'] || 0)}
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  {Object.keys(financialMetrics.paymentStatus).length} payment statuses
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-orange-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Valuation */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Inventory Valuation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Value</span>
                <span className="font-semibold text-lg">{formatCurrency(inventoryMetrics.totalValue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Cost</span>
                <span className="font-semibold text-lg">{formatCurrency(inventoryMetrics.totalCost)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-gray-600">Potential Profit</span>
                <span className="font-semibold text-lg text-green-600">
                  {formatCurrency(inventoryMetrics.potentialProfit)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Turnover Ratio</span>
                <span className="font-semibold">{inventoryMetrics.turnover.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Items in Stock</span>
                <span className="font-semibold">{inventoryMetrics.itemCount}</span>
              </div>
              
              {/* Stock Level Breakdown */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">Stock by Value</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">High Value</span>
                    <Badge variant="destructive">{inventoryMetrics.stockLevels.high}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Medium Value</span>
                    <Badge variant="secondary">{inventoryMetrics.stockLevels.medium}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Low Value</span>
                    <Badge variant="outline">{inventoryMetrics.stockLevels.low}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Payment Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(financialMetrics.paymentStatus).map(([status, amount]) => (
                <div key={status} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {status === 'Paid' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {status === 'Unpaid' && <AlertCircle className="h-4 w-4 text-red-600" />}
                    {status === 'Partial' && <Clock className="h-4 w-4 text-yellow-600" />}
                    <span className="text-gray-600 capitalize">{status}</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(amount)}</span>
                </div>
              ))}
              
              {Object.keys(financialMetrics.paymentStatus).length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No payment data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Monthly Trends ({selectedYear})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {financialMetrics.monthlyData.slice(0, 6).map((month, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{month.month}</span>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(month.revenue)}</div>
                    <div className="text-xs text-green-600">{formatCurrency(month.profit)} profit</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Stones */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Top Performing Gemstone Types</span>
            <Badge variant="outline">{topPerformers.length} types</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topPerformers.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No sales data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gemstone Type</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Total Profit</TableHead>
                    <TableHead>Units Sold</TableHead>
                    <TableHead>Avg Sale Price</TableHead>
                    <TableHead>Profit Margin</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformers.map(([stoneType, data], index) => (
                    <TableRow key={stoneType}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>#{index + 1}</span>
                          <span>{stoneType}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(data.revenue)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(data.profit)}</TableCell>
                      <TableCell>{data.count}</TableCell>
                      <TableCell>{formatCurrency(data.avgPrice)}</TableCell>
                      <TableCell>
                        <Badge variant={data.margin > 20 ? "default" : "secondary"}>
                          {formatPercentage(data.margin)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${Math.min((data.revenue / financialMetrics.totalRevenue) * 100, 100)}%` }}
                          ></div>
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

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
}
