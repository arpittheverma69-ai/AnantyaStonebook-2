import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Gem, TrendingUp, DollarSign, Award, MapPin, Eye, Scissors } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ValuationResult {
  estimatedValue: number;
  priceRange: { min: number; max: number };
  confidenceScore: number;
  factors: { name: string; impact: string; multiplier: number }[];
}

const gemstoneTypes = [
  'Ruby', 'Sapphire', 'Emerald', 'Diamond', 'Pearl', 'Opal', 'Alexandrite',
  'Tanzanite', 'Spinel', 'Garnet', 'Topaz', 'Aquamarine', 'Peridot', 'Tourmaline'
];

const grades = ['AAA', 'AA', 'A', 'B', 'C'];
const origins = ['Burma', 'Sri Lanka', 'Thailand', 'Madagascar', 'Tanzania', 'Brazil', 'Colombia', 'Zambia'];
const clarities = ['VVS', 'VS', 'SI', 'I'];
const colors = ['Exceptional', 'Excellent', 'Very Good', 'Good', 'Fair'];
const cuts = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

const marketTrends = [
  { month: 'Jan', Ruby: 14500, Sapphire: 30000, Emerald: 25000, Diamond: 120000 },
  { month: 'Feb', Ruby: 14800, Sapphire: 30500, Emerald: 25200, Diamond: 122000 },
  { month: 'Mar', Ruby: 15200, Sapphire: 31000, Emerald: 25500, Diamond: 124000 },
  { month: 'Apr', Ruby: 15500, Sapphire: 31500, Emerald: 25800, Diamond: 126000 },
  { month: 'May', Ruby: 15800, Sapphire: 32000, Emerald: 26000, Diamond: 128000 },
  { month: 'Jun', Ruby: 16200, Sapphire: 32500, Emerald: 26200, Diamond: 130000 },
];

