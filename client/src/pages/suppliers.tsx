import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type Supplier } from "@shared/schema";
import { Plus, Search, Edit, Trash2, Truck } from "lucide-react";
import SupplierForm from "@/components/forms/supplier-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { supplierService } from "@/lib/database";
import React from "react";

export default function Suppliers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Utility: Map snake_case from DB to camelCase for UI
  function mapSupplierFromDb(item: any) {
    return {
      ...item,
      gemstoneTypes: item.gemstone_types,
      certificationOptions: item.certification_options,
      businessName: item.business_name,
      businessAddress: item.business_address,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      tags: item.tags,
      arrivalDate: item.arrival_date,
      departureDate: item.departure_date,
      city: item.city,
      state: item.state,
      gstNumber: item.gst_number,
      landmark: item.landmark,
      totalAmount: item.total_amount,
      totalSold: item.total_sold,
      qualityRating: item.quality_rating,
      reliabilityScore: item.reliability_score,
      lastTransactionDate: item.last_transaction_date,
    };
  }
  // Utility: Map camelCase from UI to snake_case for DB


  // Load suppliers from Supabase
  async function loadSuppliers() {
    setLoading(true);
    try {
      const data = await supplierService.getAll();
      setSuppliers(data.map(mapSupplierFromDb));
    } catch (error) {
      toast({ title: "Error", description: "Failed to load suppliers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }
  // Load on mount
  React.useEffect(() => { loadSuppliers(); }, []);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (supplier.phone && supplier.phone.includes(searchQuery))
  );

  // Add supplier
  const handleAddSupplier = async (data: any) => {
    try {
      const created = await supplierService.create(data);
      setSuppliers(prev => [mapSupplierFromDb(created), ...prev]);
      setIsFormOpen(false);
      toast({ title: "Success", description: "Supplier added successfully" });
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast({ title: "Error", description: "Failed to add supplier", variant: "destructive" });
    }
  };

  // Edit supplier
  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };
  const handleUpdateSupplier = async (data: any) => {
    if (!editingSupplier) return;
    try {
      const mergedData = { ...editingSupplier, ...data };
      const updated = await supplierService.update(editingSupplier.id, mergedData);
      
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? mapSupplierFromDb(updated) : s));
      setEditingSupplier(null);
      setIsFormOpen(false);
      toast({ title: "Success", description: "Supplier updated successfully" });
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast({ title: "Error", description: "Failed to update supplier", variant: "destructive" });
    }
  };

  // Delete supplier
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      try {
        await supplierService.delete(id);
        setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
        toast({ title: "Success", description: "Supplier deleted successfully" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete supplier", variant: "destructive" });
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSupplier(null);
  };

  const getSupplierTypeColor = (type: string) => {
    switch (type) {
      case 'Domestic':
        return 'bg-green-100 text-green-800';
      case 'International':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600">Manage your gemstone suppliers</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Supplier</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
              </DialogTitle>
            </DialogHeader>
            <SupplierForm 
              supplier={editingSupplier} 
              onClose={handleFormClose}
              onSubmit={editingSupplier ? handleUpdateSupplier : handleAddSupplier}
            />
          </DialogContent>
        </Dialog>
        
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Supplier Directory</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? "No suppliers match your search criteria" : "Get started by adding your first supplier"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Supplier
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Gemstone Types</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>
                        <Badge className={getSupplierTypeColor(supplier.type)}>
                          {supplier.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{supplier.location}</TableCell>
                      <TableCell>{supplier.phone || '-'}</TableCell>
                      <TableCell>{supplier.email || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {supplier.gemstoneTypes?.slice(0, 2).map((type, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                          {supplier.gemstoneTypes && supplier.gemstoneTypes.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{supplier.gemstoneTypes.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(supplier)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(supplier.id)}
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
