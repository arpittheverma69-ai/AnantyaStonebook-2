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
import { supabase } from "@/lib/supabase";

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
  // Invoice-specific fields
  buyersOrderNumber?: string;
  buyersOrderDate?: string;
  dispatchDocNo?: string;
  deliveryNoteDate?: string;
  dispatchedThrough?: string;
  destination?: string;
  termsOfDelivery?: string;
}

const PAYMENT_STATUSES = ['Paid', 'Partial', 'Unpaid'];

// Build disclosures based on inventory.treatments and disclose flags
function collectTreatmentDisclosures(allInventory: any[], items?: SaleItem[]): string[] {
  if (!items || items.length === 0) return [];
  const disclosures: string[] = [];
  for (const it of items) {
    const inv: any | undefined = allInventory.find((s: any) =>
      s.gemId === it.stoneId || s.id === it.stoneId || s.gem_id === it.stoneId
    );
    if (!inv) continue;
    // Determine flags and treatments across possible shapes
    const disclose = inv.disclose_treatments ?? inv.discloseTreatments ?? inv?.extended?.discloseTreatments;
    let treatments: Record<string, any> | undefined = inv.treatments ?? inv?.extended?.treatments;
    if (!treatments && inv.notes) {
      try {
        const parsed = typeof inv.notes === 'string' ? JSON.parse(inv.notes) : inv.notes;
        treatments = parsed?.extended?.treatments || parsed?.treatments;
      } catch {}
    }
    if (disclose && treatments) {
      const active = Object.entries(treatments).filter(([, v]) => !!v).map(([k]) => k);
      if (active.length > 0) {
        const id = inv.gemId || inv.gem_id || inv.id || it.stoneId;
        const name = inv.type || it.stoneName || 'Stone';
        disclosures.push(`${name} (${id}): treatments - ${active.join(', ')}`);
      }
    }
  }
  return disclosures;
}

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

  const handleCreateSale = async (data: Omit<EnhancedSale, 'id'>) => {
    try {
      // Calculate totals
      const totalAmount = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const profit = totalAmount * 0.2; // 20% profit margin for demo
      
      // Calculate taxes
      const subtotal = totalAmount - (data.anyDiscount || 0);
      const cgst = data.isOutOfState ? 0 : subtotal * 0.015;
      const sgst = data.isOutOfState ? 0 : subtotal * 0.015;
      const igst = data.isOutOfState ? subtotal * 0.03 : 0;
      const totalWithTax = subtotal + cgst + sgst + igst;

      const saleData = {
        saleId: data.saleId || `SALE-${Date.now().toString().slice(-6)}`,
        date: new Date(data.date).toISOString(),
        clientId: data.clientId,
        stoneId: data.items.length > 0 ? data.items[0].stoneId : '',
        quantity: data.items.length > 0 ? data.items[0].quantity || 1 : 1,
        totalAmount: totalAmount,
        profit: profit,
        paymentStatus: data.paymentStatus,
        notes: data.notes,
        waitingPeriod: data.waitingPeriod || 0,
        isTrustworthy: data.isTrustworthy || false,
        anyDiscount: data.anyDiscount || 0,
        isOutOfState: data.isOutOfState || false,
        cgst,
        sgst,
        igst,
        totalWithTax
      };

      console.log('Creating sale with data:', saleData);
      const newSale = await saleService.create(saleData);
      
      // Add sale items and reduce inventory quantities
      if (data.items.length > 0) {
        await saleService.replaceItems(newSale.id, data.items.map((it) => {
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

        // Reduce inventory quantities for each item sold
        console.log('=== INVENTORY REDUCTION DEBUG ===');
        console.log('Items to process:', data.items);
        console.log('Available inventory:', inventory.map(inv => ({ id: inv.id, type: inv.type, carat: inv.carat, quantity: inv.quantity })));
        
        for (const item of data.items) {
          console.log('Processing item:', item);
          let stoneId = item.stoneId;
          let inventoryItem = null;
          
          // Try to find the inventory item by different methods
          console.log('Looking for stoneId:', stoneId, 'isUuid:', isUuid(stoneId));
          
          if (stoneId && !isUuid(stoneId)) {
            console.log('StoneId is not UUID, trying different matching methods...');
            // First try by UUID
            inventoryItem = inventory.find(s => s.id === stoneId);
            console.log('Tried by UUID, found:', inventoryItem?.type);
            
            // If not found, try by gem_id
            if (!inventoryItem) {
              inventoryItem = inventory.find(s => (s.gemId || (s as any).gem_id) === stoneId);
              console.log('Tried by gem_id, found:', inventoryItem?.type);
            }
            
            // If still not found, try by type and carat (fallback method)
            if (!inventoryItem) {
              console.log('Trying by type and carat match...');
              inventoryItem = inventory.find(s => 
                s.type === item.stoneName && 
                Math.abs((s.carat || 0) - item.carat) < 0.1 // Allow small difference in carat
              );
              console.log('Tried by type+carat, found:', inventoryItem?.type);
            }
            
            // Update stoneId to the actual inventory ID
            if (inventoryItem) {
              stoneId = inventoryItem.id;
              console.log('Updated stoneId to:', stoneId);
            }
          } else if (stoneId) {
            // Direct UUID lookup
            console.log('StoneId is UUID, doing direct lookup...');
            inventoryItem = inventory.find(inv => inv.id === stoneId);
            console.log('Direct UUID lookup found:', inventoryItem?.type);
          }

          if (inventoryItem) {
            const currentQuantity = inventoryItem.quantity || 0;
            const soldQuantity = item.quantity || 1;
            const newQuantity = Math.max(0, currentQuantity - soldQuantity);
            
            console.log(`Reducing inventory for ${inventoryItem.type} (${inventoryItem.id}): ${currentQuantity} → ${newQuantity} (sold ${soldQuantity})`);
            
            // Only update quantity and availability to avoid schema issues
            // Use direct Supabase call to avoid toSnakeCaseInventory conversion
            const { error } = await supabase
              .from('inventory')
              .update({ 
                quantity: newQuantity,
                is_available: newQuantity > 0,
                updated_at: new Date().toISOString()
              })
              .eq('id', stoneId);
            
            if (error) {
              console.error('Error updating inventory:', error);
              throw error;
            }
          } else {
            console.warn(`Could not find inventory item for stone: ${item.stoneName} (${item.stoneId})`);
          }
        }
      }
      
      // Reload sales and inventory data
      const [salesData, inventoryData] = await Promise.all([
        saleService.getAll(),
        inventoryService.getAll()
      ]);
      
      // Update local inventory state
      setInventory(inventoryData);
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
        isTrustworthy: sale.is_trustworthy || true,
        anyDiscount: sale.any_discount || 0,
        isOutOfState: sale.is_out_of_state || false,
        cgst: sale.cgst || 0,
        sgst: sale.sgst || 0,
        igst: sale.igst || 0,
        totalWithTax: sale.total_with_tax || sale.total_amount
      }));

      setSales(transformedSales);
      setIsFormOpen(false);
      setEditingSale(null);
      
      // Create a summary of what was sold
      const soldItems = data.items.map(item => {
        const inventoryItem = inventory.find(inv => inv.id === item.stoneId);
        return `${item.quantity}x ${inventoryItem?.type || 'Unknown'} (${inventoryItem?.gemId || item.stoneId})`;
      }).join(', ');
      
      toast({
        title: "Sale Created Successfully",
        description: `Sold: ${soldItems}. Inventory quantities have been updated.`,
      });
    } catch (error) {
      console.error('Error creating sale:', error);
      toast({
        title: "Error",
        description: "Failed to create sale. Please try again.",
        variant: "destructive"
      });
    }
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
      
      // Get the original sale items to calculate inventory adjustments
      const originalItems = editingSale.items || [];
      const newItems = data.items || [];
      
      // First, restore inventory quantities from the original sale
      for (const originalItem of originalItems) {
        let stoneId = originalItem.stoneId;
        let inventoryItem = null;
        
        // Try to find the inventory item by different methods
        if (stoneId && !isUuid(stoneId)) {
          // First try by UUID
          inventoryItem = inventory.find(s => s.id === stoneId);
          
          // If not found, try by gem_id
          if (!inventoryItem) {
            inventoryItem = inventory.find(s => (s.gemId || (s as any).gem_id) === stoneId);
          }
          
          // If still not found, try by type and carat (fallback method)
          if (!inventoryItem) {
            inventoryItem = inventory.find(s => 
              s.type === originalItem.stoneName && 
              Math.abs((s.carat || 0) - originalItem.carat) < 0.1 // Allow small difference in carat
            );
          }
          
          // Update stoneId to the actual inventory ID
          if (inventoryItem) {
            stoneId = inventoryItem.id;
          }
        } else if (stoneId) {
          // Direct UUID lookup
          inventoryItem = inventory.find(inv => inv.id === stoneId);
        }

        if (inventoryItem) {
          const currentQuantity = inventoryItem.quantity || 0;
          const restoredQuantity = originalItem.quantity || 1;
          const newQuantity = currentQuantity + restoredQuantity;
          
          console.log(`Restoring inventory for ${inventoryItem.type} (${inventoryItem.id}): ${currentQuantity} → ${newQuantity} (restored ${restoredQuantity})`);
          
          // Only update quantity and availability to avoid schema issues
          // Use direct Supabase call to avoid toSnakeCaseInventory conversion
          const { error } = await supabase
            .from('inventory')
            .update({ 
              quantity: newQuantity,
              is_available: newQuantity > 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', stoneId);
          
          if (error) {
            console.error('Error updating inventory:', error);
            throw error;
          }
        } else {
          console.warn(`Could not find inventory item for stone: ${originalItem.stoneName} (${originalItem.stoneId})`);
        }
      }
      
      await saleService.update(editingSale.id, saleData);
      
      // Replace multi-items for this sale
      await saleService.replaceItems(editingSale.id, newItems.map((it) => {
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
      
      // Now reduce inventory quantities for the new sale items
      for (const item of newItems) {
        let stoneId = item.stoneId;
        let inventoryItem = null;
        
        // Try to find the inventory item by different methods
        if (stoneId && !isUuid(stoneId)) {
          // First try by UUID
          inventoryItem = inventory.find(s => s.id === stoneId);
          
          // If not found, try by gem_id
          if (!inventoryItem) {
            inventoryItem = inventory.find(s => (s.gemId || (s as any).gem_id) === stoneId);
          }
          
          // If still not found, try by type and carat (fallback method)
          if (!inventoryItem) {
            inventoryItem = inventory.find(s => 
              s.type === item.stoneName && 
              Math.abs((s.carat || 0) - item.carat) < 0.1 // Allow small difference in carat
            );
          }
          
          // Update stoneId to the actual inventory ID
          if (inventoryItem) {
            stoneId = inventoryItem.id;
          }
        } else if (stoneId) {
          // Direct UUID lookup
          inventoryItem = inventory.find(inv => inv.id === stoneId);
        }

        if (inventoryItem) {
          const currentQuantity = inventoryItem.quantity || 0;
          const soldQuantity = item.quantity || 1;
          const newQuantity = Math.max(0, currentQuantity - soldQuantity);
          
          console.log(`Reducing inventory for ${inventoryItem.type} (${inventoryItem.id}): ${currentQuantity} → ${newQuantity} (sold ${soldQuantity})`);
          
          // Only update quantity and availability to avoid schema issues
          // Use direct Supabase call to avoid toSnakeCaseInventory conversion
          const { error } = await supabase
            .from('inventory')
            .update({ 
              quantity: newQuantity,
              is_available: newQuantity > 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', stoneId);
          
          if (error) {
            console.error('Error updating inventory:', error);
            throw error;
          }
        } else {
          console.warn(`Could not find inventory item for stone: ${item.stoneName} (${item.stoneId})`);
        }
      }
      
      // Reload sales and inventory data
      const [salesData, inventoryData] = await Promise.all([
        saleService.getAll(),
        inventoryService.getAll()
      ]);
      
      // Update local inventory state
      setInventory(inventoryData);
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
        // Get the sale details before deleting to restore inventory
        const saleToDelete = sales.find(sale => sale.id === id);
        
        if (saleToDelete && saleToDelete.items) {
          // Restore inventory quantities for each item in the sale
          for (const item of saleToDelete.items) {
            let stoneId = item.stoneId;
            let inventoryItem = null;
            
            // Try to find the inventory item by different methods
            if (stoneId && !isUuid(stoneId)) {
              // First try by UUID
              inventoryItem = inventory.find(s => s.id === stoneId);
              
              // If not found, try by gem_id
              if (!inventoryItem) {
                inventoryItem = inventory.find(s => (s.gemId || (s as any).gem_id) === stoneId);
              }
              
              // If still not found, try by type and carat (fallback method)
              if (!inventoryItem) {
                inventoryItem = inventory.find(s => 
                  s.type === item.stoneName && 
                  Math.abs((s.carat || 0) - item.carat) < 0.1 // Allow small difference in carat
                );
              }
              
              // Update stoneId to the actual inventory ID
              if (inventoryItem) {
                stoneId = inventoryItem.id;
              }
            } else if (stoneId) {
              // Direct UUID lookup
              inventoryItem = inventory.find(inv => inv.id === stoneId);
            }

            if (inventoryItem) {
              const currentQuantity = inventoryItem.quantity || 0;
              const restoredQuantity = item.quantity || 1;
              const newQuantity = currentQuantity + restoredQuantity;
              
              console.log(`Restoring inventory for ${inventoryItem.type} (${inventoryItem.id}): ${currentQuantity} → ${newQuantity} (restored ${restoredQuantity})`);
              
              // Only update quantity and availability to avoid schema issues
              // Use direct Supabase call to avoid toSnakeCaseInventory conversion
              const { error } = await supabase
                .from('inventory')
                .update({ 
                  quantity: newQuantity,
                  is_available: newQuantity > 0,
                  updated_at: new Date().toISOString()
                })
                .eq('id', stoneId);
              
              if (error) {
                console.error('Error updating inventory:', error);
                throw error;
              }
            } else {
              console.warn(`Could not find inventory item for stone: ${item.stoneName} (${item.stoneId})`);
            }
          }
        }
        
        await saleService.delete(id);
      setSales(sales.filter(sale => sale.id !== id));
        
        // Reload inventory data
        const inventoryData = await inventoryService.getAll();
        setInventory(inventoryData);
        
      toast({
        title: "Success",
          description: "Sale deleted successfully and inventory restored",
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
    return <SaleDetailView sale={selectedSale} onBack={handleBackToList} inventory={inventory} />;
  }

  return (
    <>
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Sales Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">Track your sales, generate invoices, and manage payments</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="btn-modern bg-gradient-to-r from-primary to-purple-600 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Sale
        </Button>
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

      {/* Add/Edit Sale Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSale ? 'Edit Sale' : 'Add New Sale'}</DialogTitle>
          </DialogHeader>
          <SaleForm
            sale={editingSale}
            inventory={inventory}
            clients={clients}
            onSubmit={editingSale ? handleUpdateSale : handleCreateSale}
            onClose={() => {
              setIsFormOpen(false);
              setEditingSale(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// Sale Detail View Component
function SaleDetailView({ 
  sale, 
  onBack,
  inventory,
}: { 
  sale: EnhancedSale; 
  onBack: () => void; 
  inventory: Inventory[];
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
              const companyInfo = (() => { try { return JSON.parse(localStorage.getItem('company-info') || '{}'); } catch { return {}; } })();
              const payload = {
                invoiceNumber: sale.saleId,
                date: formatDate(sale.date),
                clientName: sale.clientName || '',
                firmName: sale.firmName,
                gstNumber: sale.gstNumber,
                address: sale.address,
                phoneNumber: sale.phoneNumber,
                items: (sale.items || []).map((it) => ({
                  stoneId: it.stoneId,
                  stoneName: it.stoneName,
                  carat: it.carat,
                  pricePerCarat: it.pricePerCarat,
                  totalPrice: it.totalPrice,
                  quantity: it.quantity || 1,
                  hsn: '7113',
                  unit: 'ct',
                })),
                subtotal: parseFloat(sale.totalAmount),
                discount: sale.anyDiscount || 0,
                cgst,
                sgst,
                igst,
                totalAmount: totalWithTax,
                isOutOfState: sale.isOutOfState || false,
                paymentStatus: sale.paymentStatus,
                waitingPeriod: sale.waitingPeriod,
                isTrustworthy: sale.isTrustworthy,
                treatmentDisclosures: [],
                // Company overrides
                companyName: companyInfo.companyName,
                companyTagline: companyInfo.companyTagline,
                companyAddressLines: companyInfo.companyAddressLines,
                companyPhone: companyInfo.companyPhone,
                companyEmail: companyInfo.companyEmail,
                companyGstin: companyInfo.companyGstin,
                companyStateName: companyInfo.companyStateName,
                companyStateCode: companyInfo.companyStateCode,
                companyTin: companyInfo.companyTin,
                companyPan: companyInfo.companyPan,
                buyerStateName: companyInfo.buyerStateName,
                buyerStateCode: companyInfo.buyerStateCode,
                buyerTin: companyInfo.buyerTin,
                bankName: companyInfo.bankName,
                bankAccount: companyInfo.bankAccount,
                bankIfsc: companyInfo.bankIfsc,
                bankBranch: companyInfo.bankBranch,
                deliveryNote: companyInfo.deliveryNote,
                paymentTerms: companyInfo.paymentTerms,
                referenceNumber: companyInfo.referenceNumber,
                referenceDate: companyInfo.referenceDate,
                otherReferences: companyInfo.otherReferences,
                buyersOrderNumber: companyInfo.buyersOrderNumber,
                buyersOrderDate: companyInfo.buyersOrderDate,
                dispatchDocNo: companyInfo.dispatchDocNo,
                deliveryNoteDate: companyInfo.deliveryNoteDate,
                dispatchedThrough: companyInfo.dispatchedThrough,
                destination: companyInfo.destination,
                termsOfDelivery: companyInfo.termsOfDelivery,
              };
              const query = encodeURIComponent(JSON.stringify(payload));
              const url = `/invoice/print?data=${query}`;
              const a = document.createElement('a');
              a.href = url;
              a.target = '_blank';
              a.rel = 'noopener';
              a.click();
              toast({ title: 'HTML Invoice Opened', description: 'Use the Print button to save as PDF or print.' });
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download (HTML A4)
          </Button>
          <Button 
            className="btn-modern"
            onClick={() => {
              const companyInfo = (() => { try { return JSON.parse(localStorage.getItem('company-info') || '{}'); } catch { return {}; } })();
              const payload = {
                invoiceNumber: sale.saleId,
                date: formatDate(sale.date),
                clientName: sale.clientName || '',
                firmName: sale.firmName,
                gstNumber: sale.gstNumber,
                address: sale.address,
                phoneNumber: sale.phoneNumber,
                items: (sale.items || []).map((it) => ({
                  stoneId: it.stoneId,
                  stoneName: it.stoneName,
                  carat: it.carat,
                  pricePerCarat: it.pricePerCarat,
                  totalPrice: it.totalPrice,
                  quantity: it.quantity || 1,
                  hsn: '7113',
                  unit: 'ct',
                })),
                subtotal: parseFloat(sale.totalAmount),
                discount: sale.anyDiscount || 0,
                cgst,
                sgst,
                igst,
                totalAmount: totalWithTax,
                isOutOfState: sale.isOutOfState || false,
                paymentStatus: sale.paymentStatus,
                waitingPeriod: sale.waitingPeriod,
                isTrustworthy: sale.isTrustworthy,
                treatmentDisclosures: [],
                // Company overrides
                companyName: companyInfo.companyName,
                companyTagline: companyInfo.companyTagline,
                companyAddressLines: companyInfo.companyAddressLines,
                companyPhone: companyInfo.companyPhone,
                companyEmail: companyInfo.companyEmail,
                companyGstin: companyInfo.companyGstin,
                companyStateName: companyInfo.companyStateName,
                companyStateCode: companyInfo.companyStateCode,
                companyTin: companyInfo.companyTin,
                companyPan: companyInfo.companyPan,
                buyerStateName: companyInfo.buyerStateName,
                buyerStateCode: companyInfo.buyerStateCode,
                buyerTin: companyInfo.buyerTin,
                bankName: companyInfo.bankName,
                bankAccount: companyInfo.bankAccount,
                bankIfsc: companyInfo.bankIfsc,
                bankBranch: companyInfo.bankBranch,
                deliveryNote: companyInfo.deliveryNote,
                paymentTerms: companyInfo.paymentTerms,
                referenceNumber: companyInfo.referenceNumber,
                referenceDate: companyInfo.referenceDate,
                otherReferences: companyInfo.otherReferences,
                buyersOrderNumber: companyInfo.buyersOrderNumber,
                buyersOrderDate: companyInfo.buyersOrderDate,
                dispatchDocNo: companyInfo.dispatchDocNo,
                deliveryNoteDate: companyInfo.deliveryNoteDate,
                dispatchedThrough: companyInfo.dispatchedThrough,
                destination: companyInfo.destination,
                termsOfDelivery: companyInfo.termsOfDelivery,
              };
              const query = encodeURIComponent(JSON.stringify(payload));
              if (navigator.share) {
                navigator.share({ title: `Invoice ${sale.saleId}`, url: `${window.location.origin}/invoice/print?data=${query}` }).catch(()=>{});
              } else {
                window.open(`/invoice/print?data=${query}`, '_blank');
              }
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share (HTML A4)
          </Button>
          <Button 
            className="btn-modern"
            onClick={() => {
              const companyInfo = (() => { try { return JSON.parse(localStorage.getItem('company-info') || '{}'); } catch { return {}; } })();
              const payload = {
                invoiceNumber: sale.saleId,
                date: formatDate(sale.date),
                clientName: sale.clientName || '',
                firmName: sale.firmName,
                gstNumber: sale.gstNumber,
                address: sale.address,
                phoneNumber: sale.phoneNumber,
                items: (sale.items || []).map((it) => ({
                  stoneId: it.stoneId,
                  stoneName: it.stoneName,
                  carat: it.carat,
                  pricePerCarat: it.pricePerCarat,
                  totalPrice: it.totalPrice,
                  quantity: it.quantity || 1,
                  hsn: '7113',
                  unit: 'ct',
                })),
                subtotal: parseFloat(sale.totalAmount),
                discount: sale.anyDiscount || 0,
                cgst,
                sgst,
                igst,
                totalAmount: totalWithTax,
                isOutOfState: sale.isOutOfState || false,
                paymentStatus: sale.paymentStatus,
                waitingPeriod: sale.waitingPeriod,
                isTrustworthy: sale.isTrustworthy,
                treatmentDisclosures: [],
                // Company overrides
                companyName: companyInfo.companyName,
                companyTagline: companyInfo.companyTagline,
                companyAddressLines: companyInfo.companyAddressLines,
                companyPhone: companyInfo.companyPhone,
                companyEmail: companyInfo.companyEmail,
                companyGstin: companyInfo.companyGstin,
                companyStateName: companyInfo.companyStateName,
                companyStateCode: companyInfo.companyStateCode,
                companyTin: companyInfo.companyTin,
                companyPan: companyInfo.companyPan,
                buyerStateName: companyInfo.buyerStateName,
                buyerStateCode: companyInfo.buyerStateCode,
                buyerTin: companyInfo.buyerTin,
                bankName: companyInfo.bankName,
                bankAccount: companyInfo.bankAccount,
                bankIfsc: companyInfo.bankIfsc,
                bankBranch: companyInfo.bankBranch,
                deliveryNote: companyInfo.deliveryNote,
                paymentTerms: companyInfo.paymentTerms,
                referenceNumber: companyInfo.referenceNumber,
                referenceDate: companyInfo.referenceDate,
                otherReferences: companyInfo.otherReferences,
                buyersOrderNumber: companyInfo.buyersOrderNumber,
                buyersOrderDate: companyInfo.buyersOrderDate,
                dispatchDocNo: companyInfo.dispatchDocNo,
                deliveryNoteDate: companyInfo.deliveryNoteDate,
                dispatchedThrough: companyInfo.dispatchedThrough,
                destination: companyInfo.destination,
                termsOfDelivery: companyInfo.termsOfDelivery,
              };
              const query = encodeURIComponent(JSON.stringify(payload));
              const w = window.open(`/invoice/print?data=${query}`, '_blank');
              if (w) {
                const t = setInterval(() => { if (w.document && w.document.readyState === 'complete') { w.print(); clearInterval(t); } }, 300);
              }
            }}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print (HTML A4)
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
    notes: sale?.notes || '',
    // Invoice-specific fields
    buyersOrderNumber: sale?.buyersOrderNumber || '',
    buyersOrderDate: sale?.buyersOrderDate || '',
    dispatchDocNo: sale?.dispatchDocNo || '',
    deliveryNoteDate: sale?.deliveryNoteDate || '',
    dispatchedThrough: sale?.dispatchedThrough || '',
    destination: sale?.destination || '',
    termsOfDelivery: sale?.termsOfDelivery || ''
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
    
    // Validate inventory quantities
    for (const item of formData.items) {
      const inventoryItem = inventory.find(inv => inv.id === item.stoneId);
      if (inventoryItem) {
        const availableQuantity = inventoryItem.quantity || 0;
        const requestedQuantity = item.quantity || 1;
        
        if (requestedQuantity > availableQuantity) {
          toast({
            title: "Insufficient Inventory",
            description: `${inventoryItem.type} (${inventoryItem.gemId}) only has ${availableQuantity} available, but you're trying to sell ${requestedQuantity}`,
            variant: "destructive"
          });
          return;
        }
      }
    }
    
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
      paymentStatus: formData.paymentStatus,
      // Include invoice fields
      buyersOrderNumber: formData.buyersOrderNumber,
      buyersOrderDate: formData.buyersOrderDate,
      dispatchDocNo: formData.dispatchDocNo,
      deliveryNoteDate: formData.deliveryNoteDate,
      dispatchedThrough: formData.dispatchedThrough,
      destination: formData.destination,
      termsOfDelivery: formData.termsOfDelivery
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

  const handleClientChange = async (clientId: string) => {
    console.log('🔍 handleClientChange called with clientId:', clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      console.log('📋 Found client:', client.name);
      
      // Get company profile for defaults
      const companyProfile = companyProfileService.get();
      console.log('🏢 Company profile:', companyProfile);
      
      // Set basic defaults first (immediate)
      const currentYear = new Date().getFullYear();
      const basicDefaults = {
        buyersOrderNumber: `PO-${currentYear}-001`,
        buyersOrderDate: new Date().toISOString().split('T')[0],
        dispatchDocNo: `DISP-${currentYear}-001`,
        deliveryNoteDate: new Date().toISOString().split('T')[0],
        dispatchedThrough: companyProfile.dispatchedThrough || 'Courier',
        destination: companyProfile.destination || 'Mumbai',
        termsOfDelivery: companyProfile.termsOfDelivery || 'As discussed'
      };
      
      // Update form with basic defaults immediately
      setFormData(prev => ({
        ...prev,
        ...basicDefaults
      }));
      
      // Get previous sales for this client to auto-increment numbers
      let lastOrderNumber = '';
      let lastDispatchNumber = '';
      
      try {
        console.log('🔍 Fetching previous sales for client:', clientId);
        const { data: previousSales } = await supabase
          .from('sales')
          .select('buyers_order_number, dispatch_doc_no')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        console.log('📊 Previous sales data:', previousSales);
        
        if (previousSales && previousSales.length > 0) {
          const lastSale = previousSales[0];
          lastOrderNumber = lastSale.buyers_order_number || '';
          lastDispatchNumber = lastSale.dispatch_doc_no || '';
          console.log('📈 Last order number:', lastOrderNumber);
          console.log('📈 Last dispatch number:', lastDispatchNumber);
        }
      } catch (error) {
        console.log('❌ Error fetching previous sales:', error);
      }
      
      // Auto-generate next numbers
      const generateNextNumber = (lastNumber: string, prefix: string) => {
        if (!lastNumber) return `${prefix}-${currentYear}-001`;
        
        const match = lastNumber.match(new RegExp(`${prefix}-\\d{4}-(\\d+)`));
        if (match) {
          const nextNum = parseInt(match[1]) + 1;
          return `${prefix}-${currentYear}-${nextNum.toString().padStart(3, '0')}`;
        }
        return `${prefix}-${currentYear}-001`;
      };
      
      const nextOrderNumber = generateNextNumber(lastOrderNumber, 'PO');
      const nextDispatchNumber = generateNextNumber(lastDispatchNumber, 'DISP');
      
      console.log('🆕 Generated next order number:', nextOrderNumber);
      console.log('🆕 Generated next dispatch number:', nextDispatchNumber);
      
      // Get client's state from address or set default
      const clientState = client.state || extractStateFromAddress(client.address || '') || companyProfile.buyerStateName;
      console.log('📍 Client state:', clientState);
      
      const updatedFormData = {
        ...formData,
        clientId,
        clientName: client.name,
        firmName: client.businessName || '',
        gstNumber: client.gstNumber || '',
        address: client.address || '',
        phoneNumber: client.phone || '',
        // Auto-fill invoice fields with improved numbers
        buyersOrderNumber: nextOrderNumber,
        buyersOrderDate: new Date().toISOString().split('T')[0],
        dispatchDocNo: nextDispatchNumber,
        deliveryNoteDate: new Date().toISOString().split('T')[0],
        dispatchedThrough: companyProfile.dispatchedThrough || 'Courier',
        destination: clientState || companyProfile.destination || 'Mumbai',
        termsOfDelivery: companyProfile.termsOfDelivery || 'As discussed'
      };
      
      console.log('✅ Updated form data:', updatedFormData);
      setFormData(updatedFormData);
    }
  };

  // Helper function to extract state from address
  const extractStateFromAddress = (address: string): string | null => {
    const statePatterns = [
      'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Uttar Pradesh',
      'West Bengal', 'Telangana', 'Andhra Pradesh', 'Kerala', 'Rajasthan', 'Madhya Pradesh',
      'Punjab', 'Haryana', 'Bihar', 'Odisha', 'Assam', 'Jharkhand', 'Chhattisgarh',
      'Uttarakhand', 'Himachal Pradesh', 'Goa', 'Manipur', 'Meghalaya', 'Tripura',
      'Arunachal Pradesh', 'Nagaland', 'Mizoram', 'Sikkim'
    ];
    
    for (const state of statePatterns) {
      if (address.toLowerCase().includes(state.toLowerCase())) {
        return state;
      }
    }
    return null;
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
            <Select value={formData.clientId} onValueChange={(clientId) => {
              console.log('🎯 Client selected:', clientId);
              // First update the client info immediately
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
                
                // Then trigger the async auto-fill
                handleClientChange(clientId);
              }
            }}>
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
            {formData.clientId && (
              <div className="mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    console.log('🧪 Testing auto-fill for client:', formData.clientId);
                    handleClientChange(formData.clientId);
                  }}
                >
                  🔄 Test Auto-Fill
                </Button>
              </div>
            )}
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

        {/* Invoice Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Invoice Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buyersOrderNumber">Buyer's Order No.</Label>
              <Input
                id="buyersOrderNumber"
                value={formData.buyersOrderNumber}
                onChange={(e) => setFormData({...formData, buyersOrderNumber: e.target.value})}
                className="input-modern"
                placeholder="PO-2025-001"
              />
            </div>
            <div>
              <Label htmlFor="buyersOrderDate">Order Date</Label>
              <Input
                id="buyersOrderDate"
                type="date"
                value={formData.buyersOrderDate}
                onChange={(e) => setFormData({...formData, buyersOrderDate: e.target.value})}
                className="input-modern"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dispatchDocNo">Dispatch Doc No.</Label>
              <Input
                id="dispatchDocNo"
                value={formData.dispatchDocNo}
                onChange={(e) => setFormData({...formData, dispatchDocNo: e.target.value})}
                className="input-modern"
                placeholder="DISP-2025-089"
              />
            </div>
            <div>
              <Label htmlFor="deliveryNoteDate">Delivery Note Date</Label>
              <Input
                id="deliveryNoteDate"
                type="date"
                value={formData.deliveryNoteDate}
                onChange={(e) => setFormData({...formData, deliveryNoteDate: e.target.value})}
                className="input-modern"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dispatchedThrough">Dispatched Through</Label>
              <Select value={formData.dispatchedThrough} onValueChange={(value) => setFormData({...formData, dispatchedThrough: value})}>
                <SelectTrigger className="input-modern">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Courier">Courier</SelectItem>
                  <SelectItem value="Hand Delivery">Hand Delivery</SelectItem>
                  <SelectItem value="Transport Company">Transport Company</SelectItem>
                  <SelectItem value="By Road">By Road</SelectItem>
                  <SelectItem value="Express Delivery">Express Delivery</SelectItem>
                  <SelectItem value="Local Pickup">Local Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Select value={formData.destination} onValueChange={(value) => setFormData({...formData, destination: value})}>
                <SelectTrigger className="input-modern">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Kolkata">Kolkata</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                  <SelectItem value="Pune">Pune</SelectItem>
                  <SelectItem value="Jaipur">Jaipur</SelectItem>
                  <SelectItem value="Lucknow">Lucknow</SelectItem>
                  <SelectItem value="Kanpur">Kanpur</SelectItem>
                  <SelectItem value="Nagpur">Nagpur</SelectItem>
                  <SelectItem value="Indore">Indore</SelectItem>
                  <SelectItem value="Thane">Thane</SelectItem>
                  <SelectItem value="Bhopal">Bhopal</SelectItem>
                  <SelectItem value="Visakhapatnam">Visakhapatnam</SelectItem>
                  <SelectItem value="Patna">Patna</SelectItem>
                  <SelectItem value="Vadodara">Vadodara</SelectItem>
                  <SelectItem value="Ghaziabad">Ghaziabad</SelectItem>
                  <SelectItem value="Ludhiana">Ludhiana</SelectItem>
                  <SelectItem value="Agra">Agra</SelectItem>
                  <SelectItem value="Nashik">Nashik</SelectItem>
                  <SelectItem value="Faridabad">Faridabad</SelectItem>
                  <SelectItem value="Meerut">Meerut</SelectItem>
                  <SelectItem value="Rajkot">Rajkot</SelectItem>
                  <SelectItem value="Kalyan">Kalyan</SelectItem>
                  <SelectItem value="Vasai">Vasai</SelectItem>
                  <SelectItem value="Varanasi">Varanasi</SelectItem>
                  <SelectItem value="Srinagar">Srinagar</SelectItem>
                  <SelectItem value="Aurangabad">Aurangabad</SelectItem>
                  <SelectItem value="Dhanbad">Dhanbad</SelectItem>
                  <SelectItem value="Amritsar">Amritsar</SelectItem>
                  <SelectItem value="Allahabad">Allahabad</SelectItem>
                  <SelectItem value="Ranchi">Ranchi</SelectItem>
                  <SelectItem value="Howrah">Howrah</SelectItem>
                  <SelectItem value="Coimbatore">Coimbatore</SelectItem>
                  <SelectItem value="Jabalpur">Jabalpur</SelectItem>
                  <SelectItem value="Gwalior">Gwalior</SelectItem>
                  <SelectItem value="Vijayawada">Vijayawada</SelectItem>
                  <SelectItem value="Jodhpur">Jodhpur</SelectItem>
                  <SelectItem value="Madurai">Madurai</SelectItem>
                  <SelectItem value="Raipur">Raipur</SelectItem>
                  <SelectItem value="Kota">Kota</SelectItem>
                  <SelectItem value="Guwahati">Guwahati</SelectItem>
                  <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                  <SelectItem value="Solapur">Solapur</SelectItem>
                  <SelectItem value="Hubli">Hubli</SelectItem>
                  <SelectItem value="Bareilly">Bareilly</SelectItem>
                  <SelectItem value="Moradabad">Moradabad</SelectItem>
                  <SelectItem value="Mysore">Mysore</SelectItem>
                  <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                  <SelectItem value="Aligarh">Aligarh</SelectItem>
                  <SelectItem value="Jalandhar">Jalandhar</SelectItem>
                  <SelectItem value="Tiruchirappalli">Tiruchirappalli</SelectItem>
                  <SelectItem value="Bhubaneswar">Bhubaneswar</SelectItem>
                  <SelectItem value="Salem">Salem</SelectItem>
                  <SelectItem value="Warangal">Warangal</SelectItem>
                  <SelectItem value="Guntur">Guntur</SelectItem>
                  <SelectItem value="Bhiwandi">Bhiwandi</SelectItem>
                  <SelectItem value="Saharanpur">Saharanpur</SelectItem>
                  <SelectItem value="Gorakhpur">Gorakhpur</SelectItem>
                  <SelectItem value="Bikaner">Bikaner</SelectItem>
                  <SelectItem value="Amravati">Amravati</SelectItem>
                  <SelectItem value="Noida">Noida</SelectItem>
                  <SelectItem value="Jamshedpur">Jamshedpur</SelectItem>
                  <SelectItem value="Bhilai">Bhilai</SelectItem>
                  <SelectItem value="Cuttack">Cuttack</SelectItem>
                  <SelectItem value="Firozabad">Firozabad</SelectItem>
                  <SelectItem value="Kochi">Kochi</SelectItem>
                  <SelectItem value="Nellore">Nellore</SelectItem>
                  <SelectItem value="Bhavnagar">Bhavnagar</SelectItem>
                  <SelectItem value="Dehradun">Dehradun</SelectItem>
                  <SelectItem value="Durgapur">Durgapur</SelectItem>
                  <SelectItem value="Asansol">Asansol</SelectItem>
                  <SelectItem value="Rourkela">Rourkela</SelectItem>
                  <SelectItem value="Nanded">Nanded</SelectItem>
                  <SelectItem value="Kolhapur">Kolhapur</SelectItem>
                  <SelectItem value="Ajmer">Ajmer</SelectItem>
                  <SelectItem value="Akola">Akola</SelectItem>
                  <SelectItem value="Gulbarga">Gulbarga</SelectItem>
                  <SelectItem value="Loni">Loni</SelectItem>
                  <SelectItem value="Ujjain">Ujjain</SelectItem>
                  <SelectItem value="Siliguri">Siliguri</SelectItem>
                  <SelectItem value="Jhansi">Jhansi</SelectItem>
                  <SelectItem value="Ulhasnagar">Ulhasnagar</SelectItem>
                  <SelectItem value="Jammu">Jammu</SelectItem>
                  <SelectItem value="Sangli">Sangli</SelectItem>
                  <SelectItem value="Miraj">Miraj</SelectItem>
                  <SelectItem value="Belgaum">Belgaum</SelectItem>
                  <SelectItem value="Mangalore">Mangalore</SelectItem>
                  <SelectItem value="Ambattur">Ambattur</SelectItem>
                  <SelectItem value="Tirunelveli">Tirunelveli</SelectItem>
                  <SelectItem value="Malegaon">Malegaon</SelectItem>
                  <SelectItem value="Gaya">Gaya</SelectItem>
                  <SelectItem value="Jalgaon">Jalgaon</SelectItem>
                  <SelectItem value="Udaipur">Udaipur</SelectItem>
                  <SelectItem value="Maheshtala">Maheshtala</SelectItem>
                  <SelectItem value="Tirupur">Tirupur</SelectItem>
                  <SelectItem value="Davanagere">Davanagere</SelectItem>
                  <SelectItem value="Kozhikode">Kozhikode</SelectItem>
                  <SelectItem value="Akbarpur">Akbarpur</SelectItem>
                  <SelectItem value="Kurnool">Kurnool</SelectItem>
                  <SelectItem value="Bokaro">Bokaro</SelectItem>
                  <SelectItem value="Rajahmundry">Rajahmundry</SelectItem>
                  <SelectItem value="Ballari">Ballari</SelectItem>
                  <SelectItem value="Agartala">Agartala</SelectItem>
                  <SelectItem value="Bhagalpur">Bhagalpur</SelectItem>
                  <SelectItem value="Latur">Latur</SelectItem>
                  <SelectItem value="Dhule">Dhule</SelectItem>
                  <SelectItem value="Korba">Korba</SelectItem>
                  <SelectItem value="Bhilwara">Bhilwara</SelectItem>
                  <SelectItem value="Brahmapur">Brahmapur</SelectItem>
                  <SelectItem value="Muzaffarpur">Muzaffarpur</SelectItem>
                  <SelectItem value="Ahmednagar">Ahmednagar</SelectItem>
                  <SelectItem value="Mathura">Mathura</SelectItem>
                  <SelectItem value="Kollam">Kollam</SelectItem>
                  <SelectItem value="Avadi">Avadi</SelectItem>
                  <SelectItem value="Kadapa">Kadapa</SelectItem>
                  <SelectItem value="Anantapuram">Anantapuram</SelectItem>
                  <SelectItem value="Tiruvottiyur">Tiruvottiyur</SelectItem>
                  <SelectItem value="Bardhaman">Bardhaman</SelectItem>
                  <SelectItem value="Kamarhati">Kamarhati</SelectItem>
                  <SelectItem value="Sasthamkotta">Sasthamkotta</SelectItem>
                  <SelectItem value="Bihar Sharif">Bihar Sharif</SelectItem>
                  <SelectItem value="Panipat">Panipat</SelectItem>
                  <SelectItem value="Darbhanga">Darbhanga</SelectItem>
                  <SelectItem value="Bally">Bally</SelectItem>
                  <SelectItem value="Aizawl">Aizawl</SelectItem>
                  <SelectItem value="Dewas">Dewas</SelectItem>
                  <SelectItem value="Ichalkaranji">Ichalkaranji</SelectItem>
                  <SelectItem value="Tirupati">Tirupati</SelectItem>
                  <SelectItem value="Karnal">Karnal</SelectItem>
                  <SelectItem value="Bathinda">Bathinda</SelectItem>
                  <SelectItem value="Rampur">Rampur</SelectItem>
                  <SelectItem value="Shivamogga">Shivamogga</SelectItem>
                  <SelectItem value="Ratlam">Ratlam</SelectItem>
                  <SelectItem value="Modinagar">Modinagar</SelectItem>
                  <SelectItem value="Durg">Durg</SelectItem>
                  <SelectItem value="Shillong">Shillong</SelectItem>
                  <SelectItem value="Imphal">Imphal</SelectItem>
                  <SelectItem value="Hapur">Hapur</SelectItem>
                  <SelectItem value="Ranipet">Ranipet</SelectItem>
                  <SelectItem value="Anand">Anand</SelectItem>
                  <SelectItem value="Munger">Munger</SelectItem>
                  <SelectItem value="Bhind">Bhind</SelectItem>
                  <SelectItem value="Arrah">Arrah</SelectItem>
                  <SelectItem value="Rajnandgaon">Rajnandgaon</SelectItem>
                  <SelectItem value="Waidhan">Waidhan</SelectItem>
                  <SelectItem value="Sujangarh">Sujangarh</SelectItem>
                  <SelectItem value="Nangloi Jat">Nangloi Jat</SelectItem>
                  <SelectItem value="Kanpur Cantonment">Kanpur Cantonment</SelectItem>
                  <SelectItem value="Vidisha">Vidisha</SelectItem>
                  <SelectItem value="Gondia">Gondia</SelectItem>
                  <SelectItem value="Sagar">Sagar</SelectItem>
                  <SelectItem value="Bharatpur">Bharatpur</SelectItem>
                  <SelectItem value="Hajipur">Hajipur</SelectItem>
                  <SelectItem value="Chhapra">Chhapra</SelectItem>
                  <SelectItem value="Khandwa">Khandwa</SelectItem>
                  <SelectItem value="Yamunanagar">Yamunanagar</SelectItem>
                  <SelectItem value="Bidar">Bidar</SelectItem>
                  <SelectItem value="Patiala">Patiala</SelectItem>
                  <SelectItem value="Kharagpur">Kharagpur</SelectItem>
                  <SelectItem value="Puducherry">Puducherry</SelectItem>
                  <SelectItem value="Port Blair">Port Blair</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="termsOfDelivery">Terms of Delivery</Label>
              <Select value={formData.termsOfDelivery} onValueChange={(value) => setFormData({...formData, termsOfDelivery: value})}>
                <SelectTrigger className="input-modern">
                  <SelectValue placeholder="Select terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="As discussed">As discussed</SelectItem>
                  <SelectItem value="FOB">FOB (Free On Board)</SelectItem>
                  <SelectItem value="CIF">CIF (Cost, Insurance, Freight)</SelectItem>
                  <SelectItem value="Ex-factory">Ex-factory</SelectItem>
                  <SelectItem value="Ex-works">Ex-works</SelectItem>
                  <SelectItem value="DDP">DDP (Delivered Duty Paid)</SelectItem>
                  <SelectItem value="DDU">DDU (Delivered Duty Unpaid)</SelectItem>
                  <SelectItem value="CPT">CPT (Carriage Paid To)</SelectItem>
                  <SelectItem value="CIP">CIP (Carriage and Insurance Paid)</SelectItem>
                  <SelectItem value="FAS">FAS (Free Alongside Ship)</SelectItem>
                  <SelectItem value="CFR">CFR (Cost and Freight)</SelectItem>
                  <SelectItem value="DAF">DAF (Delivered At Frontier)</SelectItem>
                  <SelectItem value="DES">DES (Delivered Ex Ship)</SelectItem>
                  <SelectItem value="DEQ">DEQ (Delivered Ex Quay)</SelectItem>
                  <SelectItem value="DDP">DDP (Delivered Duty Paid)</SelectItem>
                  <SelectItem value="DDU">DDU (Delivered Duty Unpaid)</SelectItem>
                  <SelectItem value="EXW">EXW (Ex Works)</SelectItem>
                  <SelectItem value="FCA">FCA (Free Carrier)</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                  <SelectItem value="Net 90">Net 90</SelectItem>
                  <SelectItem value="Immediate">Immediate</SelectItem>
                  <SelectItem value="50% Advance">50% Advance</SelectItem>
                  <SelectItem value="100% Advance">100% Advance</SelectItem>
                  <SelectItem value="COD">COD (Cash on Delivery)</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                              ID: {stone.gemId || stone.id} • {carat}ct • ₹{pricePerCarat}/ct • Available: {stone.quantity || 0}
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
              className={`input-modern ${newItem.stoneId && (() => {
                const stone = inventory.find(s => s.id === newItem.stoneId);
                return stone && newItem.quantity > (stone.quantity || 0) ? 'border-red-500' : '';
              })()}`}
              placeholder="e.g., 1"
            />
            {newItem.stoneId && (() => {
              const stone = inventory.find(s => s.id === newItem.stoneId);
              if (stone && newItem.quantity > (stone.quantity || 0)) {
                return (
                  <div className="text-xs text-red-500 mt-1">
                    Warning: Only {stone.quantity || 0} available
                  </div>
                );
              }
              return null;
            })()}
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
                isTrustworthy: sale.isTrustworthy,
                // Include invoice-specific fields
                buyersOrderNumber: sale.buyersOrderNumber,
                buyersOrderDate: sale.buyersOrderDate,
                dispatchDocNo: sale.dispatchDocNo,
                deliveryNoteDate: sale.deliveryNoteDate,
                dispatchedThrough: sale.dispatchedThrough,
                destination: sale.destination,
                termsOfDelivery: sale.termsOfDelivery
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
