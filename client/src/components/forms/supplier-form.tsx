import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { type Supplier } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { SUPPLIER_TYPES, GEMSTONE_TYPES } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Star, TrendingUp, TrendingDown, Clock, Award, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SupplierFormProps {
  supplier?: Supplier | null;
  onClose: () => void;
}

// Popular gemstone trading locations
const POPULAR_LOCATIONS = [
  "Jaipur, Rajasthan",
  "Surat, Gujarat", 
  "Bangkok, Thailand",
  "Colombo, Sri Lanka",
  "Yangon, Myanmar",
  "Nairobi, Kenya",
  "Antwerp, Belgium",
  "Hong Kong, China",
  "Mumbai, Maharashtra",
  "Delhi, NCR"
];

// Quality indicators
const QUALITY_INDICATORS = [
  "Premium Quality",
  "Reliable Supplier", 
  "Certified Stones",
  "Good Pricing",
  "On-Time Delivery",
  "Quality Guarantee",
  "Bulk Supplier",
  "Direct Source",
  "Trusted Partner",
  "High-End Stones"
];

// Custom schema for form that accepts strings for arrays
const supplierFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  type: z.string().min(1, "Type is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  gemstoneTypes: z.string().optional(), // Accept string, will convert to array
  certificationOptions: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(), // Accept string, will convert to array
  arrivalDate: z.string().optional(),
  departureDate: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  gstNumber: z.string().optional(),
  landmark: z.string().optional(),
  totalAmount: z.string().optional(), // Accept string, will convert to number
  totalSold: z.string().optional(), // Accept string, will convert to number
  qualityRating: z.union([z.number(), z.string()]).optional().transform((val) => {
    if (typeof val === 'string') return parseInt(val) || 0;
    return val || 0;
  }),
  reliabilityScore: z.union([z.number(), z.string()]).optional().transform((val) => {
    if (typeof val === 'string') return parseInt(val) || 0;
    return val || 0;
  }),
  lastTransactionDate: z.string().optional(),
});

