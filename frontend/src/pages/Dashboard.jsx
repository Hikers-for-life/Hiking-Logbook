import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Navigation } from '../components/ui/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Mountain,
  MapPin,
  Calendar,
  Trophy,
  TrendingUp,
  User,
  Plus,
  Map,
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser, getUserProfile } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (!profile) {
          // Fallback to basic user info if profile not found
          const fallbackProfile = {
            displayName: currentUser.displayName || 'Hiker',
            bio: 'Passionate hiker exploring new trails',
            location: 'Mountain View, CA',
            preferences: { difficulty: 'intermediate', terrain: 'mountain' },
            stats: {
              totalHikes: 0,
              totalDistance: 0,
              totalElevation: 0,
              achievements: [],
            },
          };
          setUserProfile(fallbackProfile);
        } else {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Set fallback profile on error
        const fallbackProfile = {
          displayName: currentUser.displayName || 'Hiker',
          bio: 'Passionate hiker exploring new trails',
          location: 'Mountain View, CA',
          preferences: { difficulty: 'intermediate', terrain: 'mountain' },
          stats: {
            totalHikes: 0,
            totalDistance: 0,
            totalElevation: 0,
            achievements: [],
          },
        };
        setUserProfile(fallbackProfile);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadProfile();
    }
  }, [currentUser, getUserProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            Please log in to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back,{' '}
            {userProfile?.displayName || currentUser?.displayName || 'Hiker'}!
            🏔️
          </h1>
          <p className="text-muted-foreground mt-2">
            Ready for your next adventure? Let's see what you've accomplished.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hikes</CardTitle>
              <Mountain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userProfile?.stats?.totalHikes || 0}
              </div>
              <p className="text-xs text-muted-foreground">Hikes completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Distance
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userProfile?.stats?.totalDistance || 0} km
              </div>
              <p className="text-xs text-muted-foreground">Distance covered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Elevation
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userProfile?.stats?.totalElevation || 0} m
              </div>
              <p className="text-xs text-muted-foreground">Elevation gained</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Achievements
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userProfile?.stats?.achievements?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Badges earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Log New Hike
              </CardTitle>
              <CardDescription>
                Record your latest hiking adventure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Start Logging
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Plan Hike
              </CardTitle>
              <CardDescription>Schedule your next hiking trip</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Plan Trip
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-purple-600" />
                Explore Trails
              </CardTitle>
              <CardDescription>Discover new hiking trails</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Browse Trails
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Profile Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Hikes */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Hikes</CardTitle>
              <CardDescription>Your latest hiking adventures</CardDescription>
            </CardHeader>
            <CardContent>
              {userProfile?.stats?.totalHikes > 0 ? (
                <div className="space-y-4">
                  {/* Placeholder for recent hikes */}
                  <div className="text-center py-8 text-muted-foreground">
                    <Mountain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent hikes to display</p>
                    <p className="text-sm">
                      Start logging your hikes to see them here!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mountain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hikes logged yet</p>
                  <p className="text-sm">Time to start your hiking journey!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your hiking preferences and details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Display Name
                </label>
                <p className="text-foreground">
                  {userProfile?.displayName || 'Not set'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Location
                </label>
                <p className="text-foreground">
                  {userProfile?.location || 'Not specified'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Bio
                </label>
                <p className="text-foreground">
                  {userProfile?.bio || 'No bio added yet'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Difficulty Preference
                </label>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {userProfile?.preferences?.difficulty || 'Not set'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Terrain Preference
                </label>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {userProfile?.preferences?.terrain || 'Not set'}
                  </Badge>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Achievements
              </CardTitle>
              <CardDescription>
                Badges and milestones you've earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userProfile?.stats?.achievements?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {userProfile.stats.achievements.map((achievement, index) => (
                    <div key={index} className="text-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Trophy className="h-8 w-8 text-yellow-600" />
                      </div>
                      <p className="text-sm font-medium">{achievement}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No achievements yet</p>
                  <p className="text-sm">Complete hikes to earn badges!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
