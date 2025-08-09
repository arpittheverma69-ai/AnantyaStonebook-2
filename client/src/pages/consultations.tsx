import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Phone, Mail, MapPin, Gem, Star, AlertCircle, Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import ConsultationForm from "@/components/forms/consultation-form";
import { useToast } from "@/hooks/use-toast";
import { consultationService } from "@/lib/database";
import { supabase } from "@/lib/supabase";

interface Consultation {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  consultationType: string;
  consultationDate: string;
  consultationTime: string;
  duration: string;
  gemstoneInterest: string[];
  budget: string;
  urgency: string;
  consultationStatus: string;
  consultationNotes: string;
  followUpRequired: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  recommendations: string;
  nextSteps: string;
  clientSatisfaction?: number;
  specialRequirements?: string;
  location: string;
  consultationMethod: string;
  paymentStatus: string;
  consultationFee?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function Consultations() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: consultations = [], isLoading } = useQuery<Consultation[]>({
    queryKey: ["consultations"],
    queryFn: () => consultationService.getAll(),
  });

  // Debug: Log consultations data
  useEffect(() => {
    console.log('Consultations: Loaded consultations:', consultations);
    console.log('Consultations: Number of consultations:', consultations.length);
  }, [consultations]);

  // Real-time subscription for consultations
  useEffect(() => {
    const channel = supabase
      .channel('consultations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultations',
        },
        (payload) => {
          console.log('Consultation change:', payload);
          queryClient.invalidateQueries({ queryKey: ["consultations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('CreateMutation: Starting with data:', data);
      const result = await consultationService.create(data);
      console.log('CreateMutation: Result:', result);
      return result;
    },
    onSuccess: () => {
      console.log('CreateMutation: Success - invalidating queries');
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      toast({
        title: "Success",
        description: "Consultation logged successfully",
      });
      setIsFormOpen(false);
    },
    onError: (error) => {
      console.error('CreateMutation: Error:', error);
      toast({
        title: "Error",
        description: "Failed to log consultation",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('UpdateMutation: Starting with data:', data);
      console.log('UpdateMutation: Selected consultation ID:', selectedConsultation!.id);
      const result = await consultationService.update(selectedConsultation!.id, data);
      console.log('UpdateMutation: Result:', result);
      return result;
    },
    onSuccess: () => {
      console.log('UpdateMutation: Success - invalidating queries');
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      toast({
        title: "Success",
        description: "Consultation updated successfully",
      });
      setIsFormOpen(false);
      setSelectedConsultation(null);
    },
    onError: (error) => {
      console.error('UpdateMutation: Error:', error);
      toast({
        title: "Error",
        description: "Failed to update consultation",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return consultationService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      toast({
        title: "Success",
        description: "Consultation deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete consultation",
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (data: any) => {
    console.log('Consultations: Form submitted with data:', data);
    console.log('Consultations: Selected consultation:', selectedConsultation);
    console.log('Consultations: Will update:', !!selectedConsultation);
    console.log('Consultations: Will create:', !selectedConsultation);
    
    if (selectedConsultation) {
      console.log('Consultations: Calling updateMutation with data:', data);
      updateMutation.mutate(data);
    } else {
      console.log('Consultations: Calling createMutation with data:', data);
      createMutation.mutate(data);
    }
  };

  const handleEdit = (consultation: Consultation) => {
    console.log('Consultations: Edit button clicked for consultation:', consultation);
    console.log('Consultations: Setting selected consultation:', consultation);
    setSelectedConsultation(consultation);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this consultation?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch = 
      consultation.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.clientPhone.includes(searchTerm) ||
      consultation.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || consultation.consultationStatus === statusFilter;
    const matchesUrgency = urgencyFilter === "all" || consultation.urgency === urgencyFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled": return "bg-blue-100 text-blue-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      case "Rescheduled": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case "Initial": return "👋";
      case "Follow-up": return "🔄";
      case "Emergency": return "🚨";
      case "Routine": return "📋";
      case "VIP": return "👑";
      default: return "📅";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Consultation Management</h1>
          <p className="text-muted-foreground">Track client consultations and follow-ups</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedConsultation(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Log Consultation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto z-[9998]" style={{ zIndex: 9998 }} forceMount>
            <DialogHeader>
              <DialogTitle>
                {selectedConsultation ? "Edit Consultation" : "Log New Consultation"}
              </DialogTitle>
            </DialogHeader>
            <ConsultationForm
              key={selectedConsultation?.id || 'new'}
              onSubmit={handleFormSubmit}
              initialData={selectedConsultation ? {
                ...selectedConsultation,
                consultationDate: selectedConsultation.consultationDate ? 
                  new Date(new Date(selectedConsultation.consultationDate).getFullYear(), 
                          new Date(selectedConsultation.consultationDate).getMonth(), 
                          new Date(selectedConsultation.consultationDate).getDate(), 12, 0, 0) : 
                  new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 12, 0, 0),
                followUpDate: selectedConsultation.followUpDate ? 
                  new Date(new Date(selectedConsultation.followUpDate).getFullYear(), 
                          new Date(selectedConsultation.followUpDate).getMonth(), 
                          new Date(selectedConsultation.followUpDate).getDate(), 12, 0, 0) : 
                  undefined,
                consultationType: selectedConsultation.consultationType as any,
                urgency: selectedConsultation.urgency as any,
                consultationStatus: selectedConsultation.consultationStatus as any,
                consultationMethod: selectedConsultation.consultationMethod as any,
                paymentStatus: selectedConsultation.paymentStatus as any,
              } : undefined}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search consultations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Rescheduled">Rescheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency Levels</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {filteredConsultations.length} consultations
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultations List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading consultations...</p>
        </div>
      ) : filteredConsultations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No consultations found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" || urgencyFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by logging your first consultation"}
            </p>
            {!searchTerm && statusFilter === "all" && urgencyFilter === "all" && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log First Consultation
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredConsultations.map((consultation) => (
            <Card key={consultation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">
                        {getConsultationTypeIcon(consultation.consultationType)}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold">{consultation.clientName}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {consultation.clientPhone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {consultation.clientEmail}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {consultation.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Consultation Details</p>
                        <p className="font-medium">
                          {format(new Date(consultation.consultationDate), "PPP")} at {consultation.consultationTime}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {consultation.duration} • {consultation.consultationMethod}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gemstone Interest</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {consultation.gemstoneInterest.slice(0, 3).map((gemstone) => (
                            <Badge key={gemstone} variant="outline" className="text-xs">
                              {gemstone}
                            </Badge>
                          ))}
                          {consultation.gemstoneInterest.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{consultation.gemstoneInterest.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Budget & Status</p>
                        <p className="font-medium">{consultation.budget}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getStatusColor(consultation.consultationStatus)}>
                            {consultation.consultationStatus}
                          </Badge>
                          <Badge className={getUrgencyColor(consultation.urgency)}>
                            {consultation.urgency}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {consultation.consultationNotes && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm line-clamp-2">{consultation.consultationNotes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {consultation.clientSatisfaction && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">Satisfaction:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= consultation.clientSatisfaction!
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {consultation.followUpRequired && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-orange-500" />
                            <span className="text-sm text-orange-600">Follow-up Required</span>
                          </div>
                        )}
                        {consultation.tags && consultation.tags.length > 0 && (
                          <div className="flex gap-1">
                            {consultation.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(consultation)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(consultation.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
