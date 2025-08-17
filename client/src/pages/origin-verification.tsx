import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Globe,
  Camera,
  Download,
  Search,
  Shield
} from 'lucide-react';

interface VerificationMethod {
  id: string;
  name: string;
  description: string;
  reliability: number;
  cost: string;
  timeRequired: string;
}

interface OriginData {
  country: string;
  region: string;
  mine: string;
  coordinates: string;
  certification: string;
  confidence: number;
}

const verificationMethods: VerificationMethod[] = [
  {
    id: '1',
    name: 'Geological Analysis',
    description: 'Scientific analysis of mineral composition and inclusions',
    reliability: 95,
    cost: '₹15,000 - ₹25,000',
    timeRequired: '3-5 days'
  },
  {
    id: '2',
    name: 'Document Verification',
    description: 'Authentication of mining permits and export certificates',
    reliability: 85,
    cost: '₹5,000 - ₹10,000',
    timeRequired: '1-2 days'
  },
  {
    id: '3',
    name: 'Expert Assessment',
    description: 'Professional gemologist evaluation and opinion',
    reliability: 80,
    cost: '₹8,000 - ₹15,000',
    timeRequired: '1-3 days'
  },
  {
    id: '4',
    name: 'Database Check',
    description: 'Cross-reference with international gemstone databases',
    reliability: 75,
    cost: '₹3,000 - ₹8,000',
    timeRequired: 'Same day'
  },
  {
    id: '5',
    name: 'Chemical Fingerprinting',
    description: 'Advanced chemical analysis for unique signatures',
    reliability: 90,
    cost: '₹20,000 - ₹35,000',
    timeRequired: '5-7 days'
  }
];

const sampleOrigins = [
  { country: 'Burma (Myanmar)', region: 'Mogok Valley', mine: 'Mogok Ruby Mines', confidence: 95 },
  { country: 'Sri Lanka', region: 'Ratnapura', mine: 'Ratnapura Sapphire Fields', confidence: 92 },
  { country: 'Colombia', region: 'Muzo', mine: 'Muzo Emerald Mines', confidence: 88 },
  { country: 'Tanzania', region: 'Merelani', mine: 'Merelani Tanzanite Mines', confidence: 85 },
  { country: 'Brazil', region: 'Minas Gerais', mine: 'Brazilian Emerald Deposits', confidence: 82 }
];

