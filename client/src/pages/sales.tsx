import { useState, useEffect } from "react";
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
import { type Sale, type Client, type Inventory } from "@shared/schema";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ShoppingCart, 
  Calendar,
  User,
  Building2,
  IndianRupee,
  FileText,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Download,
  Share2,
  TrendingUp,
  Printer
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { downloadInvoice, shareInvoice, printInvoice, type InvoiceData } from "@/lib/invoice-generator";
import { saleService, clientService, inventoryService } from "@/lib/database";

interface SaleItem {
  stoneId: string;
  stoneName: string;
  carat: number;
  pricePerCarat: number;
  totalPrice: number;
  quantity: number;
}

interface EnhancedSale {
  id: string;
  saleId: string;
  date: string | Date;
  clientId?: string | null;
  stoneId?: string | null;
  quantity?: number | null;
  totalAmount: string;
  profit: string;
  invoiceFile?: string | null;
  paymentStatus: string;
  notes?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  clientName?: string;
  firmName?: string;
  gstNumber?: string;
  address?: string;
  phoneNumber?: string;
  items?: SaleItem[];
  waitingPeriod?: number;
  isTrustworthy?: boolean;
  anyDiscount?: number;
  isOutOfState?: boolean;
  cgst?: number;
  sgst?: number;
  igst?: number;
  totalWithTax?: number;
}

const PAYMENT_STATUSES = ['Paid', 'Partial', 'Unpaid'];

// Utility function for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Utility function for payment status colors
const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Partial':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'Unpaid':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

// UUID validator (v4 compatible)
const isUuid = (value: string | undefined | null): boolean => {
  if (!value) return false;
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);
};

