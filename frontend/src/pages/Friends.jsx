import { useState , useEffect} from "react";
import { Navigation } from "../components/ui/navigation";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { searchUsers } from "../services/userServices";
import { ProfileView } from "../components/ui/view-friend-profile";
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from "../hooks/use-toast";

import { 
  Search, 
  UserPlus, 
  MapPin, 
  TrendingUp,
  Mountain,
  Clock,
  Medal,
  Users,
  Share2,
  Heart,
  MessageSquare
} from "lucide-react";

const Friends = () => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState("");
   const { currentUser } = useAuth(); 
   const [friends, setFriends] = useState([]); 
    const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    const results = await searchUsers(searchTerm.trim());
    if (results.length === 0) {
      setSearchError("No hikers found with that name.");
      setSearchResults([]);
    } else {
      setSearchError("");
      setSearchResults(results);
    }
  };

  useEffect(() => {
  const fetchFriends = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/friends/${currentUser.uid}`);
      const data = await res.json();
      if (data.success) {
        setFriends(data.data);
      } else {
        console.error("Failed to fetch friends:", data.error);
      }
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  if (currentUser) fetchFriends();
}, [currentUser]);

console.log("Fetching friends:", friends);
const handleBlockFriend = async (fid) => {
  try {
    const res = await fetch(`http://localhost:3001/api/friends/${currentUser.uid}/block/${fid}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      setFriends(prev => prev.filter(f => f.id !== fid)); // update UI
      toast({
      title: "User blocked",
      description: "Friendship removed successfully!",
    });
    } else {
      console.error("Failed to block friend:", data.error);
    }
  } catch (err) {
    console.error("Error blocking friend:", err);
  }
};
  const handleViewProfile = (person, showAddFriend = false) => {
    setSelectedProfile({ ...person, showAddFriend });
    setIsProfileOpen(true);
  };
  

  const recentActivity = [
    {
      id: 1,
      friend: "Sarah Johnson",
      avatar: "SJ",
      action: "completed",
      hike: "Mount Rainier Trail",
      time: "2 hours ago",
      stats: "8.5 km • 4h 23m",
      type: "hike",
      description: "Conquered the challenging summit trail with incredible views!",
      likes: 12,
      comments: 3,
      photo: true
    },
    {
      id: 2,
      friend: "Aisha Patel",
      avatar: "AP",
      action: "earned achievement",
      hike: "Trail Master",
      time: "1 day ago",
      stats: "50+ trails completed",
      type: "achievement",
      description: "Just completed my 50th unique trail! The journey continues.",
      likes: 24,
      comments: 8
    },
    {
      id: 3,
      friend: "Emma Chen",
      avatar: "EC",
      action: "shared goal",
      hike: "Pacific Crest Trail Section",
      time: "2 days ago",
      stats: "Planning for next month",
      type: "goal",
      description: "Setting a goal to complete the Washington section of PCT. Who's joining?",
      likes: 8,
      comments: 5
    },
    {
      id: 4,
      friend: "Marcus Williams",
      avatar: "MW",
      action: "completed",
      hike: "Rocky Mountain Loop",
      time: "1 week ago",
      stats: "12.3 km • 6h 15m",
      type: "hike",
      description: "Early morning start paid off - had the entire trail to myself!",
      likes: 15,
      comments: 4,
      photo: true
    },
    {
      id: 5,
      friend: "David Rodriguez",
      avatar: "DR",
      action: "shared milestone",
      hike: "500km This Year",
      time: "1 week ago",
      stats: "Achievement unlocked",
      type: "milestone",
      description: "Just hit 500km for the year! Desert hiking has been incredible.",
      likes: 31,
      comments: 12
    }
  ];

  const suggestions = [
    {
      id: 1,
      name: "Jessica Park",
      avatar: "JP",
      mutualFriends: 3,
      commonTrails: ["Forest Park", "Mount Hood"]
    },
    {
      id: 2,
      name: "Michael Turner",
      avatar: "MT",
      mutualFriends: 2,
      commonTrails: ["Rocky Mountain", "Bear Lake"]
    },
    {
      id: 3,
      name: "Sofia Gonzalez",
      avatar: "SG",
      mutualFriends: 4,
      commonTrails: ["Yosemite Valley", "Half Dome"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Friends & Community</h1>
          <p className="text-muted-foreground">Connect with fellow hikers and share your adventures.</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 " />
          <Input
            placeholder="Search for friends or hikers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>

          {searchError && <p className="text-red-500 mt-2">{searchError}</p>}
            {searchResults.map((user) => (
              <Card 
                key={user.id} 
                className="relative flex flex-col sm:flex-row gap-3 items-start mt-4 mb-4"
              >
                {/* Close button */}
                <button
                  onClick={() => setSearchResults(searchResults.filter(u => u.id !== user.id))}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  ✕ 
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-xl">
                          {user.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-semibold text-foreground cursor-pointer hover:underline"
                            onClick={() => handleViewProfile(user, true)}
                          >
                            {user.displayName}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {user.location || "Not yet set"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </div>
              </Card>
            ))}



        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">My Friends</TabsTrigger>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friends.map((friend) => (
                <Card key={friend.id} className="bg-card border-border shadow-elevation">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-l">
                        {friend.displayName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                      </AvatarFallback>
                    </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{friend.displayName}</h3>
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

                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      size="sm"
                      onClick={() => handleBlockFriend(friend.id)}
                    >
                      Block Friend
                    </Button>

                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

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
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 rounded-lg bg-muted space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 cursor-pointer" onClick={() => handleViewProfile({ name: activity.friend, avatar: activity.avatar })}>
                          <AvatarFallback>{activity.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium cursor-pointer hover:underline" onClick={() => handleViewProfile({ name: activity.friend, avatar: activity.avatar })}>{activity.friend}</span>
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
                      
                      {activity.description && (
                        <p className="text-sm text-foreground pl-13">{activity.description}</p>
                      )}
                      
                      <div className="flex items-center gap-6 pl-13">
                        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <Heart className="h-4 w-4" />
                          {activity.likes}
                        </button>
                        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          {activity.comments}
                        </button>
                        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="flex items-center justify-between p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer" onClick={() => handleViewProfile(suggestion, true)}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{suggestion.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-foreground">{suggestion.name}</h4>
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
                      <Button size="sm" className="bg-gradient-trail text-primary-foreground" onClick={(e) => {
                        e.stopPropagation();
                        // Handle add friend logic here
                      }}>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Friend
                      </Button>
                    </div>
                  ))}
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