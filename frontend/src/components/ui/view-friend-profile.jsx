import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { getUserHikeCount } from "../../services/userServices";
import { hikeApiService } from "../../services/hikeApiService.js";
import { useEffect, useState, useCallback } from "react";
import { getUserStats } from "../../services/statistics";
import { discoverFriends, sendFriendRequest, checkFriendStatus } from "../../services/discover";
import { useToast } from "../../hooks/use-toast";
import { ChatBox } from "./chat-box";
import {
  Calendar,
  MapPin,
  Mountain,
  Clock,
  UserPlus,
  MessageCircle,
  Check,
  Loader2,
  Target,
  Award,
  Medal,
  TrendingUp
} from "lucide-react";


const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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

export const ProfileView = ({
  open,
  onOpenChange,
  person,
  showAddFriend = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hikeEntries, setHikeEntries] = useState([]);
  const [hikeCount, setHikeCount] = useState(0);
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [userStats, setUserStats] = useState({
    totalDistance: 0,
    totalElevation: 0,
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [achievementsLoading, setAchievementsLoading] = useState(false);

  // replace inside view-friend-profile.jsx
  const loadHikes = useCallback(async () => {
    if (!person) return;

    try {
      setIsLoading(true);
      setError(null);

      // --- CALL BACKEND FOR SPECIFIC USER ---
      const res = await fetch(
        `${API_BASE_URL}/users/${person.uid}/hikes?limit=2`
      );
      const response = await res.json();
      console.log('API Response for person.hikes:', response);

      if (response.success) {
        const processedHikes = response.data
          .map((hike) => {
            // same processing you had
            let joinDate = 'Unknown';
            if (hike?.createdAt) {
              const createdAt = hike.createdAt;
              if (createdAt.toDate) joinDate = formatDate(createdAt.toDate());
              else if (createdAt._seconds)
                joinDate = formatDate(new Date(createdAt._seconds * 1000));
              else joinDate = formatDate(new Date(createdAt));
            }
            return {
              ...hike,
              date: joinDate,
              createdAt: hike.createdAt
                ? hike.createdAt.toDate
                  ? hike.createdAt.toDate()
                  : new Date(hike.createdAt)
                : null,
              // ...other conversions and defaults
              title: hike.title || 'Untitled Hike',
              location: hike.location || 'Unknown Location',
              distance: hike.distance || '0 km',
              duration: hike.duration || '0 min',
              difficulty: hike.difficulty || 'Easy',
            };
          })
          // If backend already ordered & limited, no need to sort/slice. Keep safe:
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

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
  }, [person]);

  // Load goals
  const loadGoals = useCallback(async () => {
    if (!person) return;

    try {
      setGoalsLoading(true);
      const res = await fetch(`${API_BASE_URL}/users/${person.uid}/goals?limit=5&status=active`);
      const response = await res.json();

      if (response.success) {
        setGoals(response.data);
      } else {
        console.warn('Failed to load goals:', response.error);
        setGoals([]);
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
      setGoals([]);
    } finally {
      setGoalsLoading(false);
    }
  }, [person]);

  // Load achievements
  const loadAchievements = useCallback(async () => {
    if (!person) return;

    try {
      setAchievementsLoading(true);
      const res = await fetch(`${API_BASE_URL}/users/${person.uid}/achievements?limit=4`);
      const response = await res.json();

      if (response.success) {
        setAchievements(response.data);
      } else {
        console.warn('Failed to load achievements:', response.error);
        setAchievements([]);
      }
    } catch (err) {
      console.error('Failed to load achievements:', err);
      setAchievements([]);
    } finally {
      setAchievementsLoading(false);
    }
  }, [person]);

  useEffect(() => {
    if (!person) return;
    const fetchHikeCount = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/users/${person.uid}/hikes/count`
        );
        const data = await res.json();
        if (data.success) {
          setHikeCount(data.count);
        } else {
          console.warn('Count fetch failed:', data);
          setHikeCount(0);
        }
      } catch (err) {
        console.error('Failed to fetch hike count:', err);
        setHikeCount(0);
      }
    };
    fetchHikeCount();
  }, [person]);

  useEffect(() => {
    if (person) {
      loadHikes();
      loadGoals();
      loadAchievements();
    } else {
      setIsLoading(false);
    }
  }, [person, loadHikes, loadGoals, loadAchievements]);

  useEffect(() => {
    if (!person) return;

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${person.uid}/stats`);
        const data = await res.json();

        if (data.success) {
          setUserStats({
            totalDistance: data.totalDistance,
            totalElevation: data.totalElevation,
          });
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchStats();
  }, [person]);

  // Check friend status when profile opens
  useEffect(() => {
    if (!person || !showAddFriend) return;

    // Clear any stale localStorage entry for this user on profile open
    try {
      const staleEntry = localStorage.getItem(`pending_request_${person.uid}`);
      if (staleEntry && staleEntry.trim() !== '') {
        console.log('Found stale localStorage entry for', person.uid, '- will verify with backend');
      }
    } catch (e) {
      console.warn('Error checking localStorage:', e);
    }

    const checkStatus = async () => {
      try {
        const status = await checkFriendStatus(person.uid);

        if (status.status === 'friends') {
          setIsFriend(true);
          setRequestSent(false);
        } else if (status.status === 'request_sent') {
          setIsFriend(false);
          setRequestSent(true);
        } else if (status.status === 'request_received') {
          setIsFriend(false);
          setRequestSent(false);
        } else {
          // For 'none' status, check localStorage as fallback
          try {
            const localPending = localStorage.getItem(`pending_request_${person.uid}`);
            if (localPending && localPending.trim() !== '') {
              setRequestSent(true);
            } else {
              setRequestSent(false);
            }
          } catch (e) {
            setRequestSent(false);
          }
          setIsFriend(false);
        }
      } catch (err) {
        console.error('Failed to check friend status:', err);
        // On error, check localStorage as fallback
        try {
          const localPending = localStorage.getItem(`pending_request_${person.uid}`);
          setRequestSent(!!(localPending && localPending.trim() !== ''));
        } catch (e) {
          setRequestSent(false);
        }
        setIsFriend(false);
      }
    };

    checkStatus();
  }, [person, showAddFriend]);

  // Reset states when profile closes
  useEffect(() => {
    if (!open) {
      setRequestSent(false);
      setIsFriend(false);
      setIsAdding(false);
    }
  }, [open]);

  if (!person) return null;

  let joinDate = 'Unknown';

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
  // Profile data with real data only
  const profileData = {
    ...person,
    name: person.displayName || 'No name',
    bio: person.bio || 'No bio yet',
    achievements: achievements,
    goals: goals,
    joinedDate: joinDate || 'Unknown',
    totalElevation: person.totalElevation || '0m',
  };

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
                {profileData.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {profileData.name}
                  </h2>
                  {profileData.status === 'online' && (
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  )}
                </div>
                <p className="text-muted-foreground flex items-center gap-1 mb-2">
                  <MapPin className="h-4 w-4" />
                  {profileData.location || 'Not yet set'}
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
                    ${isFriend || requestSent ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isFriend || isAdding || requestSent}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (isFriend) return;

                      try {
                        setIsAdding(true);
                        const resp = await sendFriendRequest(person.uid);
                        toast({
                          title: 'Request sent',
                          description: 'Friend request sent.',
                        });
                        // Refresh friend status from backend instead of relying on localStorage
                        try {
                          const updatedStatus = await checkFriendStatus(person.uid);
                          if (updatedStatus.status === 'request_sent') {
                            setRequestSent(true);
                            setIsFriend(false);
                          } else if (updatedStatus.status === 'friends') {
                            setRequestSent(false);
                            setIsFriend(true);
                          } else {
                            setRequestSent(false);
                            setIsFriend(false);
                          }
                        } catch (statusErr) {
                          console.warn('Failed to refresh friend status, marking as sent:', statusErr);
                          setRequestSent(true);
                        }
                        // Notify other parts of the UI (Discover) that a request was sent
                        try {
                          window.dispatchEvent(
                            new CustomEvent('friend-request-sent', {
                              detail: {
                                id: person.uid,
                                requestId: resp?.requestId,
                              },
                            })
                          );
                        } catch (e) { }
                      } catch (err) {
                        console.error('Failed to send friend request:', err);
                        toast({
                          title: 'Request failed',
                          description: 'Could not send friend request.',
                          variant: 'destructive',
                        });
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
                    ) : requestSent ? (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Request Sent
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
                  <Button
                    variant="outline"
                    onClick={() => setIsChatOpen(true)}
                  >
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
                <p className="text-2xl font-bold text-foreground">
                  {hikeCount}
                </p>
                <p className="text-sm text-muted-foreground">Total Hikes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-forest">
                  {parseFloat(userStats.totalDistance.toFixed(1))} km
                </p>
                <p className="text-sm text-muted-foreground">Distance</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-sky">
                  {userStats.totalElevation} ft
                </p>
                <p className="text-sm text-muted-foreground">Elevation</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-trail">
                  {profileData.achievements?.length || 0}
                </p>
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
              {goalsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-sm">
                    Loading goals...
                  </p>
                </div>
              ) : goals.length > 0 ? (
                goals.map((goal, index) => (
                  <div key={goal.id || index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{goal.title || goal.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-trail h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Target: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No target date'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No active goals to display yet
                </p>
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
              {achievementsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-sm">
                    Loading achievements...
                  </p>
                </div>
              ) : achievements.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted"
                    >
                      <Medal className="h-8 w-8 text-summit" />
                      <div>
                        <h4 className="font-medium">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Earned {achievement.earned}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No achievements to display yet
                </p>
              )}
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
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Loading recent hikes...
                    </p>
                  </div>
                ) : error ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    {error}
                  </p>
                ) : hikeEntries.length > 0 ? (
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
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No recent hikes to display yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>

      {/* Chat Dialog */}
      <ChatBox
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        otherUser={person}
      />
    </Dialog>
  );
};
