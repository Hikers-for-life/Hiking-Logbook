import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MapPin, Clock, TrendingUp } from 'lucide-react';
import heroImage from './assets/hero-mountain.jpg';

export const HeroSection = ({ onGetStarted, onViewSampleLog }) => {
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
              Elevation Adventures
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Keep a digital logbook of your hikes, plan new adventures, and share
            your journey with fellow hikers. Turn every trail into a story worth
            remembering.
          </p>

          <div className="flex justify-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-trail text-primary-foreground shadow-mountain font-semibold px-10 py-6 text-lg transition-all duration-300 hover:scale-105"
              style={{
                boxShadow: '0 0 40px rgba(185, 100, 20, 0.8), 0 0 80px rgba(22, 163, 74, 0.6), 0 0 120px rgba(185, 100, 20, 0.4)',
                animation: 'trail-glow 1.5s ease-in-out infinite, float 3s ease-in-out infinite'
              }}
              onClick={onGetStarted}
            >
              Start Your Journey
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

      <style>{`
        @keyframes trail-glow {
          0%, 100% {
            box-shadow: 0 0 40px rgba(185, 100, 20, 0.8), 0 0 80px rgba(22, 163, 74, 0.6), 0 0 120px rgba(185, 100, 20, 0.4);
            filter: brightness(1);
          }
          50% {
            box-shadow: 0 0 60px rgba(185, 100, 20, 1), 0 0 100px rgba(22, 163, 74, 0.8), 0 0 140px rgba(185, 100, 20, 0.6);
            filter: brightness(1.2);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </section>
  );
}
