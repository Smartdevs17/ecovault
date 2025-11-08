import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { ImpactMetrics } from "@/components/ImpactMetrics";
import { FeaturesSection } from "@/components/FeaturesSection";
import { CTASection } from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ImpactMetrics />
      <FeaturesSection />
      <CTASection />
    </div>
  );
};

export default Index;
