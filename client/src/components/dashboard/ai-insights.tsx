import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Inventory } from "@shared/schema";
import { type Sale } from "@shared/schema";

interface AIInsight {
  type: 'growth' | 'demand' | 'stock' | 'trend';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
  icon: React.ReactNode;
}

export default function AIInsights() {
  const { data: inventory = [] } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  // Generate AI insights based on data
  const generateInsights = (): AIInsight[] => {
    const insights: AIInsight[] = [];

    // Stock level insights
    const lowStockItems = inventory.filter(item => parseFloat(item.quantity) < 5);
    if (lowStockItems.length > 0) {
      insights.push({
        type: 'stock',
        title: 'Low Stock Alert',
        description: `${lowStockItems.length} items are running low on stock. Consider restocking ${lowStockItems[0].type} and ${lowStockItems.slice(1, 2).map(item => item.type).join(', ')}.`,
        priority: 'high',
        action: 'Restock immediately',
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />
      });
    }

    // Demand insights
    const stoneTypes = [...new Set(inventory.map(item => item.type))];
    const demandAnalysis = stoneTypes.map(type => {
      const typeSales = sales.filter(sale => {
        const saleItem = inventory.find(item => item.id === sale.stoneId);
        return saleItem?.type === type;
      });
      return { type, sales: typeSales.length };
    }).sort((a, b) => b.sales - a.sales);

    if (demandAnalysis.length > 0) {
      const topDemand = demandAnalysis[0];
      insights.push({
        type: 'demand',
        title: 'High Demand Detected',
        description: `${topDemand.type} is showing the highest demand with ${topDemand.sales} sales. Consider increasing inventory for this stone type.`,
        priority: 'medium',
        action: 'Increase inventory',
        icon: <TrendingUp className="h-4 w-4 text-green-500" />
      });
    }

    // Growth opportunities
    const avgSaleValue = sales.length > 0 
      ? sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0) / sales.length 
      : 0;
    
    if (avgSaleValue > 100000) {
      insights.push({
        type: 'growth',
        title: 'Premium Market Opportunity',
        description: 'Your average sale value is high. Consider expanding your premium stone collection and targeting high-end clients.',
        priority: 'medium',
        action: 'Expand premium inventory',
        icon: <Target className="h-4 w-4 text-blue-500" />
      });
    }

    // Seasonal trends
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 9 && currentMonth <= 11) { // Oct-Dec
      insights.push({
        type: 'trend',
        title: 'Festival Season Strategy',
        description: 'Festival season is approaching. Stock up on popular stones like Blue Sapphire and Ruby for increased demand.',
        priority: 'medium',
        action: 'Seasonal stocking',
        icon: <Zap className="h-4 w-4 text-yellow-500" />
      });
    }

    // Price optimization
    const priceVariations = inventory.reduce((acc, item) => {
      const existing = acc.find(p => p.type === item.type);
      if (existing) {
        existing.prices.push(parseFloat(item.pricePerCarat));
      } else {
        acc.push({ type: item.type, prices: [parseFloat(item.pricePerCarat)] });
      }
      return acc;
    }, [] as { type: string; prices: number[] }[]);

    const priceOptimization = priceVariations.find(p => {
      const avg = p.prices.reduce((sum, price) => sum + price, 0) / p.prices.length;
      const variance = p.prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / p.prices.length;
      return variance > 1000000; // High price variance
    });

    if (priceOptimization) {
      insights.push({
        type: 'growth',
        title: 'Price Optimization Opportunity',
        description: `${priceOptimization.type} shows significant price variations. Consider standardizing pricing for better market positioning.`,
        priority: 'low',
        action: 'Review pricing strategy',
        icon: <Lightbulb className="h-4 w-4 text-purple-500" />
      });
    }

    return insights.slice(0, 4); // Show top 4 insights
  };

  const insights = generateInsights();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (insights.length === 0) {
    return (
      <Card className="card-shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No insights available yet. Add more data to get AI-powered recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {insight.priority} priority
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{insight.description}</p>
                  {insight.action && (
                    <p className="text-xs font-medium">
                      💡 <span className="text-blue-600">Recommended Action:</span> {insight.action}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
