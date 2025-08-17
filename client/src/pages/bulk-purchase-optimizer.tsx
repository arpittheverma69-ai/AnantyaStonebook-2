import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Factory, DollarSign, CalendarDays } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const STONE_TYPES = ['Ruby', 'Sapphire', 'Emerald', 'Diamond', 'Yellow Sapphire', 'Blue Sapphire'];

type PricePoint = { month: string; price: number };

const mockPriceData: Record<string, PricePoint[]> = {
  Ruby: [
    { month: 'Jan', price: 14500 },
    { month: 'Feb', price: 15200 },
    { month: 'Mar', price: 14900 },
    { month: 'Apr', price: 14100 },
    { month: 'May', price: 13800 },
    { month: 'Jun', price: 14350 },
    { month: 'Jul', price: 14000 },
    { month: 'Aug', price: 13750 },
    { month: 'Sep', price: 13900 },
    { month: 'Oct', price: 14200 },
    { month: 'Nov', price: 14600 },
    { month: 'Dec', price: 15000 },
  ],
  Sapphire: [
    { month: 'Jan', price: 9000 },
    { month: 'Feb', price: 8700 },
    { month: 'Mar', price: 9100 },
    { month: 'Apr', price: 8800 },
    { month: 'May', price: 8600 },
    { month: 'Jun', price: 8450 },
    { month: 'Jul', price: 8300 },
    { month: 'Aug', price: 8250 },
    { month: 'Sep', price: 8400 },
    { month: 'Oct', price: 8550 },
    { month: 'Nov', price: 8800 },
    { month: 'Dec', price: 8950 },
  ],
  Emerald: [
    { month: 'Jan', price: 12000 },
    { month: 'Feb', price: 11800 },
    { month: 'Mar', price: 11950 },
    { month: 'Apr', price: 11600 },
    { month: 'May', price: 11400 },
    { month: 'Jun', price: 11300 },
    { month: 'Jul', price: 11250 },
    { month: 'Aug', price: 11100 },
    { month: 'Sep', price: 11200 },
    { month: 'Oct', price: 11350 },
    { month: 'Nov', price: 11500 },
    { month: 'Dec', price: 11700 },
  ],
  Diamond: [
    { month: 'Jan', price: 30000 },
    { month: 'Feb', price: 30500 },
    { month: 'Mar', price: 29800 },
    { month: 'Apr', price: 29000 },
    { month: 'May', price: 28800 },
    { month: 'Jun', price: 29200 },
    { month: 'Jul', price: 29500 },
    { month: 'Aug', price: 29700 },
    { month: 'Sep', price: 30100 },
    { month: 'Oct', price: 30600 },
    { month: 'Nov', price: 30900 },
    { month: 'Dec', price: 31200 },
  ],
  'Yellow Sapphire': [
    { month: 'Jan', price: 4500 },
    { month: 'Feb', price: 4700 },
    { month: 'Mar', price: 4600 },
    { month: 'Apr', price: 4400 },
    { month: 'May', price: 4300 },
    { month: 'Jun', price: 4200 },
    { month: 'Jul', price: 4150 },
    { month: 'Aug', price: 4250 },
    { month: 'Sep', price: 4350 },
    { month: 'Oct', price: 4450 },
    { month: 'Nov', price: 4550 },
    { month: 'Dec', price: 4650 },
  ],
  'Blue Sapphire': [
    { month: 'Jan', price: 10000 },
    { month: 'Feb', price: 9800 },
    { month: 'Mar', price: 9700 },
    { month: 'Apr', price: 9500 },
    { month: 'May', price: 9300 },
    { month: 'Jun', price: 9250 },
    { month: 'Jul', price: 9100 },
    { month: 'Aug', price: 9050 },
    { month: 'Sep', price: 9150 },
    { month: 'Oct', price: 9300 },
    { month: 'Nov', price: 9450 },
    { month: 'Dec', price: 9600 },
  ],
};

const suppliers = [
  { id: 'S-901', name: 'Shree Gems Traders', rating: 4.7, deliveryDays: 5, discountTiers: [{ min: 5, pct: 3 }, { min: 10, pct: 7 }, { min: 20, pct: 12 }] },
  { id: 'S-783', name: 'Mogok Exports', rating: 4.5, deliveryDays: 9, discountTiers: [{ min: 5, pct: 4 }, { min: 12, pct: 8 }, { min: 25, pct: 14 }] },
  { id: 'S-644', name: 'Ratnapura Sapphires', rating: 4.6, deliveryDays: 7, discountTiers: [{ min: 4, pct: 2 }, { min: 10, pct: 6 }, { min: 20, pct: 10 }] },
];