export default function OriginVerification() {
  const [stoneDetails, setStoneDetails] = useState({
    stoneId: '',
    stoneType: '',
    carat: 0,
    claimedOrigin: '',
    purchaseDate: '',
    supplier: ''
  });
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationResult, setVerificationResult] = useState<OriginData | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleMethodToggle = (methodId: string) => {
    setSelectedMethods(prev =>
      prev.includes(methodId)
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId]
    );
  };

  const startVerification = () => {
    if (selectedMethods.length === 0) {
      alert('Please select at least one verification method');
      return;
    }

    setIsVerifying(true);

    // Simulate verification process
    setTimeout(() => {
      const totalReliability = selectedMethods.reduce((sum, methodId) => {
        const method = verificationMethods.find(m => m.id === methodId);
        return sum + (method?.reliability || 0);
      }, 0);

      const avgReliability = totalReliability / selectedMethods.length;

      // Simulate finding origin data
      const foundOrigin = sampleOrigins.find(o =>
        o.country.toLowerCase().includes(stoneDetails.claimedOrigin.toLowerCase()) ||
        o.region.toLowerCase().includes(stoneDetails.claimedOrigin.toLowerCase())
      ) || sampleOrigins[0];

      setVerificationResult({
        country: foundOrigin.country,
        region: foundOrigin.region,
        mine: foundOrigin.mine,
        coordinates: '23.6345° N, 96.1345° E',
        certification: 'GIA Certified',
        confidence: Math.min(avgReliability + Math.random() * 10, 100)
      });

      setIsVerifying(false);
    }, 3000);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-blue-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return <Badge className="bg-green-100 text-green-800">Very High</Badge>;
    if (confidence >= 80) return <Badge className="bg-blue-100 text-blue-800">High</Badge>;
    if (confidence >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low</Badge>;
  };

  const exportReport = () => {
    if (!verificationResult) return;

    const report = `
ORIGIN VERIFICATION REPORT
==========================
Stone ID: ${stoneDetails.stoneId}
Stone Type: ${stoneDetails.stoneType}
Carat Weight: ${stoneDetails.carat} ct
Claimed Origin: ${stoneDetails.claimedOrigin}
Verification Date: ${new Date().toLocaleDateString()}

VERIFICATION METHODS USED:
${selectedMethods.map(methodId => {
  const method = verificationMethods.find(m => m.id === methodId);
  return `- ${method?.name}: ${method?.description}`;
}).join('\n')}

VERIFICATION RESULTS:
Country: ${verificationResult.country}
Region: ${verificationResult.region}
Mine: ${verificationResult.mine}
Coordinates: ${verificationResult.coordinates}
Certification: ${verificationResult.certification}
Confidence Score: ${verificationResult.confidence.toFixed(1)}%

NOTES:
${verificationNotes}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `origin-verification-${stoneDetails.stoneId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Origin Verification</h1>
          <p className="text-gray-600">Geographic authenticity tracking and verification system</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stone Details Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Stone Information
            </CardTitle>
            <CardDescription>
              Enter the details of the gemstone to be verified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stoneId">Stone ID</Label>
                <Input
                  id="stoneId"
                  value={stoneDetails.stoneId}
                  onChange={(e) => setStoneDetails(prev => ({ ...prev, stoneId: e.target.value }))}
                  placeholder="e.g., RUBY-001"
                />
              </div>
              <div>
                <Label htmlFor="stoneType">Stone Type</Label>
                <Select value={stoneDetails.stoneType} onValueChange={(value) => setStoneDetails(prev => ({ ...prev, stoneType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stone type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ruby">Ruby</SelectItem>
                    <SelectItem value="sapphire">Sapphire</SelectItem>
                    <SelectItem value="emerald">Emerald</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                    <SelectItem value="pearl">Pearl</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="carat">Carat Weight</Label>
                <Input
                  id="carat"
                  type="number"
                  step="0.01"
                  value={stoneDetails.carat}
                  onChange={(e) => setStoneDetails(prev => ({ ...prev, carat: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="claimedOrigin">Claimed Origin</Label>
                <Input
                  id="claimedOrigin"
                  value={stoneDetails.claimedOrigin}
                  onChange={(e) => setStoneDetails(prev => ({ ...prev, claimedOrigin: e.target.value }))}
                  placeholder="e.g., Burma, Sri Lanka"
                />
              </div>
              <div>
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={stoneDetails.purchaseDate}
                  onChange={(e) => setStoneDetails(prev => ({ ...prev, purchaseDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={stoneDetails.supplier}
                  onChange={(e) => setStoneDetails(prev => ({ ...prev, supplier: e.target.value }))}
                  placeholder="Supplier name"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Verification Methods
            </CardTitle>
            <CardDescription>
              Select the verification methods you want to use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {verificationMethods.map((method) => (
                <div key={method.id} className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id={`method-${method.id}`}
                    checked={selectedMethods.includes(method.id)}
                    onChange={() => handleMethodToggle(method.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor={`method-${method.id}`} className="font-medium cursor-pointer">
                      {method.name}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Reliability: {method.reliability}%</span>
                      <span>Cost: {method.cost}</span>
                      <span>Time: {method.timeRequired}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Verification Process
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="verificationNotes">Additional Notes</Label>
            <Textarea
              id="verificationNotes"
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Any additional information or special requirements..."
              rows={3}
            />
          </div>

          <Button
            onClick={startVerification}
            className="w-full"
            disabled={selectedMethods.length === 0 || isVerifying}
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying Origin...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Start Verification
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Verification Results */}
      {verificationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Verification Results
            </CardTitle>
            <CardDescription>
              Origin verification completed successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Verified Country</Label>
                  <p className="text-lg font-semibold">{verificationResult.country}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Region</Label>
                  <p className="text-lg font-semibold">{verificationResult.region}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Mine/Location</Label>
                  <p className="text-lg font-semibold">{verificationResult.mine}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Coordinates</Label>
                  <p className="text-lg font-semibold">{verificationResult.coordinates}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Certification</Label>
                  <p className="text-lg font-semibold">{verificationResult.certification}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <Label className="text-sm font-medium text-gray-600">Confidence Score</Label>
                  <div className={`text-4xl font-bold ${getConfidenceColor(verificationResult.confidence)} mb-2`}>
                    {verificationResult.confidence.toFixed(1)}%
                  </div>
                  {getConfidenceBadge(verificationResult.confidence)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Verification Methods Used</span>
                    <span className="font-medium">{selectedMethods.length}</span>
                  </div>
                  <div className="space-y-1">
                    {selectedMethods.map(methodId => {
                      const method = verificationMethods.find(m => m.id === methodId);
                      return (
                        <div key={methodId} className="flex items-center justify-between text-xs">
                          <span>{method?.name}</span>
                          <span className="text-gray-500">{method?.reliability}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={exportReport} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button
                onClick={() => setVerificationResult(null)}
                variant="outline"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                New Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Origins Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Sample Origins Reference
          </CardTitle>
          <CardDescription>
            Common gemstone origins and their typical confidence levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleOrigins.map((origin, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{origin.country}</h4>
                  <Badge variant="secondary">{origin.confidence}%</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">{origin.region}</p>
                <p className="text-xs text-gray-500">{origin.mine}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
