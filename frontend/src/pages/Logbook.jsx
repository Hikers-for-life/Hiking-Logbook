import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Navigation } from "../components/ui/navigation";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import NewHikeEntryForm from "../components/NewHikeEntryForm";
import ActiveHike from "../components/ActiveHike";
import ActiveHikeStatus from "../components/ActiveHikeStatus";
import { Camera, MapPin, Clock, Mountain, Thermometer, Plus, Search, Map, Eye, Play, Edit } from "lucide-react";

const Logbook = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [selectedHike, setSelectedHike] = useState(null);
  const [isRouteMapOpen, setIsRouteMapOpen] = useState(false);
  const [activeHikeMode, setActiveHikeMode] = useState(false);
  const [currentActiveHike, setCurrentActiveHike] = useState(null);
  // Mock data for hike entries - converted to state for adding new entries
  const [hikeEntries, setHikeEntries] = useState([
    {
      id: 1,
      title: "Sunrise at Eagle Peak",
      date: "March 15, 2024",
      distance: "8.2 miles",
      elevation: "2,400 ft",
      duration: "4h 30m",
      weather: "Clear, 45°F",
      location: "Eagle Peak Trail, Colorado",
      photos: 12,
      difficulty: "Moderate",
      notes: "Most beautiful sunrise I've ever seen! The pink and orange hues reflecting off the snow-capped peaks were absolutely magical.",
    },
    {
      id: 2,
      title: "Wildflower Meadow Adventure",
      date: "March 8, 2024",
      distance: "5.1 miles",
      elevation: "1,200 ft",
      duration: "3h 15m",
      weather: "Sunny, 62°F",
      location: "Meadow Loop Trail, Montana",
      photos: 8,
      difficulty: "Easy",
      notes: "Perfect spring hike! The meadows were filled with lupines and Indian paintbrush. Great day with Sarah and Emma!",
    },
    {
      id: 3,
      title: "Rocky Mountain Challenge",
      date: "February 28, 2024",
      distance: "12.5 miles",
      elevation: "3,800 ft",
      duration: "6h 45m",
      weather: "Cloudy, 38°F",
      location: "Rocky Mountain National Park, Colorado",
      photos: 15,
      difficulty: "Hard",
      notes: "Challenging but rewarding hike. The weather was tough but the views from the summit were incredible. Definitely need proper gear for this one!",
    },
    {
      id: 4,
      title: "Lakeside Trail Walk",
      date: "February 20, 2024",
      distance: "3.2 miles",
      elevation: "450 ft",
      duration: "1h 45m",
      weather: "Sunny, 58°F",
      location: "Mirror Lake Trail, California",
      photos: 6,
      difficulty: "Easy",
      notes: "Perfect family hike! The kids loved seeing the ducks and the trail is well-maintained. Great for beginners.",
    },
  ]);

  // Handler for adding new hike entries
  const handleAddNewHike = (newHike) => {
    setHikeEntries(prev => [newHike, ...prev]);
  };

  // Handler for viewing route map (placeholder for next sprint)
  const handleViewRouteMap = (hike) => {
    setSelectedHike(hike);
    setIsRouteMapOpen(true);
  };

  // Handler for starting active hike tracking
  const handleStartActiveHike = () => {
    setActiveHikeMode(true);
    setCurrentActiveHike({
      id: Date.now(),
      startTime: new Date(),
      status: 'active'
    });
  };

  // Handler for completing active hike
  const handleCompleteActiveHike = (hikeData) => {
    const completedHike = {
      ...hikeData,
      id: currentActiveHike.id,
      photos: 0, // Will be updated when photo upload is implemented
    };
    
    setHikeEntries(prev => [completedHike, ...prev]);
    setActiveHikeMode(false);
    setCurrentActiveHike(null);
  };

  // Handler for saving active hike progress
  const handleSaveActiveHike = (hikeData) => {
    // Auto-save functionality - would integrate with backend
    console.log('Auto-saving hike progress:', hikeData);
    localStorage.setItem('activeHike', JSON.stringify(hikeData));
    
    // Update current active hike state for status display
    setCurrentActiveHike(prev => ({
      ...prev,
      ...hikeData
    }));
  };

  // Handler for resuming active hike
  const handleResumeActiveHike = () => {
    setActiveHikeMode(true);
  };

  // Filter hikes based on search term and difficulty
  const filteredHikes = hikeEntries.filter(hike => {
    const matchesSearch = hike.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hike.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hike.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "All" || hike.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  // Show active hike interface if in active mode
  if (activeHikeMode) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <ActiveHike 
          hikeId={currentActiveHike?.id}
          onComplete={handleCompleteActiveHike}
          onSave={handleSaveActiveHike}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Active Hike Status */}
        <ActiveHikeStatus 
          activeHike={currentActiveHike} 
          onResume={handleResumeActiveHike}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Track Your <span className="text-forest">Hikes</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Keep notes on location, weather, elevation, and route - along the way
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white shadow-mountain hover:shadow-elevation hover:scale-105 transition-all duration-300"
              size="lg"
              onClick={handleStartActiveHike}
            >
              <Play className="h-5 w-5 mr-2" />
              Start Hike
            </Button>
            <Button 
              className="bg-gradient-trail text-primary-foreground shadow-mountain hover:shadow-elevation hover:scale-105 transition-all duration-300"
              size="lg"
              onClick={() => setIsNewEntryOpen(true)}
              variant="outline"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Past Hike
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hikes by title, location, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={difficultyFilter === "All" ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficultyFilter("All")}
              className="min-w-[80px]"
            >
              All
            </Button>
            <Button
              variant={difficultyFilter === "Easy" ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficultyFilter("Easy")}
              className="min-w-[80px]"
            >
              Easy
            </Button>
            <Button
              variant={difficultyFilter === "Moderate" ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficultyFilter("Moderate")}
              className="min-w-[80px]"
            >
              Moderate
            </Button>
            <Button
              variant={difficultyFilter === "Hard" ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficultyFilter("Hard")}
              className="min-w-[80px]"
            >
              Hard
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-card text-center border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-forest">24</div>
              <div className="text-sm text-muted-foreground">Total Hikes</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card text-center border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-trail">186</div>
              <div className="text-sm text-muted-foreground">Miles Hiked</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card text-center border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-summit">47k</div>
              <div className="text-sm text-muted-foreground">Elevation Gained</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card text-center border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-forest">8</div>
              <div className="text-sm text-muted-foreground">States Explored</div>
            </CardContent>
          </Card>
        </div>

        {/* Hike Entries */}
        <div className="space-y-6">
          {filteredHikes.length === 0 ? (
            <Card className="bg-card border-border text-center py-12">
              <CardContent>
                <p className="text-muted-foreground text-lg">No hikes found matching your search criteria.</p>
                <p className="text-muted-foreground text-sm mt-2">Try adjusting your search terms or filters.</p>
              </CardContent>
            </Card>
          ) : (
            filteredHikes.map((hike) => (
            <Card key={hike.id} className="shadow-mountain hover:shadow-elevation transition-all duration-300 hover:scale-[1.02] bg-card border-border">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-foreground mb-1">
                      {hike.title}
                    </CardTitle>
                    <div className="flex items-center text-muted-foreground text-sm space-x-4">
                      <span>{hike.date}</span>
                      <Badge 
                        variant="secondary"
                        className={`
                          ${hike.difficulty === 'Easy' ? 'bg-meadow/20 text-forest border-meadow' : 
                            hike.difficulty === 'Moderate' ? 'bg-trail/20 text-foreground border-trail' : 
                            'bg-summit/20 text-foreground border-summit'
                          }
                        `}
                      >
                        {hike.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Camera className="h-4 w-4 mr-1" />
                      {hike.photos} photos
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Location */}
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2 text-forest" />
                  <span>{hike.location}</span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center text-sm">
                    <Mountain className="h-4 w-4 mr-2 text-forest" />
                    <div>
                      <div className="font-medium text-foreground">{hike.distance}</div>
                      <div className="text-muted-foreground text-xs">Distance</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mountain className="h-4 w-4 mr-2 text-trail" />
                    <div>
                      <div className="font-medium text-foreground">{hike.elevation}</div>
                      <div className="text-muted-foreground text-xs">Elevation</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-summit" />
                    <div>
                      <div className="font-medium text-foreground">{hike.duration}</div>
                      <div className="text-muted-foreground text-xs">Duration</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <Thermometer className="h-4 w-4 mr-2 text-stone" />
                    <div>
                      <div className="font-medium text-foreground">{hike.weather}</div>
                      <div className="text-muted-foreground text-xs">Weather</div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <p className="text-foreground italic">"{hike.notes}"</p>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-summit hover:text-summit hover:bg-muted"
                    onClick={() => handleViewRouteMap(hike)}
                  >
                    <Map className="h-4 w-4 mr-1" />
                    Route Map
                  </Button>
                  <Button variant="ghost" size="sm" className="text-forest hover:text-forest hover:bg-muted">
                    <Eye className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-trail hover:text-trail hover:bg-muted">
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
          )}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            className="border-forest text-forest hover:bg-forest hover:text-primary-foreground transition-all duration-300"
          >
            Load More Entries
          </Button>
        </div>

        {/* New Entry Form */}
        <NewHikeEntryForm 
          open={isNewEntryOpen}
          onOpenChange={setIsNewEntryOpen}
          onSubmit={handleAddNewHike}
        />

        {/* Route Map Modal - Placeholder for next sprint */}
        <Dialog open={isRouteMapOpen} onOpenChange={setIsRouteMapOpen}>
          <DialogContent className="sm:max-w-[800px] sm:max-h-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl text-foreground">
                {selectedHike?.title} - Route Map
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center h-96 bg-muted/20 rounded-lg border-2 border-dashed border-border">
              <Map className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Route Map Coming Soon!</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Interactive route maps with elevation profiles, waypoints, and GPS tracks will be available in the next sprint. 
                This will include integration with popular hiking apps and GPX file support.
              </p>
              <div className="mt-6 flex gap-2">
                <Badge variant="outline" className="text-summit border-summit">GPS Tracking</Badge>
                <Badge variant="outline" className="text-forest border-forest">Elevation Profile</Badge>
                <Badge variant="outline" className="text-trail border-trail">Waypoints</Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </div>
  );
};

export default Logbook;
