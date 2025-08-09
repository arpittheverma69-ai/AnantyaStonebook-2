import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, 
  Star, 
  Moon, 
  Sun, 
  Heart, 
  Shield, 
  Zap, 
  Target,
  Clock,
  Lightbulb,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from "lucide-react";

interface AstrologicalProfile {
  zodiacSign: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  specificConcerns?: string[];
}

interface GemstoneRecommendation {
  stone: string;
  benefits: string[];
  compatibility: 'Excellent' | 'Good' | 'Moderate' | 'Avoid';
  reasons: string[];
  alternatives?: string[];
}

interface AstrologicalAnalysis {
  profile: AstrologicalProfile;
  recommendations: GemstoneRecommendation[];
  generalAdvice: string[];
  timing: string;
}

const zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const commonConcerns = [
  'Love & Relationships',
  'Career & Success',
  'Health & Wellness',
  'Financial Prosperity',
  'Spiritual Growth',
  'Protection & Security',
  'Communication',
  'Emotional Balance',
  'Creativity',
  'Leadership'
];

export default function AstrologicalAI() {
  const [profile, setProfile] = useState<AstrologicalProfile>({
    zodiacSign: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    specificConcerns: []
  });
  const [analysis, setAnalysis] = useState<AstrologicalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quickRecommendation, setQuickRecommendation] = useState('');
  const [quickZodiac, setQuickZodiac] = useState('');
  const [quickConcern, setQuickConcern] = useState('');

  const handleProfileChange = (field: keyof AstrologicalProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleConcernToggle = (concern: string) => {
    setProfile(prev => ({
      ...prev,
      specificConcerns: prev.specificConcerns?.includes(concern)
        ? prev.specificConcerns.filter(c => c !== concern)
        : [...(prev.specificConcerns || []), concern]
    }));
  };

  const handleAnalyze = async () => {
    if (!profile.zodiacSign) {
      alert('Please select your zodiac sign');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/astrological/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze');
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze astrological compatibility');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRecommendation = async () => {
    if (!quickZodiac || !quickConcern) {
      alert('Please select zodiac sign and concern');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/astrological/quick-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zodiacSign: quickZodiac,
          concern: quickConcern
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendation');
      }

      const result = await response.json();
      setQuickRecommendation(result.recommendation);
    } catch (error) {
      console.error('Quick recommendation error:', error);
      alert('Failed to get recommendation');
    } finally {
      setIsLoading(false);
    }
  };

  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility) {
      case 'Excellent': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Good': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Avoid': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getCompatibilityIcon = (compatibility: string) => {
    switch (compatibility) {
      case 'Excellent': return <CheckCircle className="h-4 w-4" />;
      case 'Good': return <Target className="h-4 w-4" />;
      case 'Moderate': return <AlertTriangle className="h-4 w-4" />;
      case 'Avoid': return <XCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center animate-pulse">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Astrological AI</h1>
            <p className="text-muted-foreground">Get personalized gemstone recommendations based on your zodiac</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Profile Form */}
        <div className="w-96 p-6 space-y-6 overflow-y-auto">
          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Your Astrological Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Zodiac Sign *</label>
                <Select value={profile.zodiacSign} onValueChange={(value) => handleProfileChange('zodiacSign', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your zodiac sign" />
                  </SelectTrigger>
                  <SelectContent>
                    {zodiacSigns.map(sign => (
                      <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Birth Date</label>
                <Input
                  type="date"
                  value={profile.birthDate}
                  onChange={(e) => handleProfileChange('birthDate', e.target.value)}
                  placeholder="Your birth date"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Birth Time</label>
                <Input
                  type="time"
                  value={profile.birthTime}
                  onChange={(e) => handleProfileChange('birthTime', e.target.value)}
                  placeholder="Your birth time"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Birth Place</label>
                <Input
                  value={profile.birthPlace}
                  onChange={(e) => handleProfileChange('birthPlace', e.target.value)}
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Specific Concerns</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {commonConcerns.map(concern => (
                    <Button
                      key={concern}
                      variant={profile.specificConcerns?.includes(concern) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleConcernToggle(concern)}
                      className="text-xs h-8"
                    >
                      {concern}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={isLoading || !profile.zodiacSign}
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Get Analysis
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Zodiac Sign</label>
                <Select value={quickZodiac} onValueChange={setQuickZodiac}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zodiac sign" />
                  </SelectTrigger>
                  <SelectContent>
                    {zodiacSigns.map(sign => (
                      <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Concern</label>
                <Input
                  value={quickConcern}
                  onChange={(e) => setQuickConcern(e.target.value)}
                  placeholder="e.g., Love, Career, Health"
                />
              </div>

              <Button 
                onClick={handleQuickRecommendation} 
                disabled={isLoading || !quickZodiac || !quickConcern}
                variant="outline"
                className="w-full"
              >
                Get Quick Tip
              </Button>

              {quickRecommendation && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm">{quickRecommendation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Analysis Results */}
        <div className="flex-1 p-6 overflow-y-auto">
          {analysis ? (
            <div className="space-y-6">
              {/* Profile Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Zodiac Sign</p>
                      <p className="text-lg font-bold">{analysis.profile.zodiacSign}</p>
                    </div>
                    {analysis.profile.birthDate && (
                      <div>
                        <p className="text-sm font-medium">Birth Date</p>
                        <p className="text-lg">{analysis.profile.birthDate}</p>
                      </div>
                    )}
                    {analysis.profile.specificConcerns && analysis.profile.specificConcerns.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium">Concerns</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {analysis.profile.specificConcerns.map(concern => (
                            <Badge key={concern} variant="secondary">{concern}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Gemstone Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Gemstone Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.recommendations.map((rec, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold">{rec.stone}</h3>
                          <Badge className={getCompatibilityColor(rec.compatibility)}>
                            <div className="flex items-center gap-1">
                              {getCompatibilityIcon(rec.compatibility)}
                              {rec.compatibility}
                            </div>
                          </Badge>
                        </div>

                        {rec.benefits.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Benefits:</p>
                            <div className="flex flex-wrap gap-1">
                              {rec.benefits.map((benefit, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {rec.reasons.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Why:</p>
                            <ul className="text-sm space-y-1">
                              {rec.reasons.map((reason, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-purple-500 mt-1">•</span>
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {rec.alternatives && rec.alternatives.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Alternatives:</p>
                            <div className="flex flex-wrap gap-1">
                              {rec.alternatives.map((alt, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {alt}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Timing Advice */}
              {analysis.timing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Timing Advice
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysis.timing}</p>
                  </CardContent>
                </Card>
              )}

              {/* General Advice */}
              {analysis.generalAdvice && analysis.generalAdvice.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      General Astrological Advice
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.generalAdvice.map((advice, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span className="text-sm">{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Astrological Gemstone Analysis</h3>
                  <p className="text-muted-foreground">Fill out your profile to get personalized gemstone recommendations</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
