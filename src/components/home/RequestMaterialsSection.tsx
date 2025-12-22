import { MessageCircle, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const RequestMaterialsSection = () => {
  const whatsappNumber = "255756377013";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hello! I would like to request study materials.`;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-6">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">More Than Geography</span>
          </div>
          
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Need More Study Materials?
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            We have a wide range of learning materials beyond Geography! Whether you need past papers, 
            notes, or study guides for other subjects, we're here to help Tanzanian students succeed. 
            Contact us to request any materials you need.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {["Physics", "Chemistry", "Biology", "Mathematics", "History", "Kiswahili"].map((subject) => (
              <span 
                key={subject}
                className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border px-3 py-1.5 text-sm text-muted-foreground"
              >
                <BookOpen className="h-3.5 w-3.5" />
                {subject}
              </span>
            ))}
            <span className="text-muted-foreground text-sm">& more...</span>
          </div>

          <Button size="lg" className="gap-2" asChild>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
              Request Materials on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RequestMaterialsSection;
