import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Navigation } from "../components/ui/navigation";
import { Input } from "../components/ui/input";
import NewHikePlanForm from "../components/NewHikePlanForm";
import { Calendar, MapPin, Users, Backpack, Mountain, Plus, X } from "lucide-react";

const HikePlanner = () => {
  /*const [selectedDate, setSelectedDate] = useState(new Date()); */
  const [isNewPlanOpen, setIsNewPlanOpen] = useState(false);
  const [newGearItem, setNewGearItem] = useState("");

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
                  <CardTitle className="text-xl text-foreground flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-forest" />
                    March 2024
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="font-medium text-muted-foreground py-2">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {Array.from({ length: 35 }, (_, i) => {
                      const day = i - 4; // March 2024 starts on Friday
                      const isCurrentMonth = day > 0 && day <= 31;
                      const isUpcomingHike = day === 22 || day === 23;
                      const isToday = day === 15;
                      
                      return (
                        <div 
                          key={i} 
                          className={`
                            p-2 rounded-lg cursor-pointer transition-all duration-200 text-sm
                            ${!isCurrentMonth ? 'text-muted-foreground/50' : 'text-foreground hover:bg-muted'}
                            ${isToday ? 'bg-forest text-primary-foreground font-semibold' : ''}
                            ${isUpcomingHike ? 'bg-trail/20 text-foreground font-medium border border-trail/30' : ''}
                          `}
                        >
                          {isCurrentMonth ? day : ''}
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
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    Weather Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-forest">20°C</div>
                      <div className="text-muted-foreground">Partly Cloudy</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <div className="font-medium text-foreground">Fri</div>
                        <div className="text-muted-foreground">18°C</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <div className="font-medium text-foreground">Sat</div>
                        <div className="text-muted-foreground">22°C</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <div className="font-medium text-foreground">Sun</div>
                        <div className="text-muted-foreground">21°C</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    This Month
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
