import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Navigation } from '../components/ui/navigation';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { hikeApiService } from '../services/hikeApiService.js';
import { achievementApiService } from '../services/achievementApiService.js';
import RecentAchievements from '../components/RecentAchievements';

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
  Plus,
  Map,
  Clock,
  Compass,
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser, getUserProfile } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [recentHikes, setRecentHikes] = useState([]);
  const [hikeStats, setHikeStats] = useState({
    totalHikes: 0,
    totalDistance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hikesLoading, setHikesLoading] = useState(true);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);

  // Set page title
  usePageTitle('Dashboard');

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/users/${currentUser.uid}`
        );
        if (!res.ok) {
          const fallbackProfile = {
            displayName: currentUser.displayName || 'Hiker',
            bio: 'Passionate hiker exploring new trails',
            location: 'Mountain View, CA',
            preferences: { difficulty: 'intermediate', terrain: 'mountain' },
          };
          setUserProfile(fallbackProfile);
        } else {
          const profile = await res.json();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        const fallbackProfile = {
          displayName: currentUser.displayName || 'Hiker',
          bio: 'Passionate hiker exploring new trails',
          location: 'Mountain View, CA',
          preferences: { difficulty: 'intermediate', terrain: 'mountain' },
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

  // Load recent hikes and calculate statistics
  useEffect(() => {
    const loadHikesAndStats = async () => {
      if (!currentUser) return;

      try {
        setHikesLoading(true);

        const result = await hikeApiService.getHikes();
        const hikes = result.data || result;

        // Calculate statistics from all hikes
        const stats = {
          totalHikes: hikes.length,
          totalDistance: 0,
        };

        // Calculate totals from all hikes
        hikes.forEach((hike) => {
          const distance =
            parseFloat(hike.distance) || parseFloat(hike.totalDistance) || 0;
          stats.totalDistance += distance;
        });

        // Round the totals to reasonable decimal places
        stats.totalDistance = parseFloat(stats.totalDistance.toFixed(1));

        setHikeStats(stats);

        // Process the hikes for recent hikes display
        const processedHikes = hikes
          .map((hike) => {
            let jsDate;

            // Handle different date formats
            if (hike.date?._seconds !== undefined) {
              jsDate = new Date(hike.date._seconds * 1000);
            } else if (typeof hike.date === 'string') {
              jsDate = new Date(hike.date);
            } else if (hike.date instanceof Date) {
              jsDate = hike.date;
            } else {
              jsDate = new Date();
            }

            return {
              ...hike,
              jsDate,
              formattedDate: jsDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
            };
          })
          .sort((a, b) => b.jsDate - a.jsDate)
          .slice(0, 6);

        setRecentHikes(processedHikes);
      } catch (error) {
        console.error('Error loading hikes and stats:', error);
        setRecentHikes([]);
      } finally {
        setHikesLoading(false);
      }
    };

    if (currentUser) {
      loadHikesAndStats();
    }
  }, [currentUser, userProfile]);

  // Load recent achievements
  // Load recent achievements
useEffect(() => {
  const loadRecentAchievements = async () => {
    if (!currentUser) return;

    try {
      setAchievementsLoading(true);
      
      const response = await achievementApiService.getBadges();
      const badges = response.data || [];
      
      // Filter badges that have earnedDate (earned badges)
      const earnedBadges = badges.filter(badge => {
        // A badge is earned if it has an earnedDate or progress is 100
        return badge.earnedDate || badge.progress === 100;
      });
      
      console.log('🏆 Earned badges found:', earnedBadges);
      
      // Sort by most recent earnedDate
      const sortedBadges = earnedBadges
        .sort((a, b) => {
          const dateA = new Date(a.earnedDate);
          const dateB = new Date(b.earnedDate);
          return dateB - dateA; // Most recent first
        })
        .slice(0, 3); // Get top 3 most recent
      
      console.log('🎯 Recent achievements to display:', sortedBadges);
      setRecentAchievements(sortedBadges);
    } catch (error) {
      console.error('❌ Error loading recent achievements:', error);
      setRecentAchievements([]);
    } finally {
      setAchievementsLoading(false);
    }
  };

  loadRecentAchievements();
}, [currentUser]);

  // Navigation handlers
  const handleStartLogging = () => {
    navigate('/logbook');
  };

  const handlePlanTrip = () => {
    navigate('/hike-planner');
  };

  const handleExploreTrails = () => {
    navigate('/trail-explorer');
  };

  // Conditional returns AFTER all hooks
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
            <span className="text-forest">
              {userProfile?.displayName || currentUser?.displayName || 'Hiker'}
            </span>
            !
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Ready for your next adventure? Let's see what you've accomplished.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hikes</CardTitle>
              <Mountain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hikesLoading ? '...' : hikeStats.totalHikes}
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
                {hikesLoading ? '...' : `${parseFloat(hikeStats.totalDistance.toFixed(1))} km`}
              </div>
              <p className="text-xs text-muted-foreground">Distance covered</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleStartLogging}
          >
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

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handlePlanTrip}
          >
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

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleExploreTrails}
          >
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

        {/* Recent Hikes */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mountain className="h-5 w-5 text-forest" />
                Recent Hikes
              </CardTitle>
              <CardDescription>Your latest hiking adventures</CardDescription>
            </CardHeader>
            <CardContent>
              {hikesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading recent hikes...
                  </p>
                </div>
              ) : recentHikes.length > 0 ? (
                <div className="space-y-4">
                  {recentHikes.map((hike) => {
                    let formattedDate = 'Unknown date';
                    if (hike.date?._seconds !== undefined) {
                      const jsDate = new Date(hike.date._seconds * 1000);
                      formattedDate = jsDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                    } else if (hike.formattedDate) {
                      formattedDate = hike.formattedDate;
                    }

                    const getDifficultyVariant = (difficulty) => {
                      const diff = difficulty?.toLowerCase();
                      if (diff === 'hard' || diff === 'difficult')
                        return 'destructive';
                      if (diff === 'medium' || diff === 'moderate')
                        return 'default';
                      return 'secondary';
                    };

                    return (
                      <div
                        key={hike.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg bg-muted gap-3"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-sm sm:text-base">
                            {hike.name || hike.title || 'Unnamed Hike'}
                          </h4>
                          <div className="grid grid-cols-2 sm:flex sm:items-center sm:gap-4 mt-2 gap-2">
                            <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{formattedDate}</span>
                            </span>
                            <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                              <Compass className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {(
                                  parseFloat(
                                    hike.distance || hike.totalDistance
                                  ) || 0
                                ).toFixed(1)}{' '}
                                km
                              </span>
                            </span>
                            <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {hike.duration ||
                                  hike.estimatedDuration ||
                                  'N/A'}
                              </span>
                            </span>
                            {hike.location && (
                              <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 col-span-2 sm:col-span-1">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                  {hike.location}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={getDifficultyVariant(hike.difficulty)}
                          className="text-xs self-start sm:self-center"
                        >
                          {hike.difficulty || 'Unknown'}
                        </Badge>
                      </div>
                    );
                  })}
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
        </div>

        {/* Recent Achievements Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Recent Achievements
              </CardTitle>
              <CardDescription>
                Latest badges and milestones you've earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentAchievements 
                achievements={recentAchievements} 
                loading={achievementsLoading}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;