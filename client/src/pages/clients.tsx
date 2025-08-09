import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { type Client } from "@shared/schema";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  IndianRupee,
  TrendingUp,
  Star,
  Calendar,
  Eye,
  ArrowLeft
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { clientService } from "@/lib/database";
import React from "react";
import { useEffect } from "react";
import { saleService } from "@/lib/database";

interface EnhancedClient extends Client {
  whatTheyWant?: string[];
  totalRevenue?: number;
  totalProfit?: number;
  isRecurring?: boolean;
  isTrustworthy?: boolean;
  lastPurchaseDate?: string;
  totalPurchases?: number;
}

const CLIENT_TYPES = ['Jeweler', 'Astrologer', 'Temple', 'Individual', 'Wholesaler', 'Retailer'];
const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 
  'Dadra and Nagar Haveli', 'Daman and Diu', 'Lakshadweep', 'Puducherry', 'Andaman and Nicobar Islands'
];

const LOYALTY_LEVELS = ['High', 'Medium', 'Low'];

const GEMSTONE_OPTIONS = [
  'Ruby', 'Blue Sapphire', 'Emerald', 'Diamond', 'Yellow Sapphire',
  'Pink Sapphire', 'Pearl', 'Coral', 'Hessonite', "Cat's Eye"
];

