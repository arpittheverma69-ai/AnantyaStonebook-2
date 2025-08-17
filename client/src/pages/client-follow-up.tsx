import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Phone, Mail, MessageCircle, MapPin, Bell, Users, Star, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowUp {
  id: string;
  clientName: string;
  type: 'call' | 'email' | 'whatsapp' | 'visit' | 'reminder';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  scheduledDate: Date;
  notes: string;
  lastContact: Date;
  nextFollowUp: Date;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  lastPurchase: Date;
  totalSpent: number;
}

const followUpTypes = [
  { value: 'call', label: 'Phone Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'visit', label: 'Personal Visit', icon: MapPin },
  { value: 'reminder', label: 'Reminder', icon: Bell }
];

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
];

const statuses = [
  { value: 'pending', label: 'Pending', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' }
];

// Simulated data
const mockFollowUps: FollowUp[] = [
  {
    id: '1',
    clientName: 'Rajesh Kumar',
    type: 'call',
    priority: 'high',
    status: 'pending',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    notes: 'Follow up on Ruby inquiry from last week',
    lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    nextFollowUp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    clientName: 'Priya Sharma',
    type: 'whatsapp',
    priority: 'medium',
    status: 'completed',
    scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    notes: 'Sent sapphire collection photos',
    lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    nextFollowUp: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    clientName: 'Amit Patel',
    type: 'visit',
    priority: 'high',
    status: 'overdue',
    scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    notes: 'Show new emerald collection',
    lastContact: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    nextFollowUp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
];

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@email.com',
    phone: '+91 98765 43210',
    loyaltyPoints: 1250,
    tier: 'Gold',
    lastPurchase: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    totalSpent: 850000
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya@email.com',
    phone: '+91 98765 43211',
    loyaltyPoints: 850,
    tier: 'Silver',
    lastPurchase: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    totalSpent: 450000
  },
  {
    id: '3',
    name: 'Amit Patel',
    email: 'amit@email.com',
    phone: '+91 98765 43212',
    loyaltyPoints: 2100,
    tier: 'Platinum',
    lastPurchase: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    totalSpent: 1200000
  }
];

export default function ClientFollowUp() {
  const [followUps, setFollowUps] = useState<FollowUp[]>(mockFollowUps);
  const [clients] = useState<Client[]>(mockClients);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showNewFollowUp, setShowNewFollowUp] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState({
    clientName: '',
    type: 'call' as const,
    priority: 'medium' as const,
    scheduledDate: new Date(),
    notes: ''
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = followUpTypes.find(t => t.value === type);
    return typeConfig ? <typeConfig.icon className="h-4 w-4" /> : null;
  };

  const addFollowUp = () => {
    const followUp: FollowUp = {
      id: Date.now().toString(),
      ...newFollowUp,
      status: 'pending',
      lastContact: new Date(),
      nextFollowUp: newFollowUp.scheduledDate
    };
    
    setFollowUps(prev => [followUp, ...prev]);
    setNewFollowUp({
      clientName: '',
      type: 'call',
      priority: 'medium',
      scheduledDate: new Date(),
      notes: ''
    });
    setShowNewFollowUp(false);
  };

  const updateFollowUpStatus = (id: string, status: 'pending' | 'completed' | 'overdue') => {
    setFollowUps(prev => prev.map(fu => 
      fu.id === id ? { ...fu, status } : fu
    ));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const pendingCount = followUps.filter(fu => fu.status === 'pending').length;
  const overdueCount = followUps.filter(fu => fu.status === 'overdue').length;
  const completedCount = followUps.filter(fu => fu.status === 'completed').length;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Follow-up System</h1>
          <p className="text-gray-600">Manage client relationships and follow-up schedules</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-purple-600">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Follow-up List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Follow-up Tasks</h2>
            <Button onClick={() => setShowNewFollowUp(true)}>Add Follow-up</Button>
          </div>

          {followUps.map(followUp => (
            <Card key={followUp.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{followUp.clientName}</h3>
                      <Badge variant="outline" className={priorities.find(p => p.value === followUp.priority)?.color}>
                        {priorities.find(p => p.value === followUp.priority)?.label}
                      </Badge>
                      <Badge variant="outline" className={statuses.find(s => s.value === followUp.status)?.color}>
                        {statuses.find(s => s.value === followUp.status)?.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(followUp.type)}
                        <span className="capitalize">{followUp.type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{format(followUp.scheduledDate, 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700">{followUp.notes}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    {followUp.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateFollowUpStatus(followUp.id, 'completed')}
                        >
                          Complete
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateFollowUpStatus(followUp.id, 'overdue')}
                        >
                          Mark Overdue
                        </Button>
                      </>
                    )}
                    {followUp.status === 'overdue' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateFollowUpStatus(followUp.id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Client Loyalty Overview */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Client Loyalty Overview</h2>
          
          {clients.map(client => (
            <Card key={client.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{client.name}</h3>
                    <Badge variant="outline" className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800">
                      {client.tier}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Points:</span>
                      <span className="font-medium">{client.loyaltyPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Spent:</span>
                      <span className="font-medium">{formatCurrency(client.totalSpent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Purchase:</span>
                      <span className="font-medium">{format(client.lastPurchase, 'MMM dd')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">
                      {client.tier === 'Platinum' ? '★★★★★' : 
                       client.tier === 'Gold' ? '★★★★☆' : 
                       client.tier === 'Silver' ? '★★★☆☆' : '★★☆☆☆'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* New Follow-up Modal */}
      {showNewFollowUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add New Follow-up</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Select value={newFollowUp.clientName} onValueChange={(value) => setNewFollowUp(prev => ({ ...prev, clientName: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Follow-up Type</Label>
                <Select value={newFollowUp.type} onValueChange={(value: any) => setNewFollowUp(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {followUpTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newFollowUp.priority} onValueChange={(value: any) => setNewFollowUp(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newFollowUp.scheduledDate ? format(newFollowUp.scheduledDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newFollowUp.scheduledDate}
                      onSelect={(date) => date && setNewFollowUp(prev => ({ ...prev, scheduledDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  placeholder="Add follow-up notes..."
                  value={newFollowUp.notes}
                  onChange={(e) => setNewFollowUp(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={addFollowUp} className="flex-1">Add Follow-up</Button>
                <Button variant="outline" onClick={() => setShowNewFollowUp(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
