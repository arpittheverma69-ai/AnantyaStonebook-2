import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { companyProfileService, type CompanyProfile } from "@/lib/company-profile";
import { Save, Building2, FileText, Truck, CreditCard } from "lucide-react";

export default function CompanySettings() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<CompanyProfile>(companyProfileService.get());

  const handleSave = () => {
    companyProfileService.save(profile);
    toast({
      title: "Settings Saved",
      description: "Company profile has been updated successfully.",
    });
  };

  const handleReset = () => {
    const defaultProfile = companyProfileService.get();
    setProfile(defaultProfile);
    toast({
      title: "Settings Reset",
      description: "Company profile has been reset to defaults.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company Settings</h1>
          <p className="text-muted-foreground">Configure your company details and invoice settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-purple-600">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={profile.companyName}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                placeholder="ANANTYA STONEWORKS"
              />
            </div>
            <div>
              <Label htmlFor="companyTagline">Company Tagline</Label>
              <Input
                id="companyTagline"
                value={profile.companyTagline}
                onChange={(e) => setProfile({ ...profile, companyTagline: e.target.value })}
                placeholder="Premium Gemstone Solutions"
              />
            </div>
            <div>
              <Label htmlFor="companyAddress">Company Address</Label>
              <Textarea
                id="companyAddress"
                value={profile.companyAddressLines.join('\n')}
                onChange={(e) => setProfile({ 
                  ...profile, 
                  companyAddressLines: e.target.value.split('\n').filter(line => line.trim()) 
                })}
                placeholder="123 Gemstone Plaza, Jewelry District\nMumbai, Maharashtra - 400001"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyPhone">Phone</Label>
                <Input
                  id="companyPhone"
                  value={profile.companyPhone}
                  onChange={(e) => setProfile({ ...profile, companyPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="companyEmail">Email</Label>
                <Input
                  id="companyEmail"
                  value={profile.companyEmail}
                  onChange={(e) => setProfile({ ...profile, companyEmail: e.target.value })}
                  placeholder="info@anantya.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyGstin">GSTIN</Label>
                <Input
                  id="companyGstin"
                  value={profile.companyGstin}
                  onChange={(e) => setProfile({ ...profile, companyGstin: e.target.value })}
                  placeholder="27AABCA1234Z1Z5"
                />
              </div>
              <div>
                <Label htmlFor="companyPan">PAN</Label>
                <Input
                  id="companyPan"
                  value={profile.companyPan}
                  onChange={(e) => setProfile({ ...profile, companyPan: e.target.value })}
                  placeholder="AABCA1234Z"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buyersOrderNumber">Default Buyer's Order No.</Label>
                <Input
                  id="buyersOrderNumber"
                  value={profile.buyersOrderNumber}
                  onChange={(e) => setProfile({ ...profile, buyersOrderNumber: e.target.value })}
                  placeholder="PO-2025-001"
                />
              </div>
              <div>
                <Label htmlFor="buyersOrderDate">Default Order Date</Label>
                <Input
                  id="buyersOrderDate"
                  value={profile.buyersOrderDate}
                  onChange={(e) => setProfile({ ...profile, buyersOrderDate: e.target.value })}
                  placeholder="2025-08-15"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dispatchDocNo">Default Dispatch Doc No.</Label>
                <Input
                  id="dispatchDocNo"
                  value={profile.dispatchDocNo}
                  onChange={(e) => setProfile({ ...profile, dispatchDocNo: e.target.value })}
                  placeholder="DISP-2025-089"
                />
              </div>
              <div>
                <Label htmlFor="deliveryNoteDate">Default Delivery Note Date</Label>
                <Input
                  id="deliveryNoteDate"
                  value={profile.deliveryNoteDate}
                  onChange={(e) => setProfile({ ...profile, deliveryNoteDate: e.target.value })}
                  placeholder="2025-08-20"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dispatchedThrough">Default Dispatched Through</Label>
              <Input
                id="dispatchedThrough"
                value={profile.dispatchedThrough}
                onChange={(e) => setProfile({ ...profile, dispatchedThrough: e.target.value })}
                placeholder="Courier / Hand Delivery / Transport"
              />
            </div>
            <div>
              <Label htmlFor="destination">Default Destination</Label>
              <Input
                id="destination"
                value={profile.destination}
                onChange={(e) => setProfile({ ...profile, destination: e.target.value })}
                placeholder="Mumbai / Delhi / Bangalore"
              />
            </div>
            <div>
              <Label htmlFor="termsOfDelivery">Default Terms of Delivery</Label>
              <Input
                id="termsOfDelivery"
                value={profile.termsOfDelivery}
                onChange={(e) => setProfile({ ...profile, termsOfDelivery: e.target.value })}
                placeholder="As discussed / FOB / CIF / Ex-factory"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment & Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment & Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                value={profile.paymentTerms}
                onChange={(e) => setProfile({ ...profile, paymentTerms: e.target.value })}
                placeholder="Net 30 / Immediate / 50% Advance"
              />
            </div>
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={profile.bankName}
                onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                placeholder="HDFC Bank"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankAccount">Account Number</Label>
                <Input
                  id="bankAccount"
                  value={profile.bankAccount}
                  onChange={(e) => setProfile({ ...profile, bankAccount: e.target.value })}
                  placeholder="123456789012"
                />
              </div>
              <div>
                <Label htmlFor="bankIfsc">IFSC Code</Label>
                <Input
                  id="bankIfsc"
                  value={profile.bankIfsc}
                  onChange={(e) => setProfile({ ...profile, bankIfsc: e.target.value })}
                  placeholder="HDFC0000123"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bankBranch">Branch</Label>
              <Input
                id="bankBranch"
                value={profile.bankBranch}
                onChange={(e) => setProfile({ ...profile, bankBranch: e.target.value })}
                placeholder="Fort Branch"
              />
            </div>
          </CardContent>
        </Card>

        {/* Reference Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Reference Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="referenceNumber">Reference Number</Label>
                <Input
                  id="referenceNumber"
                  value={profile.referenceNumber}
                  onChange={(e) => setProfile({ ...profile, referenceNumber: e.target.value })}
                  placeholder="REF-001"
                />
              </div>
              <div>
                <Label htmlFor="referenceDate">Reference Date</Label>
                <Input
                  id="referenceDate"
                  value={profile.referenceDate}
                  onChange={(e) => setProfile({ ...profile, referenceDate: e.target.value })}
                  placeholder="2025-08-15"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="otherReferences">Other References</Label>
              <Input
                id="otherReferences"
                value={profile.otherReferences}
                onChange={(e) => setProfile({ ...profile, otherReferences: e.target.value })}
                placeholder="OR-001"
              />
            </div>
            <div>
              <Label htmlFor="deliveryNote">Delivery Note</Label>
              <Input
                id="deliveryNote"
                value={profile.deliveryNote}
                onChange={(e) => setProfile({ ...profile, deliveryNote: e.target.value })}
                placeholder="DN-001"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 How to Use These Settings:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>Default values</strong> will be used for all new invoices</li>
          <li>• <strong>Buyer's Order No.</strong>: Customer's purchase order number (e.g., "PO-2025-001")</li>
          <li>• <strong>Dispatch Doc No.</strong>: Your internal dispatch number (e.g., "DISP-2025-089")</li>
          <li>• <strong>Dispatched through</strong>: Transport method (e.g., "Courier", "Hand Delivery")</li>
          <li>• <strong>Destination</strong>: Delivery location (e.g., "Mumbai", "Delhi")</li>
          <li>• <strong>Terms of Delivery</strong>: Delivery conditions (e.g., "As discussed", "FOB")</li>
        </ul>
      </div>
    </div>
  );
}
