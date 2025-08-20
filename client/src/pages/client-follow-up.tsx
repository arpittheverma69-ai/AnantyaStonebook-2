import React, { useEffect, useMemo, useState } from 'react';
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
import { CalendarIcon, Phone, Mail, MessageCircle, MapPin, Bell, Users, Star, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { clientService, taskService } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

interface FollowUpTask {
  id: string;
  title: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  description?: string | null;
  notes?: string | null;
  relatedTo?: string | null; // client id
  relatedType?: string | null; // 'Client'
  assignedTo?: string | null;
  dueDate?: string | null; // ISO string
  priority?: 'High' | 'Medium' | 'Low' | null;
}

interface ClientItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  loyaltyLevel?: string | null;
  businessName?: string | null;
  city?: string | null;
  totalSpent?: number; // computed
  lastPurchase?: string | null;
}

const followUpTypes = [
  { value: 'call', label: 'Phone Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'visit', label: 'Personal Visit', icon: MapPin },
  { value: 'reminder', label: 'Reminder', icon: Bell }
];

const priorities = [
  { value: 'Low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'Medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'High', label: 'High', color: 'bg-red-100 text-red-800' }
];

const statuses = [
  { value: 'Pending', label: 'Pending', color: 'bg-blue-100 text-blue-800' },
  { value: 'Completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'Overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' }
];

export default function ClientFollowUp() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewFollowUp, setShowNewFollowUp] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState({
    clientId: '',
    type: 'call' as const,
    priority: 'Medium' as const,
    scheduledDate: new Date(),
    notes: ''
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [clientRows, taskRows] = await Promise.all([
          clientService.getAll(),
          taskService.getAll(),
        ]);
        setClients(clientRows.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          loyaltyLevel: c.loyaltyLevel,
          businessName: c.businessName,
          city: c.city,
        })));
        setTasks(taskRows.map((t: any) => ({
          id: t.id,
          title: t.title || 'Follow-up',
          status: (t.status || 'Pending') as FollowUpTask['status'],
          description: t.description,
          notes: t.notes,
          relatedTo: t.relatedTo,
          relatedType: t.relatedType,
          assignedTo: t.assignedTo,
          dueDate: t.dueDate,
          priority: (t.priority || 'Medium') as FollowUpTask['priority'],
        })));
      } catch (e:any) {
        console.error(e);
        toast({ title: 'Error', description: 'Failed to load follow-ups/clients', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const pendingCount = useMemo(() => tasks.filter(t => t.status === 'Pending').length, [tasks]);
  const overdueCount = useMemo(() => tasks.filter(t => t.status === 'Overdue').length, [tasks]);
  const completedCount = useMemo(() => tasks.filter(t => t.status === 'Completed').length, [tasks]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = followUpTypes.find(t => t.value === type);
    return typeConfig ? <typeConfig.icon className="h-4 w-4" /> : null;
  };

  const addFollowUp = async () => {
    try {
      const client = clients.find(c => c.id === newFollowUp.clientId);
      const payload = {
        title: `${newFollowUp.type.toUpperCase()} follow-up ${client ? `with ${client.name}` : ''}`.trim(),
        status: 'Pending',
        description: newFollowUp.notes,
        notes: newFollowUp.notes,
        relatedTo: newFollowUp.clientId || null,
        relatedType: newFollowUp.clientId ? 'Client' : null,
        dueDate: newFollowUp.scheduledDate.toISOString(),
        priority: newFollowUp.priority,
      } as any;
      const created = await taskService.create(payload);
      setTasks(prev => [{
        id: created.id,
        title: created.title || 'Follow-up',
        status: (created.status || 'Pending'),
        description: created.description,
        notes: created.notes,
        relatedTo: created.relatedTo,
        relatedType: created.relatedType,
        assignedTo: created.assignedTo,
        dueDate: created.dueDate,
        priority: created.priority,
      }, ...prev]);
    setShowNewFollowUp(false);
      setNewFollowUp({ clientId: '', type: 'call', priority: 'Medium', scheduledDate: new Date(), notes: '' });
      toast({ title: 'Follow-up added' });
    } catch (e:any) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to add follow-up', variant: 'destructive' });
    }
  };

  const updateFollowUpStatus = async (id: string, status: FollowUpTask['status']) => {
    try {
      await taskService.update(id, { status });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch (e:any) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">Loading...</div>
    );
  }

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
        <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><Clock className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-600">Pending</p><p className="text-2xl font-bold text-blue-600">{pendingCount}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><AlertCircle className="h-5 w-5 text-red-600" /><div><p className="text-sm text-gray-600">Overdue</p><p className="text-2xl font-bold text-red-600">{overdueCount}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><CheckCircle className="h-5 w-5 text-green-600" /><div><p className="text-sm text-gray-600">Completed</p><p className="text-2xl font-bold text-green-600">{completedCount}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><Users className="h-5 w-5 text-purple-600" /><div><p className="text-sm text-gray-600">Total Clients</p><p className="text-2xl font-bold text-purple-600">{clients.length}</p></div></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Follow-up List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Follow-up Tasks</h2>
            <Button onClick={() => setShowNewFollowUp(true)}>Add Follow-up</Button>
          </div>

          {tasks.map(task => (
            <Card key={task.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge variant="outline" className={cn('capitalize', priorities.find(p => p.value === (task.priority || 'Medium'))?.color)}>
                        {task.priority || 'Medium'}
                      </Badge>
                      <Badge variant="outline" className={cn(statuses.find(s => s.value === task.status)?.color)}>
                        {task.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        {getTypeIcon('call')}
                        <span className="capitalize">Due</span>
                      </div>
                      {task.dueDate && (
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                          <span>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                      </div>
                      )}
                    </div>
                    
                    {task.notes && <p className="text-sm text-gray-700">{task.notes}</p>}
                  </div>
                  
                  <div className="flex space-x-2">
                    {task.status === 'Pending' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateFollowUpStatus(task.id, 'Completed')}>Complete</Button>
                        <Button size="sm" variant="outline" onClick={() => updateFollowUpStatus(task.id, 'Overdue')}>Mark Overdue</Button>
                      </>
                    )}
                    {task.status === 'Overdue' && (
                      <Button size="sm" variant="outline" onClick={() => updateFollowUpStatus(task.id, 'Completed')}>Complete</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Client List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Clients</h2>
          {clients.map(client => (
            <Card key={client.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{client.name}</h3>
                    <Badge variant="outline" className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800">
                      {client.loyaltyLevel || '—'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-700">
                    {client.phone && <div>📞 {client.phone}</div>}
                    {client.email && <div>✉️ {client.email}</div>}
                    {client.city && <div>📍 {client.city}</div>}
                    {client.businessName && <div>🏢 {client.businessName}</div>}
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
                <Label>Client</Label>
                <Select value={newFollowUp.clientId} onValueChange={(value) => setNewFollowUp(prev => ({ ...prev, clientId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
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
