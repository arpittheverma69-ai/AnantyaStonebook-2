import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Gem, Clock, Calendar, ArrowUp } from "lucide-react";

interface MetricsCardsProps {
  metrics?: {
    monthlySales: number;
    inventoryValue: number;
    totalStones: number;
    pendingCerts: number;
    followups: number;
    highPriority: number;
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Monthly Sales */}
      <Card className="card-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(metrics.monthlySales)}
              </p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <ArrowUp className="h-4 w-4 mr-1" />
                18% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600 text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Inventory Value */}
      <Card className="card-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(metrics.inventoryValue)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {metrics.totalStones} stones in stock
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Gem className="text-blue-600 text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Pending Certifications */}
      <Card className="card-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Certifications</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.pendingCerts}</p>
              <p className="text-sm text-orange-600 mt-1 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                3 due this week
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="text-orange-600 text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Upcoming Follow-ups */}
      <Card className="card-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Follow-ups Today</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.followups}</p>
              <p className="text-sm text-gray-600 mt-1">
                {metrics.highPriority} high priority
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-purple-600 text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
