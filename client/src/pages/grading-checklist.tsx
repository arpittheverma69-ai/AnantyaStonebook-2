import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Gem,
  Camera,
  FileText,
  Download,
  Star,
  Eye,
  Scissors,
  Award,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface GradingCriteria {
  id: string;
  name: string;
  weight: number;
  score: number;
  notes: string;
}

interface GradingSession {
  id: string;
  stoneId: string;
  stoneType: string;
  carat: number;
  date: Date;
  criteria: GradingCriteria[];
  overallScore: number;
  grade: string;
  photos: string[];
  notes: string;
}

const defaultCriteria: GradingCriteria[] = [
  { id: '1', name: 'Color', weight: 25, score: 0, notes: '' },
  { id: '2', name: 'Clarity', weight: 25, score: 0, notes: '' },
  { id: '3', name: 'Cut', weight: 20, score: 0, notes: '' },
  { id: '4', name: 'Carat Weight', weight: 15, score: 0, notes: '' },
  { id: '5', name: 'Origin', weight: 10, score: 0, notes: '' },
  { id: '6', name: 'Certification', weight: 5, score: 0, notes: '' }
];

const gradeRanges = [
  { min: 90, max: 100, grade: 'AAA+', color: 'bg-green-500' },
  { min: 80, max: 89, grade: 'AAA', color: 'bg-green-400' },
  { min: 70, max: 79, grade: 'AA+', color: 'bg-blue-500' },
  { min: 60, max: 69, grade: 'AA', color: 'bg-blue-400' },
  { min: 50, max: 59, grade: 'A+', color: 'bg-yellow-500' },
  { min: 40, max: 49, grade: 'A', color: 'bg-yellow-400' },
  { min: 0, max: 39, grade: 'B', color: 'bg-red-500' }
];

export default function GradingChecklist() {
  const [currentSession, setCurrentSession] = useState<GradingSession | null>(null);
  const [criteria, setCriteria] = useState<GradingCriteria[]>(defaultCriteria);
  const [stoneDetails, setStoneDetails] = useState({
    stoneId: '',
    stoneType: '',
    carat: 0,
    origin: '',
    certification: ''
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  const startNewSession = () => {
    const newSession: GradingSession = {
      id: Date.now().toString(),
      stoneId: stoneDetails.stoneId,
      stoneType: stoneDetails.stoneType,
      carat: stoneDetails.carat,
      date: new Date(),
      criteria: [...defaultCriteria],
      overallScore: 0,
      grade: '',
      photos: [...photos],
      notes: notes
    };
    setCurrentSession(newSession);
    setCriteria([...defaultCriteria]);
    setIsGrading(true);
  };

  const updateCriteriaScore = (id: string, score: number) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, score } : c));
  };

  const updateCriteriaNotes = (id: string, notes: string) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, notes } : c));
  };

  const calculateOverallScore = () => {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    const weightedScore = criteria.reduce((sum, c) => sum + (c.score * c.weight), 0);
    return Math.round((weightedScore / totalWeight) * 100) / 100;
  };

  const getGrade = (score: number) => {
    const range = gradeRanges.find(r => score >= r.min && score <= r.max);
    return range ? range.grade : 'N/A';
  };

  const getGradeColor = (score: number) => {
    const range = gradeRanges.find(r => score >= r.min && score <= r.max);
    return range ? range.color : 'bg-gray-500';
  };

  const saveSession = () => {
    const overallScore = calculateOverallScore();
    const grade = getGrade(overallScore);
    
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        criteria: [...criteria],
        overallScore,
        grade,
        notes
      };
      setCurrentSession(updatedSession);
      // Here you would typically save to database
      console.log('Session saved:', updatedSession);
    }
  };

  const exportReport = () => {
    if (!currentSession) return;
    
    const report = `
GEMSTONE GRADING REPORT
=======================
Stone ID: ${currentSession.stoneId}
Stone Type: ${currentSession.stoneType}
Carat Weight: ${currentSession.carat} ct
Date: ${currentSession.date.toLocaleDateString()}
Overall Score: ${currentSession.overallScore}/100
Grade: ${currentSession.grade}

CRITERIA BREAKDOWN:
${criteria.map(c => `${c.name}: ${c.score}/10 (Weight: ${c.weight}%) - ${c.notes}`).join('\n')}

NOTES:
${currentSession.notes}
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grading-report-${currentSession.stoneId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetSession = () => {
    setCurrentSession(null);
    setCriteria([...defaultCriteria]);
    setStoneDetails({ stoneId: '', stoneType: '', carat: 0, origin: '', certification: '' });
    setPhotos([]);
    setNotes('');
    setIsGrading(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Gem className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gemstone Grading Checklist</h1>
          <p className="text-gray-600">Professional grading system for gemstone quality assessment</p>
        </div>
      </div>

      {!isGrading ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Start New Grading Session
            </CardTitle>
            <CardDescription>
              Enter stone details and begin the grading process
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
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  value={stoneDetails.origin}
                  onChange={(e) => setStoneDetails(prev => ({ ...prev, origin: e.target.value }))}
                  placeholder="e.g., Burma, Sri Lanka"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Initial Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any initial observations or notes..."
                rows={3}
              />
            </div>

            <Button onClick={startNewSession} className="w-full" disabled={!stoneDetails.stoneId || !stoneDetails.stoneType}>
              <Gem className="w-4 h-4 mr-2" />
              Start Grading Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Session Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Grading Session: {currentSession?.stoneId}</CardTitle>
                  <CardDescription>
                    {currentSession?.stoneType} • {currentSession?.carat} ct • {currentSession?.date.toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={saveSession}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={exportReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" onClick={resetSession}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Grading Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Grading Criteria
              </CardTitle>
              <CardDescription>
                Rate each criterion on a scale of 1-10 and add detailed notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">{criterion.name}</Label>
                      <Badge variant="secondary">Weight: {criterion.weight}%</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-600">Score: {criterion.score}/10</span>
                          <Badge variant={criterion.score >= 8 ? 'default' : criterion.score >= 6 ? 'secondary' : 'destructive'}>
                            {criterion.score >= 8 ? 'Excellent' : criterion.score >= 6 ? 'Good' : 'Poor'}
                          </Badge>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={criterion.score}
                          onChange={(e) => updateCriteriaScore(criterion.id, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`notes-${criterion.id}`}>Notes for {criterion.name}</Label>
                      <Textarea
                        id={`notes-${criterion.id}`}
                        value={criterion.notes}
                        onChange={(e) => updateCriteriaNotes(criterion.id, e.target.value)}
                        placeholder={`Enter detailed notes about ${criterion.name.toLowerCase()}...`}
                        rows={2}
                      />
                    </div>
                    
                    <Separator />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Grading Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {calculateOverallScore().toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                  <Progress value={calculateOverallScore()} className="mt-2" />
                </div>
                
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getGradeColor(calculateOverallScore())} text-white text-xl font-bold mb-2`}>
                    {getGrade(calculateOverallScore())}
                  </div>
                  <div className="text-sm text-gray-600">Final Grade</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {criteria.filter(c => c.score >= 8).length}/{criteria.length}
                  </div>
                  <div className="text-sm text-gray-600">Excellent Criteria</div>
                </div>
              </div>
              
              <div className="mt-6">
                <Label htmlFor="final-notes">Final Assessment Notes</Label>
                <Textarea
                  id="final-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter your final assessment and recommendations..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
