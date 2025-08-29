import { Card, CardContent } from './ui/card';
import {
  Users,
  Trophy,
  Calendar,
  MapPin,
  Camera,
  TrendingUp,
} from 'lucide-react';
import hikersImage from './assets/hikers-group.jpg';
import appPreviewImage from './assets/app-preview.jpg';

const features = [
  {
    icon: Calendar,
    title: 'Plan Your Adventures',
    description:
      'Schedule hikes, check weather conditions, and create detailed itineraries for your outdoor adventures.',
    color: 'text-summit',
  },
  {
    icon: Users,
    title: 'Connect with Friends',
    description:
      'Share your hiking experiences, invite friends to join your adventures, and discover new trails together.',
    color: 'text-forest',
  },
  {
    icon: Trophy,
    title: 'Track Achievements',
    description:
      'Set personal goals, earn badges, and celebrate milestones as you progress on your hiking journey.',
    color: 'text-trail',
  },
  {
    icon: Camera,
    title: 'Capture Memories',
    description:
      'Document your experiences with photos, notes, and detailed logs of every trail you conquer.',
    color: 'text-meadow',
  },
  {
    icon: MapPin,
    title: 'GPS Integration',
    description:
      'Track your routes with precision, save waypoints, and navigate trails with confidence.',
    color: 'text-stone',
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    description:
      'Visualize your hiking statistics, track improvements, and analyze your outdoor activity patterns.',
    color: 'text-summit',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for Your Hiking Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From planning your next adventure to tracking your progress, Hiking
            Log provides all the tools you need to make the most of your outdoor
            experiences.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border hover:shadow-elevation transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Image Showcase */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Join a Community of Adventurers
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Connect with fellow hikers from around the world. Share your
              experiences, discover new trails, and find hiking partners for
              your next adventure. Our community welcomes everyone from weekend
              warriors to seasoned mountaineers.
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <Users className="h-5 w-5 text-forest mr-2 mt-0.5 flex-shrink-0" />
                Share photos and stories from your hikes
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-forest mr-2 mt-0.5 flex-shrink-0" />
                Discover hidden gems and popular trails
              </li>
              <li className="flex items-start">
                <Trophy className="h-5 w-5 text-forest mr-2 mt-0.5 flex-shrink-0" />
                Celebrate achievements and milestones together
              </li>
            </ul>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative rounded-lg overflow-hidden shadow-mountain">
              <img
                src={hikersImage}
                alt="Diverse group of hikers enjoying nature"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
          </div>
        </div>

        {/* App Preview */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mt-20">
          <div>
            <div className="relative rounded-lg overflow-hidden shadow-mountain">
              <img
                src={appPreviewImage}
                alt="Hiking Log app interface on smartphone"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
          </div>

          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Take Your Adventures Anywhere
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Access your hiking logs from any device, whether you're planning
              your next adventure from home or logging your current hike from
              the trail. Our responsive design ensures a seamless experience
              across all your devices.
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <Camera className="h-5 w-5 text-trail mr-2 mt-0.5 flex-shrink-0" />
                Log hikes in real-time with GPS tracking
              </li>
              <li className="flex items-start">
                <TrendingUp className="h-5 w-5 text-trail mr-2 mt-0.5 flex-shrink-0" />
                View detailed analytics and progress charts
              </li>
              <li className="flex items-start">
                <Calendar className="h-5 w-5 text-trail mr-2 mt-0.5 flex-shrink-0" />
                Plan and schedule future hiking adventures
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
