
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-8 py-12 rounded-lg glass-effect animate-slide-up text-center">
        <h1 className="text-6xl font-light mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page not found</p>
        <Button asChild className="button-effect">
          <a href="/" className="inline-flex items-center gap-2">
            <HomeIcon className="h-4 w-4" />
            Return Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
