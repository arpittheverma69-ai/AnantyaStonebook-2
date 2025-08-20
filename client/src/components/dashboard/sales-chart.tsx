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
    
    // Determine how many data points to show based on time range
    let dataPoints: number;
    let groupBy: 'day' | 'week' | 'month';
    
    if (timeRange === '7days') {
      dataPoints = 7;
      groupBy = 'day';
    } else if (timeRange === '30days') {
      dataPoints = 10; // Show 10 data points instead of 30
      groupBy = 'day';
    } else {
      dataPoints = 12; // Show 12 weeks for 90 days
      groupBy = 'week';
    }
    
    // Generate array of dates for the time range
    const dates = [];
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }

    // Group dates based on the grouping strategy
    let groupedData: Array<{ startDate: Date; endDate: Date; dates: Date[] }> = [];
    
    if (groupBy === 'day') {
      // For daily grouping, take every nth day to reduce data points
      const step = Math.ceil(dates.length / dataPoints);
      for (let i = 0; i < dates.length; i += step) {
        const groupDates = dates.slice(i, i + step);
        groupedData.push({
          startDate: groupDates[0],
          endDate: groupDates[groupDates.length - 1],
          dates: groupDates
        });
      }
    } else if (groupBy === 'week') {
      // Group by weeks
      for (let i = 0; i < dates.length; i += 7) {
        const groupDates = dates.slice(i, i + 7);
        groupedData.push({
          startDate: groupDates[0],
          endDate: groupDates[groupDates.length - 1],
          dates: groupDates
        });
      }
    }

    // Process each group
    return groupedData.map((group, groupIndex) => {
      // Find sales for this date range
      const groupSales = sales.filter(sale => {
        const saleDateField = sale.date || sale.createdAt;
        if (!saleDateField) return false;
        
        const saleDate = new Date(saleDateField);
        
        // Normalize dates to start of day for comparison
        const saleDay = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate());
        const groupStartDay = new Date(group.startDate.getFullYear(), group.startDate.getMonth(), group.startDate.getDate());
        const groupEndDay = new Date(group.endDate.getFullYear(), group.endDate.getMonth(), group.endDate.getDate());
        
        // Check if sale is within this group's date range
        const isInRange = saleDay >= groupStartDay && saleDay <= groupEndDay;
        
        // Debug logging for sales matching
        if (isInRange) {
          console.log('Sale matched to group:', {
            groupIndex,
            saleId: sale.id,
            saleDate: saleDate.toDateString(),
            saleDay: saleDay.toDateString(),
            groupStart: groupStartDay.toDateString(),
            groupEnd: groupEndDay.toDateString(),
            amount: sale.totalAmount
          });
        }
        
        return isInRange;
      });

      // Calculate total amount for this group
      const totalAmount = groupSales.reduce((sum, sale) => {
        const amount = parseFloat(sale.totalAmount || '0');
        console.log('Adding sale amount:', { saleId: sale.id, amount, runningTotal: sum + amount });
        return sum + amount;
      }, 0);

      // Create display date based on grouping
      let displayDate: string;
      if (groupBy === 'day') {
        if (group.dates.length === 1) {
          displayDate = group.startDate.toLocaleDateString('en-IN', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
        } else {
          displayDate = `${group.startDate.getDate()}-${group.endDate.getDate()} ${group.startDate.toLocaleDateString('en-IN', { month: 'short' })}`;
        }
      } else {
        displayDate = `Week ${groupIndex + 1}`;
      }

      const result = {
        date: group.startDate,
        displayDate: displayDate,
        amount: totalAmount,
        count: groupSales.length,
        sales: groupSales
      };

      console.log('Group result:', {
        groupIndex,
        displayDate,
        totalAmount,
        salesCount: groupSales.length,
        sales: groupSales.map(s => ({ id: s.id, amount: s.totalAmount }))
      });

      return result;
    });
    
    console.log('Final chart data:', chartData.map(d => ({
      displayDate: d.displayDate,
      amount: d.amount,
      count: d.count
    })));
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
              <div className="flex-1 flex items-end justify-between gap-2 ml-12">
                {chartData.map((day, index) => {
                  const barHeight = chartMax > 0 ? (day.amount / chartMax) * 100 : 0;
                  const hasSales = day.amount > 0;
                  
                  console.log('Bar calculation:', {
                    index,
                    displayDate: day.displayDate,
                    amount: day.amount,
                    chartMax,
                    barHeight: `${barHeight}%`,
                    hasSales
                  });
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center min-w-0">
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
                      <p className="text-xs text-muted-foreground mt-2 text-center truncate w-full">{day.displayDate}</p>
                      {day.count > 0 && (
                        <p className="text-xs text-primary font-medium">{day.count} sales</p>
                      )}
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
