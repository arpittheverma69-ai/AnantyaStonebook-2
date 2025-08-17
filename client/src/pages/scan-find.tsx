import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inventoryService } from "@/lib/database";
import { BrowserMultiFormatReader } from "@zxing/browser";
// @ts-ignore
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { QrCode, Printer } from "lucide-react";

export default function ScanFind() {
  const [items, setItems] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    (async () => {
      const data = await inventoryService.getAll();
      setItems(data as any);
    })();
  }, []);

  // Scanner
  useEffect(() => {
    let reader: BrowserMultiFormatReader | null = null;
    let controls: any | null = null;
    reader = new BrowserMultiFormatReader();
    const video = videoRef.current;
    if (video) {
      reader.decodeFromVideoDevice(undefined, video, (result, err, ctl) => {
        if (ctl) controls = ctl;
        if (result) {
          const text = result.getText();
          setQuery(text);
        }
      });
    }
    return () => {
      try { controls?.stop(); } catch {}
    };
  }, []);

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((it: any) => (
      (it.gem_id || it.gemId || '').toLowerCase().includes(q) ||
      (it.type || '').toLowerCase().includes(q) ||
      (it.origin || '').toLowerCase().includes(q)
    ));
  }, [items, query]);

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function printSelectedLabels() {
    const sel = filtered.filter((it: any) => selected[it.id]);
    if (sel.length === 0) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write('<html><head><title>Labels</title><style>body{font-family:system-ui} .card{display:inline-block;margin:8px;padding:8px;border:1px solid #ddd;border-radius:8px;text-align:center;width:200px}</style></head><body>');
    sel.forEach((item: any, idx: number) => {
      const qrId = `qr_${idx}`;
      const bcId = `bc_${idx}`;
      w.document.write(`<div class="card"><div style="font-weight:600">${item.type} • ${item.grade}</div><div style="font-size:12px;color:#666">${item.gemId || item.gem_id}</div><canvas id="${qrId}" style="width:160px;height:160px"></canvas><svg id="${bcId}" style="width:180px;height:40px"></svg></div>`);
    });
    w.document.write('</body></html>');
    w.document.close();
    w.onload = () => {
      sel.forEach((item: any, idx: number) => {
        const qr = w.document.getElementById(`qr_${idx}`) as HTMLCanvasElement | null;
        const bc = w.document.getElementById(`bc_${idx}`) as SVGSVGElement | null;
        if (qr) QRCode.toCanvas(qr, item.gemId || item.gem_id || item.id || '', { width: 160 });
        if (bc) {
          // @ts-ignore
          JsBarcode(bc, item.gemId || item.gem_id || item.id || '', { format: 'code128', height: 40, displayValue: false, margin: 0 });
        }
      });
      w.focus();
      w.print();
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Scan & Find</h1>
          <p className="text-muted-foreground">Search by scanning; select stones to batch print labels.</p>
        </div>
        <Button onClick={printSelectedLabels}>
          <Printer className="h-4 w-4 mr-2" /> Print Selected Labels
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scanner</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <video ref={videoRef} className="w-full rounded bg-black" />
          </div>
          <div className="space-y-2">
            <Label>Search</Label>
            <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Type or scan a Gem ID" className="input-modern" />
            <div className="text-xs text-muted-foreground">Scanning fills the search box automatically</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Gem ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Carat</TableHead>
                  <TableHead>Origin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((it:any)=> (
                  <TableRow key={it.id}>
                    <TableCell>
                      <input type="checkbox" checked={!!selected[it.id]} onChange={()=>toggle(it.id)} />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{it.gemId || it.gem_id}</TableCell>
                    <TableCell>{it.type}</TableCell>
                    <TableCell>{it.grade}</TableCell>
                    <TableCell>{it.carat} ct</TableCell>
                    <TableCell>{it.origin}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

