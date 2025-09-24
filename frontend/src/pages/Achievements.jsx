import { useState, useEffect } from "react";
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
import { 
  Trophy, 
  Target, 
  Mountain, 
  Clock, 
  TrendingUp,
  Medal,
  Star,
  MapPin,
  Calendar,
  Award,
  Plus,
  Pin,
  Thermometer
} from "lucide-react";

const Achievements = () => {
  // State for goal management
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [customGoals, setCustomGoals] = useState([]);

  // Pinned hikes data - loaded from API
  const [pinnedHikes, setPinnedHikes] = useState([]);
  
  // View details modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedHike, setSelectedHike] = useState(null);

  // Helper function to safely convert Firestore timestamps to date strings
  const formatDate = (timestamp) => {
    if (!timestamp) return new Date().toLocaleDateString();
    try {
      // Handle Firestore timestamp objects with toDate method
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString();
      }
      // Handle Firestore timestamp objects with _seconds property
      if (timestamp._seconds) {
        return new Date(timestamp._seconds * 1000).toLocaleDateString();
      }
      // Handle regular Date objects or date strings
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      console.warn('Failed to format date:', timestamp, error);
      return new Date().toLocaleDateString();
    }
  };

  const achievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first hike",
      icon: Mountain,
      completed: true,
      progress: 1,
      maxProgress: 1,
      category: "milestone",
      earnedDate: "2024-01-15"
    },
    {
      id: 2,
      title: "Distance Walker",
      description: "Hike 100 km total",
      icon: Target,
      completed: true,
      progress: 234,
      maxProgress: 100,
      category: "distance",
      earnedDate: "2024-02-28"
    },
    {
      id: 3,
      title: "Peak Collector",
      description: "Reach 10 mountain peaks",
      icon: Trophy,
      completed: false,
      progress: 6,
      maxProgress: 10,
      category: "peaks"
    },
    {
      id: 4,
      title: "Early Bird",
      description: "Start 5 hikes before 7 AM",
      icon: Clock,
      completed: true,
      progress: 8,
      maxProgress: 5,
      category: "time",
      earnedDate: "2024-03-10"
    },
    {
      id: 5,
      title: "Endurance Master",
      description: "Complete a hike longer than 8 hours",
      icon: TrendingUp,
      completed: false,
      progress: 6.5,
      maxProgress: 8,
      category: "endurance"
    },
    {
      id: 6,
      title: "Trail Explorer",
      description: "Visit 25 different trails",
      icon: MapPin,
      completed: false,
      progress: 18,
      maxProgress: 25,
      category: "exploration"
    }
  ];

  const stats = {
    totalHikes: 47,
    totalDistance: 234,
    totalTime: "89h 32m",
    completedAchievements: achievements.filter(a => a.completed).length,
    totalAchievements: achievements.length,
    currentStreak: 12
  };

  const recentlyEarned = achievements
    .filter(a => a.completed && a.earnedDate)
    .sort((a, b) => new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime())
    .slice(0, 3);

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

  // Load goals from API on component mount
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const goals = await goalsApi.getGoals();
        // Transform API goals to match the expected format
        const transformedGoals = goals.map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description,
          category: goal.category,
          progress: goal.currentProgress || 0,
          maxProgress: goal.targetValue,
          completed: goal.status === 'completed',
          earnedDate: goal.status === 'completed' ? goal.updatedAt : null,
          icon: Target, // Default icon for custom goals
          status: goal.status
        }));
        setCustomGoals(transformedGoals);
      } catch (error) {
        console.error('Failed to load goals:', error);
        // You might want to show a toast notification here
      }
    };
    
    loadGoals();
  }, []);

  // Load pinned hikes from API
  useEffect(() => {
    const loadPinnedHikes = async () => {
      try {
        const response = await hikeApiService.getHikes({ pinned: true });
        
        if (response.success) {
          // Process pinned hikes data
          const pinnedHikesData = response.data.map(hike => ({
            ...hike,
            // Convert dates to readable format
            date: hike.date ? formatDate(hike.date) : 'No date',
            pinnedAt: formatDate(hike.updatedAt),
            // Format distance and elevation
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
            const response = await hikeApiService.getHikes({ pinned: true });
            
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
    } catch (error) {
      console.error('Failed to create goal:', error);
      // You might want to show a toast notification here
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
    } catch (error) {
      console.error('Failed to update goal:', error);
      // You might want to show a toast notification here
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await goalsApi.deleteGoal(goalId);
      setCustomGoals(prev => prev.filter(goal => goal.id !== goalId));
    } catch (error) {
      console.error('Failed to delete goal:', error);
      // You might want to show a toast notification here
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

  // Combine predefined achievements with custom goals
  const allAchievements = [...achievements, ...customGoals];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Achievements & Progress</h1>
              <p className="text-muted-foreground">Track your hiking milestones and unlock new achievements.</p>
            </div>
            <Button 
              onClick={() => setIsGoalFormOpen(true)}
              className="bg-gradient-trail text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-subtle border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-summit">{stats.totalHikes}</div>
              <div className="text-sm text-muted-foreground">Total Hikes</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-subtle border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-forest">{stats.totalDistance}km</div>
              <div className="text-sm text-muted-foreground">Distance</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-subtle border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-sky">{stats.totalTime}</div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-subtle border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-trail">{stats.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Achievements</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="progress">In Progress</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="pinned">Pinned Hikes</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Recently Earned */}
            <Card className="bg-card border-border shadow-elevation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning" />
                  Recently Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {recentlyEarned.map((achievement) => {
                    const IconComponent = achievement.icon;
                    return (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <div className={`p-2 rounded-full bg-background ${getCategoryColor(achievement.category)}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{achievement.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* All Achievements */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allAchievements.map((achievement) => {
                const IconComponent = achievement.icon;
                const progressPercentage = Math.min((achievement.progress / achievement.maxProgress) * 100, 100);
                
                return (
                  <Card key={achievement.id} className={`bg-card border-border shadow-elevation ${achievement.completed ? 'ring-2 ring-success/20' : ''}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${achievement.completed ? 'bg-success/10' : 'bg-muted'} ${getCategoryColor(achievement.category)}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {achievement.completed && (
                              <Badge variant="secondary" className="text-xs">
                                <Medal className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                            {customGoals.some(goal => goal.id === achievement.id) && (
                              <Badge variant="outline" className="text-xs">
                                Custom Goal
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {achievement.progress}
                            {achievement.maxProgress > 1 && `/${achievement.maxProgress}`}
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>

                      {achievement.completed && achievement.earnedDate && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                        </div>
                      )}

                      {/* Action buttons for custom goals */}
                      {customGoals.some(goal => goal.id === achievement.id) && (
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-forest hover:text-forest hover:bg-muted"
                            onClick={() => {
                              setEditingGoal(achievement);
                              setIsGoalFormOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteGoal(achievement.id)}
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
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allAchievements.filter(a => a.completed).map((achievement) => {
                const IconComponent = achievement.icon;
                
                return (
                  <Card key={achievement.id} className="bg-card border-border shadow-elevation ring-2 ring-success/20">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full bg-success/10 ${getCategoryColor(achievement.category)}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                          <Badge variant="secondary" className="text-xs mt-1">
                            <Award className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      
                      {achievement.earnedDate && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                        </div>
                      )}

                      {/* Action buttons for custom goals */}
                      {customGoals.some(goal => goal.id === achievement.id) && (
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-forest hover:text-forest hover:bg-muted"
                            onClick={() => {
                              setEditingGoal(achievement);
                              setIsGoalFormOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteGoal(achievement.id)}
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
          </TabsContent>

          <TabsContent value="progress">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allAchievements.filter(a => !a.completed).map((achievement) => {
                const IconComponent = achievement.icon;
                const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
                
                return (
                  <Card key={achievement.id} className="bg-card border-border shadow-elevation">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full bg-muted ${getCategoryColor(achievement.category)}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {Math.round(progressPercentage)}% complete
                        </p>
                      </div>

                      {/* Action buttons for custom goals */}
                      {customGoals.some(goal => goal.id === achievement.id) && (
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-forest hover:text-forest hover:bg-muted"
                            onClick={() => {
                              setEditingGoal(achievement);
                              setIsGoalFormOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteGoal(achievement.id)}
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
                        className={`text-sm px-3 py-1 ${
                          selectedHike.difficulty === 'Easy' ? 'bg-meadow/20 text-forest border-meadow' :
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
