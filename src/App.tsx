import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { ReportRunnerProvider } from "@/contexts/ReportRunnerContext";
import { ReportRunningOverlay } from "@/components/ReportRunningOverlay";
import { AppLayout } from "@/components/layout/AppLayout";
import { SessionRecorder } from "@/recording/SessionRecorder";
import { DownloadSessionButton } from "@/recording/DownloadSessionButton";

// Auth pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";

// App pages
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import ReportDetail from "./pages/ReportDetail";
import DataExplorer from "./pages/DataExplorer";
import Team from "./pages/Team";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppDataProvider>
          <ReportRunnerProvider>
            <Toaster />
            <Sonner />
            <ReportRunningOverlay />
            <BrowserRouter>
              <SessionRecorder />
              <DownloadSessionButton />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Protected routes */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/saved" element={<Reports />} />
              <Route path="/reports/archived" element={<Reports />} />
              <Route path="/reports/new" element={<ReportDetail />} />
              <Route path="/reports/:id" element={<ReportDetail />} />
              <Route path="/data-explorer" element={<DataExplorer />} />
              <Route path="/data/sources/connected" element={<DataExplorer />} />
              <Route path="/data/sources/pending" element={<DataExplorer />} />
              <Route path="/data/schemas" element={<DataExplorer />} />
              <Route path="/team" element={<Team />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/preferences" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/help" element={<Help />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
            </BrowserRouter>
          </ReportRunnerProvider>
        </AppDataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
