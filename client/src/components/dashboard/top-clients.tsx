import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { type Client } from "@shared/schema";

export default function TopClients() {
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // For demo purposes, show first 3 clients
  const topClients = clients.slice(0, 3);

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
                  <p className="font-semibold text-gray-900">₹0</p>
                  <p className="text-sm text-green-600">+0%</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
