import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Info, AlertTriangle, CheckCircle, Calculator, Receipt, Package, Gem, Diamond, Circle, Crown } from "lucide-react";

interface GSTRule {
  id: string;
  rule: string;
  description: string;
  rate: string;
  conditions: string[];
  compliance: string;
  hsnCode: string;
  details: string;
  examples: string[];
  documents: string[];
  deadlines: string[];
  penalties: string[];
  exemptions: string[];
}

const gstRules: GSTRule[] = [
  {
    id: "1",
    rule: "GST Rate for Precious Stones",
    description: "Precious stones and semi-precious stones attract 3% GST",
    rate: "3%",
    conditions: ["Must be in raw form", "Not set in jewelry", "Proper HSN code"],
    compliance: "Use HSN code 7103 for precious stones",
    hsnCode: "7103",
    details: "Precious stones and semi-precious stones, whether or not worked or graded but not strung, mounted or set, attract 3% GST. This includes stones like ruby, sapphire, emerald, etc. The stones must be in their natural form and not set in jewelry.",
    examples: [
      "Raw ruby stones",
      "Uncut sapphire",
      "Natural emerald",
      "Semi-precious stones like amethyst",
      "Graded but unset diamonds"
    ],
    documents: [
      "Invoice with HSN code 7103",
      "Stone certification",
      "Import documents (if applicable)",
      "Quality certificates"
    ],
    deadlines: [
      "GST to be collected at the time of supply",
      "GSTR-1 to be filed by 11th of next month",
      "GSTR-3B to be filed by 20th of next month"
    ],
    penalties: [
      "Late filing: ₹50 per day (maximum ₹5,000)",
      "Incorrect HSN: ₹25,000 per return",
      "Non-compliance: Up to 100% of tax amount"
    ],
    exemptions: [
      "Stones set in jewelry (attracts 3% on jewelry)",
      "Imitation stones (attracts 18% GST)",
      "Stones for industrial use (may have different rates)"
    ]
  },
  {
    id: "2",
    rule: "GST Rate for Jewelry",
    description: "Gold, silver, and platinum jewelry attracts 3% GST",
    rate: "3%",
    conditions: ["Must be jewelry items", "Proper hallmarking", "Invoice with HSN"],
    compliance: "Use HSN code 7113 for jewelry",
    hsnCode: "7113",
    details: "Articles of jewelry and parts thereof, of precious metal or of metal clad with precious metal, attract 3% GST. This includes all types of jewelry made from gold, silver, platinum, and other precious metals.",
    examples: [
      "Gold necklaces and chains",
      "Silver rings and earrings",
      "Platinum wedding bands",
      "Diamond-studded jewelry",
      "Gemstone-set jewelry"
    ],
    documents: [
      "Invoice with HSN code 7113",
      "Hallmarking certificates",
      "Jewelry valuation certificates",
      "Quality assurance documents"
    ],
    deadlines: [
      "GST to be collected at the time of supply",
      "GSTR-1 to be filed by 11th of next month",
      "GSTR-3B to be filed by 20th of next month"
    ],
    penalties: [
      "Late filing: ₹50 per day (maximum ₹5,000)",
      "Incorrect HSN: ₹25,000 per return",
      "Non-compliance: Up to 100% of tax amount"
    ],
    exemptions: [
      "Imitation jewelry (attracts 18% GST)",
      "Costume jewelry",
      "Industrial jewelry parts"
    ]
  },
  {
    id: "3",
    rule: "GST Rate for Diamond",
    description: "Diamonds attract 3% GST",
    rate: "3%",
    conditions: ["Must be in raw form", "Proper certification", "HSN code 7102"],
    compliance: "Use HSN code 7102 for diamonds",
    hsnCode: "7102",
    details: "Diamonds, whether or not worked, but not mounted or set, attract 3% GST. This includes both natural and synthetic diamonds in their raw form. Cut and polished diamonds also fall under this category.",
    examples: [
      "Raw diamonds",
      "Cut and polished diamonds",
      "Industrial diamonds",
      "Synthetic diamonds",
      "Diamond dust and powder"
    ],
    documents: [
      "Invoice with HSN code 7102",
      "Diamond certification (GIA, IGI, etc.)",
      "Kimberley Process certificates",
      "Import/export documents"
    ],
    deadlines: [
      "GST to be collected at the time of supply",
      "GSTR-1 to be filed by 11th of next month",
      "GSTR-3B to be filed by 20th of next month"
    ],
    penalties: [
      "Late filing: ₹50 per day (maximum ₹5,000)",
      "Incorrect HSN: ₹25,000 per return",
      "Non-compliance: Up to 100% of tax amount"
    ],
    exemptions: [
      "Diamonds set in jewelry (attracts 3% on jewelry)",
      "Diamonds for industrial use (may have different rates)",
      "Diamond simulants (attracts 18% GST)"
    ]
  },
  {
    id: "4",
    rule: "GST Rate for Pearl",
    description: "Natural and cultured pearls attract 3% GST",
    rate: "3%",
    conditions: ["Must be natural or cultured", "Not imitation", "HSN code 7101"],
    compliance: "Use HSN code 7101 for pearls",
    hsnCode: "7101",
    details: "Natural or cultured pearls, whether or not worked or graded but not strung, mounted or set, attract 3% GST. This includes both natural pearls and cultured pearls.",
    examples: [
      "Natural pearls",
      "Cultured pearls",
      "Freshwater pearls",
      "Saltwater pearls",
      "Pearl powder"
    ],
    documents: [
      "Invoice with HSN code 7101",
      "Pearl certification",
      "Origin certificates",
      "Quality grading certificates"
    ],
    deadlines: [
      "GST to be collected at the time of supply",
      "GSTR-1 to be filed by 11th of next month",
      "GSTR-3B to be filed by 20th of next month"
    ],
    penalties: [
      "Late filing: ₹50 per day (maximum ₹5,000)",
      "Incorrect HSN: ₹25,000 per return",
      "Non-compliance: Up to 100% of tax amount"
    ],
    exemptions: [
      "Pearls set in jewelry (attracts 3% on jewelry)",
      "Imitation pearls (attracts 18% GST)",
      "Pearls for industrial use"
    ]
  },
  {
    id: "5",
    rule: "GST Rate for Imitation Jewelry",
    description: "Imitation jewelry attracts 18% GST",
    rate: "18%",
    conditions: ["Must be imitation", "Not precious metals", "HSN code 7117"],
    compliance: "Use HSN code 7117 for imitation jewelry",
    hsnCode: "7117",
    details: "Imitation jewelry attracts 18% GST. This includes jewelry made from non-precious metals, plastic, glass, or other materials that imitate precious jewelry.",
    examples: [
      "Plastic jewelry",
      "Glass jewelry",
      "Costume jewelry",
      "Fashion jewelry",
      "Imitation pearl jewelry"
    ],
    documents: [
      "Invoice with HSN code 7117",
      "Material composition certificates",
      "Quality assurance documents"
    ],
    deadlines: [
      "GST to be collected at the time of supply",
      "GSTR-1 to be filed by 11th of next month",
      "GSTR-3B to be filed by 20th of next month"
    ],
    penalties: [
      "Late filing: ₹50 per day (maximum ₹5,000)",
      "Incorrect HSN: ₹25,000 per return",
      "Non-compliance: Up to 100% of tax amount"
    ],
    exemptions: [
      "Jewelry made from precious metals (attracts 3% GST)",
      "Industrial jewelry parts",
      "Jewelry for religious purposes (may be exempt)"
    ]
  },
  {
    id: "6",
    rule: "GST Rate for Gemstone Cutting",
    description: "Services for cutting and polishing gemstones attract 18% GST",
    rate: "18%",
    conditions: ["Must be service", "Not goods", "SAC code 9983"],
    compliance: "Use SAC code 9983 for gemstone services",
    hsnCode: "9983",
    details: "Services for cutting, polishing, and finishing of gemstones attract 18% GST. This includes all services related to processing and finishing of precious and semi-precious stones.",
    examples: [
      "Diamond cutting services",
      "Gemstone polishing",
      "Stone faceting",
      "Lapidary services",
      "Stone finishing"
    ],
    documents: [
      "Service invoice with SAC code 9983",
      "Service agreements",
      "Quality certificates",
      "Work completion certificates"
    ],
    deadlines: [
      "GST to be collected at the time of supply",
      "GSTR-1 to be filed by 11th of next month",
      "GSTR-3B to be filed by 20th of next month"
    ],
    penalties: [
      "Late filing: ₹50 per day (maximum ₹5,000)",
      "Incorrect SAC: ₹25,000 per return",
      "Non-compliance: Up to 100% of tax amount"
    ],
    exemptions: [
      "Services to unregistered persons (reverse charge may apply)",
      "Export of services (zero-rated)",
      "Services to SEZ units (zero-rated)"
    ]
  }
];

export default function GSTRules() {
  const getRateColor = (rate: string) => {
    if (rate === "3%") return "bg-blue-100 text-blue-800";
    if (rate === "18%") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const getCategoryIcon = (rule: string) => {
    if (rule.includes("Diamond")) return <Diamond className="h-4 w-4" />;
    if (rule.includes("Pearl")) return <Circle className="h-4 w-4" />;
    if (rule.includes("Jewelry")) return <Crown className="h-4 w-4" />;
    if (rule.includes("Stones")) return <Gem className="h-4 w-4" />;
    if (rule.includes("Cutting")) return <Calculator className="h-4 w-4" />;
    return <Package className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gstRules.map((rule) => (
          <Card key={rule.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge className={getRateColor(rule.rate)}>{rule.rate}</Badge>
                <Badge variant="outline">GST</Badge>
              </div>
              <CardTitle className="text-sm flex items-center space-x-2">
                {getCategoryIcon(rule.rule)}
                <span>{rule.rule}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
              <div className="flex items-center space-x-2 text-sm mb-3">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-600">HSN: {rule.hsnCode}</span>
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
                      {getCategoryIcon(rule.rule)}
                      <span>{rule.rule}</span>
                    </DialogTitle>
                    <DialogDescription>
                      Comprehensive GST guide for {rule.rule.toLowerCase()}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{rule.details}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">GST Rate</h4>
                        <Badge className={`text-lg px-3 py-1 ${getRateColor(rule.rate)}`}>
                          {rule.rate}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">HSN/SAC Code</h4>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {rule.hsnCode}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Compliance</h4>
                      <p className="text-sm text-gray-600">{rule.compliance}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Examples</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {rule.examples.map((example, index) => (
                          <li key={index} className="text-sm text-gray-600">{example}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Required Documents</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {rule.documents.map((doc, index) => (
                          <li key={index} className="text-sm text-gray-600">{doc}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Deadlines</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {rule.deadlines.map((deadline, index) => (
                          <li key={index} className="text-sm text-gray-600">{deadline}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Penalties</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {rule.penalties.map((penalty, index) => (
                          <li key={index} className="text-sm text-gray-600">{penalty}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Exemptions</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {rule.exemptions.map((exemption, index) => (
                          <li key={index} className="text-sm text-gray-600">{exemption}</li>
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
          <strong>Important Note:</strong> GST rates and rules are subject to change based on government notifications. 
          Always refer to the latest GST notifications and consult with a qualified tax professional for specific advice.
        </AlertDescription>
      </Alert>
    </div>
  );
}
