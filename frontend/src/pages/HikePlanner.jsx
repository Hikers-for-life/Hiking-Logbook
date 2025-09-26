import { useState, useMemo,useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Navigation } from "../components/ui/navigation";
import { Input } from "../components/ui/input";
import NewHikePlanForm from "../components/NewHikePlanForm";
import { useAuth } from '../contexts/AuthContext.jsx';
import { Calendar, MapPin, Users, Backpack, Mountain, Plus, X, Search } from "lucide-react";
import clear from '../components/assets/clear.jpg';
import sunny from '../components/assets/sunny.jpg';
import snow from '../components/assets/snow.jpg';
import rain from '../components/assets/rain.jpg';
import drizzle from '../components/assets/drizzle.jpg';
import wind from '../components/assets/wind.png';
import humidity from '../components/assets/humidity.png';
import { Description } from "@radix-ui/react-dialog";
import { useToast } from "../hooks/use-toast";

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
  const inputRef = useRef()
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewPlanOpen, setIsNewPlanOpen] = useState(false);
  const [newGearItem, setNewGearItem] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [weather] = useState(sampleWeather);
  const { currentUser } = useAuth();
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
      
  
  


  // Dynamic calendar calculations
  const currentCalendar = useMemo(() => {
    const today = new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    return {
      monthName: monthNames[currentMonth],
      year: currentYear,
      today: today.getDate(),
      todayMonth: today.getMonth(),
      todayYear: today.getFullYear(),
      isCurrentMonth: currentMonth === today.getMonth() && currentYear === today.getFullYear(),
      firstDay: firstDay.getDay(),
      daysInMonth: lastDay.getDate(),
      startDate
    };
  }, [selectedDate]);

  // State for hike plans (will be replaced with backend data)
  const [upcomingTrips, setUpcomingTrips] = useState([
    {
      id: 1,
      title: "Weekend Warriors: Lake Summit",
      date: "March 22-23, 2024",
      location: "Lake Summit Trail, Oregon",
      participants: ["You", "Sarah", "Emma", "Maya"],
      difficulty: "Moderate",
      distance: "12.5 miles",
      status: "confirmed",
    },
    {
      id: 2,
      title: "Wildflower Photography Hike",
      date: "April 5, 2024",
      location: "Meadow Vista Trail, California",
      participants: ["You", "Emma", "Lisa"],
      difficulty: "Easy",
      distance: "6.2 miles",
      status: "planning",
    },
  ]);

  // State for gear checklist (will be replaced with backend data)
  const [gearChecklist, setGearChecklist] = useState([
    { item: "Hiking Boots", checked: true },
    { item: "Water (3L)", checked: true },
    { item: "Trail Snacks", checked: false },
    { item: "First Aid Kit", checked: true },
    { item: "Camera", checked: false },
    { item: "Rain Jacket", checked: false },
  ]);

  // Handlers for functionality
  const handleAddNewPlan = (newPlan) => {
    setUpcomingTrips(prev => [newPlan, ...prev]);
  };

  const toggleGearItem = (index) => {
    setGearChecklist(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const addGearItem = () => {
    if (newGearItem.trim()) {
      setGearChecklist(prev => [...prev, { item: newGearItem.trim(), checked: false }]);
      setNewGearItem("");
    }
  };

  const removeGearItem = (index) => {
    setGearChecklist(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addGearItem();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Hike <span className="text-forest">Planner</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Plan your next adventure and coordinate with friends
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Calendar & Planning */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Button 
                  size="lg"
                  className="bg-gradient-trail text-primary-foreground shadow-mountain hover:shadow-elevation hover:scale-105 transition-all duration-300 h-16"
                  onClick={() => setIsNewPlanOpen(true)}
                >
                  <Mountain className="h-5 w-5 mr-2" />
                  Plan New Hike
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-forest text-forest hover:bg-forest hover:text-primary-foreground transition-all duration-300 h-16"
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  Explore Routes
                </Button>
              </div>

              {/* Calendar View */}
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-forest" />
                      {currentCalendar.monthName} {currentCalendar.year}
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                      >
                        ←
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedDate(new Date())}
                      >
                        Today
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                      >
                        →
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="font-medium text-muted-foreground py-2">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {Array.from({ length: 42 }, (_, i) => {
                      const cellDate = new Date(currentCalendar.startDate);
                      cellDate.setDate(currentCalendar.startDate.getDate() + i);
                      
                      const day = cellDate.getDate();
                      const month = cellDate.getMonth();
                      const year = cellDate.getFullYear();
                      const isCurrentMonth = month === selectedDate.getMonth() && year === selectedDate.getFullYear();
                      const isToday = currentCalendar.isCurrentMonth && 
                                     day === currentCalendar.today && 
                                     month === currentCalendar.todayMonth && 
                                     year === currentCalendar.todayYear;
                      
                      // Check for upcoming hikes (you can make this dynamic later)
                      const isUpcomingHike = isCurrentMonth && (day === 22 || day === 23);
                      
                      return (
                        <div 
                          key={i} 
                          className={`
                            p-2 rounded-lg cursor-pointer transition-all duration-200 text-sm
                            ${!isCurrentMonth ? 'text-muted-foreground/50' : 'text-foreground hover:bg-muted'}
                            ${isToday ? 'bg-forest text-primary-foreground font-semibold ring-2 ring-forest/50' : ''}
                            ${isUpcomingHike ? 'bg-trail/20 text-foreground font-medium border border-trail/30' : ''}
                          `}
                          onClick={() => isCurrentMonth && setSelectedDate(cellDate)}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Trips */}
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    Upcoming Adventures
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingTrips.map((trip) => (
                    <Card key={trip.id} className="shadow-mountain hover:shadow-elevation transition-all duration-300 bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                              {trip.title}
                            </h3>
                            <div className="flex items-center text-muted-foreground text-sm space-x-4">
                              <span>{trip.date}</span>
                              <Badge 
                                variant={trip.status === 'confirmed' ? 'default' : 'secondary'}
                                className={trip.status === 'confirmed' ? 'bg-forest text-primary-foreground' : 'bg-trail/20 text-foreground border-trail'}
                              >
                                {trip.status}
                              </Badge>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-forest text-forest">
                            {trip.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2 text-forest" />
                            {trip.location}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Mountain className="h-4 w-4 mr-2 text-trail" />
                            {trip.distance}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Users className="h-4 w-4 mr-2 text-summit" />
                            {trip.participants.join(', ')}
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button size="sm" variant="ghost" className="text-forest hover:text-forest hover:bg-muted">
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="text-trail hover:text-trail hover:bg-muted">
                            Invite
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add New Trip Button */}
                  <Card 
                    className="border-2 border-dashed border-border hover:border-forest transition-all duration-300 cursor-pointer"
                    onClick={() => setIsNewPlanOpen(true)}
                  >
                    <CardContent className="p-6 text-center">
                      <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Plan a new hiking adventure</p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Gear & Weather */}
            <div className="space-y-6">
              {/* Gear Checklist */}
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground flex items-center">
                    <Backpack className="h-5 w-5 mr-2 text-forest" />
                    Gear Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gearChecklist.map((item, index) => (
                      <div key={index} className="flex items-center justify-between group">
                        <div className="flex items-center space-x-3">
                          <input 
                            type="checkbox" 
                            checked={item.checked}
                            onChange={() => toggleGearItem(index)}
                            className="rounded border-forest text-forest focus:ring-forest focus:ring-offset-0"
                          />
                          <span className={`text-sm ${item.checked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {item.item}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGearItem(index)}
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
                      onClick={addGearItem}
                      className="border-forest text-forest hover:bg-forest hover:text-primary-foreground flex-shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
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

                       {/* Quick Stats */}
                      <Card className="bg-gradient-card border-border">
                        <CardHeader>
                          <CardTitle className="text-xl text-foreground">
                            {currentCalendar.monthName} {currentCalendar.year}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Planned Hikes</span>
                            <span className="font-semibold text-forest">3</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Distance</span>
                            <span className="font-semibold text-trail">28.9 mi</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Friends Invited</span>
                            <span className="font-semibold text-summit">8</span>
                          </div>
                        </CardContent>
                      </Card>

            </div>
          </div>
        </div>

        {/* New Hike Plan Form */}
        <NewHikePlanForm 
          open={isNewPlanOpen}
          onOpenChange={setIsNewPlanOpen}
          onSubmit={handleAddNewPlan}
        />
      </div>
    </div>
  );
};

export default HikePlanner;
