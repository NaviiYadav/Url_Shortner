import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MyUrls from "./pages/MyUrls";
import Analytics from "./pages/Analytics";
import QrCodes from "./pages/QrCodes";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUrls from "./pages/admin/AdminUrls";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="urls" element={<MyUrls />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="qr-codes" element={<QrCodes />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                
                {/* Admin Routes */}
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/users" element={<AdminUsers />} />
                <Route path="admin/urls" element={<AdminUrls />} />
                <Route path="admin/analytics" element={<AdminAnalytics />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
