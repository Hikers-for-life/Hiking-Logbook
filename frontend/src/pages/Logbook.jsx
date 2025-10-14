import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Navigation } from "../components/ui/navigation";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import NewHikeEntryForm from "../components/NewHikeEntryForm";
import ActiveHike from "../components/ActiveHike";
import ActiveHikeStatus from "../components/ActiveHikeStatus";
import RouteMapModal from "../components/RouteMapModal";
import { MapPin, Clock, Mountain, Thermometer, Plus, Search, Map, Play, Trash2, Edit3, Pin, PinOff, Share2, Share, Star } from "lucide-react";
import { hikeApiService } from "../services/hikeApiService.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { createFeed } from "../services/feed";
import { useToast } from "../hooks/use-toast";

const Logbook = () => {
  const { currentUser: user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [selectedHike, setSelectedHike] = useState(null);
  const [isRouteMapOpen, setIsRouteMapOpen] = useState(false);
  const [activeHikeMode, setActiveHikeMode] = useState(false);
  const [currentActiveHike, setCurrentActiveHike] = useState(null);
  const [isStartHikeFormOpen, setIsStartHikeFormOpen] = useState(false);
  const [isEditHikeOpen, setIsEditHikeOpen] = useState(false);
  const [editingHike, setEditingHike] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hikeEntries, setHikeEntries] = useState([]);
  const { toast } = useToast();

  const [hikeStats, setHikeStats] = useState({
    totalHikes: 0,
    totalDistance: 0,
    totalElevation: 0,
    statesExplored: 0
  });

  const [detectedLocation, setDetectedLocation] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedWeather, setDetectedWeather] = useState('');
  const [isDetectingWeather, setIsDetectingWeather] = useState(false);

  // Auto-detect GPS location when start hike form opens
  useEffect(() => {
    if (isStartHikeFormOpen && !detectedLocation) {
      detectGPSLocation();
    }
  }, [isStartHikeFormOpen]);

  // GPS location detection function
  const detectGPSLocation = async () => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.");
      return;
    }

    setIsDetectingLocation(true);
    setIsDetectingWeather(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Try to get location name using reverse geocoding
          const locationName = await reverseGeocode(latitude, longitude);
          if (locationName) {
            setDetectedLocation(locationName);
          } else {
            // Fallback to coordinates if reverse geocoding fails
            setDetectedLocation(`${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°W`);
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          // Fallback to coordinates
          setDetectedLocation(`${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°W`);
        }
        
        setIsDetectingLocation(false);

        // Fetch weather data for the current location
        try {
          const weatherInfo = await fetchWeatherData(latitude, longitude);
          if (weatherInfo) {
            setDetectedWeather(weatherInfo);
          }
        } catch (error) {
          console.error("Weather detection failed:", error);
        }
        
        setIsDetectingWeather(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsDetectingLocation(false);
        setIsDetectingWeather(false);
        // Don't show alert, just leave field empty for manual entry
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Simple reverse geocoding function (using OpenStreetMap Nominatim API)
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.display_name) {
        // Extract meaningful location name
        const parts = data.display_name.split(',');
        if (parts.length >= 2) {
          // Return the most relevant parts (usually first 2-3)
          return parts.slice(0, 3).join(',').trim();
        }
        return data.display_name;
      }
      return null;
    } catch (error) {
      console.error("Reverse geocoding API error:", error);
      return null;
    }
  };

  // Fetch weather data using OpenWeather API
  const fetchWeatherData = async (latitude, longitude) => {
    try {
      const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
      if (!apiKey) {
        console.log("OpenWeather API key not configured");
        return null;
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.weather && data.weather[0] && data.main) {
        // Format weather string: "Sunny, 22°C"
        const description = data.weather[0].description;
        const temp = Math.round(data.main.temp);
        const capitalizedDescription = description.charAt(0).toUpperCase() + description.slice(1);
        return `${capitalizedDescription}, ${temp}°C`;
      }
      return null;
    } catch (error) {
      console.error("Weather API error:", error);
      return null;
    }
  };

  const loadHikes = useCallback(async (searchTerm = '', difficultyFilter = 'All') => {
    if (!user) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (difficultyFilter !== 'All') filters.difficulty = difficultyFilter;

      const response = await hikeApiService.getHikes(filters);

      if (response.success) {
        const formatDate = (dateValue) => {
          if (!dateValue) return 'No date';
          if (dateValue.toDate) {
            return dateValue.toDate().toLocaleDateString();
          }
          const date = new Date(dateValue);
          return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
        };

        const processedHikes = response.data.map(hike => ({
          ...hike,
          date: formatDate(hike.date),
          createdAt: formatDate(hike.createdAt),
          updatedAt: formatDate(hike.updatedAt),
          startTime: hike.startTime ? (hike.startTime.toDate ? hike.startTime.toDate() : new Date(hike.startTime)) : null,
          endTime: hike.endTime ? (hike.endTime.toDate ? hike.endTime.toDate() : new Date(hike.endTime)) : null,
          title: hike.title || 'Untitled Hike',
          location: hike.location || 'Unknown Location',
          distance: hike.distance || '0 km',
          elevation: hike.elevation || '0 ft',
          duration: hike.duration || '0 min',
          weather: hike.weather || 'Unknown',
          difficulty: hike.difficulty || 'Easy',
          notes: hike.notes || '',
          status: hike.status || 'completed'
        }));

        setHikeEntries(processedHikes);
      } else {
        setError('Failed to load hikes from server.');
      }
    } catch (err) {
      console.error('Failed to load hikes:', err);
      setError(`Failed to load hikes: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadHikes();

      const activeHikeData = localStorage.getItem('activeHikeData');
      if (activeHikeData) {
        try {
          const parsedData = JSON.parse(activeHikeData);
          setActiveHikeMode(true);
          setCurrentActiveHike(parsedData);
          localStorage.removeItem('activeHikeData');
        } catch (err) {
          console.error('Failed to parse active hike data:', err);
          localStorage.removeItem('activeHikeData');
        }
      }
    } else {
      setIsLoading(false);
    }
  }, [user, loadHikes]);

  const handleAddNewHike = async (newHike) => {
    try {
      const response = await hikeApiService.createHike(newHike);
      if (response.success) {
        await loadHikes(searchTerm, difficultyFilter);
      }
    } catch (err) {
      console.error('Failed to create hike:', err);
      setError('Failed to create hike. Please try again.');
      setHikeEntries(prev => [newHike, ...prev]);
    }
  };

  const handleViewRouteMap = (hike) => {
    setSelectedHike(hike);
    setIsRouteMapOpen(true);
  };

  const handleCompleteActiveHike = async (hikeData) => {
    try {
      const endData = {
        ...hikeData,
      };

      const response = await hikeApiService.completeHike(currentActiveHike.id || currentActiveHike.activeHikeId, endData);

      if (response.success) {
        if (currentActiveHike.plannedHikeId) {
          try {
            const { plannedHikeApiService } = await import('../services/plannedHikesService.js');
            await plannedHikeApiService.deletePlannedHike(currentActiveHike.plannedHikeId);
            console.log('Planned hike deleted successfully');
          } catch (err) {
            console.error('Failed to delete planned hike:', err);
          }
        }

        await loadHikes();
        setActiveHikeMode(false);
        setCurrentActiveHike(null);
      }
    } catch (err) {
      console.error('Failed to complete hike:', err);
      setError('Failed to complete hike. Please try again.');
      const completedHike = {
        ...hikeData,
        id: currentActiveHike.id || currentActiveHike.activeHikeId,
        photos: 0,
      };
      setHikeEntries(prev => [completedHike, ...prev]);
      setActiveHikeMode(false);
      setCurrentActiveHike(null);
    }
  };

  const handleStartActiveHike = async (formData) => {
    try {
      const hikeData = {
        title: formData?.title || 'New Hike',
        location: formData?.location || 'Unknown Location',
        weather: formData?.weather || '',
        difficulty: formData?.difficulty || 'Easy',
        notes: formData?.notes || '',
        status: 'active',
        ...(formData?.plannedHikeId && { plannedHikeId: formData.plannedHikeId })
      };

      console.log('Starting hike with data:', hikeData);

      const response = await hikeApiService.startHike(hikeData);
      if (response.success) {
        setActiveHikeMode(true);
        setCurrentActiveHike({
          id: response.data.id,
          startTime: new Date(),
          status: 'active',
          ...hikeData
        });
      }
    } catch (err) {
      console.error('Failed to start hike:', err);
      setError('Failed to start hike. Please try again.');
      setActiveHikeMode(true);
      setCurrentActiveHike({
        id: Date.now(),
        startTime: new Date(),
        status: 'active',
        ...(formData || {})
      });
    }
  };

  const handleSaveActiveHike = (hikeData) => {
    localStorage.setItem('activeHike', JSON.stringify(hikeData));
    setCurrentActiveHike(prev => ({
      ...prev,
      ...hikeData
    }));
  };

  const handleResumeActiveHike = () => {
    setActiveHikeMode(true);
  };

  const handleDeleteHike = async (hikeId) => {
    try {
      const response = await hikeApiService.deleteHike(hikeId);
      if (response.success) {
        setHikeEntries(prev => prev.filter(hike => hike.id !== hikeId));
        setError(null);

        window.dispatchEvent(new CustomEvent('post-deleted', {
          detail: {
            type: 'post-deleted',
            postId: hikeId,
            postType: 'hike'
          }
        }));
      }
    } catch (err) {
      console.error('Failed to delete hike:', err);
      setError('Failed to delete hike. Please try again.');
    }
  };

  const handleEditHike = (hike) => {
    setEditingHike(hike);
    setIsEditHikeOpen(true);
  };

  const handleSubmitEditHike = async (updatedHikeData) => {
    if (!editingHike) {
      return;
    }

    try {
      const response = await hikeApiService.updateHike(editingHike.id, updatedHikeData);

      if (response.success) {
        await loadHikes(searchTerm, difficultyFilter);
        setIsEditHikeOpen(false);
        setEditingHike(null);
      } else {
        setError('Failed to update hike. Please try again.');
      }
    } catch (err) {
      console.error('Failed to update hike:', err);
      setError('Failed to update hike. Please try again.');
    }
  };

  const handlePinHike = async (hikeId) => {
    try {
      const hike = hikeEntries.find(h => h.id === hikeId);
      const isPinned = hike?.pinned === true;

      if (isPinned) {
        await hikeApiService.unpinHike(hikeId);
        setHikeEntries(prev => prev.map(h =>
          h.id === hikeId ? { ...h, pinned: false } : h
        ));
      } else {
        await hikeApiService.pinHike(hikeId);
        setHikeEntries(prev => prev.map(h =>
          h.id === hikeId ? { ...h, pinned: true } : h
        ));
      }
    } catch (error) {
      console.error('Failed to pin/unpin hike:', error);
      setError('Failed to pin/unpin hike. Please try again.');
    }
  };

  const handleShareHike = async (hikeId) => {
    try {
      const { success, data: hike } = await hikeApiService.getHike(hikeId);
      if (!success || !hike) throw new Error("Hike not found or fetch failed");

      await hikeApiService.shareHike(hikeId);

      const result = await createFeed({
        action: "completed a hike",
        hike: hike.title || hike.name || "Untitled Hike",
        description: hike.notes || hike.description || "",
        stats: `${hike.distance || "0 km"} • ${hike.elevation || "0 ft"} • ${hike.duration || "0s"}`,
        photo: hike.photo || null,
        hikeId: hike.id || hikeId,
        userId: hike.userId || hike.ownerId || null,
        userName: hike.userName || hike.ownerName || user?.displayName || user?.email || "Anonymous",
        userAvatar: hike.userAvatar || null,
      });

      console.log("Original feed post created:", result);

      setHikeEntries((prev) =>
        prev.map((h) => (h.id === hikeId ? { ...h, shared: true } : h))
      );
      toast({
        title: " Hike shared!",
        description: `${hike.title || hike.name || "This hike"} was posted to your feed.`,
        duration: 3000,
      });
    } catch (err) {
      console.error("Failed to share hike:", err);
      setError("Failed to share/unshare hike. Please try again.");

      toast({
        title: "Share failed",
        description: "We couldn't share your hike. Please try again later.",
        duration: 3000,
      });
    }
  };

  const isHikePinned = (hikeId) => {
    const hike = hikeEntries.find(h => h.id === hikeId);
    return hike?.pinned === true;
  };

  const handleSearchChange = useCallback((newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    loadHikes(newSearchTerm, difficultyFilter);
  }, [loadHikes, difficultyFilter]);

  const handleDifficultyChange = useCallback((newDifficulty) => {
    setDifficultyFilter(newDifficulty);
    loadHikes(searchTerm, newDifficulty);
  }, [loadHikes, searchTerm]);

  const filteredHikes = hikeEntries;

  if (activeHikeMode) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <ActiveHike
          hikeId={currentActiveHike?.id}
          onComplete={handleCompleteActiveHike}
          onSave={handleSaveActiveHike}
          initialData={currentActiveHike}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <ActiveHikeStatus
            activeHike={currentActiveHike}
            onResume={handleResumeActiveHike}
          />

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Track Your <span className="text-forest">Hikes</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Keep notes on location, weather, elevation, and route - along the way
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white shadow-mountain hover:shadow-elevation hover:scale-105 transition-all duration-300 flex-1 sm:flex-none"
                size="lg"
                onClick={() => setIsStartHikeFormOpen(true)}
              >
                <Play className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Start Hike</span>
                <span className="sm:hidden">Start Hike</span>
              </Button>
              <Button 
                className="bg-gradient-trail text-primary-foreground shadow-mountain hover:shadow-elevation hover:scale-105 transition-all duration-300 flex-1 sm:flex-none"
                size="lg"
                onClick={() => setIsNewEntryOpen(true)}
                variant="outline"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Add Past Hike</span>
                <span className="sm:hidden">Add Past</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hikes by title, location, or notes..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={difficultyFilter === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDifficultyChange("All")}
                className="min-w-[80px] flex-shrink-0"
              >
                All
              </Button>
              <Button
                variant={difficultyFilter === "Easy" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDifficultyChange("Easy")}
                className="min-w-[80px] flex-shrink-0"
              >
                Easy
              </Button>
              <Button
                variant={difficultyFilter === "Moderate" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDifficultyChange("Moderate")}
                className="min-w-[80px] flex-shrink-0"
              >
                Moderate
              </Button>
              <Button
                variant={difficultyFilter === "Hard" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDifficultyChange("Hard")}
                className="min-w-[80px] flex-shrink-0"
              >
                Hard
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {isLoading && (
              <Card className="bg-card border-border text-center py-12">
                <CardContent>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-lg">Loading your hikes...</p>
                </CardContent>
              </Card>
            )}

            {error && !isLoading && (
              <Card className="bg-card border-border text-center py-12 border-red-200 bg-red-50">
                <CardContent>
                  <p className="text-red-600 text-lg mb-2">Error loading hikes</p>
                  <p className="text-red-500 text-sm mb-4">{error}</p>
                  <Button onClick={loadHikes} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && filteredHikes.length === 0 ? (
              <Card className="bg-card border-border text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground text-lg">No hikes found matching your search criteria.</p>
                  <p className="text-muted-foreground text-sm mt-2">Try adjusting your search terms or filters.</p>
                </CardContent>
              </Card>
            ) : (
              !isLoading && !error && filteredHikes.map((hike, index) => (
                <Card key={hike.id || `hike-${index}`} className="shadow-mountain hover:shadow-elevation transition-all duration-300 hover:scale-[1.02] bg-card border-border">
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
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 text-forest" />
                      <span>{hike.location}</span>
                    </div>

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

                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <p className="text-foreground italic">"{hike.notes}"</p>
                    </div>

                    {/* Accomplishments Section */}
                    {hike.accomplishments && hike.accomplishments.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Star className="h-4 w-4 text-forest" />
                          Accomplishments ({hike.accomplishments.length})
                        </h4>
                        <div className="space-y-2">
                          {hike.accomplishments.map((accomplishment, index) => (
                            <div key={accomplishment.id || index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-forest/5 to-meadow/5 rounded-lg border border-forest/20">
                              <div className="flex-shrink-0 w-6 h-6 bg-forest rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-foreground font-medium">{accomplishment.text}</p>
                                {accomplishment.distance !== undefined && accomplishment.distance > 0 && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Recorded at {accomplishment.distance.toFixed(1)} km
                                  </p>
                                )}
                                {accomplishment.timestamp && (
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(accomplishment.timestamp).toLocaleTimeString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-2">
                        {isHikePinned(hike.id) && (
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Pin className="h-3 w-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                        {hike.shared && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                            <Share2 className="h-3 w-3 mr-1" />
                            Shared
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`${isHikePinned(hike.id) 
                            ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' 
                            : 'text-muted-foreground hover:text-yellow-600 hover:bg-yellow-50'
                          } px-2 sm:px-3`}
                          onClick={() => handlePinHike(hike.id)}
                        >
                          {isHikePinned(hike.id) ? (
                            <PinOff className="h-4 w-4 sm:mr-1" />
                          ) : (
                            <Pin className="h-4 w-4 sm:mr-1" />
                          )}
                          <span className="hidden sm:inline">
                            {isHikePinned(hike.id) ? 'Unpin' : 'Pin'}
                          </span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`${hike.shared 
                            ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' 
                            : 'text-muted-foreground hover:text-blue-600 hover:bg-blue-50'
                          } px-2 sm:px-3`}
                          onClick={() => handleShareHike(hike.id)}
                        >
                          {hike.shared ? (
                            <Share2 className="h-4 w-4 sm:mr-1" />
                          ) : (
                            <Share className="h-4 w-4 sm:mr-1" />
                          )}
                          <span className="hidden sm:inline">
                            {hike.shared ? 'Shared' : 'Share'}
                          </span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-summit hover:text-summit hover:bg-muted px-2 sm:px-3"
                          onClick={() => handleViewRouteMap(hike)}
                        >
                          <Map className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Route Map</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-forest hover:text-forest hover:bg-muted px-2 sm:px-3"
                          onClick={() => handleEditHike(hike)}
                        >
                          <Edit3 className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-600 hover:bg-red-50 px-2 sm:px-3"
                          onClick={() => handleDeleteHike(hike.id)}
                        >
                          <Trash2 className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              className="border-forest text-forest hover:bg-forest hover:text-primary-foreground transition-all duration-300"
            >
              Load More Entries
            </Button>
          </div>

          <NewHikeEntryForm 
            open={isNewEntryOpen}
            onOpenChange={setIsNewEntryOpen}
            onSubmit={handleAddNewHike}
          />

          <NewHikeEntryForm 
            open={isEditHikeOpen}
            onOpenChange={setIsEditHikeOpen}
            onSubmit={handleSubmitEditHike}
            initialData={editingHike}
            title="Edit Hike"
          />

          <Dialog open={isStartHikeFormOpen} onOpenChange={(open) => {
            setIsStartHikeFormOpen(open);
            if (!open) {
              setDetectedLocation(''); // Reset when closing
              setDetectedWeather(''); // Reset weather when closing
            }
          }}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl text-foreground flex items-center gap-2">
                  <Play className="h-6 w-6 text-green-600" />
                  Start New Hike
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Hike Title
                  </label>
                  <Input
                    id="start-title"
                    placeholder="Enter hike title..."
                    className="border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Starting Location
                  </label>
                  <Input
                    id="start-location"
                    value={detectedLocation}
                    onChange={(e) => setDetectedLocation(e.target.value)}
                    placeholder={isDetectingLocation ? "Detecting your location..." : "Where are you starting from?"}
                    className="border-border"
                    disabled={isDetectingLocation}
                  />
                  {isDetectingLocation && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      Detecting location...
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Date
                  </label>
                  <Input
                    id="start-date"
                    type="date"
                    className="border-border"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Current Weather
                  </label>
                  <Input
                    id="start-weather"
                    value={detectedWeather}
                    onChange={(e) => setDetectedWeather(e.target.value)}
                    placeholder={isDetectingWeather ? "Detecting weather..." : "e.g., Sunny, 22°C"}
                    className="border-border"
                    disabled={isDetectingWeather}
                  />
                  {isDetectingWeather && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      Detecting weather...
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Initial Notes (Optional)
                  </label>
                  <Input
                    id="start-notes"
                    placeholder="Any notes before starting..."
                    className="border-border"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsStartHikeFormOpen(false)}
                    className="flex-1 border-border"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      const formData = {
                        title: document.getElementById('start-title').value || 'New Hike',
                        location: detectedLocation || 'Unknown Location',
                        date: document.getElementById('start-date').value || new Date().toISOString().split('T')[0],
                        weather: detectedWeather || '',
                        notes: document.getElementById('start-notes').value || '',
                        difficulty: 'Easy' // Default to Easy, user can change during hike
                      };
                      handleStartActiveHike(formData);
                      setIsStartHikeFormOpen(false);
                      setDetectedLocation(''); // Reset for next time
                      setDetectedWeather(''); // Reset weather too
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Tracking
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <RouteMapModal
            isOpen={isRouteMapOpen}
            onClose={() => setIsRouteMapOpen(false)}
            hikeData={selectedHike}
          />
        </div>
      </div>
    </div>
  );
};

export default Logbook;