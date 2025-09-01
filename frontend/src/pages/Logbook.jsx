import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Navigation } from "../components/ui/navigation";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import NewHikeEntryForm from "../components/NewHikeEntryForm";
import ActiveHike from "../components/ActiveHike";
import ActiveHikeStatus from "../components/ActiveHikeStatus";
import { Camera, MapPin, Clock, Mountain, Thermometer, Plus, Search, Map, Eye, Play } from "lucide-react";
import { StatsCards } from "../components/ui/StatsCards";//ANNAH

import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

const Logbook = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [selectedHike, setSelectedHike] = useState(null);
  const [isRouteMapOpen, setIsRouteMapOpen] = useState(false);
  const [activeHikeMode, setActiveHikeMode] = useState(false);
  const [currentActiveHike, setCurrentActiveHike] = useState(null);

  const [hikeEntries, setHikeEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  {/*BEGINNING OF ANNAH */}
  //Fetch hikes from Firestore whenever filter/search changes
  useEffect(() => {
    const fetchHikes = async () => {
      setLoading(true);

      try {
        const hikesRef = collection(db, "hikes");
        let q;

        // Apply difficulty filter
        if (difficultyFilter !== "All") {
          q = query(hikesRef, where("difficulty", "==", difficultyFilter), orderBy("date", "desc"));
        } else {
          q = query(hikesRef, orderBy("date", "desc"));
        }

        const snapshot = await getDocs(q);
        let results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Apply search filter 
        if (searchTerm.trim()) {
          const lower = searchTerm.toLowerCase();
          results = results.filter(
            (hike) =>
              hike.title?.toLowerCase().includes(lower) ||
              hike.location?.toLowerCase().includes(lower) ||
              hike.notes?.toLowerCase().includes(lower)
          );
        }

        setHikeEntries(results);
      } catch (err) {
        console.error("Error fetching hikes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHikes();
  }, [searchTerm, difficultyFilter]);
    {/*END OF ANNAH */}

  // Add new hike (manual past entry)
  const handleAddNewHike = (newHike) => {
    setHikeEntries((prev) => [newHike, ...prev]);
  };

  // Route map (placeholder)
  const handleViewRouteMap = (hike) => {
    setSelectedHike(hike);
    setIsRouteMapOpen(true);
  };

  // Active hike tracking
  const handleStartActiveHike = () => {
    setActiveHikeMode(true);
    setCurrentActiveHike({
      id: Date.now(),
      startTime: new Date(),
      status: "active",
    });
  };

  const handleCompleteActiveHike = (hikeData) => {
    const completedHike = {
      ...hikeData,
      id: currentActiveHike.id,
      photos: 0,
    };

    setHikeEntries((prev) => [completedHike, ...prev]);
    setActiveHikeMode(false);
    setCurrentActiveHike(null);
  };

  const handleSaveActiveHike = (hikeData) => {
    console.log("Auto-saving hike progress:", hikeData);
    localStorage.setItem("activeHike", JSON.stringify(hikeData));

    setCurrentActiveHike((prev) => ({
      ...prev,
      ...hikeData,
    }));
  };

  const handleResumeActiveHike = () => {
    setActiveHikeMode(true);
  };

  // If user is in active hike mode, show ActiveHike UI
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
          <ActiveHikeStatus activeHike={currentActiveHike} onResume={handleResumeActiveHike} />

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
              {["All", "Easy", "Moderate", "Hard"].map((level) => (
                <Button
                  key={level}
                  variant={difficultyFilter === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDifficultyFilter(level)}
                  className="min-w-[80px]"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
          <StatsCards />
        

          {/* Hike Entries */}
          <div className="space-y-6">
            {loading ? (
              <Card className="bg-card border-border text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground text-lg">Loading hikes...</p>
                </CardContent>
              </Card>
            ) : hikeEntries.length === 0 ? (
              <Card className="bg-card border-border text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground text-lg">No hikes found matching your search criteria.</p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Try adjusting your search terms or filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              hikeEntries.map((hike) => (
                <Card
                  key={hike.id}
                  className="shadow-mountain hover:shadow-elevation transition-all duration-300 hover:scale-[1.02] bg-card border-border"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl text-foreground mb-1">{hike.title}</CardTitle>
                        <div className="flex items-center text-muted-foreground text-sm space-x-4">
                          <span>{hike.date}</span>
                          <Badge
                            variant="secondary"
                            className={`${
                              hike.difficulty === "Easy"
                                ? "bg-meadow/20 text-forest border-meadow"
                                : hike.difficulty === "Moderate"
                                ? "bg-trail/20 text-foreground border-trail"
                                : "bg-summit/20 text-foreground border-summit"
                            }`}
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

          {/* New Entry Form */}
          <NewHikeEntryForm open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen} onSubmit={handleAddNewHike} />

          {/* Route Map Modal */}
          <Dialog open={isRouteMapOpen} onOpenChange={setIsRouteMapOpen}>
            <DialogContent className="sm:max-w-[800px] sm:max-h-[600px]">
              <DialogHeader>
                <DialogTitle className="text-2xl text-foreground">{selectedHike?.title} - Route Map</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center h-96 bg-muted/20 rounded-lg border-2 border-dashed border-border">
                <Map className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Route Map Coming Soon!</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Interactive route maps with elevation profiles, waypoints, and GPS tracks will be available in the next
                  sprint. This will include integration with popular hiking apps and GPX file support.
                </p>
                <div className="mt-6 flex gap-2">
                  <Badge variant="outline" className="text-summit border-summit">
                    GPS Tracking
                  </Badge>
                  <Badge variant="outline" className="text-forest border-forest">
                    Elevation Profile
                  </Badge>
                  <Badge variant="outline" className="text-trail border-trail">
                    Waypoints
                  </Badge>
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
