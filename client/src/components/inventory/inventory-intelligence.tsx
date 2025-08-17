import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Calendar,
  ShoppingCart,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Eye,
  Plus,
  Minus
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  location: string;
  lastUpdated: Date;
  supplier: string;
  leadTime: number; // days
  demandTrend: "increasing" | "decreasing" | "stable";
  seasonalFactor: number; // 0.5 to 2.0
}

interface ReorderAlert {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  minStock: number;
  suggestedOrder: number;
  urgency: "low" | "medium" | "high" | "critical";
  estimatedCost: number;
  supplier: string;
  leadTime: number;
}

interface DemandForecast {
  month: string;
  predicted: number;
  actual: number;
  confidence: number;
}

export default function InventoryIntelligence() {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [reorderAlerts, setReorderAlerts] = useState<ReorderAlert[]>([]);
  const [demandForecast, setDemandForecast] = useState<DemandForecast[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  // Simulated data
  useEffect(() => {
    const mockInventory: InventoryItem[] = [
      {
        id: "1",
        name: "Ruby 5.2ct",
        category: "Ruby",
        currentStock: 3,
        minStock: 5,
        maxStock: 20,
        unitPrice: 25000,
        location: "Vault A",
        lastUpdated: new Date(),
        supplier: "Sri Lanka Gems",
        leadTime: 15,
        demandTrend: "increasing",
        seasonalFactor: 1.8
      },
      {
        id: "2",
        name: "Blue Sapphire 6.8ct",
        category: "Blue Sapphire",
        currentStock: 2,
        minStock: 4,
        maxStock: 15,
        unitPrice: 35000,
        location: "Vault B",
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        supplier: "Myanmar Stones",
        leadTime: 20,
        demandTrend: "stable",
        seasonalFactor: 1.2
      },
      {
        id: "3",
        name: "Yellow Sapphire 4.5ct",
        category: "Yellow Sapphire",
        currentStock: 8,
        minStock: 3,
        maxStock: 12,
        unitPrice: 12000,
        location: "Vault A",
        lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        supplier: "Thailand Gems",
        leadTime: 12,
        demandTrend: "decreasing",
        seasonalFactor: 0.7
      },
      {
        id: "4",
        name: "Emerald 3.2ct",
        category: "Emerald",
        currentStock: 1,
        minStock: 3,
        maxStock: 10,
        unitPrice: 18000,
        location: "Vault C",
        lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        supplier: "Colombia Gems",
        leadTime: 25,
        demandTrend: "increasing",
        seasonalFactor: 1.5
      }
    ];

    const mockReorderAlerts: ReorderAlert[] = [
      {
        id: "1",
        itemId: "1",
        itemName: "Ruby 5.2ct",
        currentStock: 3,
        minStock: 5,
        suggestedOrder: 8,
        urgency: "high",
        estimatedCost: 200000,
        supplier: "Sri Lanka Gems",
        leadTime: 15
      },
      {
        id: "2",
        itemId: "2",
        itemName: "Blue Sapphire 6.8ct",
        currentStock: 2,
        minStock: 4,
        suggestedOrder: 6,
        urgency: "critical",
        estimatedCost: 210000,
        supplier: "Myanmar Stones",
        leadTime: 20
      },
      {
        id: "3",
        itemId: "4",
        itemName: "Emerald 3.2ct",
        currentStock: 1,
        minStock: 3,
        suggestedOrder: 5,
        urgency: "critical",
        estimatedCost: 90000,
        supplier: "Colombia Gems",
        leadTime: 25
      }
    ];

    const mockDemandForecast: DemandForecast[] = [
      { month: "Jan", predicted: 45, actual: 42, confidence: 85 },
      { month: "Feb", predicted: 38, actual: 35, confidence: 82 },
      { month: "Mar", predicted: 52, actual: 55, confidence: 88 },
      { month: "Apr", predicted: 41, actual: 38, confidence: 80 },
      { month: "May", predicted: 48, actual: 52, confidence: 85 },
      { month: "Jun", predicted: 55, actual: 58, confidence: 90 }
    ];

    setInventory(mockInventory);
    setReorderAlerts(mockReorderAlerts);
    setDemandForecast(mockDemandForecast);
  }, []);

  const categories = ["all", "Ruby", "Blue Sapphire", "Yellow Sapphire", "Emerald", "Diamond", "Pearl"];
  const locations = ["all", "Vault A", "Vault B", "Vault C", "Display Case", "Storage Room"];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDemandTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "decreasing": return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStockLevel = (current: number, min: number, max: number) => {
    const percentage = ((current - min) / (max - min)) * 100;
    if (current <= min) return { level: "critical", percentage: 0, color: "text-red-600" };
    if (percentage < 30) return { level: "low", percentage, color: "text-orange-600" };
    if (percentage < 70) return { level: "medium", percentage, color: "text-yellow-600" };
    return { level: "good", percentage, color: "text-green-600" };
  };

  const filteredInventory = inventory.filter(item => {
    const categoryMatch = selectedCategory === "all" || item.category === selectedCategory;
    const locationMatch = selectedLocation === "all" || item.location === selectedLocation;
    return categoryMatch && locationMatch;
  });

  const criticalItems = inventory.filter(item => item.currentStock <= item.minStock);
  const lowStockItems = inventory.filter(item => 
    item.currentStock > item.minStock && 
    item.currentStock <= item.minStock + Math.ceil((item.maxStock - item.minStock) * 0.3)
  );

  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
  const totalReorderCost = reorderAlerts.reduce((sum, alert) => sum + alert.estimatedCost, 0);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Inventory Intelligence
        </h2>
        <p className="text-muted-foreground">
          Smart inventory management with AI-powered insights and alerts
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">
              {criticalItems.length} need reordering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalInventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reorder Cost</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalReorderCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {reorderAlerts.length} items to order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(((inventory.length - criticalItems.length) / inventory.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {criticalItems.length} critical items
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Reorder Alerts</TabsTrigger>
          <TabsTrigger value="forecast">Demand Forecast</TabsTrigger>
          <TabsTrigger value="locations">Storage Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Levels Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Level Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredInventory.map(item => {
                    const stockLevel = getStockLevel(item.currentStock, item.minStock, item.maxStock);
                    return (
                      <div key={item.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className={`text-sm font-bold ${stockLevel.color}`}>
                            {item.currentStock}/{item.maxStock}
                          </span>
                        </div>
                        <Progress value={stockLevel.percentage} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Min: {item.minStock}</span>
                          <span className="flex items-center gap-1">
                            {getDemandTrendIcon(item.demandTrend)}
                            {item.demandTrend}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Seasonal Demand */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Demand Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredInventory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="seasonalFactor" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-xs text-muted-foreground text-center">
                  Factor &gt; 1.0 = High season, &lt; 1.0 = Low season
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Reorder Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reorderAlerts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No reorder alerts - all stock levels are healthy!
                  </div>
                ) : (
                  reorderAlerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          alert.urgency === "critical" ? "bg-red-500" :
                          alert.urgency === "high" ? "bg-orange-500" :
                          alert.urgency === "medium" ? "bg-yellow-500" : "bg-green-500"
                        }`} />
                        <div>
                          <div className="font-medium">{alert.itemName}</div>
                          <div className="text-sm text-muted-foreground">
                            Current: {alert.currentStock} | Min: {alert.minStock}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Supplier: {alert.supplier} | Lead Time: {alert.leadTime} days
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <Badge className={getUrgencyColor(alert.urgency)}>
                          {alert.urgency.toUpperCase()}
                        </Badge>
                        <div className="text-sm">
                          <div className="font-medium">Order: {alert.suggestedOrder}</div>
                          <div className="text-muted-foreground">
                            ₹{alert.estimatedCost.toLocaleString()}
                          </div>
                        </div>
                        <Button size="sm">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Order Now
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demand Forecasting</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={demandForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="predicted" stroke="#8884d8" strokeWidth={3} name="Predicted" />
                  <Line type="monotone" dataKey="actual" stroke="#82ca9d" strokeWidth={3} name="Actual" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(demandForecast.reduce((sum, f) => sum + f.confidence, 0) / demandForecast.length)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Confidence</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {demandForecast.filter(f => Math.abs(f.predicted - f.actual) <= 5).length}/{demandForecast.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Accurate Predictions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(demandForecast.reduce((sum, f) => sum + f.predicted, 0) / demandForecast.length)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Monthly Demand</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Location Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Storage Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(inventory.map(item => item.location))).map(location => {
                    const locationItems = inventory.filter(item => item.location === location);
                    const locationValue = locationItems.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
                    return (
                      <div key={location} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{location}</span>
                          <Badge variant="outline">{locationItems.length} items</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Value: ₹{locationValue.toLocaleString()}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {locationItems.filter(item => item.currentStock <= item.minStock).length} need reordering
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat === "all" ? "All Categories" : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(loc => (
                        <SelectItem key={loc} value={loc}>
                          {loc === "all" ? "All Locations" : loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Quick Actions</Label>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Low Stock Items
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Bulk Reorder
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
