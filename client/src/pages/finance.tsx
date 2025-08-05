import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type Sale, type Inventory } from "@shared/schema";
import { TrendingUp, DollarSign, ShoppingBag, Target, BarChart3, PieChart } from "lucide-react";

export default function Finance() {
  const { data: sales = [], isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: inventory = [], isLoading: inventoryLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

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

  // Calculate financial metrics
  const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
  const totalProfit = sales.reduce((sum, sale) => sum + parseFloat(sale.profit), 0);
  const totalCostOfGoods = totalRevenue - totalProfit;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Current month calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });
  const monthlyRevenue = currentMonthSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
  const monthlyProfit = currentMonthSales.reduce((sum, sale) => sum + parseFloat(sale.profit), 0);

  // Inventory value
  const totalInventoryValue = inventory.reduce((sum, item) => sum + parseFloat(item.sellingPrice), 0);
  const totalInventoryCost = inventory.reduce((sum, item) => sum + parseFloat(item.purchasePrice), 0);

  // Outstanding payments
  const outstandingPayments = sales
    .filter(sale => sale.paymentStatus === 'Unpaid' || sale.paymentStatus === 'Partial')
    .reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);

  // Top performing stones by revenue
  const stoneRevenue = new Map<string, { revenue: number; profit: number; count: number }>();
  sales.forEach(sale => {
    if (sale.stoneId) {
      const stone = inventory.find(item => item.id === sale.stoneId);
      if (stone) {
        const existing = stoneRevenue.get(stone.type) || { revenue: 0, profit: 0, count: 0 };
        stoneRevenue.set(stone.type, {
          revenue: existing.revenue + parseFloat(sale.totalAmount),
          profit: existing.profit + parseFloat(sale.profit),
          count: existing.count + 1
        });
      }
    }
  });

  const topStones = Array.from(stoneRevenue.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
          <p className="text-gray-600">Monitor your business performance and profitability</p>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-green-600 mt-1">All time</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Profit</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalProfit)}</p>
                <p className="text-sm text-blue-600 mt-1">{formatPercentage(profitMargin)} margin</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyRevenue)}</p>
                <p className="text-sm text-purple-600 mt-1">{currentMonthSales.length} sales</p>
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
                <p className="text-sm font-medium text-gray-500">Outstanding Payments</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(outstandingPayments)}</p>
                <p className="text-sm text-orange-600 mt-1">Pending collection</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-orange-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <span className="text-gray-600">Total Inventory Value</span>
                <span className="font-semibold text-lg">{formatCurrency(totalInventoryValue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Inventory Cost</span>
                <span className="font-semibold text-lg">{formatCurrency(totalInventoryCost)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-gray-600">Potential Profit</span>
                <span className="font-semibold text-lg text-green-600">
                  {formatCurrency(totalInventoryValue - totalInventoryCost)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Items in Stock</span>
                <span className="font-semibold">{inventory.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>This Month Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenue</span>
                <span className="font-semibold text-lg">{formatCurrency(monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Profit</span>
                <span className="font-semibold text-lg text-green-600">{formatCurrency(monthlyProfit)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sales Count</span>
                <span className="font-semibold">{currentMonthSales.length}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-gray-600">Avg Sale Value</span>
                <span className="font-semibold">
                  {currentMonthSales.length > 0 
                    ? formatCurrency(monthlyRevenue / currentMonthSales.length)
                    : formatCurrency(0)
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Stones */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle>Top Performing Gemstone Types</CardTitle>
        </CardHeader>
        <CardContent>
          {topStones.length === 0 ? (
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topStones.map(([stoneType, data]) => (
                    <TableRow key={stoneType}>
                      <TableCell className="font-medium">{stoneType}</TableCell>
                      <TableCell>{formatCurrency(data.revenue)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(data.profit)}</TableCell>
                      <TableCell>{data.count}</TableCell>
                      <TableCell>{formatCurrency(data.revenue / data.count)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {formatPercentage((data.profit / data.revenue) * 100)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
