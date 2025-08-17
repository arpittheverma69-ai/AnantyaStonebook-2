import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarIcon, 
  Phone, 
  Mail, 
  MessageSquare, 
  Star, 
  Gift, 
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Send
} from "lucide-react";
import { format, addDays, isAfter, isBefore } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface FollowUp {
  id: string;
  clientId: string;
  clientName: string;
  type: "call" | "email" | "whatsapp" | "visit" | "reminder";
  status: "pending" | "completed" | "overdue";
  dueDate: Date;
  notes: string;
  priority: "low" | "medium" | "high";
  completedAt?: Date;
  createdAt: Date;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
  loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  lastContact: Date;
  totalPurchases: number;
  isActive: boolean;
}

export default function ClientFollowUp() {
  const { toast } = useToast();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [followUpType, setFollowUpType] = useState<FollowUp["type"]>("call");
  const [dueDate, setDueDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<FollowUp["priority"]>("medium");
  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "overdue">("pending");

  // Simulated data - in real app, this would come from API
  useEffect(() => {
    const mockClients: Client[] = [
      {
        id: "1",
        name: "Rajesh Kumar",
        phone: "+91 98765 43210",
        email: "rajesh@jewelry.com",
        loyaltyPoints: 1250,
        loyaltyTier: "Gold",
        lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        totalPurchases: 8,
        isActive: true
      },
      {
        id: "2",
        name: "Priya Sharma",
        phone: "+91 87654 32109",
        email: "priya@temple.org",
        loyaltyPoints: 850,
        loyaltyTier: "Silver",
        lastContact: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        totalPurchases: 5,
        isActive: true
      },
      {
        id: "3",
        name: "Amit Patel",
        phone: "+91 76543 21098",
        email: "amit@astrology.com",
        loyaltyPoints: 2100,
        loyaltyTier: "Platinum",
        lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        totalPurchases: 12,
        isActive: true
      }
    ];

    const mockFollowUps: FollowUp[] = [
      {
        id: "1",
        clientId: "1",
        clientName: "Rajesh Kumar",
        type: "call",
        status: "pending",
        dueDate: addDays(new Date(), 1),
        notes: "Follow up on Ruby inquiry",
        priority: "high",
        createdAt: new Date()
      },
      {
        id: "2",
        clientId: "2",
        clientName: "Priya Sharma",
        type: "whatsapp",
        status: "overdue",
        dueDate: addDays(new Date(), -2),
        notes: "Yellow Sapphire consultation reminder",
        priority: "medium",
        createdAt: new Date()
      },
      {
        id: "3",
        clientId: "3",
        clientName: "Amit Patel",
        type: "visit",
        status: "completed",
        dueDate: addDays(new Date(), -1),
        notes: "Blue Sapphire delivery completed",
        priority: "low",
        completedAt: new Date(),
        createdAt: new Date()
      }
    ];

    setClients(mockClients);
    setFollowUps(mockFollowUps);
  }, []);

  const getLoyaltyTierColor = (tier: string) => {
    switch (tier) {
      case "Bronze": return "bg-amber-100 text-amber-800";
      case "Silver": return "bg-gray-100 text-gray-800";
      case "Gold": return "bg-yellow-100 text-yellow-800";
      case "Platinum": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "overdue": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "call": return <Phone className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      case "whatsapp": return <MessageSquare className="h-4 w-4" />;
      case "visit": return <Users className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const createFollowUp = () => {
    if (!selectedClient || !dueDate || !notes.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const client = clients.find(c => c.id === selectedClient);
    if (!client) return;

    const newFollowUp: FollowUp = {
      id: Date.now().toString(),
      clientId: selectedClient,
      clientName: client.name,
      type: followUpType,
      status: "pending",
      dueDate,
      notes,
      priority,
      createdAt: new Date()
    };

    setFollowUps(prev => [newFollowUp, ...prev]);
    
    // Reset form
    setSelectedClient("");
    setDueDate(undefined);
    setNotes("");
    setPriority("medium");

    toast({
      title: "Follow-up Created",
      description: `Follow-up scheduled for ${client.name}`,
    });
  };

  const markComplete = (id: string) => {
    setFollowUps(prev => prev.map(fu => 
      fu.id === id 
        ? { ...fu, status: "completed" as const, completedAt: new Date() }
        : fu
    ));

    toast({
      title: "Follow-up Completed",
      description: "Follow-up marked as completed",
    });
  };

  const filteredFollowUps = followUps.filter(fu => fu.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Client Follow-up System
        </h2>
        <p className="text-muted-foreground">
          Manage client relationships with automated reminders and loyalty tracking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Follow-up Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Create Follow-up
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Select Client *</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <span>{client.name}</span>
                        <Badge className={getLoyaltyTierColor(client.loyaltyTier)}>
                          {client.loyaltyTier}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Follow-up Type</Label>
                <Select value={followUpType} onValueChange={(value: FollowUp["type"]) => setFollowUpType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="visit">In-Person Visit</SelectItem>
                    <SelectItem value="reminder">General Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: FollowUp["priority"]) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    disabled={(date) => isBefore(date, new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes *</Label>
              <Textarea
                id="notes"
                placeholder="Enter follow-up details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={createFollowUp} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Schedule Follow-up
            </Button>
          </CardContent>
        </Card>

        {/* Follow-up List & Client Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Loyalty Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Loyalty Program Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {clients.map(client => (
                  <div key={client.id} className="text-center space-y-2 p-3 border rounded-lg">
                    <div className="font-medium text-sm">{client.name}</div>
                    <Badge className={getLoyaltyTierColor(client.loyaltyTier)}>
                      {client.loyaltyTier}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {client.loyaltyPoints} points
                    </div>
                    <div className="text-xs">
                      {client.totalPurchases} purchases
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Follow-up Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Follow-up Management
              </CardTitle>
              <div className="flex space-x-2 mt-4">
                {(["pending", "overdue", "completed"] as const).map(tab => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === "pending" && (
                      <Badge variant="secondary" className="ml-2">
                        {followUps.filter(fu => fu.status === "pending").length}
                      </Badge>
                    )}
                    {tab === "overdue" && (
                      <Badge variant="destructive" className="ml-2">
                        {followUps.filter(fu => fu.status === "overdue").length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredFollowUps.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No {activeTab} follow-ups
                  </div>
                ) : (
                  filteredFollowUps.map(followUp => (
                    <div key={followUp.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(followUp.type)}
                        <div>
                          <div className="font-medium">{followUp.clientName}</div>
                          <div className="text-sm text-muted-foreground">{followUp.notes}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getPriorityColor(followUp.priority)}>
                              {followUp.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Due: {format(followUp.dueDate, "MMM dd, yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusIcon(followUp.status)}
                        {followUp.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => markComplete(followUp.id)}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
