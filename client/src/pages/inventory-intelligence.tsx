import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Package, TrendingUp, MapPin, Calendar, BarChart3, LineChart, BarChart } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  maxStock: number;
  unitPrice: number;
  location: string;
  lastRestocked: Date;
  supplier: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface DemandForecast {
  month: string;
  predicted: number;
  actual: number;
}

interface StorageLocation {
  name: string;
  itemCount: number;
  capacity: number;
  utilization: number;
}

// Simulated data
const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Burma Ruby 5ct',
    category: 'Ruby',
    currentStock: 8,
    reorderPoint: 15,
    maxStock: 50,
    unitPrice: 14500,
    location: 'Vault A',
    lastRestocked: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    supplier: 'Burma Gems Ltd',
    urgency: 'critical'
  },
  {
    id: '2',
    name: 'Sri Lanka Sapphire 3ct',
    category: 'Sapphire',
    currentStock: 12,
    reorderPoint: 10,
    maxStock: 40,
    unitPrice: 30000,
    location: 'Vault B',
    lastRestocked: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    supplier: 'Ceylon Stones',
    urgency: 'medium'
  },
  {
    id: '3',
    name: 'Colombian Emerald 2ct',
    category: 'Emerald',
    currentStock: 5,
    reorderPoint: 12,
    maxStock: 35,
    unitPrice: 25000,
    location: 'Vault A',
    lastRestocked: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    supplier: 'Colombia Minerals',
    urgency: 'high'
  },
  {
    id: '4',
    name: 'Tanzanite 4ct',
    category: 'Tanzanite',
    currentStock: 20,
    reorderPoint: 8,
    maxStock: 30,
    unitPrice: 18000,
    location: 'Vault C',
    lastRestocked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    supplier: 'Tanzania Gems',
    urgency: 'low'
  }
];

const mockDemandForecast: DemandForecast[] = [
  { month: 'Jan', predicted: 45, actual: 42 },
  { month: 'Feb', predicted: 48, actual: 50 },
  { month: 'Mar', predicted: 52, actual: 55 },
  { month: 'Apr', predicted: 55, actual: 58 },
  { month: 'May', predicted: 58, actual: 60 },
  { month: 'Jun', predicted: 60, actual: 62 }
];

const mockStorageLocations: StorageLocation[] = [
  { name: 'Vault A', itemCount: 45, capacity: 100, utilization: 45 },
  { name: 'Vault B', itemCount: 38, capacity: 80, utilization: 47.5 },
  { name: 'Vault C', itemCount: 22, capacity: 60, utilization: 36.7 },
  { name: 'Display Case 1', itemCount: 15, capacity: 25, utilization: 60 },
  { name: 'Display Case 2', itemCount: 12, capacity: 20, utilization: 60 }
];

const seasonalDemand = [
  { month: 'Jan', Ruby: 65, Sapphire: 45, Emerald: 35, Diamond: 80 },
  { month: 'Feb', Ruby: 70, Sapphire: 50, Emerald: 40, Diamond: 85 },
  { month: 'Mar', Ruby: 75, Sapphire: 55, Emerald: 45, Diamond: 90 },
  { month: 'Apr', Ruby: 80, Sapphire: 60, Emerald: 50, Diamond: 95 },
  { month: 'May', Ruby: 85, Sapphire: 65, Emerald: 55, Diamond: 100 },
  { month: 'Jun', Ruby: 90, Sapphire: 70, Emerald: 60, Diamond: 105 }
];

