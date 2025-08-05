import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { type Inventory } from "@shared/schema";
import { Gem } from "lucide-react";
import { Link } from "wouter";

export default function RecentInventory() {
  const { data: inventory = [] } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  // Show most recent 3 items
  const recentItems = inventory.slice(0, 3);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
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
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <Card className="card-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Inventory</CardTitle>
          <Link href="/inventory">
            <Button variant="link" className="text-primary">Manage Inventory</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No inventory items found</p>
              <p className="text-sm text-gray-400 mt-1">Add your first stone to see it here</p>
            </div>
          ) : (
            recentItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getStoneColor(item.type)} rounded-lg flex items-center justify-center`}>
                    <Gem className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.type}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{item.carat} Carat</span>
                      <span>{item.origin}</span>
                      <Badge 
                        variant={item.certified ? "default" : "secondary"}
                        className={item.certified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                      >
                        {item.certified ? "Certified" : "Pending Cert"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(item.sellingPrice)}</p>
                  <p className="text-sm text-gray-500">{item.stoneId}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
