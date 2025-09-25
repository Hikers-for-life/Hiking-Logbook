import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Navigation } from "../components/ui/navigation";
import { Input } from "../components/ui/input";
import NewHikePlanForm from "../components/NewHikePlanForm";
import RouteExplorer from "../components/RouteExplorer"; 
import { Calendar, MapPin, Users, Backpack, Mountain, Plus, X, RotateCcw, Search, Trash2, Edit } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { plannedHikeApiService } from "../services/plannedHikesService.js";
import { useGearChecklist } from "../services/gearService.js";
import clear from '../components/assets/clear.jpg';
import sunny from '../components/assets/sunny.jpg';
import snow from '../components/assets/snow.jpg';
import rain from '../components/assets/rain.jpg';
import drizzle from '../components/assets/drizzle.jpg';
import wind from '../components/assets/wind.png';
import humidity from '../components/assets/humidity.png';


const sampleWeather = [
  {
    id: '1',
    name: 'Mount Washington Summit',
    location: 'White Mountains, NH',
    date: '2024-08-05',
    duration: '6h 30m',
    distance: '12.4 mi',
    difficulty: 'Hard',
    elevation: '4,322 ft',
    rating: 5,
    notes:
      'Incredible views from the summit! Weather was perfect, saw amazing sunrise.',
  }
]
const HikePlanner = () => {
  const { currentUser } = useAuth();
  const inputRef = useRef();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewPlanOpen, setIsNewPlanOpen] = useState(false);
  const [isRouteExplorerOpen, setIsRouteExplorerOpen] = useState(false); 
  const [newGearItem, setNewGearItem] = useState("");
  
  // Edit state
  const [editingHike, setEditingHike] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Planned Hikes State
  const [plannedHikes, setPlannedHikes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [weather] = useState(sampleWeather);
  const [profile, setProfile] = useState(null);
  const [weatherData, setWeatherData] = useState(false);
  const filteredHikes = weather.filter(
      (hike) =>
        hike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hike.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
      if (!currentUser) return;

      const fetchProfile = async () => {
        try {
          const res = await fetch(`http://localhost:3001/api/users/${currentUser.uid}`);
          if (!res.ok) throw new Error("Failed to fetch profile");
          const data = await res.json();
          setProfile(data);  // now profile has bio, location, createdAt
        } catch (err) {
          console.error(err);
        }
      };

      fetchProfile();
    }, [currentUser]);


    const [location, setLocation] = useState({
      location: profile?.location || "Location not yet set",
      latitude: profile?.latitude || "not set",
      longitude: profile?.longitude || "not set",
    });

    useEffect(() => {
      if (profile) {
        setLocation({
          location: profile.location || "Location not yet set",
          latitude: profile.latitude || "not set",
          longitude: profile.longitude || "not set",
        });
      }
    }, [profile]);
    const allIcons = {
      "01d": sunny,
      "O1n": sunny,
      "02d" : clear,
      "02n" : clear,
      "03d" : clear,
      "03n" : clear,
      "04d" : clear,
      "04n" : drizzle,
      "09d" : rain,
      "09n" : rain,
      "10d" : rain,
      "10n" : rain,
      "13d" : snow,
      "13d": snow,

    }
    
    useEffect(() => {
      if (profile?.latitude && profile?.longitude) {
        search(profile.latitude, profile.longitude);
      }
    }, [profile]);
      
    
    const search = async (latitude, longitude) => {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${
          process.env.REACT_APP_OPENWEATHER_API_KEY
        }`;

        const response = await fetch(url);
        const data = await response.json();
        console.log("Weather data:", data);

        // guard against missing weather data
        if (!data.weather || !data.weather[0]) {
          console.error("No weather data available:", data);
          return;
        }

    const icon = allIcons[data.weather[0].icon] || clear;

    setWeatherData({
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      temperature: Math.floor(data.main.temp),
      minTemp: Math.floor(data.main.temp_min),
      maxTemp: Math.floor(data.main.temp_max),
      feelsLike: Math.floor(data.main.feels_like),
      description: data.weather[0].description,
      icon: icon,
    });
  } catch (error) {
    console.error("Error fetching weather:", error);
  }
};
  const search2 = async (query) => {
        try {
          const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`;
          const response = await fetch(geoUrl);
          const data = await response.json();

          if (data && data.length > 0) {
            const { name, lat, lon } = data[0];

           
            setLocation({
              location: name,
              latitude: lat,
              longitude: lon,
            });

            // Fetch weather with new lat/lon
            search(lat, lon);
          }
        } catch (error) {
          console.error("Error searching location:", error);
        }
      };
      


  // Use the gear checklist hook instead of local state
  const {
    gearChecklist,
    isLoading: gearLoading,
    error: gearError,
    loadGearChecklist,
    addGearItem,
    removeGearItem,
    toggleGearItem,
    resetGearChecklist,
    totalItems,
    checkedItems,
    completionPercentage
  } = useGearChecklist();

  // Load gear checklist when user is available
  useEffect(() => {
    if (currentUser) {
      loadGearChecklist();
    }
  }, [currentUser, loadGearChecklist]);

  // Data Loading from API
  const loadPlannedHikes = useCallback(async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      setError(null);
      const hikes = await plannedHikeApiService.getPlannedHikes();
      
      const processedHikes = hikes
        .map(hike => {
          if (!hike.date) {
            console.warn('Skipping hike due to missing date field:', hike);
            return null;
          }

          let jsDate;

          // If it's a Firestore Timestamp
          if (hike.date._seconds !== undefined) {
            jsDate = new Date(hike.date._seconds * 1000);
          }
          // If it's already a string
          else if (typeof hike.date === "string") {
            const cleanedDateString = hike.date.replace(" at ", "");
            jsDate = new Date(cleanedDateString);
          }
          // If it's already a Date object
          else if (hike.date instanceof Date) {
            jsDate = hike.date;
          }
          else {
            console.warn("Skipping hike: unsupported date format:", hike.date);
            return null;
          }

          if (isNaN(jsDate.getTime())) {
            console.warn('Skipping hike because date is invalid:', hike.date);
            return null;
          }

          jsDate.setHours(0, 0, 0, 0);

          return {
            ...hike,
            jsDate,
          };
        })
        .filter(Boolean);

      setPlannedHikes(processedHikes);
    } catch (err) {
      console.error("Failed to load planned hikes:", err);
      setError(`Failed to load adventures: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadPlannedHikes();
  }, [loadPlannedHikes]);

  // Handler to Create a New Hike Plan via API
  const handleAddNewPlan = async (newPlanData) => {
    try {
      setError(null);
      await plannedHikeApiService.createPlannedHike(newPlanData);
      loadPlannedHikes();
    } catch (err) {
      console.error("Failed to create hike plan:", err);
      setError("Failed to create the new hike plan. Please try again.");
    }
  };

  // Handler to Delete a Planned Hike
  const handleDeletePlannedHike = async (hikeId) => {
    if (!window.confirm('Are you sure you want to delete this planned hike? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      await plannedHikeApiService.deletePlannedHike(hikeId);
      loadPlannedHikes(); // Reload the list
    } catch (err) {
      console.error("Failed to delete planned hike:", err);
      setError("Failed to delete the hike plan. Please try again.");
    }
  };

  // Handler to Edit a Planned Hike
  const handleEditPlannedHike = (hike) => {
    // Convert the hike data to the format expected by the form
    const formattedHike = {
      ...hike,
      // Convert jsDate back to YYYY-MM-DD format for the date input
      date: hike.jsDate.toISOString().split('T')[0]
    };
    
    setEditingHike(formattedHike);
    setIsEditMode(true);
    setIsNewPlanOpen(true);
  };

  // Handler to Update a Planned Hike
  const handleUpdatePlannedHike = async (updatedPlanData) => {
    try {
      setError(null);
      await plannedHikeApiService.updatePlannedHike(editingHike.id, updatedPlanData);
      loadPlannedHikes();
      setEditingHike(null);
      setIsEditMode(false);
    } catch (err) {
      console.error("Failed to update hike plan:", err);
      setError("Failed to update the hike plan. Please try again.");
    }
  };

  const handleCancelPlannedHike = async (hikeId) => {
    if (!window.confirm('Are you sure you want to cancel this planned hike? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      // Update the status to cancelled instead of deleting
      await plannedHikeApiService.updatePlannedHike(hikeId, { status: 'cancelled' });
      loadPlannedHikes(); // Reload the list
    } catch (err) {
      console.error("Failed to cancel planned hike:", err);
      setError("Failed to cancel the hike plan. Please try again.");
    }
  };

// Add new function to start a planned hike
  const handleStartPlannedHike = async (trip) => {
    if (!window.confirm('Are you sure you want to start this hike? This will convert it to an active hiking session.')) {
      return;
    }

    try {
      setError(null);
      
      // Prepare the hike data with planned hike information
      const hikeData = {
        title: trip.title,
        location: trip.location,
        distance: trip.distance,
        difficulty: trip.difficulty,
        description: trip.description,
        notes: trip.notes,
        startTime: trip.startTime,
        plannedHikeId: trip.id, // Store reference to planned hike
        weather: weatherData ? `${weatherData.description}, ${weatherData.temperature}°C` : 'Unknown',
        status: 'active'
      };

      // Start the hike via API
      const result = await plannedHikeApiService.startPlannedHike(trip.id);
      
      if (result.success) {
        // Navigate to logbook with active hike data
        // You'll need to pass this data to the Logbook component
        // This could be done through routing state or a global context
        
        // For now, we'll store in localStorage and redirect
        localStorage.setItem('activeHikeData', JSON.stringify({
          ...hikeData,
          activeHikeId: result.id,
          startedAt: new Date().toISOString()
        }));
        
        // Redirect to logbook
        window.location.href = '/logbook';
      }
      
    } catch (err) {
      console.error("Failed to start planned hike:", err);
      setError("Failed to start the hike. Please try again.");
    }
  };

  // Handle form submission (create or update)
  const handleFormSubmit = async (planData) => {
    if (isEditMode) {
      await handleUpdatePlannedHike(planData);
    } else {
      await handleAddNewPlan(planData);
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setIsNewPlanOpen(false);
    setEditingHike(null);
    setIsEditMode(false);
  };

  // Calendar and Data Processing
  const currentCalendar = useMemo(() => {
    const today = new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    return {
      monthName: monthNames[currentMonth],
      year: currentYear,
      today: today.getDate(),
      isCurrentMonth: currentMonth === today.getMonth() && currentYear === today.getFullYear(),
      startDate
    };
  }, [selectedDate]);

  const hikesByDate = useMemo(() => {
    const map = new Map();
    plannedHikes.forEach(hike => {
      const dateKey = hike.jsDate.toISOString().split('T')[0];
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey).push(hike);
    });
    return map;
  }, [plannedHikes]);
  
  const displayedAdventures = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedCalendarDate) {
      return hikesByDate.get(selectedCalendarDate) || [];
    }
    
    return plannedHikes
      .filter(hike => hike.jsDate >= today)
      .sort((a, b) => a.jsDate - b.jsDate);
  }, [plannedHikes, selectedCalendarDate, hikesByDate]);
  
  const hikeStats = useMemo(() => {
    if (!plannedHikes || plannedHikes.length === 0) {
      return { totalPlannedHikes: 0, totalEstimatedDistance: 0 };
    }
    const totalEstimatedDistance = plannedHikes.reduce((sum, hike) => sum + (parseFloat(hike.distance) || 0), 0);
    return {
      totalPlannedHikes: plannedHikes.length,
      totalEstimatedDistance: totalEstimatedDistance.toFixed(1),
    };
  }, [plannedHikes]);

  // Updated Gear Handlers
  const handleAddGearItem = async () => {
    if (!newGearItem.trim()) return;
    
    try {
      await addGearItem(newGearItem.trim());
      setNewGearItem("");
    } catch (error) {
      console.error('Failed to add gear item:', error);
      // You could show a toast notification here
    }
  };

  const handleToggleGearItem = async (index) => {
    try {
      await toggleGearItem(index);
    } catch (error) {
      console.error('Failed to toggle gear item:', error);
    }
  };

  const handleRemoveGearItem = async (index) => {
    try {
      await removeGearItem(index);
    } catch (error) {
      console.error('Failed to remove gear item:', error);
    }
  };

  const handleResetGearChecklist = async () => {
    try {
      await resetGearChecklist();
    } catch (error) {
      console.error('Failed to reset gear checklist:', error);
    }
  };

  const handleKeyPress = (e) => { 
    if (e.key === "Enter") { 
      e.preventDefault(); 
      handleAddGearItem(); 
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Hike <span className="text-forest">Planner</span></h1>
            <p className="text-muted-foreground text-lg">Plan your next adventure and coordinate with friends</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Button size="lg" className="bg-gradient-trail text-primary-foreground shadow-mountain hover:shadow-elevation hover:scale-105 transition-all duration-300 h-16" onClick={() => setIsNewPlanOpen(true)}>
                  <Mountain className="h-5 w-5 mr-2" /> Plan New Hike
                </Button>
                <Button size="lg" variant="outline" className="border-forest text-forest hover:bg-forest hover:text-primary-foreground transition-all duration-300 h-16" onClick={() => setIsRouteExplorerOpen(true)}>
                  <MapPin className="h-5 w-5 mr-2" /> Explore Routes
                </Button>
              </div>

              {/* Calendar View */}
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground flex items-center justify-between">
                    <div className="flex items-center"><Calendar className="h-5 w-5 mr-2 text-forest" />{currentCalendar.monthName} {currentCalendar.year}</div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}>←</Button>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>Today</Button>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}>→</Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-medium text-muted-foreground py-2">{day}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {Array.from({ length: 42 }, (_, i) => {
                      const cellDate = new Date(currentCalendar.startDate);
                      cellDate.setDate(currentCalendar.startDate.getDate() + i);
                      
                      const day = cellDate.getDate();
                      const isCurrentMonth = cellDate.getMonth() === selectedDate.getMonth();
                      const isToday = currentCalendar.isCurrentMonth && day === currentCalendar.today;
                      
                      const cellDateKey = cellDate.toISOString().split('T')[0];
                      const hikesForDay = hikesByDate.get(cellDateKey);
                      const hasHikes = isCurrentMonth && hikesForDay && hikesForDay.length > 0;
                      
                      return (
                        <div 
                          key={i} 
                          className={`
                            p-2 rounded-lg cursor-pointer transition-all duration-200 text-sm relative
                            ${!isCurrentMonth ? 'text-muted-foreground/50' : 'text-foreground hover:bg-muted'}
                            ${isToday ? 'bg-forest text-primary-foreground font-semibold ring-2 ring-forest/50' : ''}
                            ${selectedCalendarDate === cellDateKey ? 'ring-2 ring-summit' : ''}
                          `}
                          onClick={() => isCurrentMonth && setSelectedCalendarDate(hasHikes ? cellDateKey : null)}
                        >
                          {day}
                          {hasHikes && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 bg-trail rounded-full"></div>}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Trips */}
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                   <CardTitle className="text-xl text-foreground flex justify-between items-center">
                    <span>
                      {selectedCalendarDate 
                        ? `Adventures on ${new Date(selectedCalendarDate + 'T00:00:00').toLocaleDateString()}` 
                        : 'Upcoming Adventures'}
                    </span>
                    {selectedCalendarDate && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCalendarDate(null)}>
                        Show All <X className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading && <p className="text-muted-foreground">Loading adventures...</p>}
                  {error && <p className="text-destructive">{error}</p>}
                  
                  {!isLoading && !error && displayedAdventures.length > 0 && displayedAdventures.map((trip) => (
                    <Card key={trip.id} className="shadow-mountain hover:shadow-elevation transition-all duration-300 bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">{trip.title}</h3>
                            <div className="flex items-center text-muted-foreground text-sm space-x-4">
                              <span>{trip.jsDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                              {trip.startTime && <span>{trip.startTime}</span>}
                              <Badge variant={trip.status === 'confirmed' ? 'default' : 'secondary'} className={trip.status === 'confirmed' ? 'bg-forest text-primary-foreground' : 'bg-trail/20 text-foreground border-trail'}>{trip.status}</Badge>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-forest text-forest">{trip.difficulty}</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-muted-foreground"><MapPin className="h-4 w-4 mr-2 text-forest" />{trip.location}</div>
                          <div className="flex items-center text-muted-foreground"><Mountain className="h-4 w-4 mr-2 text-trail" />{trip.distance}</div>
                          {trip.description && (
                            <div className="text-muted-foreground mt-2">
                              <p className="text-xs">{trip.description}</p>
                            </div>
                          )}
                          {trip.notes && (
                            <div className="text-muted-foreground">
                              <p className="text-xs"><strong>Notes:</strong> {trip.notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          {trip.status !== 'cancelled' && trip.status !== 'started' && (
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleStartPlannedHike(trip)}
                            >
                              <Mountain className="h-4 w-4 mr-1" />
                              Start Hike
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-forest hover:text-forest hover:bg-muted"
                            onClick={() => handleEditPlannedHike(trip)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          {trip.status !== 'cancelled' && trip.status !== 'started' && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleCancelPlannedHike(trip.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {!isLoading && !error && displayedAdventures.length === 0 && (
                     <Card className="border-2 border-dashed border-border hover:border-forest transition-all duration-300 cursor-pointer" onClick={() => setIsNewPlanOpen(true)}>
                        <CardContent className="p-6 text-center">
                          <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">
                            {selectedCalendarDate ? 'No hikes on this day. Plan one!' : 'No upcoming adventures. Plan a new one!'}
                          </p>
                        </CardContent>
                      </Card>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Gear Checklist - Updated to use API */}
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground flex items-center justify-between">
                    <div className="flex items-center">
                      <Backpack className="h-5 w-5 mr-2 text-forest" />
                      Gear Checklist
                    </div>
                    <div className="flex items-center gap-2">
                      {totalItems > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {checkedItems}/{totalItems} ({completionPercentage}%)
                        </span>
                      )}
                      {totalItems > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleResetGearChecklist}
                          className="text-muted-foreground hover:text-foreground p-1 h-auto"
                          title="Reset all items"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gearLoading && <p className="text-muted-foreground text-sm">Loading gear...</p>}
                  {gearError && <p className="text-destructive text-sm">{gearError}</p>}
                  
                  {!gearLoading && !gearError && (
                    <>
                      <div className="space-y-3">
                        {gearChecklist.map((item, index) => (
                          <div key={`${item.item}-${index}`} className="flex items-center justify-between group">
                            <div className="flex items-center space-x-3">
                              <input 
                                type="checkbox" 
                                checked={item.checked} 
                                onChange={() => handleToggleGearItem(index)} 
                                className="rounded border-forest text-forest focus:ring-forest focus:ring-offset-0"
                              />
                              <span className={`text-sm ${item.checked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                {item.item}
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveGearItem(index)} 
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 h-auto"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Input 
                          placeholder="Add gear item..." 
                          value={newGearItem} 
                          onChange={(e) => setNewGearItem(e.target.value)} 
                          onKeyPress={handleKeyPress} 
                          className="border-border text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleAddGearItem} 
                          className="border-forest text-forest hover:bg-forest hover:text-primary-foreground flex-shrink-0"
                          disabled={!newGearItem.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              

              {/* Quick Stats - Now Dynamic */}
              <Card className="bg-gradient-card border-border">
                <CardHeader><CardTitle className="text-xl text-foreground">All-Time Stats</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between"><span className="text-muted-foreground">Planned Hikes</span><span className="font-semibold text-forest">{isLoading ? '...' : hikeStats.totalPlannedHikes}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Distance</span><span className="font-semibold text-trail">{isLoading ? '...' : `${hikeStats.totalEstimatedDistance} km`}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Gear Items</span><span className="font-semibold text-summit">{gearLoading ? '...' : totalItems}</span></div>
                  {totalItems > 0 && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Gear Ready</span><span className="font-semibold text-forest">{completionPercentage}%</span></div>
                  )}
                </CardContent>
              </Card>

              {/* Weather Widget */}
             
              <Card className="relative bg-gradient-card border-border overflow-hidden"> 
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${weatherData.icon})` }}
                >
                  {/* Strong dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
                </div>

                {/* Put content above overlay */}
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl text-foreground">
                    <div className="relative flex-1 w-full">
                      <Input
                        ref = {inputRef}
                        type="text"
                        placeholder="Search location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background/80 text-black placeholder:text-black-300"
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" onClick={()=> search2(inputRef.current.value)} />
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10">
                  <div className="text-center space-y-4">
                    <div
                      className="text-3xl font-bold text-white mb-6"
                      style={{ textShadow: "2px 2px 6px rgba(0,0,0,0.8)" }}
                    >
                      {location.location}
                    </div>
                      <div className="grid grid-cols-3 items-center text-center gap-2">
                        {/* Left - Humidity */}
                        <div className="flex flex-col items-center justify-center p-2">
                          <div className="flex items-center gap-1">
                            <img src={humidity} alt="" className="h-3 w-3" />
                            <span className="font-medium text-white text-xs">{weatherData.humidity}%</span>
                          </div>
                          <div className="text-gray-300 text-xs">Humidity</div>
                        </div>

                        {/* Middle - Temp */}
                        <div className="flex flex-col items-center justify-center p-2">
                          <div
                            className="text-2xl font-bold text-white"
                            style={{ textShadow: "2px 2px 6px rgba(0,0,0,0.8)" }}
                          >
                            {weatherData.temperature}°C
                          </div>
                          <div className="text-gray-100 text-xs">{weatherData.description}</div>
                        </div>

                        {/* Right - Wind */}
                        <div className="flex flex-col items-center justify-center p-2">
                          <div className="flex items-center gap-1">
                            <img src={wind} alt="" className="h-3 w-3" />
                            <span className="font-medium text-white text-xs">{weatherData.windSpeed}Km/h</span>
                          </div>
                          <div className="text-gray-300 text-xs">Wind Speed</div>
                        </div>
                      </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 rounded-lg bg-white/10">
                        <div className="font-medium text-white">Feels Like</div>
                        <div className="text-gray-300">{weatherData.feelsLike}°C</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-white/10">
                        <div className="font-medium text-white">Lowest</div>
                        <div className="text-gray-300">{weatherData.minTemp}°C</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-white/10">
                        <div className="font-medium text-white">Highest </div>
                        <div className="text-gray-300">{weatherData.maxTemp}°C</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* New Hike Plan Form */}
        <NewHikePlanForm 
          open={isNewPlanOpen}
          onOpenChange={handleFormClose}
          onSubmit={handleFormSubmit}
          editingHike={editingHike}
          isEditMode={isEditMode}
        />

        {/* Route Explorer Modal */}
        <RouteExplorer 
          isOpen={isRouteExplorerOpen}
          onOpenChange={setIsRouteExplorerOpen}
        />
      </div>
    </div>
  );
};

export default HikePlanner;