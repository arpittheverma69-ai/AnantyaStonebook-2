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
