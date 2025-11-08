import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Award, Share2, Database, Shield } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track your environmental impact with interactive charts and detailed insights into your sustainability journey.",
  },
  {
    icon: Database,
    title: "Action Logging",
    description: "Record eco-friendly activities from recycling to renewable energy usage with just a few clicks.",
  },
  {
    icon: Award,
    title: "Achievements & Badges",
    description: "Earn recognition for your milestones and celebrate your commitment to the planet.",
  },
  {
    icon: Users,
    title: "Community Impact",
    description: "Join a global community of eco-warriors and see collective environmental achievements.",
  },
  {
    icon: Share2,
    title: "Shareable Reports",
    description: "Generate beautiful sustainability reports to share on social media or with your organization.",
  },
  {
    icon: Shield,
    title: "Verified Metrics",
    description: "Trust in accurate, science-backed calculations for all your environmental impact data.",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features to help you track, measure, and celebrate your environmental impact
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="bg-card border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
