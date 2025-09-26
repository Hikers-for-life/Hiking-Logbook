import { useEffect,useState } from "react";
import { Navigation } from "../components/ui/navigation";
import { Button } from "../components/ui/button";
import { Card,CardHeader,CardFooter,CardTitle,CardDescription,CardContent,} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {  Badge, badgeVariants  } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import {   Tabs, TabsList, TabsTrigger, TabsContent} from "../components/ui/tabs";
import { ProfileView } from "../components/ui/view-friend-profile";
import { fetchFeed, likeFeed, commentFeed, shareFeed, fetchComments, deleteCommentFeed,deleteFeed } from "../services/feed";//ANNAH HERE
import { discoverFriends, addFriend , getUserDetails  } from "../services/discover";//ANNAH HERE
import { getFirestore} from "firebase/firestore";
import { getAuth } from "firebase/auth";//NOT SURE ABOUT THIS IMPORT//ANNA HERE
import { Search, UserPlus,  MapPin,  TrendingUp, Mountain,Clock,Medal,Users,Share2,Heart,MessageSquare } from "lucide-react";


const Friends = () => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
//ANNAH HERE

  const [recentActivity, setRecentActivity] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
//ANNAH HERE

  const handleViewProfile = async (person, showAddFriend = false) => {
  try {
    let details = person;

    // if only id/name provided, fetch full details
    if (person.id) {
      details = await getUserDetails(person.id);
    }

    setSelectedProfile({ ...details, showAddFriend });
    setIsProfileOpen(true);
  } catch (err) {
    console.error("Failed to fetch profile details:", err);
    setSelectedProfile({ ...person, showAddFriend }); // fallback
    setIsProfileOpen(true);
  }
};
  const friends = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "SJ",
      location: "Seattle, WA",
      totalHikes: 47,
      totalDistance: "234 km",
      lastHike: "Mount Rainier Trail",
      lastHikeDate: "2 days ago",
      status: "online",
      recentAchievement: "100km Milestone"
    },
    {
      id: 2,
      name: "Marcus Williams",
      avatar: "MW",
      location: "Denver, CO",
      totalHikes: 62,
      totalDistance: "387 km",
      lastHike: "Rocky Mountain Loop",
      lastHikeDate: "1 week ago",
      status: "offline",
      recentAchievement: "Peak Collector"
    },
    {
      id: 3,
      name: "Emma Chen",
      avatar: "EC",
      location: "Portland, OR",
      totalHikes: 33,
      totalDistance: "156 km",
      lastHike: "Forest Park Trail",
      lastHikeDate: "3 days ago",
      status: "online",
      recentAchievement: "Early Bird"
    },
    {
      id: 4,
      name: "David Rodriguez",
      avatar: "DR",
      location: "Phoenix, AZ",
      totalHikes: 55,
      totalDistance: "298 km",
      lastHike: "Camelback Mountain",
      lastHikeDate: "5 days ago",
      status: "offline",
      recentAchievement: "Desert Explorer"
    },
    {
      id: 5,
      name: "Aisha Patel",
      avatar: "AP",
      location: "San Francisco, CA",
      totalHikes: 71,
      totalDistance: "445 km",
      lastHike: "Muir Woods Trail",
      lastHikeDate: "1 day ago",
      status: "online",
      recentAchievement: "Trail Master"
    }
  ];
  //ANNAH HERE
