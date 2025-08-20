import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import ProtectedRoute from "@/components/auth/protected-route";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import MainLayout from "@/components/layout/main-layout";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Clients from "@/pages/clients";
import Suppliers from "@/pages/suppliers";
import Sales from "@/pages/sales";
import Certifications from "@/pages/certifications";
import Consultations from "@/pages/consultations";
import Finance from "@/pages/finance";
import AIAnalysis from "@/pages/ai-analysis";
import AstrologicalAI from "@/pages/astrological-ai";
import Tasks from "@/pages/tasks";
import Profile from "@/pages/profile";
import ValuationCalculator from "@/pages/valuation-calculator";
import ClientFollowUp from "@/pages/client-follow-up";
import InventoryIntelligence from "@/pages/inventory-intelligence";
import BulkPurchaseOptimizer from "@/pages/bulk-purchase-optimizer";
import DocsAndCompliance from "@/pages/docs-and-compliance";
import ReportingAnalytics from "@/pages/reporting-analytics";
import QualityComparison from "@/pages/quality-comparison";
import MarketPriceTracker from "@/pages/market-price-tracker";
import ScanFind from "@/pages/scan-find";
import CALegalAssistant from "@/pages/ca-legal-assistant";
import InvoicePrint from "@/pages/invoice-print";
import CompanySettings from "@/pages/company-settings";

function Router() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/inventory" element={
        <ProtectedRoute>
          <MainLayout>
            <Inventory />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/clients" element={
        <ProtectedRoute>
          <MainLayout>
            <Clients />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/suppliers" element={
        <ProtectedRoute>
          <MainLayout>
            <Suppliers />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/sales" element={
        <ProtectedRoute>
          <MainLayout>
            <Sales />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/certifications" element={
        <ProtectedRoute>
          <MainLayout>
            <Certifications />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/consultations" element={
        <ProtectedRoute>
          <MainLayout>
            <Consultations />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/finance" element={
        <ProtectedRoute>
          <MainLayout>
            <Finance />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/ai-analysis" element={
        <ProtectedRoute>
          <MainLayout>
            <AIAnalysis />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/astrological-ai" element={
        <ProtectedRoute>
          <MainLayout>
            <AstrologicalAI />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute>
          <MainLayout>
            <Tasks />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout>
            <Profile />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/valuation-calculator" element={
        <ProtectedRoute>
          <MainLayout>
            <ValuationCalculator />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/client-follow-up" element={
        <ProtectedRoute>
          <MainLayout>
            <ClientFollowUp />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/inventory-intelligence" element={
        <ProtectedRoute>
          <MainLayout>
            <InventoryIntelligence />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/bulk-optimizer" element={
        <ProtectedRoute>
          <MainLayout>
            <BulkPurchaseOptimizer />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/docs-compliance" element={
        <ProtectedRoute>
          <MainLayout>
            <DocsAndCompliance />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/reporting-analytics" element={
        <ProtectedRoute>
          <MainLayout>
            <ReportingAnalytics />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/quality-comparison" element={
        <ProtectedRoute>
          <MainLayout>
            <QualityComparison />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/market-price-tracker" element={
        <ProtectedRoute>
          <MainLayout>
            <MarketPriceTracker />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/scan-find" element={
        <ProtectedRoute>
          <MainLayout>
            <ScanFind />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/ca-legal-assistant" element={
        <ProtectedRoute>
          <MainLayout>
            <CALegalAssistant />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/invoice/print" element={<InvoicePrint />} />
      <Route path="/company-settings" element={
        <ProtectedRoute>
          <MainLayout>
            <CompanySettings />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