export default function BulkPurchaseOptimizer() {
  const [stone, setStone] = useState<string>('Ruby');
  const [horizon, setHorizon] = useState<string>('12');
  const [budget, setBudget] = useState<number>(500000);
  const [targetCarat, setTargetCarat] = useState<number>(50);

  const data = useMemo(() => mockPriceData[stone].slice(0, parseInt(horizon, 10)), [stone, horizon]);
  const minPoint = useMemo(() => data.reduce((min, p) => (p.price < min.price ? p : min), data[0]), [data]);
  const avgPrice = useMemo(() => Math.round(data.reduce((s, p) => s + p.price, 0) / data.length), [data]);

  const bestSupplier = useMemo(() => {
    // Simple score: rating - deliveryDays/10 + top discount tier/10
    const scored = suppliers.map(sup => {
      const maxTier = sup.discountTiers.reduce((m, t) => (t.pct > m ? t.pct : m), 0);
      return { ...sup, score: sup.rating - sup.deliveryDays / 10 + maxTier / 10 };
    });
    return scored.sort((a, b) => b.score - a.score)[0];
  }, []);

  const batchSuggestion = useMemo(() => {
    // Pick best discount tier within budget
    const base = avgPrice; // price per carat
    const candidateTiers = bestSupplier.discountTiers
      .map(t => {
        const carats = Math.max(targetCarat, t.min);
        const gross = base * carats;
        const discount = (gross * t.pct) / 100;
        const net = gross - discount;
        return { tier: t, carats, gross, discount, net };
      })
      .filter(x => x.net <= budget)
      .sort((a, b) => b.discount - a.discount);
    return candidateTiers[0] || null;
  }, [avgPrice, bestSupplier.discountTiers, budget, targetCarat]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <TrendingUp className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Bulk Purchase Optimizer</h1>
          <p className="text-gray-600">Identify the best time and quantity to buy for maximum savings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
          <CardDescription>Tune your optimization inputs</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Stone</Label>
            <Select value={stone} onValueChange={setStone}>
              <SelectTrigger><SelectValue placeholder="Select stone" /></SelectTrigger>
              <SelectContent>
                {STONE_TYPES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Horizon (months)</Label>
            <Select value={horizon} onValueChange={setHorizon}>
              <SelectTrigger><SelectValue placeholder="Months" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="12">12</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Budget (Rs.)</Label>
            <Input type="number" value={budget} onChange={e => setBudget(parseInt(e.target.value || '0', 10))} />
          </div>
          <div>
            <Label>Target Total Carat</Label>
            <Input type="number" step="0.1" value={targetCarat} onChange={e => setTargetCarat(parseFloat(e.target.value || '0'))} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Market Price Trend</CardTitle>
            <CardDescription>Historical prices and seasonal dips</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="price" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Buy window and supplier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Best Month to Buy</div>
              <Badge variant="secondary" className="text-sm flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {minPoint.month}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Expected Unit Price</div>
              <div className="font-semibold">Rs. {minPoint.price.toLocaleString()}</div>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Factory className="w-4 h-4 text-gray-500" />
              <div className="text-sm">Suggested Supplier</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="font-medium">{bestSupplier.name}</div>
              <div className="text-xs text-gray-500">Rating {bestSupplier.rating} • {bestSupplier.deliveryDays} days</div>
              <div className="mt-2 text-xs text-gray-600">Discount tiers: {bestSupplier.discountTiers.map(t => `${t.min}+ ct: ${t.pct}%`).join(' | ')}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batch Size Optimizer</CardTitle>
          <CardDescription>Volume discounts vs budget</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Label>Desired Carats</Label>
            <Input type="number" step="0.1" value={targetCarat} onChange={e => setTargetCarat(parseFloat(e.target.value || '0'))} />
          </div>
          <div>
            <Label>Avg Market Price (Rs./ct)</Label>
            <Input type="number" value={avgPrice} readOnly />
          </div>
          <div>
            <Label>Budget (Rs.)</Label>
            <Input type="number" value={budget} onChange={e => setBudget(parseInt(e.target.value || '0', 10))} />
          </div>

          <div className="md:col-span-3 mt-2">
            {batchSuggestion ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                <div className="p-3 rounded-lg border bg-muted/30">
                  <div className="text-gray-600">Carats</div>
                  <div className="font-semibold">{batchSuggestion.carats} ct</div>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <div className="text-gray-600">Gross Value</div>
                  <div className="font-semibold">Rs. {batchSuggestion.gross.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <div className="text-gray-600">Discount</div>
                  <div className="font-semibold text-green-600">Rs. {Math.round(batchSuggestion.discount).toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <div className="text-gray-600">Net Payable</div>
                  <div className="font-semibold">Rs. {Math.round(batchSuggestion.net).toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <div className="text-gray-600">Tier</div>
                  <div className="font-semibold">{batchSuggestion.tier.min}+ ct @ {batchSuggestion.tier.pct}%</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">No discount tier fits your budget. Consider increasing budget or reducing target carats.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => window.alert('Optimization saved (mock).')}>Save Recommendation</Button>
      </div>
    </div>
  );
}