export default function SupplierForm({ supplier, onClose, onSubmit }: SupplierFormProps & { onSubmit: (data: any) => void }) {
  const { toast } = useToast();
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState(POPULAR_LOCATIONS);
  const [selectedQualityTags, setSelectedQualityTags] = useState<string[]>([]);
  const [supplierScore, setSupplierScore] = useState(0);

  const form = useForm<z.infer<typeof supplierFormSchema>>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: supplier ? {
      name: supplier.name,
      location: supplier.location,
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      type: supplier.type,
      gemstoneTypes: Array.isArray(supplier.gemstoneTypes) ? supplier.gemstoneTypes.join(', ') : supplier.gemstoneTypes || "",
      certificationOptions: supplier.certificationOptions || "",
      notes: supplier.notes || "",
      tags: Array.isArray(supplier.tags) ? supplier.tags.join(', ') : supplier.tags || "",
      arrivalDate: supplier.arrivalDate ? supplier.arrivalDate.toString().split('T')[0] : "",
      departureDate: supplier.departureDate ? supplier.departureDate.toString().split('T')[0] : "",
      city: supplier.city || "",
      state: supplier.state || "",
      gstNumber: supplier.gstNumber || "",
      landmark: supplier.landmark || "",
      totalAmount: supplier.totalAmount ? supplier.totalAmount.toString() : "",
      totalSold: supplier.totalSold ? supplier.totalSold.toString() : "",
      qualityRating: supplier.qualityRating || 0,
      reliabilityScore: supplier.reliabilityScore || 0,
      lastTransactionDate: supplier.lastTransactionDate ? supplier.lastTransactionDate.toString().split('T')[0] : "",
    } : {
      name: "",
      location: "",
      phone: "",
      email: "",
      address: "",
      type: "",
      gemstoneTypes: "",
      certificationOptions: "",
      notes: "",
      tags: "",
      arrivalDate: "",
      departureDate: "",
      city: "",
      state: "",
      gstNumber: "",
      landmark: "",
      totalAmount: "",
      totalSold: "",
      qualityRating: 0,
      reliabilityScore: 0,
      lastTransactionDate: "",
    },
  });

  // Auto-complete location suggestions
  const handleLocationChange = (value: string) => {
    form.setValue("location", value);
    if (value.length > 2) {
      const filtered = POPULAR_LOCATIONS.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
    }
  };

  // Quality tag selection
  const toggleQualityTag = (tag: string) => {
    const currentTags = form.getValues("tags") || "";
    const tagArray = currentTags ? currentTags.split(',').map(t => t.trim()).filter(t => t) : [];
    
    if (tagArray.includes(tag)) {
      const newTags = tagArray.filter(t => t !== tag);
      form.setValue("tags", newTags.join(', '));
    } else {
      tagArray.push(tag);
      form.setValue("tags", tagArray.join(', '));
    }
  };

  // Calculate supplier score based on various factors
  const calculateSupplierScore = () => {
    const totalAmount = parseFloat(form.getValues("totalAmount") || "0");
    const totalSold = parseFloat(form.getValues("totalSold") || "0");
    const qualityRating = form.getValues("qualityRating") || 0;
    const reliabilityScore = form.getValues("reliabilityScore") || 0;
    const tags = form.getValues("tags") || "";
    const hasGST = form.getValues("gstNumber") ? 10 : 0;
    const hasContact = (form.getValues("phone") || form.getValues("email")) ? 10 : 0;
    
    let score = 0;
    
    // Business volume (30 points)
    if (totalAmount > 1000000) score += 30;
    else if (totalAmount > 500000) score += 20;
    else if (totalAmount > 100000) score += 10;
    
    // Quality rating (25 points)
    score += (qualityRating * 5);
    
    // Reliability score (20 points)
    score += (reliabilityScore * 4);
    
    // Quality tags (15 points)
    const tagCount = tags.split(',').filter(t => t.trim()).length;
    score += Math.min(tagCount * 3, 15);
    
    // Business compliance (10 points)
    score += hasGST + hasContact;
    
    setSupplierScore(Math.min(score, 100));
  };

  useEffect(() => {
    calculateSupplierScore();
  }, [form.watch(["totalAmount", "totalSold", "qualityRating", "reliabilityScore", "tags", "gstNumber", "phone", "email"])]);

  const onSubmitForm = (data: z.infer<typeof supplierFormSchema>) => {
    // Convert string fields to arrays for database
    const processedData = {
      ...data,
      gemstoneTypes: data.gemstoneTypes 
        ? data.gemstoneTypes.split(',').map((type: string) => type.trim()).filter((type: string) => type.length > 0)
        : [],
      tags: data.tags 
        ? data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
        : [],
      totalAmount: data.totalAmount ? parseFloat(data.totalAmount) || 0 : 0,
      totalSold: data.totalSold ? parseFloat(data.totalSold) || 0 : 0,
      qualityRating: data.qualityRating || 0,
      reliabilityScore: data.reliabilityScore || 0,
      lastTransactionDate: data.lastTransactionDate || null,
    };
    
    try {
      // Call the onSubmit prop with the processed data
      onSubmit(processedData);
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: "Failed to submit form",
        variant: "destructive",
      });
    }
  };

  const isLoading = false; // No longer managing loading state internally

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => {
        console.log("=== FORM HANDLE SUBMIT CALLED ===");
        console.log("Form data received:", data);
        onSubmitForm(data);
      })} className="space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Supplier Score Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Supplier Score</h3>
            <div className="flex items-center space-x-2">
              {supplierScore >= 80 && <Award className="h-5 w-5 text-yellow-500" />}
              {supplierScore >= 60 && supplierScore < 80 && <TrendingUp className="h-5 w-5 text-green-500" />}
              {supplierScore < 60 && <AlertTriangle className="h-5 w-5 text-orange-500" />}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Score</span>
              <span className="font-semibold">{supplierScore}/100</span>
            </div>
            <Progress value={supplierScore} className="h-2" />
            <div className="flex justify-between text-xs text-gray-600">
              <span>Poor</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                  <FormLabel>Supplier Name *</FormLabel>
                <FormControl>
                    <Input {...field} className="input-modern" placeholder="Enter supplier name" required />
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
                  <FormLabel>Supplier Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                      <SelectTrigger className="input-modern">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                      {SUPPLIER_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
            <div className="relative">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                    <FormLabel>Location *</FormLabel>
                <FormControl>
                      <Input 
                        {...field} 
                        className="input-modern" 
                        placeholder="Start typing location..." 
                        onChange={(e) => handleLocationChange(e.target.value)}
                        required 
                      />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
              {showLocationSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredLocations.map((location, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        form.setValue("location", location);
                        setShowLocationSuggestions(false);
                      }}
                    >
                      {location}
                    </div>
                  ))}
                </div>
              )}
            </div>
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                <FormControl>
                    <Input {...field} className="input-modern" placeholder="Enter phone number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
                  <FormLabel>Email Address</FormLabel>
              <FormControl>
                    <Input type="email" {...field} className="input-modern" placeholder="Enter email address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
                  <FormLabel>Business Address</FormLabel>
              <FormControl>
                    <Textarea {...field} className="input-modern" rows={2} placeholder="Enter complete address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          </div>
        </div>

        {/* Business Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} className="input-modern" placeholder="Enter city" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        <FormField
          control={form.control}
              name="state"
              render={({ field }) => (
            <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} className="input-modern" placeholder="Enter state" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
                  <FormField
                    control={form.control}
              name="gstNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Number</FormLabel>
                          <FormControl>
                    <Input {...field} className="input-modern" placeholder="Enter GST number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="landmark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Landmark (Shipped From)</FormLabel>
                  <FormControl>
                    <Input {...field} className="input-modern" placeholder="e.g. Near City Center" />
                          </FormControl>
                  <FormMessage />
                        </FormItem>
              )}
                  />
          </div>
              </div>

        {/* Product Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Product Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gemstoneTypes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gemstone Types Supplied</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="input-modern" rows={2} placeholder="e.g. Ruby, Sapphire, Emerald (comma separated)" />
                  </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="certificationOptions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certification Options</FormLabel>
              <FormControl>
                    <Input {...field} className="input-modern" placeholder="e.g. IGI, IIGJ, GJEPC" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          </div>
          
          {/* Quality Tags Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quality Indicators</Label>
            <div className="flex flex-wrap gap-2">
              {QUALITY_INDICATORS.map((tag) => {
                const currentTags = form.getValues("tags") || "";
                const isSelected = currentTags.includes(tag);
                return (
                  <Badge
                    key={tag}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                    onClick={() => toggleQualityTag(tag)}
                  >
                    {tag}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Transaction History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount Purchased (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...field} 
                      className="input-modern" 
                      placeholder="0.00" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalSold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Sold to Me (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...field} 
                      className="input-modern" 
                      placeholder="0.00" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="arrivalDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Arrival Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="input-modern" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departureDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departure Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="input-modern" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="qualityRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quality Rating (1-5)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer ${
                            star <= (field.value || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                          onClick={() => field.onChange(star)}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({field.value || 0}/5)</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reliabilityScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reliability Score (1-5)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer ${
                            star <= (field.value || 0) ? 'text-green-400 fill-current' : 'text-gray-300'
                          }`}
                          onClick={() => field.onChange(star)}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({field.value || 0}/5)</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
                <FormLabel>Notes & Comments</FormLabel>
              <FormControl>
                  <Textarea {...field} className="input-modern" rows={3} placeholder="Payment terms, quality notes, special arrangements, etc." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="btn-modern">
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="btn-modern bg-gradient-to-r from-primary to-purple-600"
            onClick={() => {
              console.log("=== SUBMIT BUTTON CLICKED ===");
              console.log("Form state:", form.getValues());
              console.log("Form errors:", form.formState.errors);
            }}
          >
            {supplier ? "Update Supplier" : "Add Supplier"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
