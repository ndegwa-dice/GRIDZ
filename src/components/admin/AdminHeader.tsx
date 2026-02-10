import { Menu, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

export const AdminHeader = ({ onMenuToggle }: AdminHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 h-16 bg-card/60 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-6">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-destructive/30 to-transparent" />

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-destructive" />
          <span className="text-sm font-semibold text-muted-foreground">Admin Panel</span>
        </div>
      </div>
    </header>
  );
};
