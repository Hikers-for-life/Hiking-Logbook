import { Navigation } from "../components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
  Award
} from "lucide-react";

const Achievements = () => {
  const achievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first hike",
      icon: Mountain,
      completed: true,
      progress: 100,
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Achievements & Progress</h1>
          <p className="text-muted-foreground">Track your hiking milestones and unlock new achievements.</p>
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Achievements</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="progress">In Progress</TabsTrigger>
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
              {achievements.map((achievement) => {
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
                          {achievement.completed && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              <Medal className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
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
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.filter(a => a.completed).map((achievement) => {
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
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.filter(a => !a.completed).map((achievement) => {
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
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Achievements;