export default function InventoryIntelligence() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'low': return <AlertTriangle className="h-4 w-4 text-green-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredItems = mockInventoryItems.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedLocation !== 'all' && item.location !== selectedLocation) return false;
    return true;
  });

  const totalInventoryValue = mockInventoryItems.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
  const reorderCost = mockInventoryItems
    .filter(item => item.currentStock <= item.reorderPoint)
    .reduce((sum, item) => sum + ((item.maxStock - item.currentStock) * item.unitPrice), 0);

  const stockHealthScore = Math.round(
    (mockInventoryItems.filter(item => item.currentStock > item.reorderPoint).length / mockInventoryItems.length) * 100
  );

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const categories = ['all', ...Array.from(new Set(mockInventoryItems.map(item => item.category)))];
  const locations = ['all', ...Array.from(new Set(mockInventoryItems.map(item => item.location)))];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Intelligence</h1>
          <p className="text-gray-600">Smart inventory management with AI-powered insights</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-blue-600">{mockInventoryItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalInventoryValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Reorder Cost</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(reorderCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Stock Health</p>
                <p className="text-2xl font-bold text-purple-600">{stockHealthScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reorder">Reorder Alerts</TabsTrigger>
          <TabsTrigger value="demand">Demand Forecast</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Level Overview</CardTitle>
                <CardDescription>Current stock levels vs. reorder points</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockInventoryItems.map(item => {
                  const stockPercentage = (item.currentStock / item.maxStock) * 100;
                  const isLowStock = item.currentStock <= item.reorderPoint;
                  
                  return (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className={isLowStock ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                          {item.currentStock}/{item.maxStock}
                        </span>
                      </div>
                      <Progress 
                        value={stockPercentage} 
                        className={isLowStock ? 'h-2 bg-red-100' : 'h-2'}
                      />
                      {isLowStock && (
                        <div className="flex items-center space-x-1 text-xs text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Reorder needed</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Seasonal Demand */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Demand Trends</CardTitle>
                <CardDescription>Monthly demand patterns by gemstone type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={seasonalDemand}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Ruby" fill="#dc2626" />
                    <Bar dataKey="Sapphire" fill="#2563eb" />
                    <Bar dataKey="Emerald" fill="#059669" />
                    <Bar dataKey="Diamond" fill="#7c3aed" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reorder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span>Reorder Alerts</span>
              </CardTitle>
              <CardDescription>Items that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredItems
                  .filter(item => item.currentStock <= item.reorderPoint)
                  .sort((a, b) => {
                    const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
                  })
                  .map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{item.name}</h3>
                          <Badge variant="outline" className={getUrgencyColor(item.urgency)}>
                            {getUrgencyIcon(item.urgency)}
                            <span className="ml-1 capitalize">{item.urgency}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Current Stock:</span>
                            <span className="ml-2 text-red-600 font-semibold">{item.currentStock}</span>
                          </div>
                          <div>
                            <span className="font-medium">Reorder Point:</span>
                            <span className="ml-2">{item.reorderPoint}</span>
                          </div>
                          <div>
                            <span className="font-medium">Suggested Qty:</span>
                            <span className="ml-2 text-green-600 font-semibold">
                              {item.maxStock - item.currentStock}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Cost:</span>
                            <span className="ml-2">{formatCurrency((item.maxStock - item.currentStock) * item.unitPrice)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{item.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Last restocked: {item.lastRestocked.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <Button size="sm" variant="outline">
                          Reorder Now
                        </Button>
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demand Forecasting</CardTitle>
              <CardDescription>Predicted vs. actual demand trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={mockDemandForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} name="Predicted" />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Storage Locations */}
            <Card>
              <CardHeader>
                <CardTitle>Storage Locations</CardTitle>
                <CardDescription>Inventory distribution across storage areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 mb-4">
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location === 'all' ? 'All Locations' : location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {mockStorageLocations.map(location => (
                  <div key={location.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{location.name}</span>
                      <span className="text-gray-600">
                        {location.itemCount}/{location.capacity} items
                      </span>
                    </div>
                    <Progress value={location.utilization} className="h-2" />
                    <div className="text-xs text-gray-500">
                      {location.utilization.toFixed(1)}% utilization
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Storage Utilization Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Storage Utilization</CardTitle>
                <CardDescription>Current storage capacity usage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockStorageLocations}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, utilization }) => `${name}: ${utilization.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="utilization"
                    >
                      {mockStorageLocations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
