import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Grid3X3, 
  List,
  Eye,
  Download,
  Share2,
  Printer,
  Sparkles,
  Upload,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { inventoryService, certificationService } from "@/lib/database";
import { AIAnalysis } from "@/components/dashboard/ai-analysis";

// Utility function for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Generate unique gemstone ID
const generateGemId = (type: string) => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${type.toUpperCase()}-${timestamp}-${random}`;
};

const GEMSTONE_TYPES = [
  'Ruby', 'Blue Sapphire', 'Emerald', 'Diamond', 'Yellow Sapphire', 
  'Pink Sapphire', 'Pearl', 'Coral', 'Hessonite', 'Cat\'s Eye'
];

const ORIGINS = [
  'Sri Lanka', 'Myanmar', 'Thailand', 'Madagascar', 'Tanzania', 
  'Brazil', 'Colombia', 'India', 'Australia', 'South Africa'
];

const GRADES = ['A', 'AA', 'AAA', 'AAAA'];

// Image compression utility
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 800px width/height while maintaining aspect ratio)
      const maxSize = 800;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with good quality (0.8)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(compressedDataUrl);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export default function Inventory() {
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load inventory data from Supabase
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAll();
      // Map snake_case fields to camelCase for UI
      const mapped = data.map((item: any) => ({
        ...item,
        gemId: item.gem_id,
        pricePerCarat: item.price_per_carat,
        totalPrice: item.total_price,
        isAvailable: item.is_available,
        imageUrl: item.image_url,
        customOrigin: item.custom_origin,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        aiAnalysis: item.ai_analysis,
        supplierId: item.supplier_id,
        certificateLab: item.certificate_lab,
        certificateFile: item.certificate_file,
        packageType: item.package_type
      }));
      setInventory(mapped);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddGemstone = async (data: any) => {
    try {
      const gemstoneData = {
        ...data,
        gemId: generateGemId(data.type),
        totalPrice: data.carat * data.pricePerCarat,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create the gemstone first
      const createdGemstone = await inventoryService.create(gemstoneData);
      await loadInventory();

      // Handle certification based on whether the stone is certified
      if (data.certified && data.certificateLab) {
        // If stone is certified, create a "Certified" certification record
        try {
          const certificationData = {
            lab: data.certificateLab,
            stoneId: createdGemstone.id,
            status: 'Certified',
            notes: `Stone certified by ${data.certificateLab}. Certificate file: ${data.certificateFile || 'Not uploaded'}`
          };
          
          await certificationService.create(certificationData);
          
          toast({
            title: "Success",
            description: "Certified gemstone added successfully. Certification marked as 'Certified'.",
          });
        } catch (certError) {
          console.error('Failed to create certification record:', certError);
          toast({
            title: "Success",
            description: "Gemstone added successfully, but failed to create certification record.",
          });
        }
      } else {
        // If stone is not certified, create a "Pending" certification record
        try {
          const certificationData = {
            lab: 'GIA', // Default lab
            stoneId: createdGemstone.id,
            status: 'Pending',
            notes: `Auto-created pending certification for ${data.type} stone (${data.carat}ct)`
          };
          
          await certificationService.create(certificationData);
          
          toast({
            title: "Success",
            description: "Gemstone added successfully. A pending certification has been created.",
          });
        } catch (certError) {
          console.error('Failed to create pending certification:', certError);
          toast({
            title: "Success",
            description: "Gemstone added successfully, but failed to create pending certification.",
          });
        }
      }
      
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding gemstone:', error);
      toast({
        title: "Error",
        description: "Failed to add gemstone",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async (id: string, updates: any) => {
    try {
      await inventoryService.update(id, {
        ...updates,
        totalPrice: updates.carat * updates.pricePerCarat,
        updatedAt: new Date().toISOString()
      });
      await loadInventory();
      
      toast({
        title: "Success",
        description: "Gemstone updated successfully",
      });
      
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating gemstone:', error);
      toast({
        title: "Error",
        description: "Failed to update gemstone",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await inventoryService.delete(id);
      await loadInventory();
      
      toast({
        title: "Success",
        description: "Gemstone deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting gemstone:', error);
      toast({
        title: "Error",
        description: "Failed to delete gemstone",
        variant: "destructive"
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  // Filter inventory based on search and filters
  const filteredInventory = inventory.filter(item =>
    (item.gemId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.origin?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedGrade === 'all' || item.grade === selectedGrade) &&
    (selectedType === 'all' || item.type === selectedType) &&
    (selectedOrigin === 'all' || item.origin === selectedOrigin)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground">Manage your gemstone inventory</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="card-shadow-lg">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track your gemstone inventory and generate AI analysis</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="btn-modern bg-gradient-to-r from-primary to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Gemstone
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by Gem ID, type, or origin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 input-modern"
          />
        </div>
        
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px] input-modern">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {GEMSTONE_TYPES.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-[180px] input-modern">
            <SelectValue placeholder="Filter by Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {GRADES.map(grade => (
              <SelectItem key={grade} value={grade}>{grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
          <SelectTrigger className="w-[180px] input-modern">
            <SelectValue placeholder="Filter by Origin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Origins</SelectItem>
            {ORIGINS.map(origin => (
              <SelectItem key={origin} value={origin}>{origin}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex border rounded-[var(--radius)] p-1 bg-muted/30">
          <Button
            variant={viewMode === 'card' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('card')}
            className="btn-modern"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="btn-modern"
          >
            <List className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {/* Inventory Display */}
      {viewMode === 'card' ? (
        <GemstoneCardView 
          inventory={filteredInventory} 
          onEdit={setEditingItem}
          onDelete={handleDelete}
          onAIAnalysis={setSelectedClient}
        />
      ) : (
        <GemstoneListView 
          inventory={filteredInventory} 
          onEdit={setEditingItem}
          onDelete={handleDelete}
        />
      )}

      {/* Add/Edit Form */}
      <Dialog open={isFormOpen || !!editingItem} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
              {editingItem ? 'Edit Gemstone' : 'Add New Gemstone'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update the gemstone details below.' : 'Add a new gemstone to your inventory.'}
              </DialogDescription>
            </DialogHeader>
          <GemstoneForm
            gemstone={editingItem}
            onSubmit={editingItem ? (data) => handleEdit(editingItem.id, data) : handleAddGemstone}
            onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>

      {/* AI Analysis */}
      {selectedClient && (
        <AIAnalysis gemstone={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
      </div>
  );
}

// Card View Component
function GemstoneCardView({ inventory, onEdit, onDelete, onAIAnalysis }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {inventory.map((gemstone) => (
        <Card key={gemstone.id} className="card-shadow-lg hover:scale-105 transition-transform duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{gemstone.type}</CardTitle>
                <p className="text-sm text-muted-foreground">{gemstone.gemId}</p>
              </div>
              <Badge variant={gemstone.isAvailable ? "default" : "secondary"}>
                {gemstone.isAvailable ? "Available" : "Sold"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {gemstone.imageUrl && (
              <img src={gemstone.imageUrl} alt={gemstone.type} className="w-full h-40 object-contain bg-white rounded mx-auto" />
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Grade</p>
                <p className="font-semibold">{gemstone.grade}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Carat</p>
                <p className="font-semibold">{gemstone.carat} ct</p>
              </div>
              <div>
                <p className="text-muted-foreground">Origin</p>
                <p className="font-semibold">{gemstone.origin}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Quantity</p>
                <p className="font-semibold">{gemstone.quantity}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price per Carat:</span>
                <span className="font-semibold">{formatCurrency(gemstone.pricePerCarat)}/ct</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>Total Price:</span>
                <span>{formatCurrency(gemstone.totalPrice)}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(gemstone)}
                className="flex-1 btn-modern"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAIAnalysis(gemstone)}
                className="btn-modern"
              >
                <Sparkles className="h-4 w-4" />
                AI
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(gemstone.id)}
                className="btn-modern text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// List View Component
function GemstoneListView({ inventory, onEdit, onDelete }: any) {
  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle>Gemstone Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gem ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Carat</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Price/Carat</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((gemstone) => (
              <TableRow key={gemstone.id}>
                <TableCell className="font-mono text-sm">{gemstone.gemId}</TableCell>
                <TableCell>{gemstone.type}</TableCell>
                <TableCell>
                  <Badge variant="outline">{gemstone.grade}</Badge>
                </TableCell>
                <TableCell>{gemstone.carat} ct</TableCell>
                <TableCell>{gemstone.origin}</TableCell>
                <TableCell>{formatCurrency(gemstone.pricePerCarat)}/ct</TableCell>
                <TableCell className="font-semibold">{formatCurrency(gemstone.totalPrice)}</TableCell>
                <TableCell>
                  <Badge variant={gemstone.isAvailable ? "default" : "secondary"}>
                    {gemstone.isAvailable ? "Available" : "Sold"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(gemstone)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(gemstone.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Form Component
function GemstoneForm({ gemstone, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    type: gemstone?.type || '',
    grade: gemstone?.grade || 'A',
    carat: gemstone?.carat || 0,
    origin: gemstone?.origin || '',
    customOrigin: gemstone?.customOrigin || '',
    pricePerCarat: gemstone?.pricePerCarat || 0,
    quantity: gemstone?.quantity || 1,
    isAvailable: gemstone?.isAvailable ?? true,
    description: gemstone?.description || '',
    imageUrl: gemstone?.imageUrl || '',
    notes: gemstone?.notes || '',
    certified: gemstone?.certified ?? false,
    certificateLab: gemstone?.certificateLab || '',
    certificateFile: gemstone?.certificateFile || ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(gemstone?.imageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificateFileName, setCertificateFileName] = useState<string>(gemstone?.certificateFile || '');

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      // Compress the image
      const compressedImageUrl = await compressImage(file);
      setImagePreview(compressedImageUrl);
      setFormData({ ...formData, imageUrl: compressedImageUrl });
      setImageFile(file);
    } catch (error) {
      console.error('Error compressing image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, imageUrl: '' });
  };

  const handleCertificateUpload = (file: File) => {
    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      alert('Please select a PDF, DOC, or DOCX file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    setCertificateFile(file);
    setCertificateFileName(file.name);
    setFormData({ ...formData, certificateFile: file.name });
  };

  const removeCertificate = () => {
    setCertificateFile(null);
    setCertificateFileName('');
    setFormData({ ...formData, certificateFile: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Gemstone Type *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
            <SelectTrigger className="input-modern">
              <SelectValue placeholder="Select gemstone type" />
            </SelectTrigger>
            <SelectContent>
              {GEMSTONE_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="grade">Grade *</Label>
          <Select value={formData.grade} onValueChange={(value) => setFormData({...formData, grade: value})}>
            <SelectTrigger className="input-modern">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GRADES.map(grade => (
                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="carat">Carat Weight *</Label>
          <Input
            id="carat"
            type="number"
            step="0.01"
            value={formData.carat}
            onChange={(e) => setFormData({...formData, carat: parseFloat(e.target.value) || 0})}
            className="input-modern"
            placeholder="e.g., 3.25"
          />
        </div>

        <div>
          <Label htmlFor="origin">Origin *</Label>
          <Select value={formData.origin} onValueChange={(value) => setFormData({...formData, origin: value})}>
            <SelectTrigger className="input-modern">
              <SelectValue placeholder="Select origin" />
            </SelectTrigger>
            <SelectContent>
              {ORIGINS.map(origin => (
                <SelectItem key={origin} value={origin}>{origin}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="pricePerCarat">Price per Carat (₹) *</Label>
          <Input
            id="pricePerCarat"
            type="number"
            step="0.01"
            value={formData.pricePerCarat}
            onChange={(e) => setFormData({...formData, pricePerCarat: parseFloat(e.target.value) || 0})}
            className="input-modern"
            placeholder="e.g., 15000"
          />
        </div>

        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
            className="input-modern"
            placeholder="e.g., 1"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isAvailable"
            checked={formData.isAvailable}
            onCheckedChange={(checked) => setFormData({...formData, isAvailable: checked})}
          />
          <Label htmlFor="isAvailable">Available for Sale</Label>
        </div>
      </div>

      {/* Certification Section */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="certified"
            checked={formData.certified}
            onCheckedChange={(checked) => setFormData({...formData, certified: checked})}
          />
          <Label htmlFor="certified" className="text-lg font-semibold">This stone has a certificate</Label>
        </div>

        {formData.certified && (
          <div className="space-y-4 pl-6 border-l-2 border-primary/20">
            <div>
              <Label htmlFor="certificateLab">Certification Lab</Label>
              <Select value={formData.certificateLab} onValueChange={(value) => setFormData({...formData, certificateLab: value})}>
                <SelectTrigger className="input-modern">
                  <SelectValue placeholder="Select certification lab" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GIA">GIA (Gemological Institute of America)</SelectItem>
                  <SelectItem value="IGI">IGI (International Gemological Institute)</SelectItem>
                  <SelectItem value="IIGJ">IIGJ (Indian Institute of Gemology & Jewellery)</SelectItem>
                  <SelectItem value="GRS">GRS (Gemresearch Swisslab)</SelectItem>
                  <SelectItem value="SSEF">SSEF (Swiss Gemmological Institute)</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Certificate Document</Label>
              {certificateFileName ? (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-medium">PDF</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{certificateFileName}</p>
                        <p className="text-xs text-gray-500">
                          {certificateFile ? `${(certificateFile.size / 1024 / 1024).toFixed(2)} MB` : 'File uploaded'}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeCertificate}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload certificate document (PDF, DOC, DOCX)
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Max 10MB
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleCertificateUpload(file);
                      }
                    }}
                    className="hidden"
                    id="certificate-upload"
                  />
                  <label 
                    htmlFor="certificate-upload"
                    className="btn-modern cursor-pointer inline-flex items-center px-4 py-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Certificate
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {!formData.certified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm text-yellow-800 font-medium">Pending Certification</p>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              A pending certification will be created for this stone. You can manage it from the Certifications page.
            </p>
          </div>
        )}
      </div>

      {/* Image Upload Section */}
      <div className="space-y-4">
        <Label>Gemstone Image</Label>
        
        {imagePreview ? (
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Gemstone preview" 
              className="w-full max-w-md h-48 object-contain bg-gray-50 rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removeImage}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              {isUploading ? 'Compressing image...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              PNG, JPG, GIF up to 5MB (will be compressed for optimal quality)
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="image-upload"
              disabled={isUploading}
            />
            <label 
              htmlFor="image-upload"
              className="btn-modern cursor-pointer inline-flex items-center px-4 py-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Processing...' : 'Upload Image'}
            </label>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="input-modern"
          rows={3}
          placeholder="Detailed description of the gemstone..."
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          className="input-modern"
          rows={2}
          placeholder="Additional notes..."
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="btn-modern">
          Cancel
        </Button>
        <Button type="submit" className="btn-modern bg-gradient-to-r from-primary to-purple-600">
          {gemstone ? "Update Gemstone" : "Add Gemstone"}
        </Button>
    </div>
    </form>
  );
}
