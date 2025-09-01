import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Calendar, 
  MapPin, 
  Mountain, 
  Clock, 
  UserPlus, 
  MessageCircle, 
  Target, 
  Award, 
  Medal, 
  TrendingUp 
} from 'lucide-react';

export const ProfileView = ({ open, onOpenChange, showAddFriend = false }) => {
  const user = {
    name: "Alex Johnson",
    email: "alex@example.com",
    joinDate: "March 2024",
    location: "Colorado, USA",
    bio: "Passionate hiker exploring mountain trails and connecting with nature. Always seeking new adventures!",
    stats: {
      totalHikes: 47,
      totalDistance: "312 miles",
      totalElevation: "45,230 ft",
      achievements: 12,
    },
    achievements: [
      { name: "Peak Collector", description: "Completed 10+ mountain peaks", earned: "2 weeks ago" },
      { name: "Early Bird", description: "Started 20+ hikes before sunrise", earned: "1 month ago" },
      { name: "Trail Master", description: "Completed 50+ different trails", earned: "2 months ago" },
      { name: "Endurance Champion", description: "Hiked 100+ km in a month", earned: "3 months ago" }
    ],
    recentHikes: [
      { name: "Rocky Mountain Trail", date: "Dec 8, 2024", distance: "8.5 km", duration: "4h 23m", difficulty: "Hard" },
      { name: "Forest Loop", date: "Dec 5, 2024", distance: "5.2 km", duration: "2h 15m", difficulty: "Medium" },
      { name: "Summit Peak", date: "Dec 1, 2024", distance: "6.8 km", duration: "3h 45m", difficulty: "Hard" }
    ],
    goals: [
      { name: "Complete Pacific Crest Trail section", progress: 65, target: "End of year" },
      { name: "Hike 500km this year", progress: 78, target: "December 2024" }
    ]
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                </div>
                <p className="text-muted-foreground flex items-center gap-1 mb-2">
                  <MapPin className="h-4 w-4" />
                  {user.location}
                </p>
                <p className="text-sm text-muted-foreground">
                  Hiking since {user.joinDate}
                </p>
              </div>
              
              <p className="text-foreground">{user.bio}</p>
              
              <div className="flex gap-3">
                {showAddFriend ? (
                  <Button className="bg-gradient-trail text-primary-foreground">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Friend
                  </Button>
                ) : (
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-summit">{user.stats.totalHikes}</p>
                <p className="text-sm text-muted-foreground">Total Hikes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-forest">{user.stats.totalDistance}</p>
                <p className="text-sm text-muted-foreground">Distance</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-sky">{user.stats.totalElevation}</p>
                <p className="text-sm text-muted-foreground">Elevation</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-trail">{user.achievements?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </CardContent>
            </Card>
          </div>

          {/* Current Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-summit" />
                Current Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.goals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-trail h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Target: {goal.target}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-summit" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {user.achievements.slice(0, 4).map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Medal className="h-8 w-8 text-summit" />
                    <div>
                      <h4 className="font-medium">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground">Earned {achievement.earned}</p>
                    </div>
                  </div>
                ))}
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
                {user.recentHikes.map((hike, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex-1">
                      <h4 className="font-medium">{hike.name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {hike.date}
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
                      variant={hike.difficulty === 'Hard' ? 'destructive' : hike.difficulty === 'Medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {hike.difficulty}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1 bg-gradient-trail text-primary-foreground">
              Edit Profile
            </Button>
            <Button variant="outline" className="flex-1">
              View All Hikes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
