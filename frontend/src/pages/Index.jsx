import { Navigation } from "../components/ui/navigation";
import { HeroSection } from "../components/hero-section.jsx";
import { LogbookSection } from "../components/logbook-section";
import { FeaturesSection } from "../components/features-section";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <LogbookSection />
      <FeaturesSection />
    </div>
  );
};

export default Index;