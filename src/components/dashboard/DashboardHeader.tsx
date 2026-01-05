import { useNavigate } from "react-router-dom";
import { Bell, Menu, Search, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  onMenuToggle: () => void;
}

export const DashboardHeader = ({ onMenuToggle }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 h-16 bg-card/60 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-6 transition-all">
      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      
      {/* Left side */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Search */}
        <div className="hidden md:flex relative group">
          <div className="absolute inset-0 bg-primary/5 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Search tournaments, players..."
            className="pl-10 w-72 bg-secondary/30 border-border/50 rounded-xl focus:border-primary/50 focus:bg-secondary/50 transition-all"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Quick Action */}
        <Button 
          size="sm" 
          className="hidden sm:flex bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-glow-gold transition-all duration-300 rounded-xl gap-2 group"
          onClick={() => navigate("/tournaments")}
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          <span>Join Tournament</span>
          <Sparkles className="h-3 w-3 opacity-60" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-all group"
            >
              <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full animate-pulse" />
              <span className="absolute top-1 right-1 h-3 w-3 bg-primary/30 rounded-full animate-ping" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-80 bg-card/95 backdrop-blur-xl border-border/50 rounded-xl shadow-2xl"
          >
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <span className="text-xs text-muted-foreground">0 new</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <div className="py-8 text-center">
              <div className="relative inline-block">
                <Bell className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-primary/50" />
              </div>
              <p className="text-sm text-muted-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground/60 mt-1">No new notifications</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};