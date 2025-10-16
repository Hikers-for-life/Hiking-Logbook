import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Link } from "react-router-dom";

import { Badge } from '../ui/badge';
import { useEffect, useState, useCallback } from "react";
import { getUserHikeCount } from "../../services/userServices";
import { getUserProfile} from "../../services/userServices";
import { hikeApiService } from "../../services/hikeApiService.js";
import { getUserStats } from "../../services/statistics";

import { 
  MapPin, 
  Mountain, 
  UserPlus, 
  Target, 
  Clock,
  Calendar,
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

  const [recentHikes, setRecentHikes] = useState([]);

  const [userStats, setUserStats] = useState({
    totalDistance: 0,
    totalElevation: 0,
  });
  const [profile, setProfile] = useState({
    userName: " ",
    location: " ",
    joinDate: " ",
    bio: " " ,
  });
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
              distance: hike.distance || "0 km",
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
                  <h2 className="text-2xl font-bold text-foreground">{profile.userName}</h2>
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



          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Link to="/edit-profile" className="flex-1" >

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