export default function ValuationCalculator() {
  const [formData, setFormData] = useState({
    gemstoneType: '',
    carat: '',
    grade: '',
    origin: '',
    clarity: '',
    color: '',
    cut: '',
    certification: false
  });

  const [result, setResult] = useState<ValuationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateValuation = () => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    setTimeout(() => {
      const basePrice = getBasePrice(formData.gemstoneType);
      const carat = parseFloat(formData.carat) || 0;
      
      let multiplier = 1;
      const factors: { name: string; impact: string; multiplier: number }[] = [];

      // Grade multiplier
      const gradeMultiplier = { 'AAA': 2.5, 'AA': 2.0, 'A': 1.5, 'B': 1.0, 'C': 0.7 };
      if (formData.grade) {
        multiplier *= gradeMultiplier[formData.grade as keyof typeof gradeMultiplier];
        factors.push({ name: 'Grade', impact: formData.grade, multiplier: gradeMultiplier[formData.grade as keyof typeof gradeMultiplier] });
      }

      // Origin multiplier
      const originMultiplier = { 'Burma': 1.8, 'Sri Lanka': 1.6, 'Thailand': 1.4, 'Madagascar': 1.3, 'Tanzania': 1.2, 'Brazil': 1.1, 'Colombia': 1.1, 'Zambia': 1.0 };
      if (formData.origin) {
        multiplier *= originMultiplier[formData.origin as keyof typeof originMultiplier];
        factors.push({ name: 'Origin', impact: formData.origin, multiplier: originMultiplier[formData.origin as keyof typeof originMultiplier] });
      }

      // Clarity multiplier
      const clarityMultiplier = { 'VVS': 1.6, 'VS': 1.4, 'SI': 1.2, 'I': 1.0 };
      if (formData.clarity) {
        multiplier *= clarityMultiplier[formData.clarity as keyof typeof clarityMultiplier];
        factors.push({ name: 'Clarity', impact: formData.clarity, multiplier: clarityMultiplier[formData.clarity as keyof typeof clarityMultiplier] });
      }

      // Color multiplier
      const colorMultiplier = { 'Exceptional': 1.8, 'Excellent': 1.6, 'Very Good': 1.4, 'Good': 1.2, 'Fair': 1.0 };
      if (formData.color) {
        multiplier *= colorMultiplier[formData.color as keyof typeof colorMultiplier];
        factors.push({ name: 'Color', impact: formData.color, multiplier: colorMultiplier[formData.color as keyof typeof colorMultiplier] });
      }

      // Cut multiplier
      const cutMultiplier = { 'Excellent': 1.5, 'Very Good': 1.3, 'Good': 1.1, 'Fair': 1.0, 'Poor': 0.8 };
      if (formData.cut) {
        multiplier *= cutMultiplier[formData.cut as keyof typeof cutMultiplier];
        factors.push({ name: 'Cut', impact: formData.cut, multiplier: cutMultiplier[formData.cut as keyof typeof cutMultiplier] });
      }

      // Certification bonus
      if (formData.certification) {
        multiplier *= 1.15;
        factors.push({ name: 'Certification', impact: 'Certified', multiplier: 1.15 });
      }

      const estimatedValue = basePrice * carat * multiplier;
      const confidenceScore = Math.min(95, 70 + (factors.length * 5));

      setResult({
        estimatedValue,
        priceRange: {
          min: estimatedValue * 0.85,
          max: estimatedValue * 1.15
        },
        confidenceScore,
        factors
      });

      setIsCalculating(false);
    }, 1500);
  };

  const getBasePrice = (type: string): number => {
    const prices: { [key: string]: number } = {
      'Ruby': 14500,
      'Sapphire': 30000,
      'Emerald': 25000,
      'Diamond': 120000,
      'Pearl': 8000,
      'Opal': 12000,
      'Alexandrite': 45000,
      'Tanzanite': 18000,
      'Spinel': 15000,
      'Garnet': 6000,
      'Topaz': 5000,
      'Aquamarine': 8000,
      'Peridot': 4000,
      'Tourmaline': 10000
    };
    return prices[type] || 10000;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Calculator className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gemstone Valuation Calculator</h1>
          <p className="text-gray-600">Calculate estimated market value based on stone characteristics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gem className="h-5 w-5" />
              <span>Stone Details</span>
            </CardTitle>
            <CardDescription>Enter the gemstone specifications for accurate valuation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gemstoneType">Gemstone Type</Label>
                <Select value={formData.gemstoneType} onValueChange={(value) => handleInputChange('gemstoneType', value)}>
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
                <Label htmlFor="carat">Carat Weight</Label>
                <Input
                  id="carat"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 5.20"
                  value={formData.carat}
                  onChange={(e) => handleInputChange('carat', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Select value={formData.origin} onValueChange={(value) => handleInputChange('origin', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {origins.map(origin => (
                      <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clarity">Clarity</Label>
                <Select value={formData.clarity} onValueChange={(value) => handleInputChange('clarity', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select clarity" />
                  </SelectTrigger>
                  <SelectContent>
                    {clarities.map(clarity => (
                      <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select value={formData.color} onValueChange={(value) => handleInputChange('color', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map(color => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cut">Cut Quality</Label>
                <Select value={formData.cut} onValueChange={(value) => handleInputChange('cut', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cut" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuts.map(cut => (
                      <SelectItem key={cut} value={cut}>{cut}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.certification}
                    onChange={(e) => handleInputChange('certification', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>Certified Stone</span>
                </Label>
              </div>
            </div>

            <Button 
              onClick={calculateValuation} 
              disabled={isCalculating || !formData.gemstoneType || !formData.carat}
              className="w-full"
            >
              {isCalculating ? 'Calculating...' : 'Calculate Value'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span>Estimated Value</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-green-600">
                      {formatCurrency(result.estimatedValue)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Price Range: {formatCurrency(result.priceRange.min)} - {formatCurrency(result.priceRange.max)}
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <Badge variant={result.confidenceScore > 80 ? 'default' : result.confidenceScore > 60 ? 'secondary' : 'destructive'}>
                        {result.confidenceScore}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span>Valuation Factors</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.factors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{factor.name}:</span>
                          <span className="text-gray-600">{factor.impact}</span>
                        </div>
                        <Badge variant="outline">×{factor.multiplier.toFixed(2)}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Market Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span>Market Trends</span>
              </CardTitle>
              <CardDescription>Price trends for popular gemstones (per carat)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={marketTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Line type="monotone" dataKey="Ruby" stroke="#dc2626" strokeWidth={2} />
                  <Line type="monotone" dataKey="Sapphire" stroke="#2563eb" strokeWidth={2} />
                  <Line type="monotone" dataKey="Emerald" stroke="#059669" strokeWidth={2} />
                  <Line type="monotone" dataKey="Diamond" stroke="#7c3aed" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
