import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Award, Clock } from "lucide-react";
import heroImage from "@/assets/hero-geography.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Geography world map"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20 md:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 mb-6 animate-fade-up">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">
              TASSA GEO-ACADEMY - Form 5 & 6
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Excel in Geography with Quality Past Papers
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Access comprehensive Geography past papers to boost your exam preparation. 
            Affordable, reliable, and designed for Tanzanian students.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="premium" size="xl" asChild>
              <Link to="/materials">
                Browse Materials
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground" asChild>
              <Link to="/login">Go Premium</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-primary-foreground mb-1">
                <BookOpen className="h-5 w-5" />
                <span className="font-display text-2xl md:text-3xl font-bold">100+</span>
              </div>
              <p className="text-sm text-primary-foreground/70">Past Papers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-primary-foreground mb-1">
                <Award className="h-5 w-5" />
                <span className="font-display text-2xl md:text-3xl font-bold">500+</span>
              </div>
              <p className="text-sm text-primary-foreground/70">Students</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-primary-foreground mb-1">
                <Clock className="h-5 w-5" />
                <span className="font-display text-2xl md:text-3xl font-bold">24/7</span>
              </div>
              <p className="text-sm text-primary-foreground/70">Access</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
