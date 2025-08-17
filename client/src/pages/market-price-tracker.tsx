import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inventoryService } from "@/lib/database";
import { AlertTriangle, Upload, Bell, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface PricePoint { date: string; price: number; }

export default function MarketPriceTracker() {
  const [types, setTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [series, setSeries] = useState<PricePoint[]>([]);
  const [alertThreshold, setAlertThreshold] = useState<number>(0);
  const [alertDirection, setAlertDirection] = useState<'above' | 'below'>('above');
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const data = await inventoryService.getAll();
      const uniqueTypes = Array.from(new Set((data || []).map((i:any)=> i.type))).filter(Boolean) as string[];
      setTypes(uniqueTypes);
      setSelectedType(uniqueTypes[0] || "");
    })();
  }, []);

  useEffect(() => {
    if (!selectedType) return;
    // Try to load cached series
    const cached = localStorage.getItem(`mp_${selectedType}`);
    if (cached) {
      setSeries(JSON.parse(cached));
    } else {
      // seed with mock trend
      const today = new Date();
      const mock: PricePoint[] = Array.from({ length: 12 }).map((_, i) => {
        const d = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
        return { date: d.toISOString().split('T')[0], price: Math.round(8000 + Math.random() * 8000) };
      });
      setSeries(mock);
      localStorage.setItem(`mp_${selectedType}`, JSON.stringify(mock));
    }
  }, [selectedType]);

  // Evaluate alerts
  useEffect(() => {
    if (!series.length || !alertThreshold) return;
    const last = series[series.length - 1]?.price || 0;
    if (alertDirection === 'above' && last >= alertThreshold) {
      setAlerts((a) => [
        `Price for ${selectedType} reached ₹${last} (≥ ₹${alertThreshold})`,
        ...a,
      ].slice(0, 5));
    } else if (alertDirection === 'below' && last <= alertThreshold) {
      setAlerts((a) => [
        `Price for ${selectedType} fell to ₹${last} (≤ ₹${alertThreshold})`,
        ...a,
      ].slice(0, 5));
    }
  }, [series, alertThreshold, alertDirection, selectedType]);

  function onCsvUpload(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        // CSV format: date,price
        const rows = text.split(/\r?\n/).filter(Boolean);
        const parsed: PricePoint[] = rows.map((r) => {
          const [date, price] = r.split(",");
          return { date: date.trim(), price: Number(price) };
        }).filter(p => p.date && !Number.isNaN(p.price));
        setSeries(parsed);
        localStorage.setItem(`mp_${selectedType}`, JSON.stringify(parsed));
      } catch (e) {
        // ignore parse failure
      }
    };
    reader.readAsText(file);
  }

  const mom = useMemo(() => {
    if (series.length < 2) return 0;
    const a = series[series.length - 2].price;
    const b = series[series.length - 1].price;
    return a ? Math.round(((b - a) / a) * 100) : 0;
  }, [series]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Market Price Tracker</h1>
          <p className="text-muted-foreground">Track price trends per gemstone type. Import CSV, set alerts.</p>
        </div>
        <div className="flex gap-2">
          <input type="file" accept=".csv" id="csv-upload" className="hidden" onChange={(e)=>{
            const file = e.target.files?.[0];
            if (file) onCsvUpload(file);
          }} />
          <label htmlFor="csv-upload" className="btn-modern inline-flex items-center px-4 py-2 cursor-pointer">
            <Upload className="h-4 w-4 mr-2" /> Import CSV
          </label>
        </div>
      </div>

      <Card className="card-shadow-lg">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label>Gemstone Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="input-modern"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Alert Threshold (₹)</Label>
            <Input type="number" value={alertThreshold} onChange={(e)=>setAlertThreshold(Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Direction</Label>
            <Select value={alertDirection} onValueChange={(v)=>setAlertDirection(v as any)}>
              <SelectTrigger className="input-modern"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Above</SelectItem>
                <SelectItem value="below">Below</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={()=> setAlerts([])} className="w-full"><Bell className="h-4 w-4 mr-2"/>Clear Alerts</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2 text-sm">
            {mom >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-600"/> : <TrendingDown className="h-4 w-4 text-red-600"/>}
            <span className={mom >= 0 ? "text-emerald-700" : "text-red-700"}>{mom}% MoM</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#7c3aed" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {!!alerts.length && (
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((a, idx) => (
                  <TableRow key={idx}><TableCell className="text-sm">{a}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
