import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { 
  Play, 
  Pause, 
  Square, 
  MapPin, 
  Clock, 
  Mountain, 
  Thermometer,
  Camera,
  Save,
  Navigation,
  Plus
} from "lucide-react";

const ActiveHike = ({ hikeId, onComplete, onSave }) => {
  // Hike state
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [currentElevation, setCurrentElevation] = useState(0);
  
  // Real-time editable data
  const [hikeData, setHikeData] = useState({
    title: "",
    location: "",
    weather: "",
    difficulty: "Easy",
    notes: "",
    waypoints: [],
    accomplishments: []
  });

  // GPS and location state
  const [currentLocation, setCurrentLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const intervalRef = useRef(null);

  // Auto-save timer
  const autoSaveRef = useRef(null);

  // Start tracking GPS location
  useEffect(() => {
    if (isActive && !isPaused) {
      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, altitude } = position.coords;
            setCurrentLocation({ latitude, longitude, altitude });
            
            // Update elevation if available
            if (altitude) {
              setCurrentElevation(prev => Math.max(prev, Math.round(altitude * 3.28084))); // Convert to feet
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
        setWatchId(id);
      }
    } else if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isActive, isPaused, watchId]);

  // Timer for elapsed time
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  // Auto-save functionality
  useEffect(() => {
    if (isActive) {
      autoSaveRef.current = setInterval(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds
    } else {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    }

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [isActive, hikeData, currentDistance, currentElevation, elapsedTime]);

  const handleStartHike = () => {
    setIsActive(true);
    setIsPaused(false);
    setStartTime(new Date());
    setElapsedTime(0);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStopHike = () => {
    setIsActive(false);
    setIsPaused(false);
    
    // Save final hike data
    const finalHikeData = {
      ...hikeData,
      startTime,
      endTime: new Date(),
      duration: formatTime(elapsedTime),
      distance: `${currentDistance.toFixed(1)} miles`,
      elevation: `${currentElevation} ft`,
      status: 'completed'
    };
    
    onComplete(finalHikeData);
  };

  const handleDataChange = (field, value) => {
    setHikeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAutoSave = () => {
    const saveData = {
      ...hikeData,
      currentDistance,
      currentElevation,
      elapsedTime,
      isActive,
      isPaused,
      lastSaved: new Date()
    };
    
    onSave(saveData);
  };

  const addWaypoint = () => {
    if (currentLocation) {
      const waypoint = {
        id: Date.now(),
        ...currentLocation,
        timestamp: new Date(),
        distance: currentDistance,
        notes: ""
      };
      
      setHikeData(prev => ({
        ...prev,
        waypoints: [...prev.waypoints, waypoint]
      }));
    }
  };

  const addAccomplishment = (accomplishment) => {
    const newAccomplishment = {
      id: Date.now(),
      text: accomplishment,
      timestamp: new Date(),
      distance: currentDistance,
      location: currentLocation
    };
    
    setHikeData(prev => ({
      ...prev,
      accomplishments: [...prev.accomplishments, newAccomplishment]
    }));
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const updateDistance = (newDistance) => {
    setCurrentDistance(parseFloat(newDistance) || 0);
  };

  const quickUpdateDistance = (increment) => {
    setCurrentDistance(prev => Math.max(0, prev + increment));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-foreground">
                {isActive ? "Hiking in Progress" : "Start Your Hike"}
              </CardTitle>
              <div className="flex gap-2">
                {!isActive && (
                  <Button 
                    onClick={handleStartHike}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Hike
                  </Button>
                )}
                
                {isActive && (
                  <>
                    <Button 
                      onClick={handlePauseResume}
                      variant="outline"
                    >
                      {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                      {isPaused ? "Resume" : "Pause"}
                    </Button>
                    <Button 
                      onClick={handleStopHike}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Finish Hike
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          
          {isActive && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{formatTime(elapsedTime)}</div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
                <div className="text-center">
                  <Mountain className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{currentDistance.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Miles</div>
                </div>
                <div className="text-center">
                  <Navigation className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{currentElevation}</div>
                  <div className="text-sm text-muted-foreground">Elevation (ft)</div>
                </div>
                <div className="text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <div className="text-sm font-bold">
                    {currentLocation ? "GPS Active" : "No GPS"}
                  </div>
                  <Badge variant={currentLocation ? "default" : "destructive"}>
                    {currentLocation ? "Tracking" : "No Signal"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Hike Details - Always editable */}
        <Card>
          <CardHeader>
            <CardTitle>Hike Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Hike Title</label>
                <Input
                  value={hikeData.title}
                  onChange={(e) => handleDataChange('title', e.target.value)}
                  placeholder="Name your hike..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  value={hikeData.location}
                  onChange={(e) => handleDataChange('location', e.target.value)}
                  placeholder="Where are you hiking?"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Current Weather</label>
                <Input
                  value={hikeData.weather}
                  onChange={(e) => handleDataChange('weather', e.target.value)}
                  placeholder="Sunny, 72°F"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Distance Progress</label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => quickUpdateDistance(-0.1)}
                    className="px-2"
                  >
                    -0.1
                  </Button>
                  <Input
                    type="number"
                    step="0.1"
                    value={currentDistance}
                    onChange={(e) => updateDistance(e.target.value)}
                    placeholder="0.0"
                    className="text-center"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => quickUpdateDistance(0.1)}
                    className="px-2"
                  >
                    +0.1
                  </Button>
                </div>
                <div className="flex gap-1 mt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => quickUpdateDistance(0.5)}
                    className="text-xs"
                  >
                    +0.5mi
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => quickUpdateDistance(1.0)}
                    className="text-xs"
                  >
                    +1mi
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Notes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notes & Thoughts Along the Way</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {isActive ? "Live Editing" : "Ready to Edit"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={hikeData.notes}
              onChange={(e) => handleDataChange('notes', e.target.value)}
              placeholder="Keep track of your thoughts, observations, and experiences as you hike... What do you see? How do you feel? Any interesting wildlife or landmarks?"
              rows={6}
              className="w-full"
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {isActive ? "Auto-saves every 30 seconds" : "Click 'Start Hike' to enable auto-save"}
                </span>
                {hikeData.notes && (
                  <span className="text-xs text-muted-foreground">
                    {hikeData.notes.length} characters
                  </span>
                )}
              </div>
              <Button onClick={handleAutoSave} variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {isActive && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button onClick={addWaypoint} variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  Mark Waypoint
                </Button>
                <Button 
                  onClick={() => {
                    const accomplishment = prompt("What did you accomplish?");
                    if (accomplishment) addAccomplishment(accomplishment);
                  }}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Accomplishment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Waypoints List */}
        {hikeData.waypoints.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>GPS Waypoints Marked</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {hikeData.waypoints.length} waypoints
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hikeData.waypoints.map((waypoint, index) => (
                  <div key={waypoint.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          Waypoint #{index + 1}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {waypoint.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        GPS: {waypoint.latitude?.toFixed(6)}, {waypoint.longitude?.toFixed(6)}
                        {waypoint.altitude && (
                          <div>Altitude: {Math.round(waypoint.altitude * 3.28084)} ft</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {waypoint.distance.toFixed(1)} mi
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accomplishments List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Keep Track of Your Accomplishments Along the Way</CardTitle>
              <Badge variant="outline" className="text-xs">
                {hikeData.accomplishments.length} recorded
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {hikeData.accomplishments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mountain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No accomplishments recorded yet</p>
                <p className="text-sm">
                  {isActive 
                    ? "Use the 'Add Accomplishment' button above to record milestones as you hike!" 
                    : "Start your hike to begin tracking accomplishments along the way."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {hikeData.accomplishments.map((accomplishment, index) => (
                  <div key={accomplishment.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {accomplishment.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="font-medium">{accomplishment.text}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {accomplishment.distance.toFixed(1)} mi
                      </Badge>
                      {accomplishment.location && (
                        <div className="text-xs text-muted-foreground mt-1">
                          GPS: {accomplishment.location.latitude?.toFixed(4)}, {accomplishment.location.longitude?.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActiveHike;
