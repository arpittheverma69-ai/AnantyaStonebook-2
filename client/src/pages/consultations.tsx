import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type Consultation, type Client } from "@shared/schema";
import { Plus, Search, MessageCircle, Calendar, Phone, Video, Users as UsersIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ConsultationForm from "@/components/forms/consultation-form";

export default function Consultations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: consultations = [], isLoading } = useQuery<Consultation[]>({
    queryKey: ["/api/consultations"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const deleteConsultationMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/consultations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
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

  const filteredConsultations = consultations.filter(consultation => {
    const client = clients.find(c => c.id === consultation.clientId);
    return (
      (client && client.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      consultation.outcome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.medium.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getClientName = (clientId: string | null) => {
    if (!clientId) return '-';
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString('en-IN');
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingConsultation(null);
  };

  const getMediumIcon = (medium: string) => {
    switch (medium) {
      case 'In-person':
        return <UsersIcon className="h-4 w-4" />;
      case 'Call':
        return <Phone className="h-4 w-4" />;
      case 'Video':
        return <Video className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getMediumColor = (medium: string) => {
    switch (medium) {
      case 'In-person':
        return 'bg-green-100 text-green-800';
      case 'Call':
        return 'bg-blue-100 text-blue-800';
      case 'Video':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const upcomingFollowUps = consultations.filter(consultation => 
    consultation.followUpNeeded && 
    consultation.nextFollowUpDate && 
    new Date(consultation.nextFollowUpDate) >= new Date()
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultation Management</h1>
          <p className="text-gray-600">Track client consultations and follow-ups</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Log Consultation</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingConsultation ? "Edit Consultation" : "Log New Consultation"}
              </DialogTitle>
            </DialogHeader>
            <ConsultationForm 
              consultation={editingConsultation} 
              onClose={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Consultations</p>
                <p className="text-2xl font-bold text-gray-900">{consultations.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="text-blue-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming Follow-ups</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingFollowUps}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-orange-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultations.filter(c => 
                    new Date(c.date).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="text-green-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Consultation Log</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search consultations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredConsultations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? "No consultations match your search criteria" : "Start by logging your first client consultation"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Your First Consultation
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Medium</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Follow-up Required</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Stones Discussed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsultations.map((consultation) => (
                    <TableRow key={consultation.id}>
                      <TableCell>{formatDate(consultation.date)}</TableCell>
                      <TableCell className="font-medium">{getClientName(consultation.clientId)}</TableCell>
                      <TableCell>
                        <Badge className={getMediumColor(consultation.medium)}>
                          <span className="flex items-center space-x-1">
                            {getMediumIcon(consultation.medium)}
                            <span>{consultation.medium}</span>
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{consultation.outcome || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={consultation.followUpNeeded ? "default" : "secondary"}>
                          {consultation.followUpNeeded ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {consultation.nextFollowUpDate ? formatDateTime(consultation.nextFollowUpDate) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {consultation.stonesDiscussed?.slice(0, 2).map((stone, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {stone}
                            </Badge>
                          ))}
                          {consultation.stonesDiscussed && consultation.stonesDiscussed.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{consultation.stonesDiscussed.length - 2} more
                            </Badge>
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
