import { useState, useEffect, useContext } from "react";
import { Navigation } from "../components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import GoalForm from "../components/GoalForm";
import ProgressCharts from "../components/ProgressCharts";
import PinnedHikes from "../components/PinnedHikes";
import { goalsApi } from "../services/goalsApiService";
import { hikeApiService } from "../services/hikeApiService";
import { achievementApiService } from "../services/achievementApiService";
import StatsOverview from "../components/StatsOverview";
import { AuthContext } from "../contexts/AuthContext";
import {
  Trophy,
  Target,
  Mountain,
  Clock,
  Medal,
  MapPin,
  Calendar,
  Plus,
  Pin,
  Thermometer,
  Share
} from "lucide-react";

import { createFeed } from "../services/feed";
import { throttledRequest, REQUEST_PRIORITY } from "../utils/requestThrottle";


// Simple Progress Update Form Component
const ProgressUpdateForm = ({ goal, onSubmit, onCancel }) => {
  const [newProgress, setNewProgress] = useState(goal?.progress || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newProgress >= 0 && newProgress <= goal.maxProgress) {
      onSubmit(newProgress);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="progress" className="block text-sm font-medium mb-2">
          New Progress ({goal?.unit})
        </label>
        <input
          id="progress"
          type="number"
          min="0"
          max={goal?.maxProgress || 100}
          value={newProgress}
          onChange={(e) => setNewProgress(parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Enter progress (0-${goal?.maxProgress})`}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Target: {goal?.maxProgress} {goal?.unit}
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-trail text-primary-foreground">
          Update Progress
        </Button>
      </div>
    </form>
  );
};

const Achievements = () => {
  const { currentUser } = useContext(AuthContext);

  // State for goal management
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [isProgressUpdateOpen, setIsProgressUpdateOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [customGoals, setCustomGoals] = useState([]);

  // State for current tab
  const [currentTab, setCurrentTab] = useState(() => {
    // Try to get tab from URL params first, then localStorage, then default to 'badges'
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) return tabFromUrl;

    const savedTab = localStorage.getItem('achievements-current-tab');
    return savedTab || 'badges';
  });

  // Pinned hikes data - loaded from API
  const [pinnedHikes, setPinnedHikes] = useState([]);

  // View details modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedHike, setSelectedHike] = useState(null);

  // Real data from API
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);


  // Load real data from API
  const loadAchievementData = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      if (!currentUser) {
        setLoading(false);
        return;
      }

      // Load badges, stats, and goals using throttled requests
      const [badgesResponse, statsResponse, goalsResponse] = await Promise.all([
        throttledRequest(
          () => achievementApiService.getBadges(),
          REQUEST_PRIORITY.MEDIUM
        ).catch((error) => {
          console.error('Badges API error:', error);
          // Fallback to predefined badges when API fails
          return {
            data: [
              {
                id: "first-steps",
                name: "First Steps",
                description: "Completed your very first hike",
                progress: 0,
                progressText: "0/1 hikes",
                isEarned: false,
                category: "milestone"
              },
              {
                id: "distance-walker",
                name: "Distance Walker",
                description: "Hiked a total distance of 100 km",
                progress: 0,
                progressText: "0/100 km",
                isEarned: false,
                category: "distance"
              },
              {
                id: "peak-collector",
                name: "Peak Collector",
                description: "Summited 10 peaks",
                progress: 0,
                progressText: "0/10 peaks",
                isEarned: false,
                category: "peaks"
              },
              {
                id: "early-bird",
                name: "Early Bird",
                description: "Completed a hike that started before 7 AM",
                progress: 0,
                progressText: "Not achieved",
                isEarned: false,
                category: "achievement"
              },
              {
                id: "endurance-master",
                name: "Endurance Master",
                description: "Completed a hike longer than 8 hours",
                progress: 0,
                progressText: "Not achieved",
                isEarned: false,
                category: "achievement"
              },
              {
                id: "trail-explorer",
                name: "Trail Explorer",
                description: "Completed 25 unique trails",
                progress: 0,
                progressText: "0/25 trails",
                isEarned: false,
                category: "trails"
              }
            ]
          };
        }),
        throttledRequest(
          () => achievementApiService.getStats(),
          REQUEST_PRIORITY.MEDIUM
        ).catch((error) => {
          console.error('Stats API error:', error);
          return { data: { totalHikes: 0, totalDistance: 0, totalDuration: 0, currentStreak: 0 } };
        }),
        throttledRequest(
          () => goalsApi.getGoals(),
          REQUEST_PRIORITY.MEDIUM
        ).catch((error) => {
          console.error('Goals API error:', error);
          return [];
        })
      ]);



      setBadges(badgesResponse.data || []);
      setStats(statsResponse.data || {
        totalHikes: 0,
        totalDistance: 0,
        totalDuration: 0,
        currentStreak: 0,
        badges: 0,
        completedBadges: 0
      });

      // Process goals data
      if (goalsResponse && goalsResponse.length > 0) {
        const transformedGoals = goalsResponse.map(goal => ({
          id: goal.id || `goal-${Date.now()}-${Math.random()}`,
          title: goal.title,
          description: goal.description,
          category: goal.category || 'custom',
          progress: goal.currentProgress || 0,
          maxProgress: goal.targetValue || 1,
          completed: goal.status === 'completed',
          earnedDate: goal.status === 'completed' ? goal.updatedAt : null,
          icon: Target,
          status: goal.status,
          isCustomGoal: true,
          targetDate: goal.targetDate,
          unit: goal.unit
        }));
        setCustomGoals(transformedGoals);
        console.log('Loaded goals from API:', transformedGoals);
      } else {
        console.log('No goals found in API response');
      }

      setBadges(badgesResponse.data || []);
      setStats(statsResponse.data || {
        totalHikes: 0,
        totalDistance: 0,
        totalDuration: 0,
        currentStreak: 0,
        badges: 0,
        completedBadges: 0
      });

    } catch (error) {
      console.error('Error loading achievement data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or user changes
  useEffect(() => {
    loadAchievementData();
  }, [currentUser]);

  // Optional: Refresh data when user returns to this page (focus event) - disabled to reduce excessive reloading
  // useEffect(() => {
  //   const handleFocus = () => {
  //     if (currentUser && !loading) {
  //       console.log('Page focused, refreshing data...');
  //       loadAchievementData();
  //     }
  //   };

  //   window.addEventListener('focus', handleFocus);
  //   return () => window.removeEventListener('focus', handleFocus);
  // }, [currentUser, loading]);

  // Optional: Periodic auto-refresh every 5 minutes - disabled to reduce excessive reloading
  // useEffect(() => {
  //   if (!currentUser) return;

  //   const interval = setInterval(() => {
  //     console.log('Auto-refreshing data...');
  //     loadAchievementData();
  //   }, 300000); // 5 minutes

  //   return () => clearInterval(interval);
  // }, [currentUser]);

  // Get recently earned badges

  // Helper function to format dates properly
  const formatDate = (dateValue) => {
    if (!dateValue) return 'No date';

    try {
      // Backend now sends ISO strings, so this should work
      const date = new Date(dateValue);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return date.toLocaleDateString();
    } catch (error) {
      console.error('Date formatting error:', error, dateValue);
      return 'Invalid date';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      milestone: "text-summit",
      distance: "text-forest",
      peaks: "text-sky",
      time: "text-trail",
      endurance: "text-warning",
      exploration: "text-accent"
    };
    return colors[category] || "text-foreground";
  };

  // Goals are now loaded in loadAchievementData function

  // Handle tab change and save to localStorage and URL
  const handleTabChange = (newTab) => {
    setCurrentTab(newTab);
    localStorage.setItem('achievements-current-tab', newTab);

    // Update URL without causing a page reload
    const url = new URL(window.location);
    url.searchParams.set('tab', newTab);
    window.history.replaceState({}, '', url);
  };


  // Load pinned hikes from API
  useEffect(() => {
    const loadPinnedHikes = async () => {
      try {
        const response = await throttledRequest(
          () => hikeApiService.getHikes({ pinned: true }),
          REQUEST_PRIORITY.LOW
        );

        if (response.success) {
          // Process pinned hikes data
          const pinnedHikesData = response.data.map(hike => ({
            ...hike,

            date: hike.date ? formatDate(hike.date) : 'No date',
            pinnedAt: formatDate(hike.updatedAt),

            distance: hike.distance ? `${hike.distance} mi` : '0 mi',
            elevation: hike.elevation ? `${hike.elevation} ft` : '0 ft',
            duration: hike.duration ? `${hike.duration} min` : '0 min'
          }));

          setPinnedHikes(pinnedHikesData);
        }
      } catch (error) {
        console.error('Failed to load pinned hikes:', error);
      }
    };

    loadPinnedHikes();
  }, []);

  // Refresh pinned hikes when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Reload pinned hikes when page becomes visible
        const loadPinnedHikes = async () => {
          try {
            const response = await throttledRequest(
              () => hikeApiService.getHikes({ pinned: true }),
              REQUEST_PRIORITY.LOW
            );

            if (response.success) {
              const pinnedHikesData = response.data.map(hike => ({
                ...hike,
                date: hike.date ? formatDate(hike.date) : 'No date',
                pinnedAt: formatDate(hike.updatedAt),
                distance: hike.distance ? `${hike.distance} mi` : '0 mi',
                elevation: hike.elevation ? `${hike.elevation} ft` : '0 ft',
                duration: hike.duration ? `${hike.duration} min` : '0 min'
              }));

              setPinnedHikes(pinnedHikesData);
            }
          } catch (error) {
            console.error('Failed to refresh pinned hikes:', error);
          }
        };

        loadPinnedHikes();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Goal management functions
  const handleCreateGoal = async (goalData) => {
    try {
      const newGoal = await goalsApi.createGoal(goalData);
      // Transform the API response to match the expected format
      const transformedGoal = {
        id: newGoal.id,
        title: newGoal.title,
        description: newGoal.description,
        category: newGoal.category,
        progress: newGoal.currentProgress || 0,
        maxProgress: newGoal.targetValue,
        completed: newGoal.status === 'completed',
        earnedDate: newGoal.status === 'completed' ? newGoal.updatedAt : null,
        icon: Target, // Default icon for custom goals
        status: newGoal.status
      };
      setCustomGoals(prev => [...prev, transformedGoal]);

      // Refresh achievement data to update stats
      setTimeout(() => {
        loadAchievementData();
      }, 500);
    } catch (error) {
      console.error('Failed to create goal:', error);

    }
  };

  const handleEditGoal = async (goalData) => {
    try {
      const updatedGoal = await goalsApi.updateGoal(editingGoal.id, goalData);
      // Transform the API response to match the expected format
      const transformedGoal = {
        id: updatedGoal.id,
        title: updatedGoal.title,
        description: updatedGoal.description,
        category: updatedGoal.category,
        progress: updatedGoal.currentProgress || 0,
        maxProgress: updatedGoal.targetValue,
        completed: updatedGoal.status === 'completed',
        earnedDate: updatedGoal.status === 'completed' ? updatedGoal.updatedAt : null,
        icon: Target, // Default icon for custom goals
        status: updatedGoal.status
      };
      setCustomGoals(prev =>
        prev.map(goal =>
          goal.id === editingGoal.id
            ? transformedGoal
            : goal
        )
      );
      setEditingGoal(null);

      // Refresh achievement data to update stats
      setTimeout(() => {
        loadAchievementData();
      }, 500);
    } catch (error) {
      console.error('Failed to update goal:', error);

    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await goalsApi.deleteGoal(goalId);
      setCustomGoals(prev => prev.filter(goal => goal.id !== goalId));

      // Refresh achievement data to update stats
      setTimeout(() => {
        loadAchievementData();
      }, 500);
    } catch (error) {
      console.error('Failed to delete goal:', error);

    }
  };

  const handleUnpinHike = async (hikeId) => {
    try {
      await hikeApiService.unpinHike(hikeId);
      // Remove from local state
      setPinnedHikes(prev => prev.filter(hike => hike.id !== hikeId));
    } catch (error) {
      console.error('Failed to unpin hike:', error);
    }
  };

  const handleViewDetails = (hike) => {
    setSelectedHike(hike);
    setIsDetailsModalOpen(true);
  };

  // Handler for opening edit goal form
  const handleOpenEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsGoalFormOpen(true);
  };

  // Handler for updating goal progress
  const handleUpdateProgress = (goal) => {
    setEditingGoal(goal);
    setIsProgressUpdateOpen(true);
  };

  // Handler for submitting progress update
  const handleProgressUpdateSubmit = async (newProgress) => {
    if (!editingGoal) return;

    try {
      const updatedGoal = {
        ...editingGoal,
        progress: parseInt(newProgress),
        completed: parseInt(newProgress) >= editingGoal.maxProgress
      };

      // Update in backend
      await goalsApi.updateGoal(editingGoal.id, {
        currentProgress: parseInt(newProgress),
        status: parseInt(newProgress) >= editingGoal.maxProgress ? 'completed' : 'in_progress'
      });

      // Update the goal in the list
      setCustomGoals(prev => prev.map(g => g.id === editingGoal.id ? updatedGoal : g));


      // Close modal and reset state
      setIsProgressUpdateOpen(false);
      setEditingGoal(null);

      // Refresh achievement data to update stats
      setTimeout(() => {
        loadAchievementData();
      }, 500);
    } catch (error) {
      console.error('Failed to update goal progress:', error);
      // Still update local state even if backend fails
      const updatedGoal = {
        ...editingGoal,
        progress: parseInt(newProgress),
        completed: parseInt(newProgress) >= editingGoal.maxProgress
      };
      setCustomGoals(prev => prev.map(g => g.id === editingGoal.id ? updatedGoal : g));
      setIsProgressUpdateOpen(false);
      setEditingGoal(null);

      // Refresh achievement data even on error
      setTimeout(() => {
        loadAchievementData();
      }, 500);
    }
  };

  // Handler for sharing achievements
  const handleShareAchievement = async (achievement) => {
    try {
      // Create activity post for achievement (server attaches user info)
      const postBody = {
        action: "achieved",
        hike: achievement.title || achievement.name, // backend uses 'hike' string field; reuse it for title
        description: achievement.description || "",
        stats: achievement.progressText || "",
        photo: null, // Don't include photos for achievement posts
      };

      const created = await createFeed(postBody);
      console.log("Achievement posted to feed:", created);

      // Show success message instead of using Web Share API
      alert(`🎉 Achievement shared to your activity feed! Your friends can now see that you achieved: ${achievement.title || achievement.name}`);
    } catch (error) {
      console.error("Failed to share achievement:", error);
      alert("Something went wrong while sharing your achievement. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading achievements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Achievements & Progress</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Track your hiking milestones and unlock new achievements.</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsGoalFormOpen(true)}
                className="bg-gradient-trail text-primary-foreground hover:opacity-90 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Create Goal</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-subtle border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-summit">{stats?.totalHikes || 0}</div>
              <div className="text-sm text-muted-foreground">Total Hikes</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-subtle border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-forest">{stats?.totalDistance || 0}km</div>
              <div className="text-sm text-muted-foreground">Distance</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-subtle border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-sky">{stats?.totalDuration ? `${Math.round(stats.totalDuration / 60)}h ${stats.totalDuration % 60}m` : '0h 0m'}</div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-subtle border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-trail">{stats?.currentStreak || 0}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-0">
            <TabsTrigger value="badges" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Badges</span>
              <span className="sm:hidden">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Goals</span>
              <span className="sm:hidden">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Completed</span>
              <span className="sm:hidden">Done</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">In Progress</span>
              <span className="sm:hidden">Active</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Charts</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="pinned" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Pinned Hikes</span>
              <span className="sm:hidden">Pinned</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="badges" className="space-y-6">
            {/* Badges Section */}
            <Card className="bg-card border-border shadow-elevation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-warning" />
                  Badges
                </CardTitle>
                <p className="text-muted-foreground">Complete challenges to earn badges and unlock achievements.</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {badges.map((badge) => {
                    const isEarned = badge.earnedDate;
                    const progressPercentage = badge.progress || 0;

                    return (
                      <Card key={badge.id} className={`bg-card border-border shadow-elevation ${isEarned ? 'ring-2 ring-success/20' : ''}`}>
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${isEarned ? 'bg-success/10' : 'bg-muted'}`}>
                              <Trophy className="h-6 w-6 text-warning" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{badge.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                {isEarned && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Medal className="h-3 w-3 mr-1" />
                                    Earned
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">{badge.description}</p>

                          {/* Progress Bar for Badges */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">
                                {badge.progressText || (isEarned ? 'Completed' : 'Not Earned')}
                              </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                          </div>

                          {isEarned && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                Earned {formatDate(badge.earnedDate)}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => handleShareAchievement(badge)}
                              >
                                <Share className="h-3 w-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            {/* Goals Section */}
            <Card className="bg-card border-border shadow-elevation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-forest" />
                  Goals
                </CardTitle>
                <p className="text-muted-foreground">Create and track your personal hiking goals.</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customGoals.map((goal) => {
                    const isCompleted = goal.completed;
                    const progressPercentage = goal.maxProgress > 0
                      ? Math.min((goal.progress / goal.maxProgress) * 100, 100)
                      : 0;

                    return (
                      <Card key={goal.id} className={`bg-card border-border shadow-elevation ${isCompleted ? 'ring-2 ring-success/20' : ''}`}>
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${isCompleted ? 'bg-success/10' : 'bg-muted'}`}>
                              <Target className="h-6 w-6 text-forest" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{goal.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  Custom Goal
                                </Badge>
                                {isCompleted && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Medal className="h-3 w-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">{goal.description}</p>

                          {/* Progress Bar for Goals */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">
                                {goal.progress}/{goal.maxProgress}
                              </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                          </div>

                          {isCompleted && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                Completed {formatDate(goal.earnedDate || goal.updatedAt)}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => handleShareAchievement(goal)}
                              >
                                <Share className="h-3 w-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          )}

                          {/* Action buttons for incomplete goals */}
                          {!isCompleted && (
                            <div className="flex justify-end gap-2 pt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-forest hover:text-forest hover:bg-muted"
                                onClick={() => handleOpenEditGoal(goal)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateProgress(goal)}
                              >
                                Update Progress
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteGoal(goal.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="completed">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Completed Badges */}
              {badges.filter(badge => badge.isEarned).map((badge) => (
                <Card key={badge.id} className="bg-card border-border shadow-elevation ring-2 ring-success/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-success/10">
                        <Trophy className="h-6 w-6 text-warning" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{badge.name}</h3>
                        <Badge variant="secondary" className="text-xs mt-1">
                          <Medal className="h-3 w-3 mr-1" />
                          Badge Earned
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                    {badge.earnedDate && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Earned {formatDate(badge.earnedDate)}
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleShareAchievement(badge)}
                      >
                        <Share className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Completed Goals */}
              {customGoals.filter(goal => goal.completed).map((goal) => (
                <Card key={goal.id} className="bg-card border-border shadow-elevation ring-2 ring-success/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-success/10">
                        <Target className="h-6 w-6 text-forest" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{goal.title}</h3>
                        <Badge variant="secondary" className="text-xs mt-1">
                          <Medal className="h-3 w-3 mr-1" />
                          Goal Completed
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Completed {formatDate(goal.earnedDate || goal.updatedAt)}
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleShareAchievement(goal)}
                      >
                        <Share className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Goals in Progress */}
              {customGoals.filter(goal => !goal.completed).map((goal) => {
                const isCompleted = goal.completed;
                const progressPercentage = (goal.progress / goal.maxProgress) * 100;

                return (
                  <Card key={goal.id} className="bg-card border-border shadow-elevation">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-muted">
                          <Target className="h-6 w-6 text-forest" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{goal.title}</h3>
                          <Badge variant="outline" className="text-xs mt-1">
                            Custom Goal
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{goal.progress}/{goal.maxProgress}</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-forest hover:text-forest hover:bg-muted"
                          onClick={() => handleOpenEditGoal(goal)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateProgress(goal)}
                        >
                          Update Progress
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>



          <TabsContent value="charts">
            <ProgressCharts />
          </TabsContent>

          <TabsContent value="pinned">
            <PinnedHikes pinnedHikes={pinnedHikes} onUnpinHike={handleUnpinHike} onViewDetails={handleViewDetails} />
          </TabsContent>
        </Tabs>

        {/* Goal Form Modal */}
        <GoalForm
          open={isGoalFormOpen}
          onOpenChange={setIsGoalFormOpen}
          onSubmit={editingGoal ? handleEditGoal : handleCreateGoal}
          initialData={editingGoal}
          title={editingGoal ? "Edit Goal" : "Create New Goal"}
        />

        {/* Progress Update Modal */}
        <Dialog open={isProgressUpdateOpen} onOpenChange={setIsProgressUpdateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Progress</DialogTitle>
            </DialogHeader>
            {editingGoal && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{editingGoal.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Current: {editingGoal.progress}/{editingGoal.maxProgress} {editingGoal.unit}
                  </p>
                </div>
                <ProgressUpdateForm
                  goal={editingGoal}
                  onSubmit={handleProgressUpdateSubmit}
                  onCancel={() => setIsProgressUpdateOpen(false)}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Hike Details Modal */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <MapPin className="h-6 w-6 text-forest" />
                Hike Details
              </DialogTitle>
            </DialogHeader>
            {selectedHike && (
              <div className="space-y-8">
                {/* Header Section */}
                <div className="border-b border-border pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">{selectedHike.title}</h2>
                      <p className="text-lg text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {selectedHike.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={`text-sm px-3 py-1 ${selectedHike.difficulty === 'Easy' ? 'bg-meadow/20 text-forest border-meadow' :
                          selectedHike.difficulty === 'Moderate' ? 'bg-trail/20 text-foreground border-trail' :
                            'bg-summit/20 text-foreground border-summit'
                          }`}
                      >
                        {selectedHike.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {selectedHike.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-forest/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-forest" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Date</div>
                        <div className="text-lg font-semibold text-foreground">{selectedHike.date}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-trail/10 rounded-lg">
                        <Mountain className="h-5 w-5 text-trail" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Distance</div>
                        <div className="text-lg font-semibold text-foreground">{selectedHike.distance}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-summit/10 rounded-lg">
                        <Mountain className="h-5 w-5 text-summit" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Elevation</div>
                        <div className="text-lg font-semibold text-foreground">{selectedHike.elevation}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-stone/10 rounded-lg">
                        <Clock className="h-5 w-5 text-stone" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Duration</div>
                        <div className="text-lg font-semibold text-foreground">{selectedHike.duration}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Notes Section */}
                  {selectedHike.notes && (
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-forest" />
                        Notes & Thoughts
                      </h3>
                      <p className="text-foreground leading-relaxed">
                        {selectedHike.notes}
                      </p>
                    </div>
                  )}

                  {/* Weather Section */}
                  {selectedHike.weather && (
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Thermometer className="h-5 w-5 text-trail" />
                        Weather Conditions
                      </h3>
                      <p className="text-foreground text-lg">{selectedHike.weather}</p>
                    </div>
                  )}
                </div>

                {/* GPS Information */}
                {(selectedHike.waypoints && selectedHike.waypoints.length > 0) && (
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-summit" />
                      GPS Tracking
                    </h3>
                    <p className="text-foreground">
                      {selectedHike.waypoints.length} waypoints recorded during this hike
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Pin className="h-4 w-4 text-yellow-600" />
                      <span>Pinned on {selectedHike.pinnedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Achievements;
