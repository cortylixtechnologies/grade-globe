import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="mb-8 animate-float">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full gradient-hero">
            <MapPin className="h-12 w-12 text-primary-foreground" />
          </div>
        </div>
        
        <h1 className="font-display text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          Looks like you've wandered off the map! The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/materials">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Materials
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