export const getClientTypeColor = (type: string) => {
  switch (type) {
    case 'Jeweler':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Astrologer':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'Temple':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Individual':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'Wholesaler':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    case 'Retailer':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClientType, setSelectedClientType] = useState<string>('');
  const [selectedLoyaltyLevel, setSelectedLoyaltyLevel] = useState<string>('');
  const [editingClient, setEditingClient] = useState<EnhancedClient | null>(null);
  const [selectedClient, setSelectedClient] = useState<EnhancedClient | null>(null);
  const [clients, setClients] = useState<EnhancedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Utility: Map snake_case from DB to camelCase for UI
  function mapClientFromDb(item: any): EnhancedClient {
    return {
      ...item,
      clientType: item.client_type,
      gstNumber: item.gst_number,
      businessName: item.business_name,
      businessAddress: item.business_address,
      loyaltyLevel: item.loyalty_level,
      whatTheyWant: item.what_they_want || [],
      isRecurring: item.is_recurring,
      isTrustworthy: item.is_trustworthy,
      lastPurchaseDate: item.last_purchase_date,
      totalPurchases: item.total_purchases,
      totalRevenue: item.total_revenue,
      totalProfit: item.total_profit,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      state: item.state, // <-- Add this line
    };
  }
  // Utility: Map camelCase from UI to snake_case for DB
  function mapClientToDb(item: any) {
    return {
      ...item,
      client_type: item.clientType,
      gst_number: item.gstNumber,
      business_name: item.businessName,
      business_address: item.businessAddress,
      loyalty_level: item.loyaltyLevel,
      what_they_want: item.whatTheyWant,
      is_recurring: item.isRecurring,
      is_trustworthy: item.isTrustworthy,
      last_purchase_date: item.lastPurchaseDate,
      total_purchases: item.totalPurchases,
      total_revenue: item.totalRevenue,
      total_profit: item.totalProfit,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  }

  // Load clients from Supabase
  async function loadClients() {
    setLoading(true);
    try {
      const data = await clientService.getAll();
      setClients(data.map(mapClientFromDb));
    } catch (error) {
      toast({ title: "Error", description: "Failed to load clients", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }
  // Load on mount
  React.useEffect(() => { loadClients(); }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.clientType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.phone && client.phone.includes(searchQuery)) ||
    (client.email && client.email.includes(searchQuery)) ||
    (client.businessName && client.businessName.toLowerCase().includes(searchQuery.toLowerCase()))
  ).filter(client => 
    (selectedClientType === 'all' || !selectedClientType || client.clientType === selectedClientType) &&
    (selectedLoyaltyLevel === 'all' || !selectedLoyaltyLevel || client.loyaltyLevel === selectedLoyaltyLevel)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Add client
  const handleAddClient = async (data: Omit<EnhancedClient, 'id'>) => {
    try {
      const dbData = mapClientToDb({ ...data });
      const created = await clientService.create(dbData);
      setClients(prev => [mapClientFromDb(created), ...prev]);
    setIsFormOpen(false);
      toast({ title: "Success", description: "Client added successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add client", variant: "destructive" });
    }
  };

  // Edit client
  const handleEdit = (client: EnhancedClient) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };
  const handleUpdateClient = async (data: Omit<EnhancedClient, 'id'>) => {
    if (!editingClient) return;
    try {
      const dbData = mapClientToDb({ ...editingClient, ...data });
      const updated = await clientService.update(editingClient.id, dbData);
      setClients(prev => prev.map(c => c.id === editingClient.id ? mapClientFromDb(updated) : c));
      setEditingClient(null);
      setIsFormOpen(false);
      toast({ title: "Success", description: "Client updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update client", variant: "destructive" });
    }
  };

  // Delete client
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      try {
        await clientService.delete(id);
        setClients(prev => prev.filter(client => client.id !== id));
        toast({ title: "Success", description: "Client deleted successfully" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete client", variant: "destructive" });
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleClientClick = (client: EnhancedClient) => {
    setSelectedClient(client);
  };

  const handleBackToList = () => {
    setSelectedClient(null);
  };

  if (selectedClient) {
    return <ClientDetailView client={selectedClient} onBack={handleBackToList} />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Client Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your customer relationships and track business performance
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="btn-modern bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingClient ? "Edit Client" : "Add New Client"}
              </DialogTitle>
            </DialogHeader>
            <ClientForm 
              client={editingClient} 
              onClose={handleFormClose}
              onSubmit={editingClient ? handleUpdateClient : handleAddClient}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="card-shadow-lg bg-gradient-to-br from-background to-muted/20 border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Client Database</CardTitle>
            <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <Select value={selectedClientType} onValueChange={setSelectedClientType}>
                  <SelectTrigger className="w-40 input-modern">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {CLIENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLoyaltyLevel} onValueChange={setSelectedLoyaltyLevel}>
                  <SelectTrigger className="w-40 input-modern">
                    <SelectValue placeholder="Loyalty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {LOYALTY_LEVELS.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, city, phone, email, business..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-modern"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-muted-foreground">
              Showing {filteredClients.length} of {clients.length} clients
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">Loading clients...</h3>
              <p className="text-muted-foreground mb-4">Please wait while we fetch the client data.</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No clients found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No clients match your search criteria" : "Get started by adding your first client"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsFormOpen(true)} className="btn-modern">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Client
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="table-modern">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Loyalty</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow 
                      key={client.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleClientClick(client)}
                    >
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.businessName || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getClientTypeColor(client.clientType)}>
                          {client.clientType}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.city}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell>{client.email || '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={client.loyaltyLevel === "High" ? "default" : "secondary"}
                        >
                          {client.loyaltyLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {client.totalRevenue ? formatCurrency(client.totalRevenue) : '₹0'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(client);
                            }}
                            className="btn-modern"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(client.id);
                            }}
                            className="btn-modern text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

// Client Detail View Component
function ClientDetailView({ 
  client, 
  onBack 
}: { 
  client: EnhancedClient; 
  onBack: () => void; 
}) {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalPurchases: 0,
    lastPurchaseDate: ''
  });

  useEffect(() => {
    async function fetchStats() {
      if (!client.id) return;
      const sales = await saleService.getAll();
      const clientSales = sales.filter((sale: any) => sale.client_id === client.id);
      const totalRevenue = clientSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total_amount || 0), 0);
      const totalProfit = clientSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.profit || 0), 0);
      const totalPurchases = clientSales.length;
      const lastPurchaseDate = clientSales.length > 0 ? clientSales.reduce((latest: string, sale: any) => {
        return new Date(sale.date) > new Date(latest) ? sale.date : latest;
      }, clientSales[0].date) : '';
      setStats({ totalRevenue, totalProfit, totalPurchases, lastPurchaseDate });
    }
    fetchStats();
  }, [client.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  const formatDate = (date: string | Date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-IN');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="btn-modern">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
          <p className="text-muted-foreground">{client.businessName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="card-shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Client Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Client Type</Label>
                  <Badge className={`mt-1 ${getClientTypeColor(client.clientType)}`}>
                    {client.clientType}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Loyalty Level</Label>
                  <Badge variant={client.loyaltyLevel === "High" ? "default" : "secondary"} className="mt-1">
                    {client.loyaltyLevel}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="flex items-center space-x-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone || 'Not provided'}</span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="flex items-center space-x-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{client.email || 'Not provided'}</span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">City</Label>
                  <p className="flex items-center space-x-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{client.city}</span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">State</Label>
                  <p className="mt-1">{client.state || 'Not specified'}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <p className="mt-1">{client.address || 'Not provided'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">GST Number</Label>
                  <p className="flex items-center space-x-2 mt-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{client.gstNumber || 'Not provided'}</span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Business Name</Label>
                  <p className="flex items-center space-x-2 mt-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{client.businessName || 'Not provided'}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="card-shadow-lg">
            <CardHeader>
              <CardTitle>What They Want</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {client.whatTheyWant?.map((item, index) => (
                  <Badge key={index} variant="outline">
                    {item}
                  </Badge>
                )) || (
                  <p className="text-muted-foreground">No preferences specified</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {client.notes && (
            <Card className="card-shadow-lg">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Statistics */}
        <div className="space-y-6">
          {/* Revenue & Profit */}
          <Card className="card-shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IndianRupee className="h-5 w-5 text-green-600" />
                <span>Revenue & Profit</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalRevenue ? formatCurrency(stats.totalRevenue) : '₹0'}
                </p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-emerald-600">
                  {stats.totalProfit ? formatCurrency(stats.totalProfit) : '₹0'}
                </p>
                <p className="text-sm text-muted-foreground">Total Profit</p>
              </div>
            </CardContent>
          </Card>

          {/* Client Status */}
          <Card className="card-shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span>Client Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Recurring Client</span>
                <Badge variant={client.isRecurring ? "default" : "secondary"}>
                  {client.isRecurring ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Trustworthy</span>
                <Badge variant={client.isTrustworthy ? "default" : "destructive"}>
                  {client.isTrustworthy ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Purchases</span>
                <span className="font-semibold">{stats.totalPurchases || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Purchase</span>
                <span className="text-sm">{formatDate(stats.lastPurchaseDate)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="card-shadow-lg">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {client.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                )) || (
                  <p className="text-muted-foreground">No tags</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Client Form Component
function ClientForm({ 
  client, 
  onClose, 
  onSubmit 
}: { 
  client?: EnhancedClient | null; 
  onClose: () => void; 
  onSubmit: (data: Omit<EnhancedClient, 'id'>) => void; 
}) {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    clientType: client?.clientType || 'Jeweler',
    city: client?.city || '',
    state: client?.state || '', // <-- Add this line
    phone: client?.phone || '',
    email: client?.email || '',
    address: client?.address || '',
    gstNumber: client?.gstNumber || '',
    businessName: client?.businessName || '',
    businessAddress: client?.businessAddress || '',
    loyaltyLevel: client?.loyaltyLevel || 'Medium',
    whatTheyWant: client?.whatTheyWant || [],
    isRecurring: client?.isRecurring ?? false,
    isTrustworthy: client?.isTrustworthy ?? true,
    notes: client?.notes || '',
    tags: client?.tags || []
  });

  const [newTag, setNewTag] = useState('');
  const [newPreference, setNewPreference] = useState('');

  // Fix the form submission to not reference state
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<EnhancedClient, 'id'>);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const addPreference = () => {
    if (newPreference.trim() && !formData.whatTheyWant.includes(newPreference.trim())) {
      setFormData({ ...formData, whatTheyWant: [...formData.whatTheyWant, newPreference.trim()] });
      setNewPreference('');
    }
  };

  const removePreference = (preferenceToRemove: string) => {
    setFormData({ ...formData, whatTheyWant: formData.whatTheyWant.filter(pref => pref !== preferenceToRemove) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
          
          <div>
            <Label htmlFor="name">Client Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="input-modern"
              placeholder="Enter client name"
              required
            />
          </div>

          <div>
            <Label htmlFor="clientType">Client Type *</Label>
            <Select value={formData.clientType} onValueChange={(value) => setFormData({...formData, clientType: value})}>
              <SelectTrigger className="input-modern">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLIENT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Remove the state field from the form UI (the grid with city and state) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="input-modern"
                placeholder="Enter city"
                required
              />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Select value={formData.state} onValueChange={(value) => setFormData({...formData, state: value})}>
                <SelectTrigger className="input-modern">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="input-modern"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="input-modern"
                placeholder="Enter email address"
              />
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Business Information</h3>
          
          <div>
            <Label htmlFor="businessName">Business/Company Name</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              className="input-modern"
              placeholder="Enter business name"
            />
          </div>

          <div>
            <Label htmlFor="gstNumber">GST Number</Label>
            <Input
              id="gstNumber"
              value={formData.gstNumber}
              onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
              className="input-modern"
              placeholder="Enter GST number"
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="input-modern"
              rows={3}
              placeholder="Enter complete address"
            />
          </div>

          <div>
            <Label htmlFor="businessAddress">Business Address</Label>
            <Textarea
              id="businessAddress"
              value={formData.businessAddress}
              onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
              className="input-modern"
              rows={3}
              placeholder="Enter business address"
            />
          </div>
        </div>
      </div>

      {/* Preferences and Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Preferences & Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="loyaltyLevel">Loyalty Level</Label>
            <Select value={formData.loyaltyLevel} onValueChange={(value) => setFormData({...formData, loyaltyLevel: value})}>
              <SelectTrigger className="input-modern">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOYALTY_LEVELS.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData({...formData, isRecurring: checked})}
              />
              <Label>Recurring Client</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isTrustworthy}
                onCheckedChange={(checked) => setFormData({...formData, isTrustworthy: checked})}
              />
              <Label>Trustworthy Client</Label>
            </div>
          </div>
        </div>

        {/* What They Want */}
        <div>
          <Label>What They Want (Gemstone Preferences)</Label>
          <div className="flex flex-col gap-2 mt-2">
            <Select
              value=""
              onValueChange={value => {
                if (value && !formData.whatTheyWant.includes(value)) {
                  setFormData({ ...formData, whatTheyWant: [...formData.whatTheyWant, value] });
                }
              }}
            >
              <SelectTrigger className="input-modern">
                <SelectValue placeholder="Select gemstone(s)" />
              </SelectTrigger>
              <SelectContent>
                {GEMSTONE_OPTIONS.filter(opt => !formData.whatTheyWant.includes(opt)).map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
            <Input
              value={newPreference}
                onChange={e => setNewPreference(e.target.value)}
              className="input-modern"
                placeholder="Add custom preference"
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addPreference())}
            />
            <Button type="button" onClick={addPreference} className="btn-modern">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.whatTheyWant.map((pref, index) => (
              <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removePreference(pref)}>
                {pref} ×
              </Badge>
            ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="input-modern"
              placeholder="Add tag"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} className="btn-modern">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeTag(tag)}>
                {tag} ×
              </Badge>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="input-modern"
            rows={3}
            placeholder="Add any additional notes about this client"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="btn-modern">
          Cancel
        </Button>
        <Button type="submit" className="btn-modern bg-gradient-to-r from-primary to-purple-600">
          {client ? "Update Client" : "Add Client"}
        </Button>
      </div>
    </form>
  );
}
