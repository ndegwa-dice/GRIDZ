import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { Loader2, Gamepad2 } from "lucide-react";

export const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center gaming-mesh">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse-ring" />
            <Gamepad2 className="h-16 w-16 text-primary mx-auto mb-4 animate-float relative z-10" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Loading your arena...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex w-full overflow-hidden">
      {/* Animated background mesh */}
      <div className="fixed inset-0 gaming-mesh pointer-events-none" />
      
      {/* Animated gradient orbs */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed top-1/2 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-500 ease-out ${sidebarCollapsed ? 'ml-16' : 'ml-64'} relative z-10`}>
        <DashboardHeader onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};