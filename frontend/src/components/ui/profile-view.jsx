import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Link } from "react-router-dom";
import { Badge } from '../ui/badge';
import { useEffect, useState, useCallback } from "react";
import { getUserHikeCount } from "../../services/userServices";
import { hikeApiService } from "../../services/hikeApiService.js";
import { getUserStats } from "../../services/statistics";
import { 
  MapPin, 
  Mountain, 
  UserPlus, 
  Target, 
  Award,
  Calendar,
  TrendingUp,
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

function formatHikeDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return "Unknown date";
  
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
}

export const ProfileView = ({ open, onOpenChange, showAddFriend = false }) => {
  const { currentUser } = useAuth();

  const [recentHikes, setRecentHikes] = useState([]);
  const [userStats, setUserStats] = useState({
    totalDistance: 0,
    totalElevation: 0,
  });
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hikeEntries, setHikeEntries] = useState([]);
  const [hikeCount, setHikeCount] = useState(0);

    const loadHikes = useCallback(async () => {
    if (!currentUser) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await hikeApiService.getHikes();
      console.log(" API Response:", response);
      if (response.success) {

        
        // Convert Firestore timestamps to readable dates and ensure all fields are safe for React
        const processedHikes = response.data
          .map(hike => {
            let joinDate = "Unknown";

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
                ? (hike.createdAt.toDate ? hike.createdAt.toDate() : new Date(hike.createdAt))
                : null,
              updatedAt: hike.updatedAt
                ? (hike.updatedAt.toDate ? hike.updatedAt.toDate() : new Date(hike.updatedAt))
                : null,
              startTime: hike.startTime
                ? (hike.startTime.toDate ? hike.startTime.toDate() : new Date(hike.startTime))
                : null,
              endTime: hike.endTime
                ? (hike.endTime.toDate ? hike.endTime.toDate() : new Date(hike.endTime))
                : null,
              title: hike.title || "Untitled Hike",
              location: hike.location || "Unknown Location",
              distance: hike.distance || "0 miles",
              elevation: hike.elevation || "0 ft",
              duration: hike.duration || "0 min",
              weather: hike.weather || "Unknown",
              difficulty: hike.difficulty || "Easy",
              notes: hike.notes || "",
              photos: hike.photos || 0,
              status: hike.status || "completed",
            };
          })
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); // newest first

           console.log("✅ Processed hikes:", processedHikes);
        
        setHikeEntries(processedHikes.slice(0, 2));

      } else {
        setError('Failed to load hikes from server.');
      }
    } catch (err) {
      console.error('Failed to load hikes:', err);
      setError(`Failed to load hikes: ${err.message}`);
      // Keep mock data if API fails
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);


  useEffect(() => {
    if (!currentUser) return;
  
    getUserStats(currentUser.uid).then((stats) => {
      console.log("User stats:", stats);
      setUserStats(stats); // { totalDistance: X, totalElevation: Y }
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
        console.log(" Hike count:", count);
        setHikeCount(count);
      };

      fetchHikeCount();
    }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/users/${currentUser.uid}`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
        
        console.log('Profile data:', data); // Debug log
        console.log('Hikes data:', data.hikes); // Debug log
        
        const allHikes = data.hikes || [];
        
        // Calculate stats from hikes subcollection
        const calculatedStats = {
          totalHikes: allHikes.length,
          totalDistance: 0,
          totalElevation: 0
        };

        // Sum up distance and elevation from all hikes
        allHikes.forEach(hike => {
          // Add distance (handle different field names and formats)
          const distance = parseFloat(hike.distance) || parseFloat(hike.totalDistance) || 0;
          calculatedStats.totalDistance += distance;

          // Add elevation (handle different field names and formats)
          const elevation = parseFloat(hike.elevation) || 
                          parseFloat(hike.elevationGain) || 
                          parseFloat(hike.totalElevation) || 0;
          calculatedStats.totalElevation += elevation;
        });

        // Round the totals
        calculatedStats.totalDistance = Math.round(calculatedStats.totalDistance * 10) / 10; // 1 decimal place
        calculatedStats.totalElevation = Math.round(calculatedStats.totalElevation);

        console.log('Calculated stats:', calculatedStats); // Debug log

        // Update the profile data with calculated stats
        setProfile(prevProfile => ({
          ...prevProfile,
          stats: calculatedStats
        }));
        
        // Sort hikes by date (most recent first) and take only the first 2
        const sortedHikes = allHikes
          .filter(hike => hike.status === 'completed') // Only show completed hikes
          .sort((a, b) => {
            const dateA = new Date(b.endTime || b.startTime || b.date);
            const dateB = new Date(a.endTime || a.startTime || a.date);
            return dateA - dateB;
          })
          .slice(0, 2);
        
        console.log('Sorted hikes:', sortedHikes); // Debug log
        setRecentHikes(sortedHikes);
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
    name: profile?.displayName || "No name",
    email: profile?.email || "No email",
    joinDate: joinDate,
    location: profile?.location || "Not set",
    bio: profile?.bio || "No bio yet",
    stats: {
      totalHikes: profile?.stats?.totalHikes || 0,
      totalDistance: profile?.stats?.totalDistance ? `${profile.stats.totalDistance} km` : "0.0 km",
      totalElevation: profile?.stats?.totalElevation ? `${profile.stats.totalElevation} m` : "0 m",
    },
    recentHikes: recentHikes,
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
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
                <p className="text-2xl font-bold text-forest">{userStats.totalDistance} miles</p>
                <p className="text-sm text-muted-foreground">Distance</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
               <p className="text-2xl font-bold text-foreground">{userStats.totalElevation} ft</p>
                <p className="text-sm text-muted-foreground">Elevation</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-trail">0</p>
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
              <p className="text-muted-foreground">No goals set yet</p>
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
                <p className="text-muted-foreground col-span-2">No achievements to display</p>
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
                {user.recentHikes.length > 0 ? (
                  user.recentHikes.map((hike, index) => (
                    <Card key={hike.id || index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-foreground">
                              {hike.name || hike.title || `Hike ${index + 1}`}
                            </h4>
                            {hike.difficulty && (
                              <Badge className={`${getDifficultyColor(hike.difficulty)} text-white text-xs`}>
                                {hike.difficulty}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatHikeDate(hike.endTime || hike.startTime || hike.date)}
                            </span>
                            {(hike.distance || hike.totalDistance) && (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {(parseFloat(hike.distance || hike.totalDistance) || 0).toFixed(1)} km
                              </span>
                            )}
                            {(hike.elevationGain || hike.elevation || hike.totalElevation) && (
                              <span>
                                {(parseFloat(hike.elevationGain || hike.elevation || hike.totalElevation) || 0).toFixed(0)} m elevation
                              </span>
                            )}
                          </div>
                          
                          {hike.notes && (
                            <p className="text-sm text-muted-foreground">
                              {hike.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground">No recent hikes completed</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex pt-4">
            <Link to="/edit-profile" className="w-full">
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