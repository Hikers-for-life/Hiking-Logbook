import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useEffect, useState, useCallback } from 'react';
import { getUserHikeCount } from '../../services/userServices';
import { getUserProfile } from '../../services/userServices';
import { hikeApiService } from '../../services/hikeApiService.js';
import { getUserStats } from '../../services/statistics';
import { achievementApiService } from '../../services/achievementApiService';
import { goalsApi } from '../../services/goalsApiService';

import {
  MapPin,
  Mountain,
  UserPlus,
  Target,
  Clock,
  Calendar,
  Award,
  Medal,
  TrendingUp,
  Trophy,
  ChevronRight,
} from 'lucide-react';

function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date)) return 'Unknown';

  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();

  // Add ordinal suffix (st, nd, rd, th)
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';

  return `${month} ${day}${suffix}, ${year}`;
}

export const ProfileView = ({ open, onOpenChange, showAddFriend = false }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [recentHikes, setRecentHikes] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [currentGoals, setCurrentGoals] = useState([]);
  const [achievementCount, setAchievementCount] = useState(0);

  const [userStats, setUserStats] = useState({
    totalDistance: 0,
    totalElevation: 0,
  });
  const [profile, setProfile] = useState({
    userName: ' ',
    location: ' ',
    joinDate: ' ',
    bio: ' ',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hikeEntries, setHikeEntries] = useState([]);
  const [hikeCount, setHikeCount] = useState(0);

  // Format date for achievements and goals
  const formatSimpleDate = (dateValue) => {
    if (!dateValue) return 'Recently';
    try {
      const date = dateValue._seconds 
        ? new Date(dateValue._seconds * 1000)
        : new Date(dateValue);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const loadHikes = useCallback(async () => {
    if (!currentUser) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await hikeApiService.getHikes();
      console.log(' API Response:', response);
      if (response.success) {
        // Convert Firestore timestamps to readable dates and ensure all fields are safe for React
        const processedHikes = response.data
          .map((hike) => {
            let joinDate = 'Unknown';

            if (hike?.createdAt) {
              const createdAt = hike.createdAt;

              if (createdAt.toDate) {
                joinDate = formatDate(createdAt.toDate());
              } else if (createdAt._seconds) {
                joinDate = formatDate(new Date(createdAt._seconds * 1000));
              } else {
                joinDate = formatDate(new Date(createdAt));
              }
            }

            return {
              ...hike,
              date: joinDate,
              createdAt: hike.createdAt
                ? hike.createdAt.toDate
                  ? hike.createdAt.toDate()
                  : new Date(hike.createdAt)
                : null,
              updatedAt: hike.updatedAt
                ? hike.updatedAt.toDate
                  ? hike.updatedAt.toDate()
                  : new Date(hike.updatedAt)
                : null,
              startTime: hike.startTime
                ? hike.startTime.toDate
                  ? hike.startTime.toDate()
                  : new Date(hike.startTime)
                : null,
              endTime: hike.endTime
                ? hike.endTime.toDate
                  ? hike.endTime.toDate()
                  : new Date(hike.endTime)
                : null,
              title: hike.title || 'Untitled Hike',
              location: hike.location || 'Unknown Location',
              distance: hike.distance || '0 km',
              elevation: hike.elevation || '0 ft',
              duration: hike.duration || '0 min',
              weather: hike.weather || 'Unknown',
              difficulty: hike.difficulty || 'Easy',
              notes: hike.notes || '',
              photos: hike.photos || 0,
              status: hike.status || 'completed',
            };
          })
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); // newest first

        console.log('✅ Processed hikes:', processedHikes);

        setHikeEntries(processedHikes.slice(0, 2));
      } else {
        setError('Failed to load hikes from server.');
      }
    } catch (err) {
      console.error('Failed to load hikes:', err);
      setError(`Failed to load hikes: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Load achievements and goals
  useEffect(() => {
    if (!currentUser) return;

    const loadAchievementsAndGoals = async () => {
      try {
        // Load achievements
        const badgesResponse = await achievementApiService.getBadges();
        const badges = badgesResponse.data || [];
        
        // Filter earned badges
        const earned = badges.filter(badge => badge.earnedDate || badge.progress === 100);
        setAchievementCount(earned.length);
        
        // Get 3 most recent
        const recent = earned
          .sort((a, b) => {
            const dateA = new Date(a.earnedDate);
            const dateB = new Date(b.earnedDate);
            return dateB - dateA;
          })
          .slice(0, 3);
        
        setRecentAchievements(recent);

        // Load current goals
        const goalsResponse = await goalsApi.getGoals();
        const goals = goalsResponse || [];
        
        // Get active goals (not completed)
        const active = goals
          .filter(goal => goal.status !== 'completed')
          .slice(0, 3);
        
        setCurrentGoals(active);
      } catch (error) {
        console.error('Error loading achievements and goals:', error);
      }
    };

    loadAchievementsAndGoals();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    getUserStats(currentUser.uid).then((stats) => {
      console.log('User stats:', stats);
      setUserStats(stats);
    });
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadHikes();
    } else {
      setIsLoading(false);
    }
  }, [currentUser, loadHikes]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchHikeCount = async () => {
      const count = await getUserHikeCount(currentUser.uid);
      console.log(' Hike count:', count);
      setHikeCount(count);
    };

    fetchHikeCount();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    getUserProfile(currentUser.uid).then((userProfile) => {
      setProfile(userProfile);
    });
  }, [currentUser]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">
                {profile.userName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {profile.userName}
                  </h2>
                </div>

                <p className="text-muted-foreground flex items-center gap-1 mb-2">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </p>
                <p className="text-sm text-muted-foreground">
                  Joined Since {profile.joinDate}
                </p>
              </div>

              <p className="text-foreground">{profile.bio}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {hikeCount}
                </p>
                <p className="text-sm text-muted-foreground">Total Hikes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-forest">
                  {userStats.totalDistance} km
                </p>
                <p className="text-sm text-muted-foreground">Distance</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {userStats.totalElevation} ft
                </p>
                <p className="text-sm text-muted-foreground">Elevation</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-trail">{achievementCount}</p>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </CardContent>
            </Card>
          </div>

          {/* Current Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-forest" />
                  Current Goals
                </span>
                {currentGoals.length > 0 && (
                  <button
                    onClick={() => {
                      onOpenChange(false);
                      navigate('/achievements?tab=goals');
                    }}
                    className="text-sm text-forest hover:text-forest/80 font-normal flex items-center gap-1"
                  >
                    View all
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentGoals.length > 0 ? (
                currentGoals.map((goal) => {
                  const progressPercentage = goal.targetValue > 0
                    ? Math.min((goal.currentProgress / goal.targetValue) * 100, 100)
                    : 0;

                  return (
                    <div
                      key={goal.id}
                      className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        onOpenChange(false);
                        navigate('/achievements?tab=progress');
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{goal.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {goal.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {goal.category}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {goal.currentProgress}/{goal.targetValue} {goal.unit}
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Target className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No active goals</p>
                  <button
                    onClick={() => {
                      onOpenChange(false);
                      navigate('/achievements?tab=goals');
                    }}
                    className="mt-2 text-xs text-forest hover:text-forest/80 underline"
                  >
                    Create your first goal
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Recent Achievements
                </span>
                {recentAchievements.length > 0 && (
                  <button
                    onClick={() => {
                      onOpenChange(false);
                      navigate('/achievements?tab=completed');
                    }}
                    className="text-sm text-forest hover:text-forest/80 font-normal flex items-center gap-1"
                  >
                    View all
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAchievements.length > 0 ? (
                  recentAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200/50 dark:border-yellow-800/50 hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => {
                        onOpenChange(false);
                        navigate('/achievements?tab=badges');
                      }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{achievement.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>Earned {formatSimpleDate(achievement.earnedDate)}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0 text-xs">
                        <Medal className="h-3 w-3 mr-1" />
                        Earned
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Trophy className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No achievements yet</p>
                    <p className="text-xs mt-1">Complete hikes to earn badges!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Hikes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mountain className="h-5 w-5 text-forest" />
                Recent Hikes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hikeEntries.length > 0 ? (
                  hikeEntries.map((hike, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{hike.title}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {hike.date || 'No date'}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {hike.distance}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {hike.duration}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          hike.difficulty === 'Hard'
                            ? 'destructive'
                            : hike.difficulty === 'Medium'
                              ? 'default'
                              : 'secondary'
                        }
                        className="text-xs"
                      >
                        {hike.difficulty}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No recent hikes to display yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Link to="/edit-profile" className="flex-1">
              <Button className="w-full bg-gradient-trail text-primary-foreground">
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileView;