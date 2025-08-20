import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Calculator, FileText, TrendingUp, Shield, AlertTriangle, CheckCircle, BookOpen, Scale, Receipt, PiggyBank, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TaxSavingTips from "@/components/ca/tax-saving-tips";
import GSTRules from "@/components/ca/gst-rules";
import AIResponseFormatter from "@/components/ca/ai-response-formatter";

const querySchema = z.object({
  query: z.string().min(10, "Please provide a detailed query (minimum 10 characters)"),
  category: z.enum(["gst", "income-tax", "business-tax", "compliance", "tax-saving", "legal", "audit", "customs"]),
  businessType: z.enum(["gemstone", "jewelry", "retail", "wholesale", "manufacturing", "export", "other"]),
  turnover: z.enum(["under-20lakh", "20lakh-1crore", "1crore-5crore", "5crore-10crore", "above-10crore"]),
});

type QueryForm = z.infer<typeof querySchema>;

export default function CALegalAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const { toast } = useToast();

  const form = useForm<QueryForm>({
    resolver: zodResolver(querySchema),
    defaultValues: {
      query: "",
      category: "gst",
      businessType: "gemstone",
      turnover: "under-20lakh",
    },
  });

  const handleSubmit = async (data: QueryForm) => {
    console.log("🚀 CA Legal Assistant - Submitting query:", data);
    setIsLoading(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Business Context: ${data.businessType} business with ${data.turnover} turnover
Category: ${data.category}

Query: ${data.query}

Provide practical legal and tax advice for this gemstone business query. Include relevant sections, compliance requirements, and actionable steps.`,
        }),
      });

      console.log("🚀 CA Legal Assistant - Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🚀 CA Legal Assistant - Response error:", errorText);
        throw new Error(`Failed to get AI response: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log("🚀 CA Legal Assistant - AI response received:", result);
      
      setAiResponse(result.response);
      toast({
        title: "Legal Advice Generated",
        description: "AI has provided comprehensive legal and tax advice",
      });
    } catch (error) {
      console.error("🚀 CA Legal Assistant - Error getting AI response:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Scale className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CA & Legal Assistant</h1>
          <p className="text-gray-600">AI-powered legal and tax advice for your gemstone business</p>
        </div>
      </div>

      <Tabs defaultValue="ai-consultation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-consultation" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>AI Consultation</span>
          </TabsTrigger>
          <TabsTrigger value="tax-saving" className="flex items-center space-x-2">
            <PiggyBank className="h-4 w-4" />
            <span>Tax Saving</span>
          </TabsTrigger>
          <TabsTrigger value="gst-rules" className="flex items-center space-x-2">
            <Receipt className="h-4 w-4" />
            <span>GST Rules</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Compliance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-consultation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>AI Legal & Tax Consultation</span>
              </CardTitle>
              <CardDescription>
                Get comprehensive legal and tax advice from AI powered by Indian tax laws and regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Query Category</Label>
                    <Select onValueChange={(value) => form.setValue("category", value as any)} defaultValue={form.getValues("category")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gst">GST & Indirect Tax</SelectItem>
                        <SelectItem value="income-tax">Income Tax</SelectItem>
                        <SelectItem value="business-tax">Business Tax</SelectItem>
                        <SelectItem value="compliance">Legal Compliance</SelectItem>
                        <SelectItem value="tax-saving">Tax Saving Strategies</SelectItem>
                        <SelectItem value="legal">Legal Issues</SelectItem>
                        <SelectItem value="audit">Audit & Assessment</SelectItem>
                        <SelectItem value="customs">Customs & Import</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select onValueChange={(value) => form.setValue("businessType", value as any)} defaultValue={form.getValues("businessType")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemstone">Gemstone Trading</SelectItem>
                        <SelectItem value="jewelry">Jewelry Business</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="wholesale">Wholesale</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="export">Export</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="turnover">Annual Turnover</Label>
                    <Select onValueChange={(value) => form.setValue("turnover", value as any)} defaultValue={form.getValues("turnover")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select turnover" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-20lakh">Under ₹20 Lakh</SelectItem>
                        <SelectItem value="20lakh-1crore">₹20 Lakh - ₹1 Crore</SelectItem>
                        <SelectItem value="1crore-5crore">₹1 Crore - ₹5 Crore</SelectItem>
                        <SelectItem value="5crore-10crore">₹5 Crore - ₹10 Crore</SelectItem>
                        <SelectItem value="above-10crore">Above ₹10 Crore</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="query">Your Legal/Tax Query</Label>
                  <Textarea
                    id="query"
                    placeholder="Describe your legal or tax question in detail. For example: 'What are the GST implications for importing diamonds from abroad?' or 'How can I optimize tax for my gemstone business?'"
                    className="min-h-[120px]"
                    {...form.register("query")}
                  />
                  {form.formState.errors.query && (
                    <p className="text-sm text-red-500">{form.formState.errors.query.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Legal Advice...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Scale className="h-4 w-4" />
                      <span>Get AI Legal Advice</span>
                    </div>
                  )}
                </Button>
              </form>

              {aiResponse && (
                <div className="mt-6">
                  <AIResponseFormatter response={aiResponse} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax-saving" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PiggyBank className="h-5 w-5" />
                <span>Tax Saving Strategies</span>
              </CardTitle>
              <CardDescription>
                Legitimate tax-saving strategies under Indian Income Tax Act
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaxSavingTips />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gst-rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-5 w-5" />
                <span>GST Rules for Gemstone Business</span>
              </CardTitle>
              <CardDescription>
                Important GST rules and rates applicable to gemstone and jewelry business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GSTRules />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>GST Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Monthly GSTR-1:</strong> File by 11th of next month
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>GSTR-3B:</strong> File by 20th of next month
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Annual GSTR-9:</strong> File by 31st December
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Income Tax Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Advance Tax:</strong> Pay in 4 installments
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>TDS:</strong> Deduct and deposit monthly
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Audit:</strong> Required if turnover exceeds ₹1 crore
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Important Legal Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Disclaimer:</strong> This AI assistant provides general guidance based on Indian tax laws. 
                  For specific legal advice, please consult a qualified Chartered Accountant or legal professional. 
                  Tax laws are subject to change, and individual circumstances may vary.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
