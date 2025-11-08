import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-12 md:p-16 text-white text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of individuals and organizations tracking their environmental impact and building a sustainable future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 h-auto bg-white text-primary hover:bg-white/90"
                asChild
              >
                <Link to="/projects">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="lg" 
                className="text-lg px-8 py-6 h-auto text-white hover:bg-white/10"
                asChild
              >
                <Link to="/dashboard">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
