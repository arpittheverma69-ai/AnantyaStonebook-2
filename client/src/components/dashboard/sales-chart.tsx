import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { type Sale } from "@shared/schema";
import { BarChart3, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useState, useMemo } from "react";

export default function SalesChart() {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('30days');
  
  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
    refetchInterval: 30000,
  });

  // Calculate sales data for the selected time range
  const chartData = useMemo(() => {
    const today = new Date();
    const daysToShow = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    
    console.log('Sales Chart Debug:', {
      today: today.toISOString(),
      totalSales: sales.length,
      salesDates: sales.map(s => ({ id: s.id, date: s.date, createdAt: s.createdAt })),
      timeRange: timeRange,
      daysToShow: daysToShow
    });
    
    // Generate array of dates for the time range
    const dates = [];
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }

    // Process each date
    return dates.map(date => {
      // Find sales for this specific date
      const daySales = sales.filter(sale => {
        // Use created_at if date is not available (for backward compatibility)
        const saleDateField = sale.date || sale.createdAt;
        if (!saleDateField) return false;
        
        const saleDate = new Date(saleDateField);
        
        // Compare dates by setting time to start of day
        const saleDay = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate());
        const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        const matches = saleDay.getTime() === targetDay.getTime();
        
        // Debug log for each date comparison
        if (matches) {
          console.log('Found matching sale:', {
            saleId: sale.id,
            saleDateField,
            saleDay: saleDay.toDateString(),
            targetDay: targetDay.toDateString(),
            amount: sale.totalAmount
          });
        }
        
        return matches;
      });

      // Calculate total amount for this day
      const totalAmount = daySales.reduce((sum, sale) => {
        return sum + parseFloat(sale.totalAmount || '0');
      }, 0);

      return {
        date: date,
        displayDate: date.toLocaleDateString('en-IN', { 
          weekday: timeRange === '7days' ? 'short' : 'short',
          month: timeRange === '7days' ? undefined : 'short',
          day: timeRange === '7days' ? undefined : 'numeric'
        }),
        amount: totalAmount,
        count: daySales.length,
        sales: daySales
      };
    });
  }, [sales, timeRange]);

  // Calculate metrics
  const totalAmount = chartData.reduce((sum, day) => sum + day.amount, 0);
  const totalSales = chartData.reduce((sum, day) => sum + day.count, 0);
  const avgDailyAmount = totalAmount / chartData.length;
  const maxAmount = Math.max(...chartData.map(d => d.amount));
  const bestDay = chartData.reduce((best, day) => day.amount > best.amount ? day : best);

  // Calculate growth
  const growth = useMemo(() => {
    if (chartData.length < 2) return 0;
    
    const recentDays = chartData.slice(-7);
    const previousDays = chartData.slice(-14, -7);
    
    const recentTotal = recentDays.reduce((sum, day) => sum + day.amount, 0);
    const previousTotal = previousDays.reduce((sum, day) => sum + day.amount, 0);
    
    return previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal) * 100 : 0;
  }, [chartData]);

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

  // Calculate Y-axis scale
  const getYAxisScale = (maxValue: number) => {
    if (maxValue === 0) return 100000;
    
    // Find appropriate scale for the max value
    const scale = Math.pow(10, Math.floor(Math.log10(maxValue)));
    const multiplier = Math.ceil(maxValue / scale);
    
    if (multiplier <= 2) return scale * 2;
    if (multiplier <= 5) return scale * 5;
    return scale * 10;
  };

  const yAxisMax = getYAxisScale(maxAmount);
  const chartMax = Math.max(yAxisMax, maxAmount * 1.1);

  return (
    <Card className="lg:col-span-2 card-shadow-lg bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Sales Trend</CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {timeRange === '7days' ? 'Weekly' : timeRange === '30days' ? 'Monthly' : 'Quarterly'} Total
              </p>
              <p className="text-lg font-semibold">{formatCurrency(totalAmount)}</p>
              {growth !== 0 && (
                <div className="flex items-center text-xs">
                  {growth > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span className={growth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(growth).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-40 input-modern">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <div className="h-64 bg-muted/30 rounded-[var(--radius)] flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <p className="text-muted-foreground font-medium">No sales data available</p>
              <p className="text-sm text-muted-foreground/70 mt-2">Record your first sale to see trends</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Chart */}
            <div className="h-64 flex items-end justify-between gap-2 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground pr-2">
                <span>{formatCurrency(chartMax)}</span>
                <span>{formatCurrency(chartMax * 0.75)}</span>
                <span>{formatCurrency(chartMax * 0.5)}</span>
                <span>{formatCurrency(chartMax * 0.25)}</span>
                <span>₹0</span>
              </div>
              
              {/* Chart bars */}
              <div className="flex-1 flex items-end justify-between gap-1 ml-12">
                {chartData.map((day, index) => {
                  const barHeight = chartMax > 0 ? (day.amount / chartMax) * 100 : 0;
                  const hasSales = day.amount > 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gradient-to-t from-primary/20 to-primary/40 rounded-t-lg relative group h-full">
                        <div 
                          className={`rounded-t-lg transition-all duration-300 group-hover:from-primary/90 group-hover:to-primary w-full ${
                            hasSales 
                              ? 'bg-gradient-to-t from-primary to-primary/80' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                          style={{ 
                            height: `${barHeight}%`,
                            minHeight: hasSales ? '4px' : '0px'
                          }}
                        />
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg px-3 py-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                          <div className="font-medium">{formatCurrency(day.amount)}</div>
                          <div className="text-muted-foreground">{day.count} sales</div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">{day.displayDate}</p>
                      <p className="text-xs text-muted-foreground">{day.count} sales</p>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-lg font-semibold">{formatNumber(totalSales)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Avg Daily</p>
                <p className="text-lg font-semibold">{formatCurrency(avgDailyAmount)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Best Day</p>
                <p className="text-lg font-semibold">{bestDay.displayDate}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Growth</p>
                <p className={`text-lg font-semibold ${growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
