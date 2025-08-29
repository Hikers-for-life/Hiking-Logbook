import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MapPin, Clock, TrendingUp } from 'lucide-react';
import heroImage from './assets/hero-mountain.jpg';

export const HeroSection = ({ onGetStarted }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            Track Your
            <span className="block bg-gradient-trail bg-clip-text text-transparent">
              Mountain Adventures
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Keep a digital logbook of your hikes, plan new adventures, and share
            your journey with fellow hikers. Turn every trail into a story worth
            remembering.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-trail text-primary-foreground shadow-mountain"
              onClick={onGetStarted}
            >
              Start Your Journey
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border bg-background/50 backdrop-blur-sm"
            >
              View Sample Log
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-slide-up">
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-elevation">
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 text-forest mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Track Routes
              </h3>
              <p className="text-muted-foreground">
                Log your hiking routes with GPS coordinates, elevation data, and
                detailed notes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-elevation">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-summit mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Plan Ahead
              </h3>
              <p className="text-muted-foreground">
                Schedule hikes, check weather conditions, and invite friends to
                join your adventures.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-elevation">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-trail mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Track Progress
              </h3>
              <p className="text-muted-foreground">
                Set goals, earn achievements, and visualize your hiking progress
                over time.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
