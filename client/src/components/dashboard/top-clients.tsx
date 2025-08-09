import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { type Client } from "@shared/schema";
import { type Sale } from "@shared/schema";

interface ClientWithRevenue extends Client {
  totalRevenue: number;
  totalPurchases: number;
}

export default function TopClients() {
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  // Calculate revenue for each client
  const clientsWithRevenue: ClientWithRevenue[] = clients.map(client => {
    const clientSales = sales.filter(sale => sale.clientId === client.id);
    const totalRevenue = clientSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
    const totalPurchases = clientSales.length;
    
    return {
      ...client,
      totalRevenue,
      totalPurchases
    };
  });

  // Sort by revenue and take top 3
  const topClients = clientsWithRevenue
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 3);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getClientTypeColor = (type: string) => {
    switch (type) {
      case 'Jeweler':
        return 'from-blue-400 to-blue-600';
      case 'Astrologer':
        return 'from-purple-400 to-purple-600';
      case 'Temple':
        return 'from-green-400 to-green-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="card-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Top Clients</CardTitle>
          <Button variant="link" className="text-primary">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topClients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No clients found</p>
              <p className="text-sm text-gray-400 mt-1">Add your first client to see them here</p>
            </div>
          ) : (
            topClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${getClientTypeColor(client.clientType)} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-medium text-sm">
                      {getInitials(client.name)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.clientType} - {client.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(client.totalRevenue)}</p>
                  <p className="text-sm text-green-600">{client.totalPurchases} purchases</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
