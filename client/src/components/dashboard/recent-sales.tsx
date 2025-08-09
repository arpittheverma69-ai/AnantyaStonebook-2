import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, User, Gem } from "lucide-react";

interface RecentSalesProps {
  sales?: Array<{
    id: string;
    clientName: string;
    gemName: string;
    totalAmount: string;
    saleDate: string;
    status: string;
  }>;
}

export default function RecentSales({ sales }: RecentSalesProps) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(parseFloat(amount) || 0);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (!sales || sales.length === 0) {
    return (
      <Card className="card-shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No recent sales data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recent Sales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sales.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Gem className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{sale.gemName || 'Unknown Gem'}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {sale.clientName || 'Unknown Client'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">
                  {formatCurrency(sale.totalAmount)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={sale.status === 'Completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {sale.status || 'Completed'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(sale.saleDate)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
