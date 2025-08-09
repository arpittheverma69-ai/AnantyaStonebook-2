import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIAnalysisProps {
  gemstone: any;
  onClose: () => void;
}

export function AIAnalysis({ gemstone, onClose }: AIAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const analyzeGemstone = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI analysis based on gemstone properties
    const mockAnalysis = generateMockAnalysis(gemstone);
    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
    
    toast({
      title: "AI Analysis Complete",
      description: "Gemstone analysis has been generated successfully",
    });
  };

  const generateMockAnalysis = (gemstone: any) => {
    const { type, grade, carat, origin, pricePerCarat } = gemstone;
    
    // Calculate market value based on properties
    const baseValue = pricePerCarat * carat;
    const gradeMultiplier = grade === 'AAAA' ? 1.5 : grade === 'AAA' ? 1.3 : grade === 'AA' ? 1.1 : 1.0;
    const originMultiplier = origin === 'Sri Lanka' ? 1.2 : origin === 'Myanmar' ? 1.3 : 1.0;
    const marketValue = baseValue * gradeMultiplier * originMultiplier;
    
    // Generate recommendations
    const recommendations = [];
    if (grade === 'A' || grade === 'AA') {
      recommendations.push("Consider certification for premium pricing");
    }
    if (carat > 5) {
      recommendations.push("Large carat weight - premium market opportunity");
    }
    if (origin === 'Sri Lanka' || origin === 'Myanmar') {
      recommendations.push("Premium origin - excellent for high-end market");
    }
    
    // Market trends
    const marketTrend = pricePerCarat > 20000 ? 'High-end' : pricePerCarat > 10000 ? 'Mid-range' : 'Entry-level';
    
    return {
      marketValue: Math.round(marketValue),
      recommendations,
      marketTrend,
      riskLevel: grade === 'A' ? 'Medium' : 'Low',
      profitPotential: marketValue > baseValue * 1.5 ? 'High' : marketValue > baseValue * 1.2 ? 'Medium' : 'Low',
      certificationValue: grade === 'AAAA' || grade === 'AAA' ? 'High' : 'Medium',
      marketDemand: type === 'Ruby' || type === 'Blue Sapphire' ? 'High' : 'Medium',
      analysisDate: new Date().toISOString(),
      confidence: 85 + Math.floor(Math.random() * 15)
    };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'High-end': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'Mid-range': return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      default: return <TrendingUp className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getBadgeVariant = (level: string) => {
    switch (level) {
      case 'High': return 'default';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={!!gemstone} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Gemstone Analysis
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Gemstone Info */}
          <Card className="card-shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Gemstone Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold">{gemstone?.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grade</p>
                  <Badge variant="outline">{gemstone?.grade}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Carat</p>
                  <p className="font-semibold">{gemstone?.carat} ct</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Origin</p>
                  <p className="font-semibold">{gemstone?.origin}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Controls */}
          <Card className="card-shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">AI Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Get market insights and recommendations
                  </p>
                </div>
                <Button 
                  onClick={analyzeGemstone} 
                  disabled={isAnalyzing}
                  className="btn-modern bg-gradient-to-r from-primary to-purple-600"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isAnalyzing ? "Analyzing..." : "Analyze Gemstone"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-4">
              {/* Market Value */}
              <Card className="card-shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Market Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-[var(--radius)]">
                      <p className="text-sm text-muted-foreground">Estimated Market Value</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{analysis.marketValue.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Confidence: {analysis.confidence}%
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-[var(--radius)]">
                      <p className="text-sm text-muted-foreground">Market Trend</p>
                      <div className="flex items-center justify-center gap-2">
                        {getTrendIcon(analysis.marketTrend)}
                        <p className="text-lg font-semibold">{analysis.marketTrend}</p>
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-[var(--radius)]">
                      <p className="text-sm text-muted-foreground">Risk Level</p>
                      <div className="flex items-center justify-center gap-2">
                        {getRiskIcon(analysis.riskLevel)}
                        <p className="text-lg font-semibold">{analysis.riskLevel}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="card-shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-[var(--radius)]">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Market Metrics */}
              <Card className="card-shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Market Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Profit Potential</p>
                      <Badge variant={getBadgeVariant(analysis.profitPotential)}>
                        {analysis.profitPotential}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Certification Value</p>
                      <Badge variant={getBadgeVariant(analysis.certificationValue)}>
                        {analysis.certificationValue}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Market Demand</p>
                      <Badge variant={getBadgeVariant(analysis.marketDemand)}>
                        {analysis.marketDemand}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Analysis Date</p>
                      <p className="text-xs font-mono">
                        {new Date(analysis.analysisDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <Card className="card-shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <div>
                    <p className="font-semibold">Analyzing Gemstone...</p>
                    <p className="text-sm text-muted-foreground">
                      AI is analyzing market trends, pricing, and recommendations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 