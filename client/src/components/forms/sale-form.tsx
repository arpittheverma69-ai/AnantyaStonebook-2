import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { insertSaleSchema, type Sale, type InsertSale, type Client, type Inventory } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PAYMENT_STATUS } from "@/lib/constants";
import { useEffect } from "react";

interface SaleFormProps {
  sale?: Sale | null;
  onClose: () => void;
}

export default function SaleForm({ sale, onClose }: SaleFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: inventory = [] } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const form = useForm<InsertSale>({
    resolver: zodResolver(insertSaleSchema),
    defaultValues: sale ? {
      saleId: sale.saleId,
      date: sale.date,
      clientId: sale.clientId || "",
      stoneId: sale.stoneId || "",
      quantity: sale.quantity || 1,
      totalAmount: sale.totalAmount,
      profit: sale.profit,
      paymentStatus: sale.paymentStatus,
      notes: sale.notes || "",
    } : {
      saleId: `SALE-${Date.now()}`,
      date: new Date(),
      clientId: "",
      stoneId: "",
      quantity: 1,
      totalAmount: "0",
      profit: "0",
      paymentStatus: "Unpaid",
      notes: "",
    },
  });

  const watchedStoneId = form.watch("stoneId");
  const watchedTotalAmount = form.watch("totalAmount");

  // Auto-calculate profit when stone or total amount changes
  useEffect(() => {
    if (watchedStoneId && watchedTotalAmount) {
      const selectedStone = inventory.find(item => item.id === watchedStoneId);
      if (selectedStone) {
        const profit = parseFloat(watchedTotalAmount) - parseFloat(selectedStone.purchasePrice);
        form.setValue("profit", profit.toString());
      }
    }
  }, [watchedStoneId, watchedTotalAmount, inventory, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertSale) => {
      return apiRequest("POST", "/api/sales", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Success",
        description: "Sale recorded successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record sale",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertSale) => {
      return apiRequest("PATCH", `/api/sales/${sale!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      toast({
        title: "Success",
        description: "Sale updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update sale",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSale) => {
    if (sale) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const availableStones = inventory.filter(item => item.status === "In Stock");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="saleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale ID</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} ({client.clientType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stoneId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stone</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableStones.map((stone) => (
                      <SelectItem key={stone.id} value={stone.id}>
                        {stone.type} - {stone.carat} Carat ({stone.stoneId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount (₹)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="profit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profit (₹)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} readOnly className="bg-gray-50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="paymentStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_STATUS.map((status) => (
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
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
            {isLoading ? "Saving..." : sale ? "Update Sale" : "Record Sale"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
