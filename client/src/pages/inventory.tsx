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
  X,
  QrCode,
  Barcode,
  Camera,
  Scan,
  Images,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { inventoryService, certificationService, supplierService, fileService } from "@/lib/database";
import { AIAnalysis } from "@/components/dashboard/ai-analysis";
import { BrowserMultiFormatReader } from "@zxing/browser";
import QRCode from "qrcode";
// @ts-ignore - jsbarcode has no official types
import JsBarcode from "jsbarcode";

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
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [labelItem, setLabelItem] = useState<any | null>(null);
  const [detailItem, setDetailItem] = useState<any | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Load inventory data from Supabase
  useEffect(() => {
    loadInventory();
    loadSuppliers();
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
        packageType: item.package_type,
        // Prefer real columns; fallback to notes JSON if necessary
        extended: (() => {
          const ext: any = {
            treatments: item.treatments || undefined,
            discloseTreatments: item.disclose_treatments ?? undefined,
            media: item.media || undefined,
            reorderRules: item.reorder_rules || undefined,
          };
          if (ext.treatments || ext.media || ext.reorderRules || typeof ext.discloseTreatments === 'boolean') return ext;
          try {
            const parsed = typeof item.notes === 'string' ? JSON.parse(item.notes) : item.notes;
            if (parsed && parsed.extended) return parsed.extended;
            if (parsed && (parsed.treatments || parsed.media || parsed.reorderRules)) return parsed;
          } catch {}
          return {};
        })()
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

  const loadSuppliers = async () => {
    try {
      const sup = await supplierService.getAll();
      setSuppliers(sup);
    } catch (e) {
      // non-blocking
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

  // Scanner logic
  useEffect(() => {
    let reader: BrowserMultiFormatReader | null = null;
    let controls: any | null = null;
    let stopped = false;
    if (isScannerOpen) {
      reader = new BrowserMultiFormatReader();
      const video = document.getElementById('scanner-video') as HTMLVideoElement | null;
      if (video) {
        reader
          // The third arg provides controls with a stop() method
          .decodeFromVideoDevice(undefined, video, (result, err, ctl) => {
            if (ctl) controls = ctl;
            if (stopped) return;
            if (result) {
              const text = result.getText();
              const found = inventory.find((it) => it.gemId === text || it.id === text);
              if (found) {
                setIsScannerOpen(false);
                setScanError(null);
                setEditingItem(found);
                // stop scanning once found
                try { controls?.stop(); } catch {}
              }
            }
          })
          .catch((e) => setScanError(String(e)));
      }
    }
    return () => {
      stopped = true;
      try { controls?.stop(); } catch {}
    };
  }, [isScannerOpen, inventory]);

  // Render QR/Barcode when label dialog opens
  useEffect(() => {
    if (!labelItem) return;
    const id = labelItem.gemId || labelItem.id || '';
    // slight delay to ensure dialog content is in DOM
    const t = setTimeout(() => {
      renderLabelIntoElements(labelItem, 'qr-canvas', 'barcode-svg');
    }, 0);
    return () => clearTimeout(t);
  }, [labelItem]);

  // Render QR/Barcode in detail dialog
  useEffect(() => {
    if (!detailItem) return;
    const t = setTimeout(() => {
      renderLabelIntoElements(detailItem, 'qr-canvas-detail', 'barcode-svg-detail');
    }, 0);
    return () => clearTimeout(t);
  }, [detailItem]);

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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">Track your gemstone inventory and generate AI analysis</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setIsScannerOpen(true)} variant="outline" className="w-full sm:w-auto">
            <Scan className="h-4 w-4 mr-2" />
            Scan Label
          </Button>
          <Button onClick={() => setIsFormOpen(true)} className="btn-modern bg-gradient-to-r from-primary to-purple-600 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Gemstone
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by Gem ID, type, or origin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 input-modern"
          />
        </div>
        
        <div className="grid grid-cols-2 md:flex md:gap-4 gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="input-modern text-xs md:text-sm">
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
            <SelectTrigger className="input-modern text-xs md:text-sm">
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
            <SelectTrigger className="input-modern text-xs md:text-sm">
              <SelectValue placeholder="Filter by Origin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Origins</SelectItem>
              {ORIGINS.map(origin => (
                <SelectItem key={origin} value={origin}>{origin}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inventory Display */}
      {viewMode === 'card' ? (
        <GemstoneCardView
          inventory={filteredInventory} 
          onEdit={setEditingItem}
          onDelete={handleDelete}
          onAIAnalysis={setSelectedClient}
          onShowLabel={(item: any) => setLabelItem(item)}
          onView={(item: any) => setDetailItem(item)}
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
            suppliers={suppliers}
            />
          </DialogContent>
        </Dialog>

      {/* Scanner Dialog */}
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR/Barcode</DialogTitle>
            <DialogDescription>Point your camera at a label to open the gemstone.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <video id="scanner-video" className="w-full rounded bg-black" />
            {scanError && <p className="text-xs text-red-600">{scanError}</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Label Dialog */}
      <Dialog open={!!labelItem} onOpenChange={(open) => !open && setLabelItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Gemstone Label</DialogTitle>
            <DialogDescription>QR and barcode label for quick identification.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-center">
              <p className="font-semibold">{labelItem?.type} • {labelItem?.grade}</p>
              <p className="text-xs text-muted-foreground">{labelItem?.gemId}</p>
            </div>
            <canvas id="qr-canvas" className="mx-auto" />
            <svg id="barcode-svg" className="w-full h-16" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => printLabel(labelItem!)}>Print</Button>
              <Button size="sm" onClick={() => downloadLabel(labelItem!)}>Download</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={(open) => !open && setDetailItem(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gemstone Details</DialogTitle>
            <DialogDescription>Full information and assets for this stone.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Media */}
            <div className="space-y-3 lg:col-span-1">
              {detailItem?.imageUrl && (
                <img src={detailItem.imageUrl} className="w-full h-56 object-contain rounded border bg-white" onClick={()=>setLightboxUrl(detailItem.imageUrl)} />
              )}
              {Array.isArray(detailItem?.extended?.media) && detailItem.extended.media.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {detailItem.extended.media.map((m:any, idx:number)=> (
                    <button key={idx} className="block" onClick={()=>setLightboxUrl(m.url)}>
                      {m.type?.startsWith('image') ? (
                        <img src={m.url} className="w-full h-20 object-cover rounded" />
                      ) : (
                        <video src={m.url} className="w-full h-20 object-cover rounded" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              <div className="border rounded p-3 space-y-2">
                <div className="text-sm font-semibold">Label</div>
                <canvas id="qr-canvas-detail" className="mx-auto" />
                <svg id="barcode-svg-detail" className="w-full h-16" />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={()=>printLabel(detailItem!)}>Print</Button>
                  <Button size="sm" onClick={()=>downloadLabel(detailItem!)}>Download</Button>
                </div>
              </div>
            </div>
            {/* Right: Facts */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={detailItem?.isAvailable ? 'default' : 'secondary'}>
                      {detailItem?.isAvailable ? 'Available' : 'Sold'}
                    </Badge>
                  </div>
                  <div className="text-2xl font-semibold mt-1">{detailItem?.type}</div>
                  <div className="text-xs text-muted-foreground">{detailItem?.gemId}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={()=>setEditingItem(detailItem)}><Edit className="h-4 w-4 mr-1"/>Edit</Button>
                  <Button variant="outline" onClick={()=>setSelectedClient(detailItem)}><Sparkles className="h-4 w-4 mr-1"/>AI</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-muted-foreground text-sm">Grade</div>
                  <div className="font-semibold">{detailItem?.grade}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Carat</div>
                  <div className="font-semibold">{detailItem?.carat} ct</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Origin</div>
                  <div className="font-semibold">{detailItem?.origin}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Quantity</div>
                  <div className="font-semibold">{detailItem?.quantity}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Price per Carat:</span><span className="font-semibold">{formatCurrency(detailItem?.pricePerCarat || 0)}/ct</span></div>
                <div className="flex justify-between text-lg font-bold text-primary"><span>Total Price:</span><span>{formatCurrency(detailItem?.totalPrice || 0)}</span></div>
              </div>
              {detailItem?.description && (
                <div>
                  <div className="text-muted-foreground text-sm">Description</div>
                  <div className="text-sm">{detailItem.description}</div>
                </div>
              )}
              {detailItem?.extended?.treatments && (
                <div>
                  <div className="text-muted-foreground text-sm mb-2">Treatments</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(detailItem.extended.treatments).filter(([,v])=>!!v).map(([k,v])=> (
                      <Badge key={k} variant="outline">{String(k)}</Badge>
                    ))}
                  </div>
                  {detailItem?.extended?.discloseTreatments && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-2">Disclosure enabled for invoices</div>
                  )}
                </div>
              )}
              {detailItem?.extended?.reorderRules && (
                <div className="border rounded p-3">
                  <div className="text-sm font-semibold mb-2">Reorder Rules</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Type: </span>{detailItem.extended.reorderRules.type}</div>
                    <div><span className="text-muted-foreground">Grade: </span>{detailItem.extended.reorderRules.grade}</div>
                    <div><span className="text-muted-foreground">Origin: </span>{detailItem.extended.reorderRules.origin}</div>
                    <div><span className="text-muted-foreground">Min Stock: </span>{detailItem.extended.reorderRules.minStock}</div>
                    <div><span className="text-muted-foreground">Reorder Qty: </span>{detailItem.extended.reorderRules.reorderQty}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={!!lightboxUrl} onOpenChange={(open)=>!open && setLightboxUrl(null)}>
        <DialogContent className="max-w-3xl">
          {lightboxUrl?.match(/\.mp4|video\//) ? (
            <video src={lightboxUrl} className="w-full" controls autoPlay />
          ) : (
            <img src={lightboxUrl || ''} className="w-full" />
          )}
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
function GemstoneCardView({ inventory, onEdit, onDelete, onAIAnalysis, onShowLabel, onView }: any) {
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
            {Array.isArray(gemstone.extended?.media) && gemstone.extended.media.length > 0 && (
              <div className="flex -space-x-2">
                {gemstone.extended.media.slice(0,3).map((m: any, idx: number) => (
                  <img key={idx} src={m.url} className="w-10 h-10 rounded ring-2 ring-white object-cover" />
                ))}
                {gemstone.extended.media.length > 3 && (
                  <div className="w-10 h-10 rounded bg-gray-100 text-xs flex items-center justify-center ring-2 ring-white">+{gemstone.extended.media.length - 3}</div>
                )}
              </div>
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
            {gemstone.extended?.treatments && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(gemstone.extended.treatments).filter(([,v]) => !!v).map(([k]) => (
                  <Badge key={k} variant="outline">{String(k)}</Badge>
                ))}
              </div>
            )}
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
                onClick={() => onView(gemstone)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShowLabel(gemstone)}
              >
                <QrCode className="h-4 w-4" />
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
function GemstoneForm({ gemstone, onSubmit, onCancel, suppliers = [] }: any) {
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
  const [treatments, setTreatments] = useState<any>({
    heat: gemstone?.extended?.treatments?.heat || false,
    oil: gemstone?.extended?.treatments?.oil || false,
    diffusion: gemstone?.extended?.treatments?.diffusion || false,
    other: gemstone?.extended?.treatments?.other || ''
  });
  const [discloseTreatments, setDiscloseTreatments] = useState<boolean>(gemstone?.extended?.discloseTreatments || false);
  const [media, setMedia] = useState<any[]>(gemstone?.extended?.media || []);
  const [newMediaMeta, setNewMediaMeta] = useState({
    lighting: 'Diffuse',
    angle: 'Top',
    caption: ''
  });
  const [reorderRules, setReorderRules] = useState<any>({
    type: gemstone?.type || '',
    grade: gemstone?.grade || 'A',
    origin: gemstone?.origin || '',
    minStock: gemstone?.extended?.reorderRules?.minStock || 0,
    reorderQty: gemstone?.extended?.reorderRules?.reorderQty || 0,
    preferredSupplierId: gemstone?.extended?.reorderRules?.preferredSupplierId || ''
  });

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
    const payload = {
      ...formData,
      treatments,
      discloseTreatments,
      media,
      reorderRules,
    };
    onSubmit(payload);
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

      {/* Media Manager */}
      <div className="space-y-3 border-t pt-6">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold flex items-center gap-2"><Images className="h-4 w-4" /> Media (Photos/Videos)</Label>
          <div className="text-xs text-muted-foreground">Add multiple views with presets</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {media.map((m, idx) => (
            <div key={idx} className="border rounded p-2 space-y-1">
              {m.type.startsWith('image') ? (
                <img src={m.url} className="w-full h-28 object-cover rounded" />
              ) : (
                <video src={m.url} className="w-full h-28 object-cover rounded" controls />
              )}
              <div className="text-xs text-muted-foreground">{m.meta?.lighting} • {m.meta?.angle}</div>
              <div className="text-xs truncate">{m.meta?.caption}</div>
              <div className="flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setMedia(media.filter((_,i)=>i!==idx))}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={newMediaMeta.lighting} onValueChange={(v)=>setNewMediaMeta({...newMediaMeta, lighting:v})}>
            <SelectTrigger className="input-modern"><SelectValue placeholder="Lighting" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Diffuse">Diffuse</SelectItem>
              <SelectItem value="Direct">Direct</SelectItem>
            </SelectContent>
          </Select>
          <Select value={newMediaMeta.angle} onValueChange={(v)=>setNewMediaMeta({...newMediaMeta, angle:v})}>
            <SelectTrigger className="input-modern"><SelectValue placeholder="Angle" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Top">Top</SelectItem>
              <SelectItem value="Side">Side</SelectItem>
              <SelectItem value="Back">Back</SelectItem>
            </SelectContent>
          </Select>
          <Input value={newMediaMeta.caption} onChange={(e)=>setNewMediaMeta({...newMediaMeta, caption:e.target.value})} placeholder="Caption (optional)" className="input-modern" />
        </div>
        <div className="flex gap-2">
          <input type="file" accept="image/*,video/*" onChange={async (e)=>{
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const url = await fileService.uploadFile(file);
              setMedia([...media, { url, type: file.type, meta: newMediaMeta }]);
            } catch (err) {
              console.error(err);
            }
          }} id="media-upload" className="hidden" />
          <label htmlFor="media-upload" className="btn-modern inline-flex items-center px-4 py-2 cursor-pointer">
            <Upload className="h-4 w-4 mr-2" /> Add Photo/Video
          </label>
        </div>
      </div>

      {/* Treatments & Disclosure */}
      <div className="space-y-4 border-t pt-6">
        <Label className="text-lg font-semibold">Treatments & Disclosure</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2"><Switch checked={treatments.heat} onCheckedChange={(v)=>setTreatments({...treatments, heat:v})} /><span>Heat</span></div>
          <div className="flex items-center gap-2"><Switch checked={treatments.oil} onCheckedChange={(v)=>setTreatments({...treatments, oil:v})} /><span>Oil</span></div>
          <div className="flex items-center gap-2"><Switch checked={treatments.diffusion} onCheckedChange={(v)=>setTreatments({...treatments, diffusion:v})} /><span>Diffusion</span></div>
          <Input placeholder="Other notes" value={treatments.other} onChange={(e)=>setTreatments({...treatments, other:e.target.value})} className="input-modern" />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={discloseTreatments} onCheckedChange={setDiscloseTreatments} id="disclose" />
          <Label htmlFor="disclose">Include treatment disclosure on invoices</Label>
        </div>
      </div>

      {/* Reorder Rules */}
      <div className="space-y-4 border-t pt-6">
        <Label className="text-lg font-semibold">Reorder Rules</Label>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input value={reorderRules.type} onChange={(e)=>setReorderRules({...reorderRules, type:e.target.value})} placeholder="Type" className="input-modern" />
          <Select value={reorderRules.grade} onValueChange={(v)=>setReorderRules({...reorderRules, grade:v})}>
            <SelectTrigger className="input-modern"><SelectValue placeholder="Grade" /></SelectTrigger>
            <SelectContent>
              {GRADES.map(g=> <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input value={reorderRules.origin} onChange={(e)=>setReorderRules({...reorderRules, origin:e.target.value})} placeholder="Origin" className="input-modern" />
          <Input type="number" value={reorderRules.minStock} onChange={(e)=>setReorderRules({...reorderRules, minStock: Number(e.target.value) || 0})} placeholder="Min Stock" className="input-modern" />
          <Input type="number" value={reorderRules.reorderQty} onChange={(e)=>setReorderRules({...reorderRules, reorderQty: Number(e.target.value) || 0})} placeholder="Reorder Qty" className="input-modern" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select value={reorderRules.preferredSupplierId} onValueChange={(v)=>setReorderRules({...reorderRules, preferredSupplierId:v})}>
            <SelectTrigger className="input-modern"><SelectValue placeholder="Preferred Supplier" /></SelectTrigger>
            <SelectContent>
              {suppliers.map((s:any)=>(<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
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

// Helpers for label actions
function renderLabelIntoElements(item: any, qrElementId: string, barcodeElementId: string) {
  const qr = document.getElementById(qrElementId) as HTMLCanvasElement | null;
  if (qr) {
    try { QRCode.toCanvas(qr, item.gemId || item.id || '', { width: 160 }); } catch {}
  }
  const svg = document.getElementById(barcodeElementId) as SVGSVGElement | null;
  if (svg) {
    try {
      // @ts-ignore
      JsBarcode(svg, item.gemId || item.id || '', { format: 'code128', height: 40, displayValue: false, margin: 0 });
    } catch {}
  }
}

function printLabel(item: any) {
  // Render to canvases first
  renderLabelIntoElements(item, 'qr-canvas', 'barcode-svg');
  const w = window.open('', '_blank');
  if (!w) return;
  const qrDataUrl = (document.getElementById('qr-canvas') as HTMLCanvasElement)?.toDataURL() || '';
  const barcodeSvg = (document.getElementById('barcode-svg') as SVGSVGElement)?.outerHTML || '';
  w.document.write(`<html><head><title>Label</title><style>body{font-family:system-ui;margin:16px} .center{text-align:center}</style></head><body>
    <div class="center">
      <div style="font-weight:600">${item.type} • ${item.grade}</div>
      <div style="font-size:12px;color:#666">${item.gemId}</div>
      <img src="${qrDataUrl}" style="width:160px;height:160px;"/>
      ${barcodeSvg}
    </div>
  </body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

function downloadLabel(item: any) {
  renderLabelIntoElements(item, 'qr-canvas', 'barcode-svg');
  const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `${item.gemId || 'label'}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
