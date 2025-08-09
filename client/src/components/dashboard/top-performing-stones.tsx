import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gem, TrendingUp, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Inventory } from "@shared/schema";
import { type Sale } from "@shared/schema";

interface StonePerformance {
  type: string;
  totalSales: number;
  totalRevenue: number;
  avgPrice: number;
  demandScore: number;
  stockLevel: number;
}

export default function TopPerformingStones() {
  const { data: inventory = [] } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  // Calculate stone performance
  const stonePerformance: StonePerformance[] = inventory.reduce((acc, item) => {
    const existing = acc.find(stone => stone.type === item.type);
    const itemSales = sales.filter(sale => sale.stoneId === item.id);
    const itemRevenue = itemSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
    
    if (existing) {
      existing.totalSales += itemSales.length;
      existing.totalRevenue += itemRevenue;
      existing.stockLevel += parseFloat(item.quantity);
    } else {
      acc.push({
        type: item.type,
        totalSales: itemSales.length,
        totalRevenue: itemRevenue,
        avgPrice: parseFloat(item.pricePerCarat),
        demandScore: itemSales.length * parseFloat(item.pricePerCarat),
        stockLevel: parseFloat(item.quantity)
      });
    }
    
    return acc;
  }, [] as StonePerformance[]);

  // Sort by demand score and take top 5
  const topStones = stonePerformance
    .sort((a, b) => b.demandScore - a.demandScore)
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStoneColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'blue sapphire':
        return 'from-blue-400 to-purple-500';
      case 'ruby':
        return 'from-red-400 to-pink-500';
      case 'emerald':
        return 'from-green-400 to-emerald-500';
      case 'yellow sapphire':
        return 'from-yellow-400 to-orange-500';
      case 'diamond':
        return 'from-gray-400 to-gray-500';
      case 'pearl':
        return 'from-pink-400 to-rose-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getDemandLevel = (score: number) => {
    if (score > 1000000) return { level: 'Very High', color: 'bg-red-100 text-red-800' };
    if (score > 500000) return { level: 'High', color: 'bg-orange-100 text-orange-800' };
    if (score > 100000) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'Low', color: 'bg-gray-100 text-gray-800' };
  };

  if (topStones.length === 0) {
    return (
      <Card className="card-shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gem className="h-5 w-5" />
            Top Performing Stones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No stone performance data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gem className="h-5 w-5" />
          Top Performing Stones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topStones.map((stone, index) => {
            const demand = getDemandLevel(stone.demandScore);
            return (
              <div key={stone.type} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${getStoneColor(stone.type)} rounded-lg flex items-center justify-center`}>
                      <Gem className="text-white h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{stone.type}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        {stone.totalSales} sales
                        <Badge className={demand.color + " text-xs"}>
                          {demand.level} Demand
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    {formatCurrency(stone.totalRevenue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(stone.avgPrice)}/ct • {stone.stockLevel} in stock
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
