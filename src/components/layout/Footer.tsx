import { Link } from "react-router-dom";
import { BookOpen, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-hero">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-semibold text-foreground">
                TASSA GEO-ACADEMY
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md">
              Your trusted source for high-quality Geography past papers for Form 5 & 6. 
              Helping Tanzanian students excel in their studies with easy access to learning materials.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/materials" className="text-muted-foreground hover:text-primary transition-colors">
                  Materials
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                  Premium Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+255 756 377 013</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Tanzania</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TASSA GEO-ACADEMY. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for Tanzanian Students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
