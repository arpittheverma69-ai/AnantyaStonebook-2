import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  TrendingUp, 
  Star, 
  MapPin, 
  DollarSign,
  Info,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ValuationResult {
  basePrice: number;
  qualityMultiplier: number;
  originMultiplier: number;
  marketTrendMultiplier: number;
  finalPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  confidence: number;
}

interface MarketTrend {
  trend: "rising" | "falling" | "stable";
  percentage: number;
  confidence: number;
}

export default function ValuationCalculator() {
  const { toast } = useToast();
  const [gemstoneType, setGemstoneType] = useState("");
  const [carat, setCarat] = useState(1);
  const [grade, setGrade] = useState("A");
  const [origin, setOrigin] = useState("");
  const [clarity, setClarity] = useState(7);
  const [color, setColor] = useState(7);
  const [cut, setCut] = useState(7);
  const [certified, setCertified] = useState(false);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [marketTrend, setMarketTrend] = useState<MarketTrend | null>(null);

  const gemstoneTypes = [
    "Ruby", "Blue Sapphire", "Yellow Sapphire", "Emerald", "Diamond",
    "Pearl", "Coral", "Hessonite", "Cat's Eye", "Opal", "Topaz", "Garnet"
  ];

  const origins = [
    "Sri Lanka", "Myanmar", "Thailand", "Madagascar", "Tanzania",
    "Brazil", "Colombia", "India", "Australia", "USA", "Russia"
  ];

  const grades = ["A", "AA", "AAA", "AAAA"];

  // Market trends data (simulated - in real app, this would come from API)
  const marketTrends = {
    "Ruby": { trend: "rising" as const, percentage: 15, confidence: 85 },
    "Blue Sapphire": { trend: "stable" as const, percentage: 2, confidence: 90 },
    "Yellow Sapphire": { trend: "rising" as const, percentage: 8, confidence: 75 },
    "Emerald": { trend: "falling" as const, percentage: -5, confidence: 80 },
    "Diamond": { trend: "rising" as const, percentage: 12, confidence: 88 }
  };

  useEffect(() => {
    if (gemstoneType && marketTrends[gemstoneType as keyof typeof marketTrends]) {
      setMarketTrend(marketTrends[gemstoneType as keyof typeof marketTrends]);
    }
  }, [gemstoneType]);

  const calculateValuation = () => {
    if (!gemstoneType || !origin) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Base price per carat (simulated market prices)
    const basePrices: Record<string, number> = {
      "Ruby": 25000,
      "Blue Sapphire": 35000,
      "Yellow Sapphire": 12000,
      "Emerald": 18000,
      "Diamond": 50000,
      "Pearl": 8000,
      "Coral": 5000,
      "Hessonite": 15000,
      "Cat's Eye": 20000,
      "Opal": 10000,
      "Topaz": 6000,
      "Garnet": 4000
    };

    const basePrice = basePrices[gemstoneType] || 15000;

    // Quality multipliers
    const gradeMultipliers = { "A": 1, "AA": 1.5, "AAA": 2.5, "AAAA": 4 };
    const qualityMultiplier = gradeMultipliers[grade as keyof typeof gradeMultipliers] || 1;

    // Origin multipliers (premium origins get higher values)
    const originMultipliers: Record<string, number> = {
      "Sri Lanka": 1.3, "Myanmar": 1.4, "Thailand": 1.2,
      "Madagascar": 1.1, "Tanzania": 1.2, "Brazil": 1.0,
      "Colombia": 1.1, "India": 1.0, "Australia": 0.9,
      "USA": 1.1, "Russia": 1.0
    };
    const originMultiplier = originMultipliers[origin] || 1.0;

    // Market trend multiplier
    const marketTrendMultiplier = marketTrend ? (1 + marketTrend.percentage / 100) : 1;

    // Clarity, color, cut multipliers (1-10 scale)
    const clarityMultiplier = 0.5 + (clarity / 10) * 0.5;
    const colorMultiplier = 0.5 + (color / 10) * 0.5;
    const cutMultiplier = 0.5 + (cut / 10) * 0.5;

    // Certification bonus
    const certificationMultiplier = certified ? 1.15 : 1;

    // Calculate final price
    const finalPrice = basePrice * carat * qualityMultiplier * originMultiplier * 
                      marketTrendMultiplier * clarityMultiplier * colorMultiplier * 
                      cutMultiplier * certificationMultiplier;

    // Price range (±15%)
    const priceRange = {
      min: finalPrice * 0.85,
      max: finalPrice * 1.15
    };

    // Confidence score
    const confidence = Math.min(95, 
      (marketTrend?.confidence || 70) + 
      (certified ? 10 : 0) + 
      (originMultiplier > 1.2 ? 5 : 0)
    );

    setResult({
      basePrice,
      qualityMultiplier,
      originMultiplier,
      marketTrendMultiplier,
      finalPrice,
      priceRange,
      confidence
    });

    toast({
      title: "Valuation Complete",
      description: `Estimated value: ₹${finalPrice.toLocaleString()}`,
    });
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "rising": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "falling": return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <TrendingUp className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "rising": return "text-green-600";
      case "falling": return "text-red-600";
      default: return "text-blue-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Gemstone Valuation Calculator
        </h2>
        <p className="text-muted-foreground">
          Get accurate market valuations with AI-powered analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Stone Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gemstoneType">Gemstone Type *</Label>
                <Select value={gemstoneType} onValueChange={setGemstoneType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {gemstoneTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carat">Carat Weight *</Label>
                <Input
                  id="carat"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={carat}
                  onChange={(e) => setCarat(parseFloat(e.target.value) || 0)}
                  placeholder="1.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">Origin *</Label>
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {origins.map(o => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Clarity (1-10)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Poor</span>
                  <Slider
                    value={[clarity]}
                    onValueChange={([value]) => setClarity(value)}
                    max={10}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">Excellent</span>
                </div>
                <div className="text-center text-sm font-medium">{clarity}/10</div>
              </div>

              <div className="space-y-2">
                <Label>Color (1-10)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Poor</span>
                  <Slider
                    value={[color]}
                    onValueChange={([value]) => setColor(value)}
                    max={10}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">Excellent</span>
                </div>
                <div className="text-center text-sm font-medium">{color}/10</div>
              </div>

              <div className="space-y-2">
                <Label>Cut (1-10)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Poor</span>
                  <Slider
                    value={[cut]}
                    onValueChange={([value]) => setCut(value)}
                    max={10}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">Excellent</span>
                </div>
                <div className="text-center text-sm font-medium">{cut}/10</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="certified"
                checked={certified}
                onChange={(e) => setCertified(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="certified">Certified by Lab (IGI, IIGJ, etc.)</Label>
            </div>

            <Button onClick={calculateValuation} className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Calculate Valuation
            </Button>
          </CardContent>
        </Card>

        {/* Results & Market Info */}
        <div className="space-y-6">
          {/* Market Trends */}
          {marketTrend && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Market Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(marketTrend.trend)}
                    <span className="font-medium">{gemstoneType}</span>
                  </div>
                  <Badge variant={marketTrend.trend === "rising" ? "default" : "secondary"}>
                    {marketTrend.trend === "rising" ? "+" : ""}{marketTrend.percentage}%
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Confidence: {marketTrend.confidence}%
                </div>
              </CardContent>
            </Card>
          )}

          {/* Valuation Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Valuation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(result.finalPrice)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Price Range: {formatPrice(result.priceRange.min)} - {formatPrice(result.priceRange.max)}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Base Price:</span>
                    <span className="font-medium">{formatPrice(result.basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quality Multiplier:</span>
                    <span className="font-medium">×{result.qualityMultiplier.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Origin Multiplier:</span>
                    <span className="font-medium">×{result.originMultiplier.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Market Trend:</span>
                    <span className="font-medium">×{result.marketTrendMultiplier.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Confidence Score:</span>
                  <Badge variant="outline" className="text-sm">
                    {result.confidence}%
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  * This is an estimated valuation based on current market data. 
                  Actual prices may vary based on specific stone characteristics and market conditions.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Valuation Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-start gap-2">
                <Star className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                <span>Higher grades (AAA, AAAA) significantly increase value</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                <span>Origin affects price - Sri Lanka and Myanmar command premiums</span>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                <span>Market trends can impact prices by 10-20%</span>
              </div>
              <div className="flex items-start gap-2">
                <Info className="h-3 w-3 text-purple-500 mt-1 flex-shrink-0" />
                <span>Certification adds 10-15% to stone value</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
