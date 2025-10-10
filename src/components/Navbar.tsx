import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Gamepad2 } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <Gamepad2 className="w-8 h-8 text-primary group-hover:animate-float" />
            <span className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              GRIDZ
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/tournaments" className="text-sm font-medium hover:text-primary transition-colors">
              Tournaments
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="hero" size="sm">
                Join GRIDZ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