export default function Sales() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('');
  const [editingSale, setEditingSale] = useState<EnhancedSale | null>(null);
  const [selectedSale, setSelectedSale] = useState<EnhancedSale | null>(null);
  const [sales, setSales] = useState<EnhancedSale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        const [salesData, clientsData, inventoryData] = await Promise.all([
          saleService.getAll(),
          clientService.getAll(),
          inventoryService.getAll()
        ]);

        // Transform sales data to match EnhancedSale interface
        const transformedSales: EnhancedSale[] = salesData.map((sale: any) => ({
          id: sale.id,
          saleId: sale.sale_id,
          date: sale.date,
          clientId: sale.client_id,
          clientName: sale.clients?.name || '',
          firmName: sale.clients?.business_name || '',
          gstNumber: sale.clients?.gst_number || '',
          address: sale.clients?.address || '',
          phoneNumber: sale.clients?.phone || '',
          stoneId: sale.stone_id,
          quantity: sale.quantity,
          totalAmount: sale.total_amount,
          profit: sale.profit,
          paymentStatus: sale.payment_status,
          notes: sale.notes,
          createdAt: sale.created_at,
          updatedAt: sale.updated_at,
          // Items from sale_items if present; fallback to single mapped item
          items: (() => {
            console.log('Processing sale:', sale.sale_id, 'sale_items:', sale.sale_items);
            if (sale.sale_items && sale.sale_items.length > 0) {
              const mappedItems = sale.sale_items.map((si: any) => ({
                stoneId: si.inventory?.gem_id || si.stone_id,
                stoneName: si.inventory?.type || '',
                carat: parseFloat((si.carat ?? si.inventory?.carat) || '0'),
                pricePerCarat: parseFloat((si.price_per_carat ?? si.inventory?.price_per_carat) || '0'),
                totalPrice: parseFloat(si.total_price),
                quantity: typeof si.quantity === 'number' ? si.quantity : parseInt(si.quantity || '1') || 1
              }));
              console.log('Mapped sale_items:', mappedItems);
              return mappedItems;
            } else {
              console.log('Using fallback single item for sale:', sale.sale_id);
              return [{
                stoneId: sale.inventory?.gem_id || sale.stone_id || '',
                stoneName: sale.inventory?.type || '',
                carat: parseFloat(sale.inventory?.carat || '0'),
                pricePerCarat: parseFloat(sale.inventory?.price_per_carat || '0'),
                totalPrice: sale.total_amount,
                quantity: (typeof sale.quantity === 'number' ? sale.quantity : parseInt(sale.quantity || '1')) || 1
              }];
            }
          })(),
      isTrustworthy: true,
      anyDiscount: 0,
      isOutOfState: false,
      cgst: 0,
      sgst: 0,
      igst: 0,
          totalWithTax: sale.total_amount
        }));

        setSales(transformedSales);
        setClients(clientsData as any);
        setInventory(inventoryData as any);
        

      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load sales data",
          variant: "destructive"
        });
      }
    };

    loadData();
  }, [toast]);

  const filteredSales = sales.filter(sale =>
      sale.saleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sale.clientName && sale.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (sale.firmName && sale.firmName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    sale.paymentStatus.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(sale => 
    (selectedPaymentStatus === 'all' || !selectedPaymentStatus || sale.paymentStatus === selectedPaymentStatus)
  );

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const handleAddSale = async (data: Omit<EnhancedSale, 'id'>) => {
    try {
      const saleData = {
        saleId: `SALE-${Date.now().toString().slice(-6)}`,
        date: new Date(data.date).toISOString(),
        clientId: data.clientId,
        stoneId: data.stoneId,
        quantity: data.quantity || 1,
        totalAmount: parseFloat(data.totalAmount),
        profit: parseFloat(data.profit),
        paymentStatus: data.paymentStatus,
        notes: data.notes
      };

      // Ensure stoneId is a UUID (map gem_id -> UUID if needed)
      if (saleData.stoneId && !isUuid(saleData.stoneId)) {
        const byId = inventory.find(s => s.id === saleData.stoneId);
        const byGem = byId ? undefined : inventory.find(s => (s.gemId || (s as any).gem_id) === saleData.stoneId);
        saleData.stoneId = (byId?.id || byGem?.id || saleData.stoneId);
      }


      const newSale = await saleService.create(saleData);
      // Persist multi-items
      await saleService.replaceItems(newSale.id, (data.items || []).map((it) => {
        // Convert gem_id to UUID if needed
        let stoneId = it.stoneId;
        if (stoneId && !isUuid(stoneId)) {
          const byId = inventory.find(s => s.id === stoneId);
          const byGem = byId ? undefined : inventory.find(s => (s.gemId || (s as any).gem_id) === stoneId);
          stoneId = (byId?.id || byGem?.id || stoneId);
        }
        return {
          stoneId: stoneId,
          quantity: it.quantity || 1,
          carat: it.carat,
          pricePerCarat: it.pricePerCarat,
          totalPrice: (it.quantity || 1) * it.carat * it.pricePerCarat,
        };
      }));
      
      // Reload sales data
      const salesData = await saleService.getAll();
      const transformedSales: EnhancedSale[] = salesData.map((sale: any) => ({
        id: sale.id,
        saleId: sale.sale_id,
        date: sale.date,
        clientId: sale.client_id,
        clientName: sale.clients?.name || '',
        firmName: sale.clients?.business_name || '',
        gstNumber: sale.clients?.gst_number || '',
        address: sale.clients?.address || '',
        phoneNumber: sale.clients?.phone || '',
        stoneId: sale.stone_id,
        quantity: sale.quantity,
        totalAmount: sale.total_amount,
        profit: sale.profit,
        paymentStatus: sale.payment_status,
        notes: sale.notes,
        createdAt: sale.created_at,
        updatedAt: sale.updated_at,
        // Use sale_items if available, otherwise fallback to single inventory item
        items: (() => {
          if (sale.sale_items && sale.sale_items.length > 0) {
            return sale.sale_items.map((si: any) => ({
              stoneId: si.inventory?.gem_id || si.stone_id,
              stoneName: si.inventory?.type || '',
              carat: parseFloat((si.carat ?? si.inventory?.carat) || '0'),
              pricePerCarat: parseFloat((si.price_per_carat ?? si.inventory?.price_per_carat) || '0'),
              totalPrice: parseFloat(si.total_price)
            }));
          } else {
            return [{
              stoneId: sale.inventory?.gem_id || sale.stone_id || '',
              stoneName: sale.inventory?.type || '',
              carat: parseFloat(sale.inventory?.carat || '0'),
              pricePerCarat: parseFloat(sale.inventory?.price_per_carat || '0'),
              totalPrice: sale.total_amount
            }];
          }
        })(),
        isTrustworthy: true,
        anyDiscount: 0,
        isOutOfState: false,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalWithTax: sale.total_amount
      }));

      setSales(transformedSales);
    setIsFormOpen(false);
    toast({
      title: "Success",
      description: "Sale recorded successfully",
    });
    } catch (error) {
      console.error('Error adding sale:', error);
      toast({
        title: "Error",
        description: "Failed to record sale",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (sale: EnhancedSale) => {
    setEditingSale(sale);
    setIsFormOpen(true);
  };

  const handleUpdateSale = async (data: Omit<EnhancedSale, 'id'>) => {
    if (!editingSale) return;
    
    try {
      const saleData = {
        saleId: editingSale.saleId,
        date: new Date(data.date).toISOString(),
        clientId: data.clientId,
        stoneId: data.stoneId,
        quantity: data.quantity || 1,
        totalAmount: parseFloat(data.totalAmount),
        profit: parseFloat(data.profit),
        paymentStatus: data.paymentStatus,
        notes: data.notes
      };

      // Ensure stoneId is a UUID (map gem_id -> UUID if needed)
      if (saleData.stoneId && !isUuid(saleData.stoneId)) {
        const byId = inventory.find(s => s.id === saleData.stoneId);
        const byGem = byId ? undefined : inventory.find(s => (s.gemId || (s as any).gem_id) === saleData.stoneId);
        saleData.stoneId = (byId?.id || byGem?.id || saleData.stoneId);
      }

      console.log('Updating sale with data:', saleData);
      await saleService.update(editingSale.id, saleData);
      // Replace multi-items for this sale
      await saleService.replaceItems(editingSale.id, (data.items || []).map((it) => {
        // Convert gem_id to UUID if needed
        let stoneId = it.stoneId;
        if (stoneId && !isUuid(stoneId)) {
          const byId = inventory.find(s => s.id === stoneId);
          const byGem = byId ? undefined : inventory.find(s => (s.gemId || (s as any).gem_id) === stoneId);
          stoneId = (byId?.id || byGem?.id || stoneId);
        }
        return {
          stoneId: stoneId,
          quantity: it.quantity || 1,
          carat: it.carat,
          pricePerCarat: it.pricePerCarat,
          totalPrice: (it.quantity || 1) * it.carat * it.pricePerCarat,
        };
      }));
      
      // Reload sales data
      const salesData = await saleService.getAll();
      const transformedSales: EnhancedSale[] = salesData.map((sale: any) => ({
        id: sale.id,
        saleId: sale.sale_id,
        date: sale.date,
        clientId: sale.client_id,
        clientName: sale.clients?.name || '',
        firmName: sale.clients?.business_name || '',
        gstNumber: sale.clients?.gst_number || '',
        address: sale.clients?.address || '',
        phoneNumber: sale.clients?.phone || '',
        stoneId: sale.stone_id,
        quantity: sale.quantity,
        totalAmount: sale.total_amount,
        profit: sale.profit,
        paymentStatus: sale.payment_status,
        notes: sale.notes,
        createdAt: sale.created_at,
        updatedAt: sale.updated_at,
        // Use sale_items if available, otherwise fallback to single inventory item
        items: (() => {
          if (sale.sale_items && sale.sale_items.length > 0) {
            return sale.sale_items.map((si: any) => ({
              stoneId: si.inventory?.gem_id || si.stone_id,
              stoneName: si.inventory?.type || '',
              carat: parseFloat((si.carat ?? si.inventory?.carat) || '0'),
              pricePerCarat: parseFloat((si.price_per_carat ?? si.inventory?.price_per_carat) || '0'),
              totalPrice: parseFloat(si.total_price)
            }));
          } else {
            return [{
              stoneId: sale.inventory?.gem_id || sale.stone_id || '',
              stoneName: sale.inventory?.type || '',
              carat: parseFloat(sale.inventory?.carat || '0'),
              pricePerCarat: parseFloat(sale.inventory?.price_per_carat || '0'),
              totalPrice: sale.total_amount
            }];
          }
        })(),
        isTrustworthy: true,
        anyDiscount: 0,
        isOutOfState: false,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalWithTax: sale.total_amount
      }));

      setSales(transformedSales);
      setIsFormOpen(false);
      setEditingSale(null);
      toast({
        title: "Success",
        description: "Sale updated successfully",
      });
    } catch (error) {
      console.error('Error updating sale:', error);
      toast({
        title: "Error",
        description: "Failed to update sale",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sale?")) {
      try {
        await saleService.delete(id);
      setSales(sales.filter(sale => sale.id !== id));
      toast({
        title: "Success",
        description: "Sale deleted successfully",
      });
      } catch (error) {
        console.error('Error deleting sale:', error);
        toast({
          title: "Error",
          description: "Failed to delete sale",
          variant: "destructive"
        });
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSale(null);
  };

  const handleSaleClick = (sale: EnhancedSale) => {
    setSelectedSale(sale);
  };

  const handleBackToList = () => {
    setSelectedSale(null);
  };



  if (selectedSale) {
    return <SaleDetailView sale={selectedSale} onBack={handleBackToList} />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Sales Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your gemstone sales transactions and generate invoices
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="btn-modern bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
              <Plus className="h-4 w-4 mr-2" />
              Record Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingSale ? "Edit Sale" : "Record New Sale"}
              </DialogTitle>
            </DialogHeader>
            <SaleForm 
              sale={editingSale} 
              onClose={handleFormClose}
              onSubmit={editingSale ? handleUpdateSale : handleAddSale}
              clients={clients}
              inventory={inventory}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="card-shadow-lg bg-gradient-to-br from-background to-muted/20 border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Sales Transactions</CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                <SelectTrigger className="w-40 input-modern">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {PAYMENT_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by Sale ID, client name, firm name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-modern"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-muted-foreground">
              Showing {filteredSales.length} of {sales.length} sales
            </p>
          </div>

          {/* Content */}
          {filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No sales found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No sales match your search criteria" : "Get started by recording your first sale"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsFormOpen(true)} className="btn-modern">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Your First Sale
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="table-modern">
                <TableHeader>
                  <TableRow>
                    <TableHead>Sale ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Firm/Company</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow 
                      key={sale.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSaleClick(sale)}
                    >
                      <TableCell className="font-medium">{sale.saleId}</TableCell>
                      <TableCell>{formatDate(sale.date)}</TableCell>
                      <TableCell>{sale.clientName}</TableCell>
                      <TableCell>{sale.firmName || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {sale.items?.map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item.stoneName} ({item.carat}ct)
                            </Badge>
                          )) || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(parseFloat(sale.totalAmount))}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(sale.paymentStatus)}>
                          {sale.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(sale);
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
                              handleDelete(sale.id);
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

// Sale Detail View Component
function SaleDetailView({ 
  sale, 
  onBack 
}: { 
  sale: EnhancedSale; 
  onBack: () => void; 
}) {
  const { toast } = useToast();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  // --- TAX CALCULATION LOGIC ---
  const subtotal = parseFloat(sale.totalAmount) - (sale.anyDiscount || 0);
  const cgst = sale.isOutOfState ? 0 : subtotal * 0.015;
  const sgst = sale.isOutOfState ? 0 : subtotal * 0.015;
  const igst = sale.isOutOfState ? subtotal * 0.03 : 0;
  const totalWithTax = subtotal + cgst + sgst + igst;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="btn-modern">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sales
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{sale.saleId}</h1>
          <p className="text-muted-foreground">{formatDate(sale.date)}</p>
        </div>
        <div className="ml-auto flex space-x-2">
          <Button 
            className="btn-modern"
            onClick={() => {
              const invoiceData: InvoiceData = {
                invoiceNumber: sale.saleId,
                date: formatDate(sale.date),
                clientName: sale.clientName || '',
                firmName: sale.firmName,
                gstNumber: sale.gstNumber,
                address: sale.address,
                phoneNumber: sale.phoneNumber,
                items: sale.items || [],
                subtotal: parseFloat(sale.totalAmount),
                discount: sale.anyDiscount,
                cgst: sale.cgst,
                sgst: sale.sgst,
                igst: sale.igst,
                totalAmount: sale.totalWithTax || parseFloat(sale.totalAmount),
                isOutOfState: sale.isOutOfState || false,
                paymentStatus: sale.paymentStatus,
                waitingPeriod: sale.waitingPeriod,
                isTrustworthy: sale.isTrustworthy
              };
              downloadInvoice(invoiceData);
              toast({
                title: "Invoice Downloaded",
                description: "Invoice has been downloaded to your device.",
              });
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Invoice
          </Button>
          <Button 
            className="btn-modern"
            onClick={async () => {
              const invoiceData: InvoiceData = {
                invoiceNumber: sale.saleId,
                date: formatDate(sale.date),
                clientName: sale.clientName || '',
                firmName: sale.firmName,
                gstNumber: sale.gstNumber,
                address: sale.address,
                phoneNumber: sale.phoneNumber,
                items: sale.items || [],
                subtotal: parseFloat(sale.totalAmount),
                discount: sale.anyDiscount,
                cgst: sale.cgst,
                sgst: sale.sgst,
                igst: sale.igst,
                totalAmount: sale.totalWithTax || parseFloat(sale.totalAmount),
                isOutOfState: sale.isOutOfState || false,
                paymentStatus: sale.paymentStatus,
                waitingPeriod: sale.waitingPeriod,
                isTrustworthy: sale.isTrustworthy
              };
              const result = await shareInvoice(invoiceData);
              if (result === 'shared') {
                toast({
                  title: "Invoice Shared",
                  description: "Invoice has been shared successfully.",
                });
              } else if (result === 'downloaded') {
                toast({
                  title: "Invoice Downloaded",
                  description: "Invoice has been downloaded to your device.",
                });
              }
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            className="btn-modern"
            onClick={() => {
              const invoiceData: InvoiceData = {
                invoiceNumber: sale.saleId,
                date: formatDate(sale.date),
                clientName: sale.clientName || '',
                firmName: sale.firmName,
                gstNumber: sale.gstNumber,
                address: sale.address,
                phoneNumber: sale.phoneNumber,
                items: sale.items || [],
                subtotal: parseFloat(sale.totalAmount),
                discount: sale.anyDiscount,
                cgst: sale.cgst,
                sgst: sale.sgst,
                igst: sale.igst,
                totalAmount: sale.totalWithTax || parseFloat(sale.totalAmount),
                isOutOfState: sale.isOutOfState || false,
                paymentStatus: sale.paymentStatus,
                waitingPeriod: sale.waitingPeriod,
                isTrustworthy: sale.isTrustworthy
              };
              printInvoice(invoiceData);
              toast({
                title: "Invoice Printed",
                description: "Invoice has been sent to the printer.",
              });
            }}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sale Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card className="card-shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Client Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Client Name</Label>
                  <p className="mt-1 font-semibold">{sale.clientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Firm/Company</Label>
                  <p className="flex items-center space-x-2 mt-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{sale.firmName || 'Not provided'}</span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">GST Number</Label>
                  <p className="flex items-center space-x-2 mt-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{sale.gstNumber || 'Not provided'}</span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                  <p className="flex items-center space-x-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{sale.phoneNumber || 'Not provided'}</span>
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                  <p className="flex items-center space-x-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{sale.address || 'Not provided'}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Sold */}
          <Card className="card-shadow-lg">
            <CardHeader>
              <CardTitle>Items Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sale.items?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-[var(--radius)]">
                    <div>
                      <p className="font-semibold">{item.stoneName}</p>
                      <p className="text-sm text-muted-foreground">Stone ID: {item.stoneId}</p>
                      <p className="text-sm text-muted-foreground">{item.carat} carat × {formatCurrency(item.pricePerCarat)}/ct × qty {item.quantity || 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(item.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="card-shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IndianRupee className="h-5 w-5" />
                <span>Payment Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Payment Status</Label>
                  <Badge className={`mt-1 ${getPaymentStatusColor(sale.paymentStatus)}`}>
                    {sale.paymentStatus}
                  </Badge>
                </div>
                {sale.paymentStatus === 'Unpaid' && sale.waitingPeriod && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Waiting Period</Label>
                    <p className="flex items-center space-x-2 mt-1">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span>{sale.waitingPeriod} days</span>
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Trustworthy Client</Label>
                  <Badge variant={sale.isTrustworthy ? "default" : "destructive"} className="mt-1">
                    {sale.isTrustworthy ? "Yes" : "No"}
                  </Badge>
                </div>
                {sale.anyDiscount && sale.anyDiscount > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Discount Applied</Label>
                    <p className="mt-1 text-green-600 font-semibold">
                      -{formatCurrency(sale.anyDiscount)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {sale.notes && (
            <Card className="card-shadow-lg">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{sale.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Financial Summary */}
        <div className="space-y-6">
          {/* Amount Breakdown */}
          <Card className="card-shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IndianRupee className="h-5 w-5 text-green-600" />
                <span>Amount Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(parseFloat(sale.totalAmount))}</span>
              </div>
              {sale.anyDiscount && sale.anyDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(sale.anyDiscount)}</span>
                </div>
              )}
              {sale.isOutOfState ? (
                <div className="flex justify-between">
                  <span>IGST (3%):</span>
                  <span>{formatCurrency(igst)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>CGST (1.5%):</span>
                    <span>{formatCurrency(cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (1.5%):</span>
                    <span>{formatCurrency(sgst)}</span>
                  </div>
                </>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(totalWithTax)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit Information */}
          <Card className="card-shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Profit Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Total Revenue:</span>
                <span className="font-semibold">{formatCurrency(parseFloat(sale.totalAmount))}</span>
              </div>
              <div className="flex justify-between">
                <span>Profit:</span>
                <span className="font-semibold text-green-600">{formatCurrency(parseFloat(sale.profit))}</span>
              </div>
              <div className="flex justify-between">
                <span>Profit Margin:</span>
                <span className="font-semibold text-blue-600">
                  {((parseFloat(sale.profit) / parseFloat(sale.totalAmount)) * 100).toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tax Information */}
          <Card className="card-shadow-lg">
            <CardHeader>
              <CardTitle>Tax Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge variant={sale.isOutOfState ? "default" : "secondary"}>
                  {sale.isOutOfState ? "Out of State" : "Within State"}
                </Badge>
              </div>
              {sale.isOutOfState ? (
                <div className="text-sm text-muted-foreground">
                  IGST (3%) applied for out-of-state transaction
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  CGST (1.5%) + SGST (1.5%) applied for within-state transaction
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Sale Form Component
function SaleForm({ 
  sale, 
  onClose, 
  onSubmit,
  clients,
  inventory
}: { 
  sale?: EnhancedSale | null; 
  onClose: () => void; 
  onSubmit: (data: Omit<EnhancedSale, 'id'>) => void; 
  clients: Client[];
  inventory: Inventory[];
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: sale?.date ? new Date(sale.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    clientId: sale?.clientId || '',
    clientName: sale?.clientName || '',
    firmName: sale?.firmName || '',
    gstNumber: sale?.gstNumber || '',
    address: sale?.address || '',
    phoneNumber: sale?.phoneNumber || '',
    items: sale?.items || [],
    totalAmount: sale?.totalAmount || 0,
    profit: sale?.profit || 0,
    paymentStatus: sale?.paymentStatus || 'Unpaid',
    waitingPeriod: sale?.waitingPeriod || 0,
    isTrustworthy: sale?.isTrustworthy ?? true,
    anyDiscount: sale?.anyDiscount || 0,
    isOutOfState: sale?.isOutOfState ?? false,
    notes: sale?.notes || ''
  });

  const [newItem, setNewItem] = useState({
    stoneId: '',
    stoneName: '',
    carat: 0,
    pricePerCarat: 0,
    quantity: 1
  });

  const [stoneSearchQuery, setStoneSearchQuery] = useState('');

  // Use real clients and inventory data
  // The database returns snake_case properties, so we need to check both
  const availableInventory = inventory.filter((item: any) => 
    item.isAvailable || (item as any).is_available || item.isAvailable === true || (item as any).is_available === true
  );
  
  // Fallback: if no available inventory found, show all inventory
  const displayInventory = availableInventory.length > 0 ? availableInventory : inventory;
  
  // Simple and reliable search for stones
  const filteredStones = displayInventory.filter((stone: any) => {
    if (!stoneSearchQuery.trim()) return true;
    
    const query = stoneSearchQuery.toLowerCase().trim();
    const stoneAny = stone as any;
    
    // Create a searchable text from all stone properties
    const searchableText = [
      stone.type,
      stone.gemId,
      stoneAny.gem_id,
      stone.grade,
      stone.origin,
      stoneAny.color,
      stoneAny.clarity,
      stoneAny.cut,
      stoneAny.stone_name,
      stoneAny.stone_type,
      stoneAny.name,
      stoneAny.description,
      stoneAny.type,
      stoneAny.gem_id,
      stoneAny.grade,
      stoneAny.origin
    ].filter(Boolean).join(' ').toLowerCase();
    
    // Simple includes check
    return searchableText.includes(query);
  });
  


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate totals
    const totalAmount = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const profit = totalAmount * 0.2; // 20% profit margin for demo
    
    // Calculate taxes
    const subtotal = totalAmount - formData.anyDiscount;
    const cgst = formData.isOutOfState ? 0 : subtotal * 0.015;
    const sgst = formData.isOutOfState ? 0 : subtotal * 0.015;
    const igst = formData.isOutOfState ? subtotal * 0.03 : 0;
    const totalWithTax = subtotal + cgst + sgst + igst;

    // Use the sale's stoneId for the database (not from items array)
    // When editing, use the sale's stoneId directly
    const stoneId = sale?.stoneId || (formData.items.length > 0 ? formData.items[0].stoneId : '');
    
    // If we're editing and the sale has a stoneId, use that instead of the items array
    const finalStoneId = sale?.stoneId || stoneId;
    


    onSubmit({
      ...formData,
      stoneId: finalStoneId,
      totalAmount: totalAmount.toString(),
      profit: profit.toString(),
      cgst,
      sgst,
      igst,
      totalWithTax,
      saleId: `SALE-${Date.now().toString().slice(-6)}`,
      paymentStatus: formData.paymentStatus
    });
  };

  const addItem = () => {
    if (newItem.stoneId && newItem.stoneName && newItem.carat > 0 && newItem.pricePerCarat > 0 && newItem.quantity > 0) {
      const qty = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : 1;
      const totalPrice = qty * newItem.carat * newItem.pricePerCarat;
      setFormData({
        ...formData,
        items: [...formData.items, { ...newItem, quantity: qty, totalPrice }]
      });
      setNewItem({ stoneId: '', stoneName: '', carat: 0, pricePerCarat: 0, quantity: 1 });
    } else {
      toast({
        title: "Cannot add item",
        description: "Please fill in all required fields: stone selection, carat, price per carat, and quantity.",
        variant: "destructive"
      });
    }
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setFormData({
        ...formData,
        clientId,
        clientName: client.name,
        firmName: client.businessName || '',
        gstNumber: client.gstNumber || '',
        address: client.address || '',
        phoneNumber: client.phone || ''
      });
    }
  };

  console.log('Form render - filtered stones:', filteredStones.length);
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Sale Information</h3>
          
          <div>
            <Label htmlFor="date">Sale Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="input-modern"
              required
            />
          </div>

          <div>
            <Label htmlFor="clientId">Client *</Label>
            <Select value={formData.clientId} onValueChange={handleClientChange}>
              <SelectTrigger className="input-modern">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} - {client.businessName || 'No Business Name'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                className="input-modern"
                placeholder="Auto-filled from client selection"
                readOnly
              />
            </div>

            <div>
              <Label htmlFor="firmName">Firm/Company Name</Label>
              <Input
                id="firmName"
                value={formData.firmName}
                onChange={(e) => setFormData({...formData, firmName: e.target.value})}
                className="input-modern"
                placeholder="Auto-filled from client selection"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="input-modern"
                placeholder="Enter phone number"
              />
            </div>
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
        </div>

        {/* Payment and Tax Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Payment & Tax</h3>
          
          <div>
            <Label htmlFor="paymentStatus">Payment Status *</Label>
            <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({...formData, paymentStatus: value})}>
              <SelectTrigger className="input-modern">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.paymentStatus === 'Unpaid' && (
            <div>
              <Label htmlFor="waitingPeriod">Waiting Period (Days)</Label>
              <Input
                id="waitingPeriod"
                type="number"
                value={formData.waitingPeriod}
                onChange={(e) => setFormData({...formData, waitingPeriod: parseInt(e.target.value) || 0})}
                className="input-modern"
                placeholder="e.g., 10"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="anyDiscount">Discount (₹)</Label>
              <Input
                id="anyDiscount"
                type="number"
                value={formData.anyDiscount}
                onChange={(e) => setFormData({...formData, anyDiscount: parseFloat(e.target.value) || 0})}
                className="input-modern"
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isOutOfState}
                onCheckedChange={(checked) => setFormData({...formData, isOutOfState: checked})}
              />
              <Label>Out of State</Label>
            </div>
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

      {/* Items */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Items</h3>
        
        {/* Stone Search */}
        
        {/* Stone Search and Selection */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="stoneSearch">Search Stones</Label>
            <Input
              id="stoneSearch"
              placeholder="Try: 'ruby', 'expensive diamonds', 'large sapphires', 'premium stones', 'blue gems'..."
              value={stoneSearchQuery}
              onChange={(e) => setStoneSearchQuery(e.target.value)}
              className="input-modern"
            />
          </div>
          
          {/* Stone Selection Results */}
          <div>
            <Label>Available Stones</Label>
            <div className="text-xs text-muted-foreground mb-2">
              Found {filteredStones.length} stones matching your search
            </div>
            
            {/* Stone List */}
            <div className="border rounded-lg bg-background">
              {filteredStones.length > 0 ? (
                <div className="max-h-48 overflow-y-auto">
                  {filteredStones.map(stone => {
                    const stoneAny = stone as any;
                    const pricePerCarat = stoneAny.pricePerCarat || stoneAny.price_per_carat || 0;
                    const carat = stoneAny.carat || stoneAny.caratWeight || 0;
                    const isSelected = newItem.stoneId === stone.id;
                    return (
                      <div 
                        key={stone.id} 
                        className={`p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors ${
                          isSelected ? 'bg-primary/10 border-primary/20' : ''
                        }`}
                        onClick={() => {
                          setNewItem({
                            ...newItem,
                            stoneId: stone.id,
                            stoneName: stone.type || '',
                            carat: parseFloat(carat || '0'),
                            pricePerCarat: parseFloat(pricePerCarat || '0'),
                            quantity: 1
                          });
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-foreground">
                              {stone.type || 'Unknown Type'}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              ID: {stone.gemId || stone.id} • {carat}ct • ₹{pricePerCarat}/ct
                            </div>
                          </div>
                          <div className="text-xs text-primary font-medium">
                            {isSelected ? '✓ Selected' : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No stones found matching "{stoneSearchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Item Details Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div>
            <Label>Stone Name</Label>
            <Input
              value={newItem.stoneName}
              onChange={(e) => setNewItem({...newItem, stoneName: e.target.value})}
              className="input-modern"
              placeholder="Auto-filled from selection"
              readOnly
            />
          </div>

          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              value={newItem.quantity}
              onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value || '1') || 1})}
              className="input-modern"
              placeholder="e.g., 1"
            />
          </div>

          <div>
            <Label>Carat Weight</Label>
            <Input
              type="number"
              step="0.01"
              value={newItem.carat}
              onChange={(e) => setNewItem({...newItem, carat: parseFloat(e.target.value) || 0})}
              className="input-modern"
              placeholder="e.g., 3.25"
            />
          </div>

          <div>
            <Label>Price per Carat (₹)</Label>
            <Input
              type="number"
              step="0.01"
              value={newItem.pricePerCarat}
              onChange={(e) => setNewItem({...newItem, pricePerCarat: parseFloat(e.target.value) || 0})}
              className="input-modern"
              placeholder="e.g., 15000"
            />
          </div>
        </div>

        <Button type="button" onClick={addItem} className="btn-modern">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>

        {/* Items List */}
        <div className="space-y-2">
          {formData.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-[var(--radius)]">
              <div>
                <p className="font-semibold">{item.stoneName}</p>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const stone = displayInventory.find(s => s.id === item.stoneId);
                    return (stone?.gemId || stone?.id || item.stoneId) + ' - ' + item.carat + 'ct × ' + formatCurrency(item.pricePerCarat) + '/ct × qty ' + (item.quantity || 1);
                  })()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold">{formatCurrency(item.totalPrice)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
          placeholder="Add any additional notes about this sale"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="btn-modern">
          Cancel
        </Button>
        <Button type="submit" className="btn-modern bg-gradient-to-r from-primary to-purple-600">
          {sale ? "Update Sale" : "Record Sale"}
        </Button>
        {sale && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              const invoiceData: InvoiceData = {
                invoiceNumber: sale.saleId,
                date: new Date(sale.date).toLocaleDateString('en-IN'),
                clientName: sale.clientName || '',
                firmName: sale.firmName,
                gstNumber: sale.gstNumber,
                address: sale.address,
                phoneNumber: sale.phoneNumber,
                items: sale.items || [],
                subtotal: parseFloat(sale.totalAmount),
                discount: sale.anyDiscount,
                cgst: sale.cgst,
                sgst: sale.sgst,
                igst: sale.igst,
                totalAmount: sale.totalWithTax || parseFloat(sale.totalAmount),
                isOutOfState: sale.isOutOfState || false,
                paymentStatus: sale.paymentStatus,
                waitingPeriod: sale.waitingPeriod,
                isTrustworthy: sale.isTrustworthy
              };
              downloadInvoice(invoiceData);
              toast({
                title: "Invoice Generated",
                description: "Invoice has been generated and downloaded.",
              });
            }}
            className="btn-modern"
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>
        )}
      </div>
    </form>
  );
}
