import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Calendar, MapPin, Mountain, Trophy, Clock } from "lucide-react";

export const ProfileView = ({ open, onOpenChange }) => {
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
    recentHikes: [
      { name: "Rocky Mountain Trail", date: "Dec 8, 2024", difficulty: "Hard" },
      { name: "Forest Loop", date: "Dec 5, 2024", difficulty: "Medium" },
      { name: "Summit Peak", date: "Dec 1, 2024", difficulty: "Hard" },
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback className="bg-gradient-trail text-white text-xl">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Joined {user.joinDate}</span>
                <MapPin className="h-4 w-4 ml-4 mr-1" />
                <span>{user.location}</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label className="text-sm font-semibold">About</Label>
            <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Mountain className="h-4 w-4 mr-2 text-forest" />
                  Total Hikes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.stats.totalHikes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-forest" />
                  Distance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.stats.totalDistance}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Mountain className="h-4 w-4 mr-2 text-forest" />
                  Elevation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.stats.totalElevation}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-forest" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.stats.achievements}</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Hikes */}
          <div>
            <Label className="text-sm font-semibold">Recent Hikes</Label>
            <div className="mt-2 space-y-2">
              {user.recentHikes.map((hike, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{hike.name}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {hike.date}
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
                  >
                    {hike.difficulty}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

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
