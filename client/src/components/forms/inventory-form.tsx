import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
import { insertInventorySchema, type Inventory, type InsertInventory, type Supplier } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GEMSTONE_TYPES, GEMSTONE_ORIGINS, CERTIFICATION_LABS, STONE_STATUS, PACKAGE_TYPES } from "@/lib/constants";
import { v4 as uuidv4 } from 'uuid'

interface InventoryFormProps {
  item?: Inventory | null;
  onClose: () => void;
}

export default function InventoryForm({ item, onClose }: InventoryFormProps) {
  console.log('InventoryForm component is loading!');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const suppliers: Supplier[] = [];
  
  // Simplified form for testing
  const form = useForm<InsertInventory>({
    defaultValues: {
      gemId: uuidv4(),
      type: "",
      grade: "A",
      carat: 0,
      origin: "",
      customOrigin: "",
      pricePerCarat: 0,
      totalPrice: 0,
      isAvailable: true,
      quantity: 1,
      imageUrl: "",
      description: "",
      supplierId: "",
      certified: false,
      certificateLab: "",
      certificateFile: "",
      status: "In Stock",
      packageType: "",
      notes: "",
      tags: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertInventory) => {
      return apiRequest("POST", "/api/inventory", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Success",
        description: "Gemstone added successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || error?.data?.message || JSON.stringify(error) || "Failed to add gemstone",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertInventory) => {
      return apiRequest("PATCH", `/api/inventory/${item!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Success",
        description: "Gemstone updated successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || error?.data?.message || JSON.stringify(error) || "Failed to update gemstone",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InsertInventory) => {
    console.log('Form submitted with data:', data);
    alert('Form submitted! Check console for data.');
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
        <h2 className="text-xl font-bold text-red-800">FORM TEST</h2>
        <p className="text-red-600">If you can see this, the component is loading!</p>
        <Button 
          type="button" 
          onClick={() => {
            console.log('Form test button clicked');
            alert('Form is working!');
          }}
          className="mt-2"
        >
          Test Button
        </Button>
      </div>
      
      <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-bold text-blue-800">SIMPLE TEST</h3>
        <p className="text-blue-600">This is a simple test without Form wrapper</p>
      </div>
      
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-green-100 border border-green-300 rounded-lg p-4">
            <h3 className="text-lg font-bold text-green-800">BASIC FORM TEST</h3>
            <p className="text-green-600">Form is rendering!</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stone ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gemstone Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GEMSTONE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                      <SelectItem value="Custom">Custom Type</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="carat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carat Weight</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select origin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GEMSTONE_ORIGINS.map((origin) => (
                        <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                      ))}
                      <SelectItem value="Custom">Custom Origin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("origin") === "Custom" && (
              <FormField
                control={form.control}
                name="customOrigin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Origin</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter custom origin" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Custom Origin Field (duplicated safeguard removed) */}

          {/* Image Upload */}
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stone Image</FormLabel>
                <FormControl>
                  <FileUpload
                    onFileSelect={(file) => {
                      setSelectedImage(file);
                      field.onChange(file.name);
                    }}
                    onFileRemove={() => {
                      setSelectedImage(null);
                      field.onChange("");
                    }}
                    currentFile={field.value}
                    accept={{
                      'image/*': ['.jpeg', '.jpg', '.png']
                    }}
                    maxSize={5 * 1024 * 1024} // 5MB
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pricePerCarat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Per Carat (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Price (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STONE_STATUS.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="packageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select package" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PACKAGE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Simple Certification Test */}
          <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
            <h3 className="text-lg font-bold text-red-800">CERTIFICATION SECTION TEST</h3>
            <p className="text-red-600">If you can see this, the form is working!</p>
            <p className="text-sm text-red-500">Certified value: {form.watch("certified") ? "TRUE" : "FALSE"}</p>
            <Button 
              type="button" 
              onClick={() => {
                console.log('Form values:', form.getValues());
                alert('Check console for form values');
              }}
              className="mt-2"
            >
              Test Button
            </Button>
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ""} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : item ? "Update Stone" : "Add Stone"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
