import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
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

function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date)) return "Unknown";

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  // Add ordinal suffix (st, nd, rd, th)
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  return `${month} ${day}${suffix}, ${year}`;
}


export const ProfileView = ({ open, onOpenChange, showAddFriend = false }) => {
  const { currentUser } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [recentHikes, setRecentHikes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [profile, setProfile] = useState(null);

useEffect(() => {
  if (!currentUser) return;


  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/users/${currentUser.uid}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);  // now profile has bio, location, createdAt
      setAchievements(data.achievements || []);
      setGoals(data.goals || []);
      setRecentHikes(data.hikes || []);
    } catch (err) {
      console.error(err);
    }
  };

  fetchProfile();
}, [currentUser]);


let joinDate = "Unknown";

if (profile?.createdAt) {
  const createdAt = profile.createdAt;

  if (createdAt.toDate) {
    joinDate = formatDate(createdAt.toDate());
  } else if (createdAt._seconds) {
    joinDate = formatDate(new Date(createdAt._seconds * 1000));
  } else {
    joinDate = formatDate(new Date(createdAt));
  }
}



  const user = {
    name: currentUser.displayName || "No name",
    email: currentUser.email || "No email",
    joinDate: joinDate,
    location: profile?.location || "Not set",
    bio: profile?.bio || "No bio yet",
    stats: {
    totalHikes: profile?.stats?.totalHikes || 0,
    totalDistance: profile?.stats?.totalDistance || 0,
    totalElevation: profile?.stats?.totalElevation || 0,
    achievements: achievements.length || profile?.stats?.achievementsCount || 0,
  },


    achievements: achievements, // from state
    recentHikes: recentHikes, // from state
    goals: goals, // from state
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
                {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
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
                  Joined Since {user.joinDate}
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
                <p className="text-2xl font-bold text-foreground">{user.stats.totalHikes}</p>
                <p className="text-sm text-muted-foreground">Total Hikes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{user.stats.totalDistance}</p>
                <p className="text-sm text-muted-foreground">Distance</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
               <p className="text-2xl font-bold text-foreground">{user.stats.totalElevation}</p>
                <p className="text-sm text-muted-foreground">Elevation</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{user.stats.achievements}</p>
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
            {user.goals && user.goals.length > 0 ? (
              user.goals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{goal.title}</span>
                    <span className="text-sm text-muted-foreground">{goal.currentValue}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-trail h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${goal.currentValue}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Target: {goal.targetValue}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No goals set yet</p>
            )}
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
              {user.achievements && user.achievements.length > 0 ? (
                user.achievements.slice(0, 4).map((achievements, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Medal className="h-8 w-8 text-summit" />
                    <div>
                      <h4 className="font-medium">{achievements.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievements.description}</p>
                      <p className="text-xs text-muted-foreground">Earned {achievements.earnedAt}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground col-span-2">No achievements to display</p>
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
              {user.recentHikes && user.recentHikes.length > 0 ? (
                user.recentHikes.map((hikes, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex-1">
                      <h4 className="font-medium">{hikes.trailName}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {hikes.date}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {hikes.distanceKm}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {hikes.duration}
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        hikes.difficulty === 'Hard' ? 'destructive' :
                        hikes.difficulty === 'Medium' ? 'default' :
                        'secondary'
                      }
                      className="text-xs"
                    >
                      {hikes.difficulty}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No recent hikes completed</p>
              )}
            </div>
          </CardContent>

          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Link to="/edit-profile" className="flex-1" >
              <Button className="w-full bg-gradient-trail text-primary-foreground">
                Edit Profile
              </Button>
            </Link>
            <Button variant="outline" className="flex-1">
              View All Hikes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileView;