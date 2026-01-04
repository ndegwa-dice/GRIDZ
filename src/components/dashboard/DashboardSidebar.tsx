import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  BarChart3, 
  Trophy, 
  User, 
  Wallet, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface Profile {
  username: string | null;
  avatar_url: string | null;
  subscription_tier: string;
}

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/dashboard/stats", icon: BarChart3, label: "Statistics" },
  { to: "/dashboard/tournaments", icon: Trophy, label: "Tournaments" },
  { to: "/dashboard/profile", icon: User, label: "Profile" },
  { to: "/dashboard/wallet", icon: Wallet, label: "Wallet" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings" },
];

const adminItem = { to: "/dashboard/admin", icon: ShieldCheck, label: "Admin Panel" };

export const DashboardSidebar = ({ collapsed, onToggle }: DashboardSidebarProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("username, avatar_url, subscription_tier")
      .eq("user_id", user.id)
      .single();
    
    if (data) setProfile(data);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'pro': return 'text-primary';
      case 'elite': return 'text-neon-pink';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center w-full")}>
          <Gamepad2 className="h-8 w-8 text-primary flex-shrink-0" />
          {!collapsed && (
            <span className="text-xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              GRIDZ
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", collapsed && "hidden")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Collapse button when collapsed */}
      {collapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="mx-auto h-8 w-8 text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Profile Section */}
      <div className={cn("px-4 py-3", collapsed && "px-2")}>
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg bg-secondary/50",
          collapsed && "justify-center p-2"
        )}>
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "G"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {profile?.username || user?.email?.split('@')[0] || 'Gamer'}
              </p>
              <p className={cn("text-xs capitalize", getTierColor(profile?.subscription_tier || 'free'))}>
                {profile?.subscription_tier || 'Free'} Member
              </p>
            </div>
          )}
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.end 
            ? location.pathname === item.to 
            : location.pathname.startsWith(item.to);
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                isActive && "text-primary"
              )} />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {collapsed && (
                <span className="sr-only">{item.label}</span>
              )}
            </NavLink>
          );
        })}

        {/* Admin Link - Only visible to admins */}
        {isAdmin && (
          <>
            <Separator className="my-2 bg-border/50" />
            <NavLink
              to={adminItem.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                location.pathname === adminItem.to
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                collapsed && "justify-center px-2"
              )}
            >
              <adminItem.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                location.pathname === adminItem.to && "text-primary"
              )} />
              {!collapsed && (
                <span className="font-medium">{adminItem.label}</span>
              )}
              {collapsed && (
                <span className="sr-only">{adminItem.label}</span>
              )}
            </NavLink>
          </>
        )}
      </nav>

      <Separator className="bg-border/50" />

      {/* Sign Out */}
      <div className="p-2">
        <button
          onClick={signOut}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-colors text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
