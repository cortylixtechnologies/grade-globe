import { Search, MessageCircle, Download, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Browse Materials",
    description: "Explore our collection of Geography past papers and find what you need.",
  },
  {
    icon: MessageCircle,
    step: "02",
    title: "Request via WhatsApp",
    description: "Click 'Request Access' to send a payment request through WhatsApp.",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Receive Access Code",
    description: "After payment confirmation, receive your unique access code via WhatsApp.",
  },
  {
    icon: Download,
    step: "04",
    title: "Download & Study",
    description: "Enter your code and download the material instantly. Start studying!",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting started is simple. Follow these easy steps to access your study materials.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="relative bg-card rounded-xl p-6 shadow-card hover:shadow-lg transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-6 gradient-hero text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Step {step.step}
                </div>
                
                <div className="mt-4 mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
