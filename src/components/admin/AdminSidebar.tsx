import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/admin/tournaments", icon: Trophy, label: "Tournaments" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/roles", icon: Shield, label: "Roles" },
];

export const AdminSidebar = ({ collapsed, onToggle }: AdminSidebarProps) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col transition-all duration-500 ease-out z-50",
        "bg-gradient-to-b from-card/95 to-background/95 backdrop-blur-xl",
        "border-r border-border/50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-destructive/50 to-transparent" />

      {/* Logo */}
      <div className="p-4 flex items-center justify-between">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          <div className="relative group">
            <div className="absolute inset-0 bg-destructive/30 rounded-lg blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative p-2 rounded-lg bg-gradient-to-br from-destructive/20 to-destructive/5 border border-destructive/20">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent tracking-tight">
                ADMIN
              </span>
              <Sparkles className="h-3 w-3 text-destructive/60" />
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {collapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="mx-auto h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50 mb-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
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
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
              <div
                className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  "bg-gradient-to-r from-primary/5 to-transparent"
                )}
              />
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-all duration-300 relative z-10",
                  isActive ? "text-primary" : "group-hover:text-primary/80"
                )}
              />
              {!collapsed && <span className="font-medium relative z-10">{item.label}</span>}
              {collapsed && <span className="sr-only">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Back to dashboard */}
      <div className="px-2 pb-4">
        <NavLink
          to="/dashboard"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-muted-foreground hover:text-foreground hover:bg-secondary/50",
            collapsed && "justify-center px-2"
          )}
        >
          <ArrowLeft className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Back to Dashboard</span>}
        </NavLink>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
    </aside>
  );
};
