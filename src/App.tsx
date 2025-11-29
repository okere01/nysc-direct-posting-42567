import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Submissions from "./pages/Submissions";
import AdminSetup from "./pages/AdminSetup";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import NotificationHistory from "./pages/NotificationHistory";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminUsers from "./pages/admin/AdminUsers";
import HelpCenter from "./pages/HelpCenter";
import NotificationPreferences from "./pages/NotificationPreferences";
import AIChat from "./components/AIChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/submissions" element={<Submissions />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notification-history" element={<NotificationHistory />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/notification-preferences" element={<NotificationPreferences />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="submissions" element={<AdminSubmissions />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
          <Route path="/admin/setup" element={<AdminSetup />} />
          <Route path="/support" element={<Support />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIChat type="general" />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
