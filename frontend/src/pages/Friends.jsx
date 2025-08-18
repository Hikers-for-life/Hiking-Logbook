import { Navigation } from "../components/ui/navigation";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Search, 
  UserPlus, 
  MapPin, 
  Calendar,
  TrendingUp,
  Mountain,
  Clock,
  Medal,
  Users
} from "lucide-react";

const Friends = () => {
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

  const recentActivity = [
    {
      id: 1,
      friend: "Sarah Johnson",
      action: "completed",
      hike: "Mount Rainier Trail",
      time: "2 hours ago",
      stats: "8.5 km • 4h 23m"
    },
    {
      id: 2,
      friend: "Aisha Patel",
      action: "earned achievement",
      hike: "Trail Master",
      time: "1 day ago",
      stats: "50+ trails completed"
    },
    {
      id: 3,
      friend: "Emma Chen",
      action: "planned",
      hike: "Columbia River Gorge",
      time: "2 days ago",
      stats: "This weekend"
    },
    {
      id: 4,
      friend: "Marcus Williams",
      action: "completed",
      hike: "Rocky Mountain Loop",
      time: "1 week ago",
      stats: "12.3 km • 6h 15m"
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

                    <Button variant="outline" className="w-full" size="sm">
                      View Profile
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
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{activity.friend.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.friend}</span>
                          <span className="text-muted-foreground"> {activity.action} </span>
                          <span className="font-medium">{activity.hike}</span>
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.time}
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.stats}</p>
                        </div>
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
                    <div key={suggestion.id} className="flex items-center justify-between p-4 rounded-lg bg-muted">
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
                      <Button size="sm" className="bg-gradient-trail text-primary-foreground">
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
    </div>
  );
};

export default Friends;