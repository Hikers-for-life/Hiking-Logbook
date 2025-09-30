import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { getUserHikeCount } from "../../services/userServices";
import { hikeApiService } from "../../services/hikeApiService.js";
import { useEffect, useState, useCallback } from "react";
import { getUserStats } from "../../services/statistics";
import { discoverFriends, addFriend } from "../../services/discover";
import { useToast } from "../../hooks/use-toast";
import { 
 Calendar, 
  MapPin, 
  Mountain, 
  Clock, 
  UserPlus, 
  MessageCircle, 
  Check, Loader2 ,
  Target, 
  Award, 
  Medal, 
  TrendingUp 
} from "lucide-react";

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

export const ProfileView = ({ open, onOpenChange, person, showAddFriend = false }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hikeEntries, setHikeEntries] = useState([]);
  const [hikeCount, setHikeCount] = useState(0);
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [userStats, setUserStats] = useState({
    totalDistance: 0,
    totalElevation: 0,
  });

  // replace inside view-friend-profile.jsx
const loadHikes = useCallback(async () => {
  if (!person) return;

  try {
    setIsLoading(true);
    setError(null);

    // --- CALL BACKEND FOR SPECIFIC USER ---
    const res = await fetch(`http://localhost:3001/api/users/${person.uid}/hikes?limit=2`);
    const response = await res.json();
    console.log("API Response for person.hikes:", response);

    if (response.success) {
      const processedHikes = response.data
        .map(hike => {
          // same processing you had
          let joinDate = "Unknown";
          if (hike?.createdAt) {
            const createdAt = hike.createdAt;
            if (createdAt.toDate) joinDate = formatDate(createdAt.toDate());
            else if (createdAt._seconds) joinDate = formatDate(new Date(createdAt._seconds * 1000));
            else joinDate = formatDate(new Date(createdAt));
          }
          return {
            ...hike,
            date: joinDate,
            createdAt: hike.createdAt
              ? (hike.createdAt.toDate ? hike.createdAt.toDate() : new Date(hike.createdAt))
              : null,
            // ...other conversions and defaults
            title: hike.title || "Untitled Hike",
            location: hike.location || "Unknown Location",
            distance: hike.distance || "0 miles",
            duration: hike.duration || "0 min",
            difficulty: hike.difficulty || "Easy",
          };
        })
        // If backend already ordered & limited, no need to sort/slice. Keep safe:
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      setHikeEntries(processedHikes.slice(0, 2));
    } else {
      setError("Failed to load hikes from server.");
    }
  } catch (err) {
    console.error("Failed to load hikes:", err);
    setError(`Failed to load hikes: ${err.message}`);
  } finally {
    setIsLoading(false);
  }
}, [person]);


useEffect(() => {
  if (!person) return;
  const fetchHikeCount = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/users/${person.uid}/hikes/count`);
      const data = await res.json();
      if (data.success) {
        setHikeCount(data.count);
      } else {
        console.warn("Count fetch failed:", data);
        setHikeCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch hike count:", err);
      setHikeCount(0);
    }
  };
  fetchHikeCount();
}, [person]);

    useEffect(() => {
      if (person) {
        loadHikes();
      } else {
        setIsLoading(false);
      }
    }, [person, loadHikes]);

    
 useEffect(() => {
  if (!person) return;

  const fetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/users/${person.uid}/stats`);
      const data = await res.json();

      if (data.success) {
        setUserStats({
          totalDistance: data.totalDistance,
          totalElevation: data.totalElevation,
        });
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  fetchStats();
}, [person]);

  
  if (!person) return null;

  
  let joinDate = "Unknown";

  if (person?.createdAt) {
    const createdAt = person.createdAt;

    if (createdAt.toDate) {
      joinDate = formatDate(createdAt.toDate());
    } else if (createdAt._seconds) {
      joinDate = formatDate(new Date(createdAt._seconds * 1000));
    } else {
      joinDate = formatDate(new Date(createdAt));
    }
  }
  // Enhanced profile data with achievements and recent hikes
  const profileData = {
    
    ...person,
    name: person.displayName || "No name",
    bio: person.bio || "No bio yet",
    achievements: person.achievements || [
      { name: "Peak Collector", description: "Completed 10+ mountain peaks", earned: "2 weeks ago" },
      { name: "Early Bird", description: "Started 20+ hikes before sunrise", earned: "1 month ago" },
      { name: "Trail Master", description: "Completed 50+ different trails", earned: "2 months ago" },
      { name: "Endurance Champion", description: "Hiked 100+ km in a month", earned: "3 months ago" }
    ],
    recentHikes: person.recentHikes || [
      { name: "Mount Rainier Trail", date: "2 days ago", distance: "8.5 km", duration: "4h 23m", difficulty: "Hard" },
      { name: "Forest Discovery Loop", date: "1 week ago", distance: "5.2 km", duration: "2h 15m", difficulty: "Medium" },
      { name: "Sunset Ridge Trail", date: "2 weeks ago", distance: "6.8 km", duration: "3h 45m", difficulty: "Medium" },
      { name: "Alpine Lake Circuit", date: "3 weeks ago", distance: "12.1 km", duration: "5h 30m", difficulty: "Hard" }
    ],
    goals: person.goals || [
      { name: "Complete Pacific Crest Trail section", progress: 65, target: "End of year" },
      { name: "Hike 500km this year", progress: 78, target: "December 2024" }
    ],
    joinedDate: joinDate || "March 2023",
    totalElevation: person.totalElevation || "15,420m"
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
                {profileData.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">{profileData.name}</h2>
                  {profileData.status === 'online' && (
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  )}
                </div>
                <p className="text-muted-foreground flex items-center gap-1 mb-2">
                  <MapPin className="h-4 w-4" />
                  {profileData.location  || "Not yet set"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Joined since {profileData.joinedDate}
                </p>
              </div>
              
              <p className="text-foreground">{profileData.bio}</p>
              
              <div className="flex gap-3">
                {showAddFriend ? (
                  <Button
                  className={`bg-gradient-trail text-primary-foreground hover:bg-gradient-to-r hover:from-green-600 hover:to-green-400 
                    ${isFriend ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isFriend || isAdding}
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (isFriend) return;

                    try {
                      setIsAdding(true);
                      await addFriend(person.uid);
                      toast({
                        title: "Friend added",
                        description: "Friendship created successfully!",
                      });
                      setIsFriend(true); // ✅ switch to "already friends"
                    } catch (err) {
                      console.error("Failed to add friend:", err);
                    } finally {
                      setIsAdding(false);
                    }
                  }}
                >
                  {isFriend ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Friend Added
                    </>
                  ) : isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Friend
                    </>
                  )}
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
                <p className="text-2xl font-bold text-foreground">{hikeCount}</p>
                <p className="text-sm text-muted-foreground">Total Hikes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-forest">{userStats.totalDistance} km</p>
                <p className="text-sm text-muted-foreground">Distance</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-sky">{userStats.totalElevation} m</p>
                <p className="text-sm text-muted-foreground">Elevation</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-trail">{profileData.achievements?.length || 0}</p>
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
              {profileData.goals.map((goal, index) => (
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
                {profileData.achievements.slice(0, 4).map((achievement, index) => (
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
                                {hike.date || "No date"}
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
                              hike.difficulty === "Hard"
                                ? "destructive"
                                : hike.difficulty === "Medium"
                                ? "default"
                                : "secondary"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};