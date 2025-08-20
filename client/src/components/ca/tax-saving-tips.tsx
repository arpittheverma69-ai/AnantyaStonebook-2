import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, CheckCircle, AlertTriangle, Info, Calculator, Shield, PiggyBank, BookOpen, FileText, Users, Heart, GraduationCap, Building2 } from "lucide-react";

interface TaxSavingTip {
  id: string;
  title: string;
  description: string;
  category: string;
  applicableTo: string[];
  savings: string;
  riskLevel: "low" | "medium" | "high";
  compliance: string;
  section: string;
  details: string;
  examples: string[];
  documents: string[];
  deadlines: string[];
  restrictions: string[];
}

const taxSavingTips: TaxSavingTip[] = [
  {
    id: "1",
    title: "Section 80C - ELSS Investment",
    description: "Invest in Equity Linked Saving Schemes to claim deduction up to ₹1.5 lakh under Section 80C",
    category: "Investment",
    applicableTo: ["gemstone", "jewelry", "retail", "wholesale", "manufacturing"],
    savings: "₹1.5 lakh deduction",
    riskLevel: "medium",
    compliance: "Must be held for 3 years minimum",
    section: "80C",
    details: "ELSS (Equity Linked Saving Schemes) are mutual fund schemes that offer tax benefits under Section 80C. They have a lock-in period of 3 years and invest primarily in equity markets. This is one of the most popular tax-saving instruments due to its potential for higher returns compared to traditional tax-saving options.",
    examples: [
      "Axis Long Term Equity Fund",
      "HDFC TaxSaver Fund",
      "ICICI Prudential Long Term Equity Fund",
      "SBI Long Term Equity Fund"
    ],
    documents: [
      "PAN Card",
      "Aadhaar Card",
      "Bank Account Details",
      "KYC Documents"
    ],
    deadlines: [
      "Investment can be made throughout the financial year",
      "Lock-in period: 3 years from date of investment"
    ],
    restrictions: [
      "Maximum deduction: ₹1.5 lakh (combined with other 80C investments)",
      "Lock-in period of 3 years",
      "Subject to market risks"
    ]
  },
  {
    id: "2",
    title: "Section 80D - Health Insurance Premium",
    description: "Claim deduction for health insurance premium paid for self, spouse, children, and parents",
    category: "Insurance",
    applicableTo: ["gemstone", "jewelry", "retail", "wholesale", "manufacturing"],
    savings: "Up to ₹25,000 (₹50,000 for senior citizens)",
    riskLevel: "low",
    compliance: "Premium must be paid by cheque/online",
    section: "80D",
    details: "Section 80D allows deduction for health insurance premium paid for self, spouse, dependent children, and parents. The deduction limit is ₹25,000 for individuals and ₹50,000 for senior citizens. Additionally, preventive health check-ups up to ₹5,000 are also deductible.",
    examples: [
      "Individual health insurance premium",
      "Family floater health insurance",
      "Senior citizen health insurance",
      "Preventive health check-ups"
    ],
    documents: [
      "Health insurance policy document",
      "Premium payment receipts",
      "Medical bills for preventive check-ups"
    ],
    deadlines: [
      "Premium must be paid during the financial year",
      "Deduction available for policies taken in the same year"
    ],
    restrictions: [
      "Maximum deduction: ₹25,000 (₹50,000 for senior citizens)",
      "Preventive health check-ups: ₹5,000 (included in the limit)",
      "Payment must be by non-cash mode"
    ]
  },
  {
    id: "3",
    title: "Section 80G - Charitable Donations",
    description: "Donate to registered charitable organizations to claim deduction",
    category: "Donation",
    applicableTo: ["gemstone", "jewelry", "retail", "wholesale", "manufacturing"],
    savings: "50% or 100% of donation amount",
    riskLevel: "low",
    compliance: "Must be to registered organizations",
    section: "80G",
    details: "Section 80G provides deduction for donations made to registered charitable organizations. The deduction can be 50% or 100% of the donation amount depending on the organization. This is a great way to contribute to social causes while saving tax.",
    examples: [
      "PM National Relief Fund (100% deduction)",
      "Prime Minister's Drought Relief Fund (100% deduction)",
      "National Defence Fund (100% deduction)",
      "Registered charitable trusts (50% deduction)"
    ],
    documents: [
      "Donation receipt with 80G registration number",
      "Bank statement showing payment",
      "Organization's 80G certificate"
    ],
    deadlines: [
      "Donation must be made during the financial year",
      "Receipt must be obtained in the same year"
    ],
    restrictions: [
      "Only donations to registered organizations qualify",
      "Minimum donation amount: ₹1,000",
      "Payment must be by non-cash mode for amounts above ₹10,000"
    ]
  },
  {
    id: "4",
    title: "Section 80TTA - Interest on Savings Account",
    description: "Claim deduction for interest earned on savings account up to ₹10,000",
    category: "Interest",
    applicableTo: ["gemstone", "jewelry", "retail", "wholesale"],
    savings: "₹10,000 deduction",
    riskLevel: "low",
    compliance: "Only for savings account interest",
    section: "80TTA",
    details: "Section 80TTA allows deduction of up to ₹10,000 for interest earned on savings accounts. This includes interest from all savings accounts across different banks. This is a simple way to reduce tax liability on interest income.",
    examples: [
      "Savings account interest from any bank",
      "Post office savings account interest",
      "Cooperative bank savings account interest"
    ],
    documents: [
      "Bank statements showing interest earned",
      "Form 16A from banks (if applicable)"
    ],
    deadlines: [
      "Interest earned during the financial year",
      "No specific deadline for claiming deduction"
    ],
    restrictions: [
      "Maximum deduction: ₹10,000",
      "Only for savings account interest",
      "Fixed deposit interest is not covered"
    ]
  },
  {
    id: "5",
    title: "Section 80TTB - Interest on Fixed Deposits",
    description: "Senior citizens can claim deduction for interest on fixed deposits up to ₹50,000",
    category: "Interest",
    applicableTo: ["gemstone", "jewelry", "retail", "wholesale"],
    savings: "₹50,000 deduction",
    riskLevel: "low",
    compliance: "Only for senior citizens",
    section: "80TTB",
    details: "Section 80TTB provides deduction of up to ₹50,000 for interest earned on fixed deposits by senior citizens (60 years and above). This is in addition to the ₹10,000 deduction available under Section 80TTA for savings account interest.",
    examples: [
      "Fixed deposit interest from banks",
      "Post office fixed deposit interest",
      "Cooperative bank fixed deposit interest"
    ],
    documents: [
      "Fixed deposit certificates",
      "Interest certificates from banks",
      "Age proof for senior citizen status"
    ],
    deadlines: [
      "Interest earned during the financial year",
      "Available only for senior citizens (60+ years)"
    ],
    restrictions: [
      "Maximum deduction: ₹50,000",
      "Only for senior citizens (60 years and above)",
      "Only for fixed deposit interest"
    ]
  },
  {
    id: "6",
    title: "Section 80E - Education Loan Interest",
    description: "Claim deduction for interest paid on education loan for higher studies",
    category: "Education",
    applicableTo: ["gemstone", "jewelry", "retail", "wholesale"],
    savings: "Full interest amount",
    riskLevel: "low",
    compliance: "Must be for approved courses",
    section: "80E",
    details: "Section 80E allows deduction for interest paid on education loans taken for higher studies. There is no upper limit on the deduction amount. The loan must be taken from a financial institution or approved charitable institution.",
    examples: [
      "Engineering course fees",
      "Medical course fees",
      "MBA course fees",
      "Post-graduation course fees"
    ],
    documents: [
      "Education loan agreement",
      "Interest payment certificates",
      "Course completion certificates",
      "Institution recognition certificates"
    ],
    deadlines: [
      "Interest must be paid during the financial year",
      "Deduction available for 8 years from loan disbursement"
    ],
    restrictions: [
      "Only for higher education courses",
      "Loan must be from approved financial institutions",
      "No deduction for principal repayment"
    ]
  },
  {
    id: "7",
    title: "Section 80CCD(1B) - NPS Additional Contribution",
    description: "Additional deduction of ₹50,000 for NPS contribution beyond Section 80C limit",
    category: "Pension",
    applicableTo: ["gemstone", "jewelry", "retail", "wholesale", "manufacturing"],
    savings: "₹50,000 additional deduction",
    riskLevel: "low",
    compliance: "Must be to NPS account",
    section: "80CCD(1B)",
    details: "Section 80CCD(1B) provides an additional deduction of ₹50,000 for contributions made to the National Pension System (NPS). This is over and above the ₹1.5 lakh limit under Section 80C. NPS is a government-sponsored pension scheme.",
    examples: [
      "NPS Tier I account contributions",
      "Voluntary contributions to NPS",
      "Employer contributions to NPS"
    ],
    documents: [
      "NPS account statement",
      "Contribution receipts",
      "PRAN (Permanent Retirement Account Number)"
    ],
    deadlines: [
      "Contribution must be made during the financial year",
      "No specific deadline within the year"
    ],
    restrictions: [
      "Maximum deduction: ₹50,000",
      "Only for NPS Tier I account",
      "Subject to NPS withdrawal rules"
    ]
  },
  {
    id: "8",
    title: "Section 80GGA - Rural Development Donations",
    description: "Donate to rural development projects for deduction",
    category: "Donation",
    applicableTo: ["gemstone", "jewelry", "retail", "wholesale"],
    savings: "100% of donation amount",
    riskLevel: "low",
    compliance: "Must be to approved projects",
    section: "80GGA",
    details: "Section 80GGA allows deduction for donations made to rural development projects and scientific research. The deduction is 100% of the donation amount. This encourages contributions to rural development and scientific research.",
    examples: [
      "Rural development projects",
      "Scientific research institutions",
      "Agricultural research projects",
      "Rural technology development"
    ],
    documents: [
      "Donation receipt with project details",
      "Project approval certificates",
      "Bank payment proof"
    ],
    deadlines: [
      "Donation must be made during the financial year",
      "Project must be approved by prescribed authority"
    ],
    restrictions: [
      "Only for approved rural development projects",
      "Payment must be by non-cash mode",
      "Project must be approved by prescribed authority"
    ]
  }
];

export default function TaxSavingTips() {
  const [selectedTip, setSelectedTip] = useState<TaxSavingTip | null>(null);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Investment": return <TrendingUp className="h-4 w-4" />;
      case "Insurance": return <Shield className="h-4 w-4" />;
      case "Donation": return <Heart className="h-4 w-4" />;
      case "Interest": return <Calculator className="h-4 w-4" />;
      case "Education": return <GraduationCap className="h-4 w-4" />;
      case "Pension": return <Building2 className="h-4 w-4" />;
      default: return <PiggyBank className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {taxSavingTips.map((tip) => (
          <Card key={tip.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">{tip.section}</Badge>
                <Badge className={`text-xs ${getRiskColor(tip.riskLevel)}`}>
                  {tip.riskLevel.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-sm flex items-center space-x-2">
                {getCategoryIcon(tip.category)}
                <span>{tip.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-2">{tip.description}</p>
              <div className="flex items-center space-x-2 text-sm mb-3">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">{tip.savings}</span>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Info className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      {getCategoryIcon(tip.category)}
                      <span>{tip.title}</span>
                    </DialogTitle>
                    <DialogDescription>
                      Comprehensive guide for {tip.section} tax saving
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{tip.details}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Potential Savings</h4>
                        <p className="text-lg font-bold text-green-600">{tip.savings}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Risk Level</h4>
                        <Badge className={getRiskColor(tip.riskLevel)}>
                          {tip.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Compliance Requirements</h4>
                      <p className="text-sm text-gray-600">{tip.compliance}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Examples</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {tip.examples.map((example, index) => (
                          <li key={index} className="text-sm text-gray-600">{example}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Required Documents</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {tip.documents.map((doc, index) => (
                          <li key={index} className="text-sm text-gray-600">{doc}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Deadlines</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {tip.deadlines.map((deadline, index) => (
                          <li key={index} className="text-sm text-gray-600">{deadline}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Restrictions</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {tip.restrictions.map((restriction, index) => (
                          <li key={index} className="text-sm text-gray-600">{restriction}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important Disclaimer:</strong> These tax-saving strategies are based on current Indian tax laws. 
          Tax laws are subject to change, and individual circumstances may vary. 
          Please consult a qualified Chartered Accountant for personalized advice before implementing any tax-saving strategy.
        </AlertDescription>
      </Alert>
    </div>
  );
}
