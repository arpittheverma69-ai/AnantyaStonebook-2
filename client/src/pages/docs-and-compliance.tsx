import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, ShieldCheck, RefreshCw, AlertTriangle, Download, Filter } from 'lucide-react';

interface DocItem { id: string; name: string; type: 'certificate' | 'contract' | 'invoice' | 'other'; uploadedAt: string; tags: string[]; }
interface ComplianceItem { id: string; name: string; type: 'license' | 'gst' | 'lab-cert' | 'insurance'; issueDate: string; expiryDate: string; status: 'valid' | 'expiring' | 'expired'; }

const sampleDocs: DocItem[] = [
  { id: 'D-1', name: 'GIA Certificate RUBY-10348.pdf', type: 'certificate', uploadedAt: '2025-07-05', tags: ['ruby', 'gia'] },
  { id: 'D-2', name: 'Supplier Contract - Mogok 2025.pdf', type: 'contract', uploadedAt: '2025-06-18', tags: ['supplier', 'mogok'] },
  { id: 'D-3', name: 'Export Permit - Sri Lanka 2025.pdf', type: 'other', uploadedAt: '2025-05-02', tags: ['permit', 'sri-lanka'] },
];

const sampleCompliance: ComplianceItem[] = [
  { id: 'C-1', name: 'GST Registration', type: 'gst', issueDate: '2023-04-01', expiryDate: '2026-03-31', status: 'valid' },
  { id: 'C-2', name: 'Import-Export License', type: 'license', issueDate: '2024-01-10', expiryDate: '2025-12-31', status: 'expiring' },
  { id: 'C-3', name: 'Insurance Policy', type: 'insurance', issueDate: '2025-01-01', expiryDate: '2026-01-01', status: 'valid' },
  { id: 'C-4', name: 'Lab Certification Agreement', type: 'lab-cert', issueDate: '2023-08-15', expiryDate: '2025-08-14', status: 'expired' },
];

export default function DocsAndCompliance() {
  const [docs, setDocs] = useState<DocItem[]>(sampleDocs);
  const [compliance, setCompliance] = useState<ComplianceItem[]>(sampleCompliance);
  const [filterText, setFilterText] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<DocItem['type']>('certificate');

  const filteredDocs = useMemo(() => docs.filter(d => (
    d.name.toLowerCase().includes(filterText.toLowerCase()) ||
    d.tags.some(t => t.toLowerCase().includes(filterText.toLowerCase()))
  )), [docs, filterText]);

  const expiringSoon = (dateStr: string) => {
    const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000*60*60*24));
    return days <= 45 && days > 0;
  };

  const statusBadge = (status: ComplianceItem['status'], expiryDate: string) => {
    if (status === 'expired') return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    if (status === 'expiring' || expiringSoon(expiryDate)) return <Badge className="bg-yellow-100 text-yellow-800">Expiring</Badge>;
    return <Badge className="bg-green-100 text-green-800">Valid</Badge>;
  };

  const addMockDoc = () => {
    if (!newDocName) return;
    setDocs(prev => [{ id: `D-${Date.now()}`, name: newDocName, type: newDocType, uploadedAt: new Date().toISOString().slice(0,10), tags: [] }, ...prev]);
    setNewDocName('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Documents & Compliance</h1>
          <p className="text-gray-600">Store certificates/contracts and track renewals in one place</p>
        </div>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="documents">Document Management</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Tracker</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload & Manage</CardTitle>
              <CardDescription>Certificates, contracts, and more</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <Label>Document Name</Label>
                <Input placeholder="e.g., GIA Certificate RUBY-10348.pdf" value={newDocName} onChange={e => setNewDocName(e.target.value)} />
              </div>
              <div>
                <Label>Type</Label>
                <select className="w-full border rounded-md h-9 px-2" value={newDocType} onChange={e => setNewDocType(e.target.value as DocItem['type'])}>
                  <option value="certificate">Certificate</option>
                  <option value="contract">Contract</option>
                  <option value="invoice">Invoice</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="md:col-span-3 flex gap-3">
                <Button onClick={addMockDoc} className="flex items-center gap-2"><Upload className="w-4 h-4" /> Add</Button>
                <div className="ml-auto flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <Input placeholder="Filter by name/tag" value={filterText} onChange={e => setFilterText(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Click to download</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDocs.map(doc => (
                <div key={doc.id} className="p-3 border rounded-lg hover:bg-muted/40 cursor-pointer" onClick={() => window.alert('Download '+doc.name)}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate pr-2">{doc.name}</div>
                    <Button size="sm" variant="outline" className="h-8 px-2"><Download className="w-4 h-4" /></Button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{doc.type} • {doc.uploadedAt}</div>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {doc.tags.map(tag => (<Badge key={tag} variant="secondary">{tag}</Badge>))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
              <CardDescription>Renewals and legal requirements</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {compliance.map(item => (
                <div key={item.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{item.name}</div>
                    {statusBadge(item.status, item.expiryDate)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 capitalize">{item.type.replace('-', ' ')}</div>
                  <div className="text-xs text-gray-500">Issued {item.issueDate} • Expires {item.expiryDate}</div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => window.alert('Renewal flow (mock)')} className="h-8"><RefreshCw className="w-4 h-4 mr-1" /> Renew</Button>
                    <Button size="sm" variant="outline" onClick={() => window.alert('View details (mock)')} className="h-8"><ShieldCheck className="w-4 h-4 mr-1" /> Details</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Renewals</CardTitle>
              <CardDescription>Items expiring within 45 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {compliance.filter(c => c.status !== 'expired' && expiringSoon(c.expiryDate)).length === 0 && (
                <div className="text-sm text-gray-600">No upcoming renewals in the next 45 days</div>
              )}
              {compliance.filter(c => c.status !== 'expired' && expiringSoon(c.expiryDate)).map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">Expires {item.expiryDate}</div>
                  </div>
                  <Button size="sm" className="h-8" onClick={() => window.alert('Send reminder (mock)')}><AlertTriangle className="w-4 h-4 mr-1" /> Remind</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
