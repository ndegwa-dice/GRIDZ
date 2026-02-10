import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Tournaments from "./pages/Tournaments";
import About from "./pages/About";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Dashboard imports
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Stats from "./pages/dashboard/Stats";
import DashboardTournaments from "./pages/dashboard/Tournaments";
import ProfilePage from "./pages/dashboard/Profile";
import Wallet from "./pages/dashboard/Wallet";
import Settings from "./pages/dashboard/Settings";

// Admin imports
import { AdminRoute } from "./components/AdminRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/Overview";
import AdminTournaments from "./pages/admin/Tournaments";
import AdminUsers from "./pages/admin/Users";
import AdminRoles from "./pages/admin/Roles";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/about" element={<About />} />
            
            {/* Dashboard routes - protected */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Overview />} />
              <Route path="stats" element={<Stats />} />
              <Route path="tournaments" element={<DashboardTournaments />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminOverview />} />
              <Route path="tournaments" element={<AdminTournaments />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="roles" element={<AdminRoles />} />
            </Route>
            
            {/* ADD CUSTOM ROUTES ABOVE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
