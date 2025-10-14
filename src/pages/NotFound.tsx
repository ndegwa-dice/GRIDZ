import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-8xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-4">
              404
            </h1>
            <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
            <p className="text-xl text-muted-foreground mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/">
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
            </Button>
            <Button variant="neon" size="lg" asChild>
              <Link to="/tournaments">
                <Search className="mr-2 h-5 w-5" />
                View Tournaments
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
