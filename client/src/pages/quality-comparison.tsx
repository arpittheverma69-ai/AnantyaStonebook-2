import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { inventoryService } from "@/lib/database";
import { Sparkles, Scale, ArrowLeftRight } from "lucide-react";

interface GemItem {
  id: string;
  gem_id?: string;
  gemId?: string;
  type: string;
  grade: string;
  carat: number;
  origin: string;
  price_per_carat?: number;
  pricePerCarat?: number;
  total_price?: number;
  totalPrice?: number;
  image_url?: string;
  imageUrl?: string;
}

function getGemId(it: any) { return it.gemId || it.gem_id; }
function getPricePerCarat(it: any) { return it.pricePerCarat ?? it.price_per_carat ?? 0; }
function getTotalPrice(it: any) { return it.totalPrice ?? it.total_price ?? 0; }
function getImageUrl(it: any) { return it.imageUrl ?? it.image_url ?? ""; }

const DEFAULT_WEIGHTS = {
  grade: 0.4,
  carat: 0.3,
  origin: 0.2,
  certification: 0.1,
};

function gradeScore(grade: string) {
  const map: Record<string, number> = { A: 1, AA: 2, AAA: 3, AAAA: 4 };
  return map[grade] || 1;
}

function originScore(origin: string) {
  const premium = ["Sri Lanka", "Myanmar", "Colombia", "Kashmir"];
  return premium.includes(origin) ? 1 : 0.7;
}

export default function QualityComparison() {
  const [items, setItems] = useState<GemItem[]>([]);
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);

  useEffect(() => {
    (async () => {
      const data = await inventoryService.getAll();
      setItems(data as any);
      if (data?.length >= 2) {
        setLeftId(data[0].id);
        setRightId(data[1].id);
      }
    })();
  }, []);

  const left = useMemo(() => items.find(i => i.id === leftId), [items, leftId]);
  const right = useMemo(() => items.find(i => i.id === rightId), [items, rightId]);

  function score(it?: any) {
    if (!it) return 0;
    const s = gradeScore(it.grade) * weights.grade
      + (Number(it.carat) || 0) * weights.carat
      + originScore(it.origin) * weights.origin
      + (it.certified ? 1 : 0) * weights.certification;
    return Math.round(s * 100) / 100;
  }

  const leftScore = score(left);
  const rightScore = score(right);
  const deltaPrice = (getTotalPrice(right || {}) - getTotalPrice(left || {})) || 0;
  const better = leftScore === rightScore ? "Equal" : (leftScore > rightScore ? "Left" : "Right");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Quality Comparison</h1>
          <p className="text-muted-foreground">Compare two stones side-by-side with weighted scoring and price delta.</p>
        </div>
        <Button variant="outline" onClick={() => setWeights(DEFAULT_WEIGHTS)}>
          <ArrowLeftRight className="h-4 w-4 mr-2" /> Reset Weights
        </Button>
      </div>

      <Card className="card-shadow-lg">
        <CardHeader>
          <CardTitle>Select Stones</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label>Left Stone</Label>
            <Select value={leftId} onValueChange={setLeftId}>
              <SelectTrigger className="input-modern"><SelectValue placeholder="Choose stone" /></SelectTrigger>
              <SelectContent>
                {items.map((it) => (
                  <SelectItem key={it.id} value={it.id}>{it.type} • {getGemId(it)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label>Right Stone</Label>
            <Select value={rightId} onValueChange={setRightId}>
              <SelectTrigger className="input-modern"><SelectValue placeholder="Choose stone" /></SelectTrigger>
              <SelectContent>
                {items.map((it) => (
                  <SelectItem key={it.id} value={it.id}>{it.type} • {getGemId(it)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Side-by-side</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Left</TableHead>
                  <TableHead>Right</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Gem ID</TableCell>
                  <TableCell className="font-mono text-sm">{getGemId(left || {})}</TableCell>
                  <TableCell className="font-mono text-sm">{getGemId(right || {})}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>{left?.type}</TableCell>
                  <TableCell>{right?.type}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Grade</TableCell>
                  <TableCell><Badge variant="outline">{left?.grade}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{right?.grade}</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Carat</TableCell>
                  <TableCell>{left?.carat} ct</TableCell>
                  <TableCell>{right?.carat} ct</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Origin</TableCell>
                  <TableCell>{left?.origin}</TableCell>
                  <TableCell>{right?.origin}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Price/ct</TableCell>
                  <TableCell>₹{getPricePerCarat(left || 0)}</TableCell>
                  <TableCell>₹{getPricePerCarat(right || 0)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Price</TableCell>
                  <TableCell>₹{getTotalPrice(left || 0)}</TableCell>
                  <TableCell>₹{getTotalPrice(right || 0)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weighted Scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Grade Weight</Label>
                <Input type="number" step="0.1" value={weights.grade}
                  onChange={(e)=>setWeights({...weights, grade: Number(e.target.value) || 0})} />
              </div>
              <div>
                <Label>Carat Weight</Label>
                <Input type="number" step="0.1" value={weights.carat}
                  onChange={(e)=>setWeights({...weights, carat: Number(e.target.value) || 0})} />
              </div>
              <div>
                <Label>Origin Weight</Label>
                <Input type="number" step="0.1" value={weights.origin}
                  onChange={(e)=>setWeights({...weights, origin: Number(e.target.value) || 0})} />
              </div>
              <div>
                <Label>Cert Weight</Label>
                <Input type="number" step="0.1" value={weights.certification}
                  onChange={(e)=>setWeights({...weights, certification: Number(e.target.value) || 0})} />
              </div>
            </div>
            <div className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Left Score</div>
                  <div className="text-xl font-semibold">{leftScore}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Right Score</div>
                  <div className="text-xl font-semibold">{rightScore}</div>
                </div>
              </div>
              <div className="mt-2 text-sm"><span className="text-muted-foreground">Better:</span> {better}</div>
              <div className="text-sm"><span className="text-muted-foreground">Δ Price:</span> ₹{deltaPrice}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
