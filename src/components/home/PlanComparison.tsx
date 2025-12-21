import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, MessageCircle, Crown, User } from "lucide-react";

const plans = [
  {
    name: "Basic",
    icon: User,
    price: "2,000",
    priceLabel: "TZS per material",
    description: "Pay only for what you need. Perfect for occasional users.",
    features: [
      { text: "No account required", included: true },
      { text: "Pay per material", included: true },
      { text: "Access via codes", included: true },
      { text: "Download materials instantly", included: true },
      { text: "Unlimited downloads", included: false },
      { text: "Priority support", included: false },
    ],
    variant: "basic" as const,
    buttonText: "Request Access",
    buttonLink: "/materials",
  },
  {
    name: "Premium",
    icon: Crown,
    price: "5,000",
    priceLabel: "TZS / 3 months",
    description: "Full access to all materials. Best for serious students.",
    features: [
      { text: "Access ALL materials", included: true },
      { text: "Valid for 3 months", included: true },
      { text: "No access codes needed", included: true },
      { text: "Unlimited downloads", included: true },
      { text: "Priority support", included: true },
      { text: "New materials first", included: true },
    ],
    variant: "premium" as const,
    buttonText: "Go Premium",
    buttonLink: "/login",
    popular: true,
  },
];

const PlanComparison = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you need one paper or unlimited access, we have a plan that fits your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative shadow-card hover:shadow-lg transition-all duration-300 ${
                plan.popular ? "border-2 border-accent ring-2 ring-accent/20" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="gradient-premium text-premium-foreground text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${
                  plan.variant === "premium" ? "gradient-premium" : "gradient-basic"
                }`}>
                  <plan.icon className={`h-7 w-7 ${
                    plan.variant === "premium" ? "text-premium-foreground" : "text-basic-foreground"
                  }`} />
                </div>
                <CardTitle className="font-display text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-2">{plan.priceLabel}</span>
                </div>

                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      {feature.included ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                          <X className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button variant={plan.variant} size="lg" className="w-full" asChild>
                  <Link to={plan.buttonLink}>
                    {plan.variant === "basic" && <MessageCircle className="h-4 w-4 mr-2" />}
                    {plan.buttonText}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="font-display text-2xl font-bold text-foreground text-center mb-8">
            Quick Comparison
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-card rounded-xl shadow-card overflow-hidden">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                  <th className="text-center p-4 font-semibold text-basic">Basic</th>
                  <th className="text-center p-4 font-semibold text-accent">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-foreground">Price</td>
                  <td className="p-4 text-center text-muted-foreground">2,000 TZS / material</td>
                  <td className="p-4 text-center text-muted-foreground">5,000 TZS / 3 months</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-foreground">Account Required</td>
                  <td className="p-4 text-center"><X className="h-5 w-5 mx-auto text-muted-foreground" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 mx-auto text-primary" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-foreground">Access Method</td>
                  <td className="p-4 text-center text-muted-foreground">Access Codes</td>
                  <td className="p-4 text-center text-muted-foreground">Direct Download</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-foreground">All Materials</td>
                  <td className="p-4 text-center"><X className="h-5 w-5 mx-auto text-muted-foreground" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 mx-auto text-primary" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-foreground">Best For</td>
                  <td className="p-4 text-center text-muted-foreground">Occasional Users</td>
                  <td className="p-4 text-center text-muted-foreground">Serious Students</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanComparison;
