import { NavLink, useLocation } from "react-router-dom";
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
  Sparkles,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview", end: true, color: "neon-cyan" },
  { to: "/dashboard/stats", icon: BarChart3, label: "Statistics", color: "neon-green" },
  { to: "/dashboard/tournaments", icon: Trophy, label: "Tournaments", color: "primary" },
  { to: "/dashboard/profile", icon: User, label: "Profile", color: "neon-pink" },
  { to: "/dashboard/wallet", icon: Wallet, label: "Wallet", color: "neon-cyan" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings", color: "muted-foreground" },
];

export const DashboardSidebar = ({ collapsed, onToggle }: DashboardSidebarProps) => {
  const location = useLocation();
  const { profile } = useProfile();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const displayName = profile?.username || user?.email?.split("@")[0] || "Gamer";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col transition-all duration-500 ease-out z-50",
        "bg-gradient-to-b from-card/95 to-background/95 backdrop-blur-xl",
        "border-r border-border/50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Logo */}
      <div className="p-4 flex items-center justify-between">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/30 rounded-lg blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Gamepad2 className="h-6 w-6 text-primary" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold bg-gradient-gold bg-clip-text text-transparent tracking-tight">
                GRIDZ
              </span>
              <Sparkles className="h-3 w-3 text-primary/60" />
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all",
            collapsed && "hidden"
          )}
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
          className="mx-auto h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50 mb-2 transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Profile Section */}
      <div className={cn("px-3 py-3", collapsed && "px-2")}>
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
          "bg-gradient-to-br from-secondary/60 to-secondary/30",
          "border border-border/50 hover:border-primary/30",
          "group cursor-pointer",
          collapsed && "justify-center p-2"
        )}>
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-primary/30 ring-2 ring-primary/10 ring-offset-2 ring-offset-background transition-all group-hover:ring-primary/30">
              <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-neon-green rounded-full border-2 border-background" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-foreground">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs px-2 py-0.5 rounded-full capitalize font-medium bg-muted/30 text-muted-foreground border border-border">
                  {profile?.subscription_tier || "Free"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider with gradient */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {navItems.map((item, index) => {
          const isActive = item.end 
            ? location.pathname === item.to 
            : location.pathname.startsWith(item.to);
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={{ animationDelay: `${index * 50}ms` }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                "animate-slide-up opacity-0",
                isActive
                  ? "bg-primary/10 text-primary shadow-lg shadow-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                collapsed && "justify-center px-2"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
              
              {/* Hover glow effect */}
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                "bg-gradient-to-r from-primary/5 to-transparent"
              )} />
              
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-all duration-300 relative z-10",
                isActive ? "text-primary" : "group-hover:text-primary/80"
              )} />
              {!collapsed && (
                <span className="font-medium relative z-10">{item.label}</span>
              )}
              {collapsed && (
                <span className="sr-only">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Admin link */}
      {isAdmin && (
        <div className="px-2 pb-4">
          <NavLink
            to="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-destructive hover:bg-destructive/10",
              collapsed && "justify-center px-2"
            )}
          >
            <Shield className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Admin Panel</span>}
          </NavLink>
        </div>
      )}
      
      {/* Decorative bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
    </aside>
  );
};
