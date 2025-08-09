import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Tag, 
  Clock, 
  CheckCircle, 
  FileText, 
  Plus, 
  Download,
  Calendar,
  Building2,
  AlertCircle,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Certifications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Real-time data fetching with auto-refresh
  const { data: certifications = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/certifications"],
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchIntervalInBackground: true,
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/inventory"],
  });

  // Auto-refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  const updateCertificationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiRequest("PATCH", `/api/certifications/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certifications"] });
      toast({
        title: "Success",
        description: "Certification updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update certification",
        variant: "destructive",
      });
    },
  });

  const createCertificationMutation = useMutation({
    mutationFn: async (certification: any) => {
      console.log('Sending certification data:', certification);
      return apiRequest("POST", "/api/certifications", certification);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certifications"] });
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: "Certification created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Certification creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create certification",
        variant: "destructive",
      });
    },
  });

  const filteredCertifications = (certifications as any[]).filter((cert: any) => {
    const searchLower = searchQuery.toLowerCase();
    const stone = (inventory as any[]).find((i: any) => i.id === cert.stoneId);
    return (
      cert.lab.toLowerCase().includes(searchLower) ||
      (stone && stone.type.toLowerCase().includes(searchLower)) ||
      (stone && stone.gemId.toLowerCase().includes(searchLower)) ||
      cert.status.toLowerCase().includes(searchLower) ||
      (cert.notes && cert.notes.toLowerCase().includes(searchLower))
    );
  });

  const getStoneName = (stoneId: string | null) => {
    if (!stoneId) return '-';
    const stone = (inventory as any[]).find((i: any) => i.id === stoneId);
    return stone ? `${stone.type} (${stone.gemId})` : 'Unknown Stone';
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Certified':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    updateCertificationMutation.mutate({ 
      id, 
      updates: { 
        status,
        ...(status === 'Received' && { dateReceived: new Date().toISOString() })
      } 
    });
  };

  const handleMarkAsCertified = (id: string) => {
    updateCertificationMutation.mutate(
      { 
        id, 
        updates: { 
          status: 'Certified',
          dateReceived: new Date().toISOString()
        } 
      },
      {
        onSuccess: async (updatedCertification: any) => {
          // Also update the inventory to mark the stone as certified
          try {
            const inventoryUpdate = {
              certified: true,
              certificateLab: updatedCertification.lab,
              certificateFile: updatedCertification.certificateFile
            };
            
            await apiRequest("PATCH", `/api/inventory/${updatedCertification.stoneId}`, inventoryUpdate);
            
            toast({
              title: "Stone Certified",
              description: "The stone has been marked as certified in both certification and inventory",
            });
          } catch (error) {
            console.error('Failed to update inventory:', error);
            toast({
              title: "Certification Updated",
              description: "Certification status updated, but failed to update inventory",
            });
          }
        },
      }
    );
  };

  const handleCreateCertification = (formData: any) => {
    createCertificationMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Certification Tracking
            </h1>
            <p className="text-muted-foreground text-lg">
              Monitor gemstone certification process
            </p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  const pendingCount = (certifications as any[]).filter((cert: any) => cert.status === 'Pending').length;
  const receivedCount = (certifications as any[]).filter((cert: any) => cert.status === 'Received').length;
  const inProgressCount = (certifications as any[]).filter((cert: any) => cert.status === 'In Progress').length;
  const certifiedCount = (certifications as any[]).filter((cert: any) => cert.status === 'Certified').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Certification Tracking
          </h1>
          <p className="text-muted-foreground text-lg">
            Monitor gemstone certification process
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="btn-modern bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Certification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Certification</DialogTitle>
              </DialogHeader>
              <CertificationForm 
                onSubmit={handleCreateCertification}
                inventory={inventory as any[]}
                onClose={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="card-shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Certifications</p>
                <p className="text-3xl font-bold text-foreground">{(certifications as any[]).length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Tag className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Certifications</p>
                <p className="text-3xl font-bold text-foreground">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600 dark:text-yellow-400 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Certifications</p>
                <p className="text-3xl font-bold text-foreground">{receivedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600 dark:text-green-400 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-foreground">{inProgressCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600 dark:text-purple-400 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certified Stones</p>
                <p className="text-3xl font-bold text-foreground">{certifiedCount}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-600 dark:text-emerald-400 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certification Records */}
      <Card className="card-shadow-lg bg-gradient-to-br from-background to-muted/20 border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Certification Records</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search certifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 input-modern"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCertifications.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No certifications found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No certifications match your search criteria" : "Certifications will appear here as they are processed"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsFormOpen(true)} className="btn-modern">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Certification
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stone</TableHead>
                    <TableHead>Certification Lab</TableHead>
                    <TableHead>Date Sent</TableHead>
                    <TableHead>Date Received</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Certificate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertifications.map((cert: any) => (
                    <TableRow key={cert.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold">{getStoneName(cert.stoneId)}</span>
                          {cert.inventory && (
                            <span className="text-xs text-muted-foreground">
                              {cert.inventory.carat}ct • {cert.inventory.grade} • {cert.inventory.origin}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{cert.lab}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(cert.dateSent)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(cert.dateReceived)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(cert.status)}>
                          {cert.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cert.certificateFile ? (
                          <Button variant="ghost" size="sm" className="text-primary">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                        {cert.status === 'Pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(cert.id, 'In Progress')}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Start Process
                            </Button>
                          )}
                          {cert.status === 'In Progress' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(cert.id, 'Received')}
                              className="text-green-600 hover:text-green-700"
                          >
                            Mark Received
                          </Button>
                        )}
                          {cert.status === 'Received' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsCertified(cert.id)}
                              className="text-purple-600 hover:text-purple-700"
                            >
                              Mark as Certified
                            </Button>
                          )}
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

// Certification Form Component
function CertificationForm({ 
  onSubmit, 
  inventory, 
  onClose 
}: { 
  onSubmit: (data: any) => void; 
  inventory: any[]; 
  onClose: () => void; 
}) {
  const [formData, setFormData] = useState({
    stoneId: '',
    lab: '',
    dateSent: new Date().toISOString().split('T')[0],
    status: 'Pending',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure we have required fields
    if (!formData.lab) {
      alert('Please select a certification lab');
      return;
    }
    
    if (!formData.stoneId) {
      alert('Please select a stone');
      return;
    }
    
    const certificationData = {
      lab: formData.lab,
      stoneId: formData.stoneId,
      dateSent: formData.dateSent || null,
      status: formData.status,
      notes: formData.notes || null
    };
    
    console.log('Submitting certification data:', certificationData);
    onSubmit(certificationData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="stoneId">Select Stone</Label>
        <Select value={formData.stoneId} onValueChange={(value) => setFormData({...formData, stoneId: value})}>
          <SelectTrigger className="input-modern">
            <SelectValue placeholder="Select a stone" />
          </SelectTrigger>
          <SelectContent>
            {inventory.filter((item: any) => item.isAvailable).map((stone: any) => (
              <SelectItem key={stone.id} value={stone.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{stone.type}</span>
                  <span className="text-sm text-muted-foreground">
                    {stone.gemId} • {stone.carat}ct • {stone.grade}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="lab">Certification Lab</Label>
        <Select value={formData.lab} onValueChange={(value) => setFormData({...formData, lab: value})}>
          <SelectTrigger className="input-modern">
            <SelectValue placeholder="Select certification lab" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IGI">IGI (International Gemological Institute)</SelectItem>
            <SelectItem value="IIGJ">IIGJ (Indian Institute of Gemology & Jewellery)</SelectItem>
            <SelectItem value="GJEPC">GJEPC (Gem & Jewellery Export Promotion Council)</SelectItem>
            <SelectItem value="GIA">GIA (Gemological Institute of America)</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="dateSent">Date Sent</Label>
        <Input
          id="dateSent"
          type="date"
          value={formData.dateSent}
          onChange={(e) => setFormData({...formData, dateSent: e.target.value})}
          className="input-modern"
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          className="input-modern"
          placeholder="Add any additional notes about this certification"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="btn-modern">
          Cancel
        </Button>
        <Button type="submit" className="btn-modern bg-gradient-to-r from-primary to-purple-600">
          Create Certification
        </Button>
      </div>
    </form>
  );
}
