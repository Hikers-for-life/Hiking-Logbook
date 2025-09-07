import { useState } from "react";
import { Navigation } from "../components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import GoalForm from "../components/GoalForm";
import ProgressCharts from "../components/ProgressCharts";
import PinnedHikes from "../components/PinnedHikes";
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
  BarChart3,
  Pin
} from "lucide-react";

const Achievements = () => {
  // State for goal management
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [customGoals, setCustomGoals] = useState([]);

  // Sample pinned hikes data
  const [pinnedHikes] = useState([
    {
      id: 1,
      title: "Mount Washington Summit",
      location: "White Mountains, NH",
      date: "2024-08-05",
      distance: "12.4 mi",
      elevation: "4,322 ft",
      duration: "6h 30m",
      difficulty: "Hard",
      notes: "Incredible views from the summit! Weather was perfect, saw amazing sunrise.",
      pinnedAt: "2024-08-06"
    },
    {
      id: 2,
      title: "Bear Mountain Trail",
      location: "Harriman State Park, NY",
      date: "2024-07-22",
      distance: "5.8 mi",
      elevation: "1,284 ft",
      duration: "3h 45m",
      difficulty: "Moderate",
      notes: "Great family-friendly hike. Spotted some wildlife on the way down.",
      pinnedAt: "2024-07-23"
    }
  ]);

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

  // Goal management functions
  const handleCreateGoal = (goalData) => {
    const newGoal = {
      ...goalData,
      id: Date.now(), // Simple ID generation
      currentProgress: 0,
      status: "active"
    };
    setCustomGoals(prev => [...prev, newGoal]);
  };

  const handleEditGoal = (goalData) => {
    setCustomGoals(prev => 
      prev.map(goal => 
        goal.id === editingGoal.id 
          ? { ...goal, ...goalData }
          : goal
      )
    );
    setEditingGoal(null);
  };

  const handleDeleteGoal = (goalId) => {
    setCustomGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const handleUnpinHike = (hikeId) => {
    // This would typically call an API to unpin the hike
    console.log('Unpinning hike:', hikeId);
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
            <PinnedHikes pinnedHikes={pinnedHikes} onUnpinHike={handleUnpinHike} />
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
      </main>
    </div>
  );
};

export default Achievements;
