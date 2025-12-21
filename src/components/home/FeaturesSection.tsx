import { Download, Shield, Clock, BookOpen, MessageCircle, Star } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Quality Materials",
    description: "Carefully curated past papers from trusted sources to help you prepare effectively.",
  },
  {
    icon: Download,
    title: "Instant Access",
    description: "Download materials immediately after payment confirmation. No waiting required.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Safe payment process via WhatsApp with manual verification for your protection.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Access materials anytime, anywhere. Study at your own pace and convenience.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Support",
    description: "Get help instantly through WhatsApp. We're always here to assist you.",
  },
  {
    icon: Star,
    title: "Affordable Pricing",
    description: "Budget-friendly options for all students. Pay per paper or get unlimited access.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose GeoPapers?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're committed to helping Tanzanian students succeed in their Geography exams.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group p-6 bg-card rounded-xl shadow-card hover:shadow-lg transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg gradient-hero group-hover:shadow-glow transition-shadow">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
