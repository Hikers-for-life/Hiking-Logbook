import { useState, useEffect } from "react";
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
import { auth } from "../config/firebase"; // Firebase auth

const Logbook = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [selectedHike, setSelectedHike] = useState(null);
  const [isRouteMapOpen, setIsRouteMapOpen] = useState(false);
  const [activeHikeMode, setActiveHikeMode] = useState(false);
  const [currentActiveHike, setCurrentActiveHike] = useState(null);
  const [hikeEntries, setHikeEntries] = useState([]);

  // --- Fetch hikes from backend ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch(`/api/users/${user.uid}/hikes`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to fetch hikes");
          const data = await res.json();
          setHikeEntries(data);
        } catch (err) {
          console.error("Error fetching hikes:", err);
        }
      } else {
        setHikeEntries([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- Add new hike ---
  const handleAddNewHike = async (newHike) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/users/${user.uid}/hikes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(newHike),
      });
      if (!res.ok) throw new Error("Failed to add hike");
      const savedHike = await res.json();
      setHikeEntries((prev) => [savedHike, ...prev]);
    } catch (err) {
      console.error("Error adding hike:", err);
    }
  };

  // --- Start active hike ---
  const handleStartActiveHike = () => {
    setActiveHikeMode(true);
    setCurrentActiveHike({ id: Date.now(), startTime: new Date(), status: "active" });
  };

  // --- Complete active hike ---
  const handleCompleteActiveHike = async (hikeData) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/users/${user.uid}/hikes/${currentActiveHike.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...hikeData, status: "completed", endTime: new Date() }),
      });
      if (!res.ok) throw new Error("Failed to complete hike");
      const savedHike = await res.json();

      setHikeEntries((prev) => [savedHike, ...prev]);
      setActiveHikeMode(false);
      setCurrentActiveHike(null);
    } catch (err) {
      console.error("Error completing hike:", err);
    }
  };

  // --- Save active hike progress (auto-save) ---
  const handleSaveActiveHike = (hikeData) => {
    localStorage.setItem("activeHike", JSON.stringify(hikeData));
    setCurrentActiveHike((prev) => ({ ...prev, ...hikeData }));
  };

  const handleResumeActiveHike = () => setActiveHikeMode(true);
  const handleViewRouteMap = (hike) => {
    setSelectedHike(hike);
    setIsRouteMapOpen(true);
  };

  // --- Filter hikes ---
  const filteredHikes = hikeEntries.filter((hike) => {
    const matchesSearch =
      hike.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hike.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hike.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "All" || hike.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  // --- Active hike mode view ---
  if (activeHikeMode) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <ActiveHike hikeId={currentActiveHike?.id} onComplete={handleCompleteActiveHike} onSave={handleSaveActiveHike} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <ActiveHikeStatus activeHike={currentActiveHike} onResume={handleResumeActiveHike} />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Track Your <span className="text-forest">Hikes</span>
            </h1>
            <p className="text-muted-foreground text-lg">Keep notes on location, weather, elevation, and route - along the way</p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-green-600 hover:bg-green-700 text-white" size="lg" onClick={handleStartActiveHike}>
              <Play className="h-5 w-5 mr-2" /> Start Hike
            </Button>
            <Button className="bg-gradient-trail text-primary-foreground" size="lg" onClick={() => setIsNewEntryOpen(true)} variant="outline">
              <Plus className="h-5 w-5 mr-2" /> Add Past Hike
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search hikes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
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

        {/* Hike Entries */}
        <div className="space-y-6">
          {filteredHikes.length === 0 ? (
            <Card className="bg-card border-border text-center py-12">
              <CardContent>
                <p className="text-muted-foreground text-lg">No hikes found matching your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredHikes.map((hike) => (
              <Card key={hike.id} className="shadow-mountain hover:shadow-elevation transition-all duration-300 hover:scale-[1.02] bg-card border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-foreground mb-1">{hike.title}</CardTitle>
                      <div className="flex items-center text-muted-foreground text-sm space-x-4">
                        <span>{new Date(hike.date).toLocaleDateString()}</span>
                        <Badge variant="secondary">{hike.difficulty}</Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground flex items-center">
                      <Camera className="h-4 w-4 mr-1" /> {hike.photos || 0} photos
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 text-forest" /> <span>{hike.location}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center text-sm"><Mountain className="h-4 w-4 mr-2 text-forest" /><div><div className="font-medium text-foreground">{hike.distance}</div><div className="text-muted-foreground text-xs">Distance</div></div></div>
                    <div className="flex items-center text-sm"><Mountain className="h-4 w-4 mr-2 text-trail" /><div><div className="font-medium text-foreground">{hike.elevation}</div><div className="text-muted-foreground text-xs">Elevation</div></div></div>
                    <div className="flex items-center text-sm"><Clock className="h-4 w-4 mr-2 text-summit" /><div><div className="font-medium text-foreground">{hike.duration}</div><div className="text-muted-foreground text-xs">Duration</div></div></div>
                    <div className="flex items-center text-sm"><Thermometer className="h-4 w-4 mr-2 text-stone" /><div><div className="font-medium text-foreground">{hike.weather}</div><div className="text-muted-foreground text-xs">Weather</div></div></div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <p className="text-foreground italic">"{hike.notes}"</p>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewRouteMap(hike)}><Map className="h-4 w-4 mr-1" /> Route Map</Button>
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4 mr-1" /> Edit</Button>
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
            <DialogHeader><DialogTitle>{selectedHike?.title} - Route Map</DialogTitle></DialogHeader>
            <div className="flex flex-col items-center justify-center h-96 bg-muted/20 rounded-lg border-2 border-dashed border-border">
              <Map className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Route Map Coming Soon!</h3>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Logbook;

