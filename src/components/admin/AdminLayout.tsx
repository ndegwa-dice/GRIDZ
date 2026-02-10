import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex w-full overflow-hidden">
      <div className="fixed inset-0 gaming-mesh pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />
      
      <AdminSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-500 ease-out ${sidebarCollapsed ? 'ml-16' : 'ml-64'} relative z-10`}>
        <AdminHeader onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
