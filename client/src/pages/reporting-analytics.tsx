import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { BarChart2, PieChart, LineChart as LineIcon, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Pie, PieChart as RePieChart, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { downloadStockReport, type StockItem } from '@/lib/stock-report';

const colors = ['#60a5fa', '#f59e0b', '#34d399', '#f43f5e', '#a78bfa'];

type Metrics = {
  monthlySales: number;
  totalRevenue: number;
  totalSales: number;
  avgSaleValue: number;
  pendingPayments: number;
  inventoryValue: number;
  totalStones: number;
  availableStones: number;
  soldStones: number;
  lowStockItems: number;
  totalClients: number;
  activeClients: number;
  trustworthyClients: number;
  totalSuppliers: number;
  domesticSuppliers: number;
  internationalSuppliers: number;
  highQualitySuppliers: number;
};

type Sale = {
  id: string;
  date: string; // ISO
  totalAmount: string; // decimal as string
  profit: string; // decimal as string
  stoneId?: string | null;
};

type InventoryItem = {
  id: string;
  type: string;
};

export default function ReportingAnalytics() {
  const [reportName, setReportName] = useState('Custom Report 1');
  const [builderBlocks, setBuilderBlocks] = useState<string[]>(['KPI: Sales', 'Chart: Sales by Month']);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Fetch real data
  const { data: metrics } = useQuery<Metrics>({ queryKey: ["/api/dashboard/metrics"] });
  const { data: sales } = useQuery<Sale[]>({ queryKey: ["/api/sales"] });
  const { data: inventory } = useQuery<any[]>({ queryKey: ["/api/inventory"] });
  const { data: aiInsights } = useQuery<{ insights: string[] }>({ queryKey: ["/api/ai/insights"] });

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const salesByMonth = useMemo(() => {
    const base = monthNames.map((m) => ({ month: m, sales: 0, profit: 0 }));
    if (!sales) return base;
    const result = [...base];
    for (const s of sales) {
      const d = new Date(s.date);
      if (isNaN(d.getTime())) continue;
      const mi = d.getMonth();
      const amount = Number(s.totalAmount) || 0;
      const profit = Number(s.profit) || 0;
      result[mi].sales += amount / 100000; // scale for chart readability
      result[mi].profit += profit / 100000;
    }
    // Round to 2 decimals for display
    return result.map(r => ({ ...r, sales: Math.round(r.sales * 100)/100, profit: Math.round(r.profit * 100)/100 }));
  }, [sales]);

  const topStones = useMemo(() => {
    if (!sales || !inventory) return [] as { name: string; value: number }[];
    const idToType = new Map(inventory.map(i => [i.id, i.type] as const));
    const counts = new Map<string, number>();
    for (const s of sales) {
      const t = s.stoneId ? idToType.get(s.stoneId) : undefined;
      if (!t) continue;
      counts.set(t, (counts.get(t) || 0) + (Number(s.totalAmount) || 0));
    }
    const arr = Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
    arr.sort((a, b) => b.value - a.value);
    return arr.slice(0, 5);
  }, [sales, inventory]);

  const formatRs = (n: number) => `Rs. ${Math.round(n).toLocaleString()}`;

  const addBlock = (type: string) => {
    setBuilderBlocks(prev => [...prev, type]);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFontSize(16);
    doc.text(`Report: ${reportName}`, 40, 40);
    doc.setFontSize(12);
    doc.text('KPIs', 40, 70);
    autoTable(doc, {
      startY: 80,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', metrics ? formatRs(metrics.totalRevenue) : '—'],
        ['Total Sales', metrics ? String(metrics.totalSales) : '—'],
        ['Avg Sale Value', metrics ? formatRs(metrics.avgSaleValue) : '—'],
        ['Inventory Value', metrics ? formatRs(metrics.inventoryValue) : '—'],
      ],
    });
    doc.addPage();
    doc.text('Sales vs Profit (Monthly, scaled in lakhs)', 40, 40);
    autoTable(doc, {
      startY: 50,
      head: [['Month', 'Sales', 'Profit']],
      body: salesByMonth.map(r => [r.month, String(r.sales), String(r.profit)]),
    });
    if (topStones.length) {
      doc.addPage();
      doc.text('Top Stones by Revenue', 40, 40);
      autoTable(doc, {
        startY: 50,
        head: [['Stone', 'Revenue']],
        body: topStones.map(t => [t.name, formatRs(t.value)]),
      });
    }
    doc.save(`${reportName.replace(/\s+/g,'_')}.pdf`);
  };

  const exportCSV = () => {
    const rows: string[] = [];
    rows.push('Metric,Value');
    rows.push(`Total Revenue,${metrics ? metrics.totalRevenue : ''}`);
    rows.push(`Total Sales,${metrics ? metrics.totalSales : ''}`);
    rows.push(`Avg Sale Value,${metrics ? metrics.avgSaleValue : ''}`);
    rows.push('');
    rows.push('Month,Sales (lakhs),Profit (lakhs)');
    for (const r of salesByMonth) {
      rows.push(`${r.month},${r.sales},${r.profit}`);
    }
    rows.push('');
    rows.push('Top Stone,Revenue');
    for (const t of topStones) {
      rows.push(`${t.name},${t.value}`);
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName.replace(/\s+/g,'_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    // Simple HTML table export compatible with Excel
    const tableHTML = `
      <html><head><meta charset="UTF-8"></head><body>
      <table border="1">
      <tr><th colspan="2">KPIs</th></tr>
      <tr><td>Total Revenue</td><td>${metrics ? metrics.totalRevenue : ''}</td></tr>
      <tr><td>Total Sales</td><td>${metrics ? metrics.totalSales : ''}</td></tr>
      <tr><td>Avg Sale Value</td><td>${metrics ? metrics.avgSaleValue : ''}</td></tr>
      <tr><td>Inventory Value</td><td>${metrics ? metrics.inventoryValue : ''}</td></tr>
      </table>
      <br/>
      <table border="1">
      <tr><th colspan="3">Sales vs Profit (Monthly, lakhs)</th></tr>
      <tr><th>Month</th><th>Sales</th><th>Profit</th></tr>
      ${salesByMonth.map(r => `<tr><td>${r.month}</td><td>${r.sales}</td><td>${r.profit}</td></tr>`).join('')}
      </table>
      <br/>
      <table border="1">
      <tr><th colspan="2">Top Stones by Revenue</th></tr>
      <tr><th>Stone</th><th>Revenue</th></tr>
      ${topStones.map(t => `<tr><td>${t.name}</td><td>${t.value}</td></tr>`).join('')}
      </table>
      </body></html>`;
    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName.replace(/\s+/g,'_')}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportFile = (type: 'pdf' | 'csv' | 'xlsx') => {
    if (type === 'pdf') return exportPDF();
    if (type === 'csv') return exportCSV();
    return exportExcel();
  };

  // Stock Report helpers
  const inventoryForReport: StockItem[] = useMemo(() => {
    return (inventory || []).map((item: any) => ({
      id: item.id,
      gemId: item.gem_id || item.gemId,
      type: item.type,
      grade: item.grade,
      carat: item.carat ?? item.weight,
      origin: item.origin,
      quantity: item.quantity,
      status: item.status,
      isAvailable: item.is_available ?? item.isAvailable,
      pricePerCarat: item.price_per_carat ?? item.pricePerCarat,
      totalPrice: item.total_price ?? item.totalPrice ?? item.sellingPrice,
      sellingPrice: item.sellingPrice,
    }));
  }, [inventory]);

  const downloadStockPDF = (onlyAvailable: boolean) => {
    downloadStockReport(inventoryForReport, {
      title: 'Stock Report',
      onlyAvailable,
      filename: onlyAvailable ? 'Stock_Report_Available.pdf' : 'Stock_Report_All.pdf',
    });
  };
  const [onlyAvailView, setOnlyAvailView] = useState(true);

  // Persist builder state locally so it behaves more like a real builder
  useEffect(() => {
    try {
      const saved = localStorage.getItem('anantya-report-builder');
      if (saved) {
        const parsed = JSON.parse(saved) as { name: string; blocks: string[] };
        if (parsed?.name) setReportName(parsed.name);
        if (Array.isArray(parsed?.blocks) && parsed.blocks.length) setBuilderBlocks(parsed.blocks);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('anantya-report-builder', JSON.stringify({ name: reportName, blocks: builderBlocks }));
    } catch {}
  }, [reportName, builderBlocks]);

  const onDragStart = (index: number) => setDragIndex(index);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    setBuilderBlocks(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
  };
  const removeBlock = (index: number) => setBuilderBlocks(prev => prev.filter((_, i) => i !== index));

  const renderBlock = (label: string) => {
    if (label.startsWith('KPI:')) {
      const name = label.split(':')[1]?.trim().toLowerCase();
      if (name === 'revenue' || name === 'sales') {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card><CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{metrics ? formatRs(metrics.totalRevenue) : '—'}</div></CardContent></Card>
            <Card><CardHeader><CardTitle>Orders</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{metrics ? metrics.totalSales : '—'}</div></CardContent></Card>
          </div>
        );
      }
      if (name === 'profit') {
        const totalProfit = sales ? sales.reduce((s, x) => s + (Number(x.profit) || 0), 0) : 0;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card><CardHeader><CardTitle>Total Profit</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatRs(totalProfit)}</div></CardContent></Card>
            <Card><CardHeader><CardTitle>Avg Margin</CardTitle></CardHeader><CardContent>
              <div className="text-2xl font-bold">
                {sales ? (() => { const rev = sales.reduce((s, x) => s + (Number(x.totalAmount) || 0), 0); const prof = totalProfit; const pct = rev>0? Math.round((prof/rev)*1000)/10 : 0; return `${pct}%`;})() : '—'}
              </div>
            </CardContent></Card>
          </div>
        );
      }
    }
    if (label.startsWith('Chart:')) {
      const name = label.split(':')[1]?.trim().toLowerCase();
      if (name.includes('sales by month')) {
        return (
          <Card>
            <CardHeader><CardTitle>Sales vs Profit (Monthly)</CardTitle></CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#3b82f6" />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      }
      if (name.includes('top stones')) {
        return (
          <Card>
            <CardHeader><CardTitle>Top Stones by Revenue</CardTitle></CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie dataKey="value" data={topStones} cx="50%" cy="50%" outerRadius={80} label>
                    {topStones.map((entry, index) => (
                      <Cell key={`cell2-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      }
    }
    if (label.startsWith('Table:')) {
      const name = label.split(':')[1]?.trim().toLowerCase();
      if (name.includes('sales')) {
        return (
          <Card>
            <CardHeader><CardTitle>Sales Detail</CardTitle><CardDescription>Latest 10 sales</CardDescription></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b"><th className="py-2 pr-4">Date</th><th className="py-2 pr-4">Amount</th><th className="py-2">Profit</th></tr>
                  </thead>
                  <tbody>
                    {(sales || []).slice(-10).reverse().map((s, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2 pr-4">{new Date(s.date).toLocaleDateString()}</td>
                        <td className="py-2 pr-4">{formatRs(Number(s.totalAmount)||0)}</td>
                        <td className="py-2">{formatRs(Number(s.profit)||0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      }
    }
    return (
      <div className="text-xs text-gray-500">Unknown block: {label}</div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart2 className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reporting & Analytics</h1>
          <p className="text-gray-600">Build custom reports, visualize data, and export</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="dashboard">Performance Dashboards</TabsTrigger>
          <TabsTrigger value="builder">Custom Report Builder</TabsTrigger>
          <TabsTrigger value="exports">Export Tools</TabsTrigger>
          <TabsTrigger value="stock">Stock Report</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader><CardTitle>Total Sales</CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics ? formatRs(metrics.totalRevenue) : '—'}</div>
                <div className="text-xs text-green-600">KPI</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total Profit</CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sales ? formatRs(sales.reduce((s, x) => s + (Number(x.profit) || 0), 0)) : '—'}</div>
                <div className="text-xs text-green-600">KPI</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Orders</CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics ? metrics.totalSales : '—'}</div>
                <div className="text-xs text-blue-600">KPI</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Avg Margin</CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {sales ? (() => {
                    const rev = sales.reduce((s, x) => s + (Number(x.totalAmount) || 0), 0);
                    const prof = sales.reduce((s, x) => s + (Number(x.profit) || 0), 0);
                    const pct = rev > 0 ? Math.round((prof / rev) * 1000) / 10 : 0;
                    return `${pct}%`;
                  })() : '—'}
                </div>
                <div className="text-xs text-green-600">KPI</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Sales vs Profit (Monthly)</CardTitle></CardHeader>
              <CardContent style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#3b82f6" />
                    <Line type="monotone" dataKey="profit" stroke="#10b981" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Top Performing Stones</CardTitle></CardHeader>
              <CardContent style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie dataKey="value" data={topStones} cx="50%" cy="50%" outerRadius={80} label>
                      {topStones.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>Drag-and-drop blocks to assemble your report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="border rounded-lg p-3 bg-muted/30">
                  <div className="text-sm font-medium mb-2">Available Blocks</div>
                  <div className="space-y-2 text-sm">
                    <Button size="sm" variant="outline" onClick={() => addBlock('KPI: Revenue')}>+ KPI: Revenue</Button>
                    <Button size="sm" variant="outline" onClick={() => addBlock('KPI: Profit')}>+ KPI: Profit</Button>
                    <Button size="sm" variant="outline" onClick={() => addBlock('Chart: Top Stones')}>+ Chart: Top Stones</Button>
                    <Button size="sm" variant="outline" onClick={() => addBlock('Table: Sales Detail')}>+ Table: Sales Detail</Button>
                  </div>
                </div>
                <div className="md:col-span-2 border rounded-lg p-3 min-h-[220px]">
                  <div className="flex items-center justify-between">
                    <Input className="max-w-xs" value={reportName} onChange={e => setReportName(e.target.value)} />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => exportFile('pdf')}><FileText className="w-4 h-4 mr-1" /> PDF</Button>
                      <Button size="sm" variant="outline" onClick={() => exportFile('csv')}><FileSpreadsheet className="w-4 h-4 mr-1" /> CSV</Button>
                      <Button size="sm" variant="outline" onClick={() => exportFile('xlsx')}><FileSpreadsheet className="w-4 h-4 mr-1" /> Excel</Button>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-1 gap-3">
                    {builderBlocks.map((b, i) => (
                      <div key={`${b}-${i}`} className="space-y-2">
                        <div
                          className="p-2 border rounded-md bg-white/50 dark:bg-gray-900/50 cursor-move flex items-center justify-between"
                          draggable
                          onDragStart={() => onDragStart(i)}
                          onDragOver={onDragOver}
                          onDrop={() => onDrop(i)}
                          title="Drag to reorder"
                        >
                          <div className="text-sm font-medium">{b}</div>
                          <Button size="sm" variant="ghost" onClick={() => removeBlock(i)}>Remove</Button>
                        </div>
                        {renderBlock(b)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Download data in multiple formats</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => exportFile('pdf')}><FileText className="w-4 h-4 mr-1" /> Export PDF</Button>
              <Button variant="outline" onClick={() => exportFile('csv')}><FileSpreadsheet className="w-4 h-4 mr-1" /> Export CSV</Button>
              <Button variant="outline" onClick={() => exportFile('xlsx')}><FileSpreadsheet className="w-4 h-4 mr-1" /> Export Excel</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Intelligence Insights</CardTitle>
              <CardDescription>AI-assisted insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {aiInsights?.insights?.length ? (
                aiInsights.insights.map((line, idx) => (
                  <div key={idx}>• {line}</div>
                ))
              ) : (
                <div className="text-gray-600">No insights available yet.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Report</CardTitle>
              <CardDescription>Real-time inventory with printable PDF</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => downloadStockPDF(true)}>
                  <FileText className="w-4 h-4 mr-1" /> Download PDF (Available Only)
                </Button>
                <Button variant="outline" onClick={() => downloadStockPDF(false)}>
                  <FileText className="w-4 h-4 mr-1" /> Download PDF (All Items)
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="only-avail" checked={onlyAvailView} onCheckedChange={setOnlyAvailView} />
                <Label htmlFor="only-avail" className="text-sm">Show only available items</Label>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Gem ID</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Grade</th>
                      <th className="py-2 pr-4">Carat</th>
                      <th className="py-2 pr-4">Origin</th>
                      <th className="py-2 pr-4">Qty</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Price/ct</th>
                      <th className="py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryForReport.filter(it => !onlyAvailView || it.isAvailable || it.status === 'In Stock').map((it, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-mono">{it.gemId || it.id}</td>
                        <td className="py-2 pr-4">{it.type}</td>
                        <td className="py-2 pr-4">{it.grade}</td>
                        <td className="py-2 pr-4">{Number(it.carat || 0).toFixed(2)}</td>
                        <td className="py-2 pr-4">{it.origin}</td>
                        <td className="py-2 pr-4">{it.quantity}</td>
                        <td className="py-2 pr-4">{it.status || (it.isAvailable ? 'In Stock' : 'Sold')}</td>
                        <td className="py-2 pr-4">{it.pricePerCarat ? `Rs. ${Number(it.pricePerCarat).toLocaleString()}` : '-'}</td>
                        <td className="py-2">{`Rs. ${Number(it.totalPrice || it.sellingPrice || 0).toLocaleString()}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
