import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { MapPin, Calendar, Clock, Mountain, Star, Plus, Search } from "lucide-react";

const sampleHikes = [
  {
    id: "1",
    name: "Mount Washington Summit",
    location: "White Mountains, NH",
    date: "2024-08-05",
    duration: "6h 30m",
    distance: "12.4 mi",
    difficulty: "Hard",
    elevation: "4,322 ft",
    rating: 5,
    notes: "Incredible views from the summit! Weather was perfect, saw amazing sunrise."
  },
  {
    id: "2",
    name: "Bear Mountain Trail",
    location: "Harriman State Park, NY",
    date: "2024-07-22",
    duration: "3h 45m",
    distance: "5.8 mi",
    difficulty: "Moderate",
    elevation: "1,284 ft",
    rating: 4,
    notes: "Great family-friendly hike. Spotted some wildlife on the way down."
  },
  {
    id: "3",
    name: "Cascade Falls Loop",
    location: "Yosemite National Park, CA",
    date: "2024-07-10",
    duration: "2h 15m",
    distance: "3.2 mi",
    difficulty: "Easy",
    elevation: "800 ft",
    rating: 5,
    notes: "Beautiful waterfall views! Perfect for a morning hike."
  }
];

const difficultyColors = {
  Easy: "bg-meadow text-forest",
  Moderate: "bg-trail text-primary-foreground",
  Hard: "bg-destructive text-destructive-foreground",
  Expert: "bg-stone text-primary-foreground"
};

export const LogbookSection = () => {
  const [hikes] = useState(sampleHikes);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHikes = hikes.filter(hike =>
    hike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hike.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="logbook" className="py-20 bg-gradient-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your Hiking Logbook
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Keep track of every adventure, from your first trail to your summit conquests.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search hikes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-gradient-trail text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Add Hike
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHikes.map((hike) => (
            <Card key={hike.id} className="hover:shadow-elevation transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-foreground">{hike.name}</CardTitle>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < hike.rating ? "text-trail fill-current" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{hike.location}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={difficultyColors[hike.difficulty]}>
                    {hike.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-border">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(hike.date).toLocaleDateString()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {hike.duration}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Mountain className="h-4 w-4 mr-1" />
                    {hike.elevation}
                  </div>
                  <div className="col-span-2 font-medium text-foreground">
                    Distance: {hike.distance}
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm">{hike.notes}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredHikes.length === 0 && (
          <div className="text-center py-12">
            <Mountain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No hikes found</h3>
            <p className="text-muted-foreground">Try adjusting your search or add your first hike!</p>
          </div>
        )}
      </div>
    </section>
  );
};