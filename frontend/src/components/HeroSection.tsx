import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Leaf, TrendingUp, Award } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <Leaf className="h-5 w-5" />
            <span className="text-sm font-medium">Track Your Environmental Impact</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your Journey to a
            <span className="block bg-gradient-to-r from-accent via-white to-accent bg-clip-text text-transparent">
              Greener Tomorrow
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-2xl mx-auto leading-relaxed">
            Monitor, record, and showcase your sustainability efforts. 
            Track carbon savings, celebrate achievements, and inspire change.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6 h-auto" asChild>
              <Link to="/projects">Start Tracking Impact</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 h-auto bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-primary"
              disabled
            >
              View Demo
            </Button>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <TrendingUp className="h-8 w-8 mb-3 mx-auto text-accent" />
              <div className="text-3xl font-bold mb-1">12.5K</div>
              <div className="text-sm text-white/80">Tons CO₂ Saved</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Leaf className="h-8 w-8 mb-3 mx-auto text-accent" />
              <div className="text-3xl font-bold mb-1">45.2K</div>
              <div className="text-sm text-white/80">Trees Planted</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Award className="h-8 w-8 mb-3 mx-auto text-accent" />
              <div className="text-3xl font-bold mb-1">8.7K</div>
              <div className="text-sm text-white/80">Active Users</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};