const auth = getAuth();

  useEffect(() => {
    let isMounted = true;

    const loadFeed = async () => {
      try {
        setLoading(true);
        const data = await fetchFeed(); // fetches activities WITH comments included
        if (!isMounted) return;

        // Each activity object can now include a comments array
        const activitiesWithComments = (Array.isArray(data) ? data : data.activities || []).map(a =>  ({
          ...a,
          comments: a.comments || [], // default empty array if backend doesn’t include
        }));

        setRecentActivity(activitiesWithComments);
      } catch (err) {
        console.error("Failed to fetch feed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFeed();
    return () => { isMounted = false; };
  }, []);


  // ---- Like handler ----
  const handleLike = async (activity) => {
    const uid = auth?.currentUser.uid;
    if (!uid) return; 

    // Optimistic UI update
    setRecentActivity(prev => prev.map(a => {
      if (a.id === activity.id) {
        const likes = a.likes?.includes(uid)
          ? a.likes.filter(l => l !== uid)
          : [...(a.likes || []), uid];
        return { ...a, likes };
      }
      return a;
    }));

    try {
      await likeFeed(activity.id, !activity.likes?.includes(uid));
    } catch (err) {
      console.error("Failed to like:", err);
      // rollback if needed
      setRecentActivity(prev => prev.map(a => {
        if (a.id === activity.id) {
          const likes = activity.likes || [];
          return { ...a, likes };
        }
        return a;
      }));
    }
  };

  // ---- Comment handler ----
  const handleAddComment = async (activityId, content) => {
    if (!content.trim()) return;
    const user = auth?.currentUser;

    // Optimistic UI update
    const tempComment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.uid,
      name: user.displayName || user.email,
      content,
    };
    setRecentActivity(prev =>
      prev.map(a =>
        a.id === activityId
          ? { ...a, comments: [...(a.comments || []), tempComment] }
          : a
      )
    );
    try {
     const res = await commentFeed(activityId, content);
      setRecentActivity(prev =>
        prev.map(a =>
          a.id === activityId
            ? {
                ...a,
                comments: [
                  ...(a.comments || []).filter(c => c.id !== tempComment.id),
                  res.comment,
                ],
              }
            : a
        )
      );
    } catch (err) {
      console.error("Failed to add comment:", err);
      // rollback temp comment
      setRecentActivity(prev =>
        prev.map(a =>
          a.id === activityId
            ? {
                ...a,
                comments: (a.comments || []).filter(c => c.id !== tempComment.id),
              }
            : a
        )
      );
    }
  };
  const handleDeleteComment = async (activityId, commentId) => {
  // Optimistic update
  setRecentActivity(prev =>
    prev.map(a =>
      a.id === activityId
        ? { ...a, comments: a.comments.filter(c => c.id !== commentId) }
        : a
    )
  );

  try {
    await deleteCommentFeed(activityId, commentId);
  } catch (err) {
    console.error("Failed to delete comment:", err);
    // Optional: refetch comments here if you want rollback
  }
};



  // ---- Share handler ----
  // ---- Share handler ----
const handleShare = async (activity) => {
  const user = auth.currentUser;

  // Embed the original activity data directly
  const originalData = {
    id: activity.id,
    name: activity.name,
    avatar: activity.avatar,
    action: activity.action,
    hike: activity.hike,
    description: activity.description,
    time: activity.time,
    stats: activity.stats,
    photo: activity.photo,
    likes: activity.likes || [],
    comments: activity.comments || [],
  };

  // Optimistic share object
  const tempShare = {
    id: Math.random().toString(36).substr(2, 9),
    type: "share",
    original: originalData,
    userId: user.uid,
    name: user.displayName || user.email,
    avatar: user.displayName?.[0] || user.email?.[0] || "?",
    created_at: new Date().toISOString(),
    likes: [],
    comments: [],
  };

  // Optimistic UI update
  setRecentActivity((prev) => [tempShare, ...prev]);

  try {
    // ✅ use service function instead of fetch
    const data = await shareFeed(activity.id, {
      sharerId: user.uid,
      sharerName: user.displayName || user.email,
      sharerAvatar: tempShare.avatar,
      original: originalData,
    });

    // Replace temp with persisted version
    setRecentActivity((prev) =>
      prev.map((a) =>
        a.id === tempShare.id ? { ...tempShare, id: data.newActivityId } : a
      )
    );
  } catch (err) {
    console.error("Failed to share:", err);
    // rollback optimistic
    setRecentActivity((prev) => prev.filter((a) => a.id !== tempShare.id));
  }
};

const handleDeletePost = async (activityId) => {
  // Optimistic UI update: remove the post locally first
  const prevActivity = [...recentActivity];
  setRecentActivity(prev => prev.filter(a => a.id !== activityId));

  try {
    // Call a backend/service function to delete the post
    await deleteFeed(activityId); // <-- you need to implement this in services/feed.js
  } catch (err) {
    console.error("Failed to delete post:", err);
    // Rollback if deletion fails
    setRecentActivity(prevActivity);
  }
};

  
  const handlePostAchievement = async () => {
  const user = auth?.currentUser;
  const displayName = user.displayName || user.email.split("@")[0];

  const mockedActivity = {
    id: Math.random().toString(36).substr(2, 9),
    type: "achievement", // optional, helps distinguish achievements
    userId: user.uid,     // very important for ownership & delete button
    name: displayName,    // match the activity feed key
    avatar: displayName[0].toUpperCase(),
    action: "completed",
    hike: "Mount Rainier Trail",
    description: "Beautiful day!",
    stats: "5km in 1h 30min",
    time: "just now",
    likes: [],
    comments: [],
  };

  setRecentActivity(prev => [mockedActivity, ...prev]);
};//ANNAH HERE


  useEffect(() => {
    if (!auth?.currentUser) return;
    const loadSuggestions = async () => {
      try {
        setLoading(true);
        const data = await discoverFriends();
        setSuggestions(data);
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSuggestions();
  }, [auth?.currentUser]);


  // ---- Add Friend handler ----
  const handleAddFriend = async (friendId) => {
  try {
    await addFriend(friendId); // uses backend API
    setSuggestions(prev => prev.filter(s => s.id !== friendId)); // remove locally
    console.log(`Friend ${friendId} added successfully!`);
  } catch (err) {
    console.error("Failed to add friend:", err);
  }
};


  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Friends & Community</h1>
          <p className="text-muted-foreground">Connect with fellow hikers and share your adventures.</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search for friends or hikers..." 
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">My Friends</TabsTrigger>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>
{/*MY FRIENDS */}
          <TabsContent value="friends" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friends.map((friend) => (
                <Card key={friend.id} className="bg-card border-border shadow-elevation">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{friend.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{friend.name}</h3>
                          <div className={`w-2 h-2 rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {friend.location}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-summit">{friend.totalHikes}</p>
                        <p className="text-xs text-muted-foreground">Hikes</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-forest">{friend.totalDistance}</p>
                        <p className="text-xs text-muted-foreground">Distance</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mountain className="h-4 w-4 text-trail" />
                        <span className="text-muted-foreground">Last hike:</span>
                      </div>
                      <p className="text-sm font-medium">{friend.lastHike}</p>
                      <p className="text-xs text-muted-foreground">{friend.lastHikeDate}</p>
                    </div>

                    <Badge variant="secondary" className="text-xs">
                      <Medal className="h-3 w-3 mr-1" />
                      {friend.recentAchievement}
                    </Badge>

                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => handleViewProfile(friend)}
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
{/*ACTIVITY FEED*/ }
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-card border-border shadow-elevation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-forest" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recentActivity.map((activity) => {
                    const isOwnPost = activity.userId === auth.currentUser.uid; // works for normal & shared

                    return (
                      <div key={activity.id} className="p-4 rounded-lg bg-muted space-y-3">
                        {/* ---- If shared post ---- */}
                        {activity.type === "share" ? (
                          <>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8" onClick={() => handleViewProfile({ id: activity.userId })}>
                                <AvatarFallback>{activity.name[0]}</AvatarFallback>
                              </Avatar>
                              <p className="text-sm">
                                <span className="font-medium" onClick={() => handleViewProfile({ id: activity.userId })}>{activity.name}</span>{" "}
                                <span className="text-muted-foreground">shared</span>{" "}
                                <span className="font-medium"onClick={() => handleViewProfile({ id: activity.userId })}>{activity.original.name}</span>’s post
                              </p>
                            </div>

                            {/* Original post preview */}
                            <div className="ml-6 mt-3 p-3 rounded-md border bg-background space-y-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8" onClick={() => handleViewProfile({ id: activity.userId })}>
                                  <AvatarFallback>{activity.original.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-sm">
                                    <span className="font-medium" onClick={() => handleViewProfile({ id: activity.userId })}>{activity.original.name}</span>{" "}
                                    <span className="text-muted-foreground">{activity.original.action}</span>{" "}
                                    <span className="font-medium">{activity.original.hike}</span>
                                  </p>
                                  <div className="flex items-center gap-4 mt-1">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {activity.original.time}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{activity.original.stats}</p>
                                  </div>
                                </div>
                              </div>

                              {activity.original.description && (
                                <p className="text-sm text-foreground">{activity.original.description}</p>
                              )}
                            </div>
                          </>
                        ) : (
                          /* ---- Normal post ---- */
                          <div className="flex items-center gap-3">
                            <Avatar
                              className="h-10 w-10 cursor-pointer"
                              onClick={() => handleViewProfile({ name: activity.friend, avatar: activity.avatar, id: activity.userId})}
                            >
                              <AvatarFallback>{activity.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm">
                                <span
                                  className="font-medium cursor-pointer hover:underline"
                                  onClick={() => handleViewProfile({ name: activity.name, avatar: activity.avatar, id: activity.userId })}
                                >
                                  {activity.name}
                                </span>
                                <span className="text-muted-foreground"> {activity.action} </span>
                                <span className="font-medium">{activity.hike}</span>
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {activity.time}
                                </p>
                                <p className="text-xs text-muted-foreground">{activity.stats}</p>
                                {activity.photo && (
                                  <Badge variant="outline" className="text-xs">
                                    📷 Photo
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Description for non-share posts */}
                        {activity.type !== "share" && activity.description && (
                          <p className="text-sm text-foreground pl-13">{activity.description}</p>
                        )}

                        {/* Actions (Like, Comment, Share, Delete) */}
                        <div className="flex items-center gap-6 pl-13">
                          <button
                            onClick={() => handleLike(activity)}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Heart
                              className={`h-4 w-4 ${activity.likes?.includes(auth.currentUser.uid) ? "text-red-500 fill-red-500" : ""}`}
                            />
                            {activity.likes?.length || 0}
                          </button>

                          <button
                            onClick={() =>
                              setExpandedComments((prev) => ({
                                ...prev,
                                [activity.id]: !prev[activity.id],
                              }))
                            }
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <MessageSquare className="h-4 w-4" />
                            {commentsMap[activity.id]?.length || activity.comments?.length || 0}
                          </button>

                          <button
                            onClick={() => handleShare(activity.type === "share" ? activity.original : activity)}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Share2 className="h-4 w-4" />
                            Share
                          </button>

                          {isOwnPost && (
                            <button
                              onClick={() => handleDeletePost(activity.id)}
                              className="text-red-500 hover:underline ml-2 text-sm"
                            >
                              Delete Post
                            </button>
                          )}
                        </div>

                        {/* Comments */}
                        {expandedComments[activity.id] && (
                          <div className="pl-13 mt-2 space-y-1">
                            {(activity.comments || []).map((comment) => (
                              <div
                                key={comment.id}
                                className="flex items-center justify-between text-xs text-muted-foreground"
                              >
                                <span className="flex items-center">
                                  <span className="font-medium">{comment.name || comment.email}:</span>{" "}
                                  {comment.content}
                                </span>
                                {comment.userId === auth.currentUser.uid && (
                                  <button
                                    onClick={() => handleDeleteComment(activity.id, comment.id)}
                                    className="text-red-500 hover:underline ml-2"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            ))}

                            <textarea
                              rows={2}
                              placeholder="Add a comment..."
                              className="text-sm w-full border rounded-md px-2 py-1 resize-none focus:outline-none focus:ring-2 focus:ring-summit"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddComment(activity.id, e.target.value);
                                  e.target.value = "";
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


{/*DISCOVER */}
      {/* DISCOVER */}
          <TabsContent value="discover" className="space-y-6">
            <Card className="bg-card border-border shadow-elevation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-sky" />
                  Suggested Friends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-muted-foreground text-sm">Loading suggestions...</p>
                  ) : suggestions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No suggestions at the moment.</p>
                  ) : (
                    suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                        onClick={() => handleViewProfile(suggestion, true)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>{suggestion.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-foreground" onClick={() => handleViewProfile({ id: suggestion.id })}> {suggestion.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {suggestion.mutualFriends} mutual friends
                            </p>
                            <div className="flex gap-1 mt-1">
                              {suggestion.commonTrails.map((trail) => (
                                <Badge key={trail} variant="outline" className="text-xs">
                                  {trail}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={async (e) => {
                            e.stopPropagation(); // prevent opening profile modal
                            try {
                              await addFriend(suggestion.id); // ✅ uses service
                              setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
                              console.log(`Friend ${suggestion.name} added!`);
                            } catch (err) {
                              console.error("Failed to add friend:", err);
                            }
                          }}
                        >
                          Add Friend
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>

      <ProfileView 
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        person={selectedProfile}
        showAddFriend={selectedProfile?.showAddFriend || false}
      />
    </div>
  );
};

export default Friends;