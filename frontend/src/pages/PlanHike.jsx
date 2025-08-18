import { Navigation } from "../components/ui/navigation";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Users, 
  Plus,
  Settings,
  Check,
  X,
  Star,
  Target,
  TrendingUp,
  Mountain,
  Thermometer
} from "lucide-react";
import { useState } from "react";

const PlanHike = () => {
  const [invitedFriends, setInvitedFriends] = useState([]);

  const availableFriends = [
    { id: 1, name: "Sarah Johnson", avatar: "👩🏻" },
    { id: 2, name: "Marcus Williams", avatar: "👨🏿" },
    { id: 3, name: "Emma Chen", avatar: "👩🏻" },
    { id: 4, name: "David Rodriguez", avatar: "👨🏽" },
    { id: 5, name: "Aisha Patel", avatar: "👩🏾" },
  ];

  const upcomingHikes = [
    {
      id: 1,
      name: "Mount Baker Trail",
      date: "2024-03-15",
      time: "07:00",
      difficulty: "Advanced",
      attendees: ["Sarah Johnson", "Marcus Williams"],
      status: "confirmed"
    },
    {
      id: 2,
      name: "Forest Park Loop",
      date: "2024-03-22",
      time: "09:30",
      difficulty: "Easy",
      attendees: ["Emma Chen"],
      status: "pending"
    },
    {
      id: 3,
      name: "Rocky Ridge",
      date: "2024-03-28",
      time: "06:30",
      difficulty: "Expert",
      attendees: ["David Rodriguez", "Aisha Patel", "Sarah Johnson"],
      status: "draft"
    }
  ];

  const toggleFriend = (friendName) => {
    setInvitedFriends(prev => 
      prev.includes(friendName) 
        ? prev.filter(name => name !== friendName)
        : [...prev, friendName]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Plan Your Hike</h1>
          <p className="text-muted-foreground">Create a new hiking adventure and invite friends to join you.</p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create New Hike</TabsTrigger>
            <TabsTrigger value="suggestions">Suggested Hikes</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Hikes</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Hike Details Form */}
              <Card className="bg-card border-border shadow-elevation">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mountain className="h-5 w-5 text-summit" />
                    Hike Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="hike-name">Hike Name</Label>
                    <Input id="hike-name" placeholder="Enter hike name..." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Mountain, trail, or park name..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" />
                    </div>

                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input type="time" defaultValue="08:00" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Estimated Duration</Label>
                      <Input placeholder="e.g., 4 hours" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe the hike, what to expect, and any special notes..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button className="bg-gradient-trail text-primary-foreground shadow-mountain flex-1">
                      Create Hike Plan
                    </Button>
                    <Button variant="outline">
                      Save Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Friends & Weather */}
              <div className="space-y-6">
                {/* Invite Friends */}
                <Card className="bg-card border-border shadow-elevation">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-forest" />
                      Invite Friends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {availableFriends.map((friend) => (
                          <Button
                            key={friend.id}
                            variant={invitedFriends.includes(friend.name) ? "default" : "outline"}
                            className="justify-start h-auto p-3"
                            onClick={() => toggleFriend(friend.name)}
                          >
                            <span className="mr-2">{friend.avatar}</span>
                            <span className="text-sm">{friend.name}</span>
                          </Button>
                        ))}
                      </div>

                      {invitedFriends.length > 0 && (
                        <div className="pt-4 border-t border-border">
                          <p className="text-sm text-muted-foreground mb-2">Invited ({invitedFriends.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {invitedFriends.map((friend) => (
                              <Badge key={friend} variant="secondary">
                                {friend}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Weather Forecast */}
                <Card className="bg-card border-border shadow-elevation">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-sky" />
                      Weather Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">☀️</div>
                          <div>
                            <p className="font-medium">Sunny</p>
                            <p className="text-sm text-muted-foreground">Perfect hiking weather</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">22°C</p>
                          <p className="text-sm text-muted-foreground">High: 25°C</p>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>• Wind: 5 km/h NE</p>
                        <p>• Humidity: 45%</p>
                        <p>• UV Index: 6 (High)</p>
                        <p>• Precipitation: 0%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid gap-6">
              {upcomingHikes.map((hike) => (
                <Card key={hike.id} className="bg-card border-border shadow-elevation">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground">{hike.name}</CardTitle>
                      <Badge variant={hike.status === 'confirmed' ? 'default' : hike.status === 'pending' ? 'secondary' : 'outline'}>
                        {hike.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarDays className="h-4 w-4 text-summit" />
                          <span>{new Date(hike.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-forest" />
                          <span>{hike.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mountain className="h-4 w-4 text-trail" />
                          <span>{hike.difficulty}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Attendees</p>
                        <div className="flex flex-wrap gap-1">
                          {hike.attendees.map((attendee) => (
                            <Badge key={attendee} variant="outline" className="text-xs">
                              {attendee}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {hike.status === 'pending' && (
                          <>
                            <Button size="sm" variant="default" className="bg-forest">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PlanHike;