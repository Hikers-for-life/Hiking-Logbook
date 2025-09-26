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
import { MapPin, Clock, Mountain, Thermometer, Plus, Search, Map, Play, Trash2, Edit3, Pin, PinOff, Share2, Share } from "lucide-react";
import { hikeApiService } from "../services/hikeApiService.js";
import { useAuth } from "../contexts/AuthContext.jsx";

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
  // Hike entries from database
  const [hikeEntries, setHikeEntries] = useState([]);

  // API functions for loading data
  const loadHikes = useCallback(async (searchTerm = '', difficultyFilter = 'All') => {
    if (!user) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Build filters for API call
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (difficultyFilter !== 'All') filters.difficulty = difficultyFilter;
      
      const response = await hikeApiService.getHikes(filters);
      console.log("📦 API Response:", response);
      if (response.success) {
        
        // Convert Firestore timestamps to readable dates and ensure all fields are safe for React
        const processedHikes = response.data.map(hike => ({
          ...hike,
          // Convert dates
          date: hike.date ? (hike.date.toDate ? hike.date.toDate().toLocaleDateString() : new Date(hike.date).toLocaleDateString()) : 'No date',
          createdAt: hike.createdAt ? (hike.createdAt.toDate ? hike.createdAt.toDate() : new Date(hike.createdAt)) : null,
          updatedAt: hike.updatedAt ? (hike.updatedAt.toDate ? hike.updatedAt.toDate().toLocaleDateString() : new Date(hike.updatedAt).toLocaleDateString()) : null,
          startTime: hike.startTime ? (hike.startTime.toDate ? hike.startTime.toDate() : new Date(hike.startTime)) : null,
          endTime: hike.endTime ? (hike.endTime.toDate ? hike.endTime.toDate() : new Date(hike.endTime)) : null,
          // Ensure other fields are strings/numbers
          title: hike.title || 'Untitled Hike',
          location: hike.location || 'Unknown Location',
          distance: hike.distance || '0 miles',
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
      // Keep mock data if API fails
    } finally {
      setIsLoading(false);
    }
  }, [user]);


  // Load hikes when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadHikes();
    } else {
      setIsLoading(false);
    }
  }, [user, loadHikes]);

  // Handler for adding new hike entries
  const handleAddNewHike = async (newHike) => {
    try {
      const response = await hikeApiService.createHike(newHike);
      if (response.success) {
        // Refresh the entire list from server to ensure consistency
        await loadHikes(searchTerm, difficultyFilter);
      }
    } catch (err) {
      console.error('Failed to create hike:', err);
      setError('Failed to create hike. Please try again.');
      // Fallback to local addition if API fails
      setHikeEntries(prev => [newHike, ...prev]);
    }
  };

  // Handler for viewing route map (placeholder for next sprint)
  const handleViewRouteMap = (hike) => {
    setSelectedHike(hike);
    setIsRouteMapOpen(true);
  };

  // Handler for starting active hike tracking
  const handleStartActiveHike = async (formData) => {
    try {
      const hikeData = {
        title: formData?.title || 'New Hike',
        location: formData?.location || 'Unknown Location',
        date: formData?.date || new Date().toISOString().split('T')[0],
        weather: formData?.weather || '',
        difficulty: formData?.difficulty || 'Easy',
        notes: formData?.notes || '',
        status: 'active'
      };
      
      
      const response = await hikeApiService.startHike(hikeData);
      if (response.success) {
        setActiveHikeMode(true);
        setCurrentActiveHike({
          id: response.data.id,
          startTime: new Date(),
          status: 'active',
          ...hikeData  // Include the form data
        });
      }
    } catch (err) {
      console.error('Failed to start hike:', err);
      setError('Failed to start hike. Please try again.');
      // Fallback to local mode if API fails
      setActiveHikeMode(true);
      setCurrentActiveHike({
        id: Date.now(),
        startTime: new Date(),
        status: 'active',
        ...(formData || {})  // Include form data in fallback too
      });
    }
  };

  // Handler for completing active hike
  const handleCompleteActiveHike = async (hikeData) => {
    try {
      const endData = {
        ...hikeData,
      };
      
      const response = await hikeApiService.completeHike(currentActiveHike.id, endData);
      
      if (response.success) {
        // Refresh the entire list from server to ensure consistency
        await loadHikes();
        setActiveHikeMode(false);
        setCurrentActiveHike(null);
      }
    } catch (err) {
      console.error('Failed to complete hike:', err);
      setError('Failed to complete hike. Please try again.');
      // Fallback to local completion if API fails
      const completedHike = {
        ...hikeData,
        id: currentActiveHike.id,
      };
      setHikeEntries(prev => [completedHike, ...prev]);
      setActiveHikeMode(false);
      setCurrentActiveHike(null);
    }
  };

  // Handler for saving active hike progress
  const handleSaveActiveHike = (hikeData) => {
    // Auto-save functionality - would integrate with backend
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



  // Handler for deleting a hike (DELETE)
  const handleDeleteHike = async (hikeId) => {
    try {
      const response = await hikeApiService.deleteHike(hikeId);
      if (response.success) {
        setHikeEntries(prev => prev.filter(hike => hike.id !== hikeId));
        setError(null);
      }
    } catch (err) {
      console.error('Failed to delete hike:', err);
      setError('Failed to delete hike. Please try again.');
    }
  };

  // Handler for editing a hike
  const handleEditHike = (hike) => {
    setEditingHike(hike);
    setIsEditHikeOpen(true);
  };

  // Handler for submitting hike edits
  const handleSubmitEditHike = async (updatedHikeData) => {
    if (!editingHike) {
      return;
    }
    
    try {
      const response = await hikeApiService.updateHike(editingHike.id, updatedHikeData);
      
      if (response.success) {
        // Refresh the entire list from server to ensure consistency
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

  // Handler for pinning/unpinning hikes
  const handlePinHike = async (hikeId) => {
    try {
      const hike = hikeEntries.find(h => h.id === hikeId);
      const isPinned = hike?.pinned === true;
      
      if (isPinned) {
        // Unpin the hike
        await hikeApiService.unpinHike(hikeId);
        // Update local state
        setHikeEntries(prev => prev.map(h => 
          h.id === hikeId ? { ...h, pinned: false } : h
        ));
      } else {
        // Pin the hike
        await hikeApiService.pinHike(hikeId);
        // Update local state
        setHikeEntries(prev => prev.map(h => 
          h.id === hikeId ? { ...h, pinned: true } : h
        ));
      }
    } catch (error) {
      console.error('Failed to pin/unpin hike:', error);
      setError('Failed to pin/unpin hike. Please try again.');
    }
  };

  // Handler for sharing/unsharing hikes
  const handleShareHike = async (hikeId) => {
    try {
      const hike = hikeEntries.find(h => h.id === hikeId);
      const isShared = hike?.shared === true;
      
      if (isShared) {
        // Unshare the hike
        await hikeApiService.unshareHike(hikeId);
        // Update local state
        setHikeEntries(prev => prev.map(h => 
          h.id === hikeId ? { ...h, shared: false } : h
        ));
      } else {
        // Share the hike
        await hikeApiService.shareHike(hikeId);
        // Update local state
        setHikeEntries(prev => prev.map(h => 
          h.id === hikeId ? { ...h, shared: true } : h
        ));
      }
    } catch (error) {
      console.error('Failed to share/unshare hike:', error);
      setError('Failed to share/unshare hike. Please try again.');
    }
  };

  // Check if a hike is pinned
  const isHikePinned = (hikeId) => {
    const hike = hikeEntries.find(h => h.id === hikeId);
    return hike?.pinned === true;
  };

  // Handle search and filter changes
  const handleSearchChange = useCallback((newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    loadHikes(newSearchTerm, difficultyFilter);
  }, [loadHikes, difficultyFilter]);

  const handleDifficultyChange = useCallback((newDifficulty) => {
    setDifficultyFilter(newDifficulty);
    loadHikes(searchTerm, newDifficulty);
  }, [loadHikes, searchTerm]);

  // Since we're now using backend filtering, filteredHikes is just hikeEntries
  const filteredHikes = hikeEntries;

  // Show active hike interface if in active mode
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
              onClick={() => setIsStartHikeFormOpen(true)}
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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={difficultyFilter === "All" ? "default" : "outline"}
              size="sm"
              onClick={() => handleDifficultyChange("All")}
              className="min-w-[80px]"
            >
              All
            </Button>
            <Button
              variant={difficultyFilter === "Easy" ? "default" : "outline"}
              size="sm"
              onClick={() => handleDifficultyChange("Easy")}
              className="min-w-[80px]"
            >
              Easy
            </Button>
            <Button
              variant={difficultyFilter === "Moderate" ? "default" : "outline"}
              size="sm"
              onClick={() => handleDifficultyChange("Moderate")}
              className="min-w-[80px]"
            >
              Moderate
            </Button>
            <Button
              variant={difficultyFilter === "Hard" ? "default" : "outline"}
              size="sm"
              onClick={() => handleDifficultyChange("Hard")}
              className="min-w-[80px]"
            >
              Hard
            </Button>
          </div>
        </div>


        {/* Hike Entries */}
        <div className="space-y-6">
          {/* Loading State */}
          {isLoading && (
            <Card className="bg-card border-border text-center py-12">
              <CardContent>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mx-auto mb-4"></div>
                <p className="text-muted-foreground text-lg">Loading your hikes...</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
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

          {/* No Results */}
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
                <div className="flex justify-between items-center pt-2">
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
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`${isHikePinned(hike.id) 
                        ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' 
                        : 'text-muted-foreground hover:text-yellow-600 hover:bg-yellow-50'
                      }`}
                      onClick={() => handlePinHike(hike.id)}
                    >
                      {isHikePinned(hike.id) ? (
                        <PinOff className="h-4 w-4 mr-1" />
                      ) : (
                        <Pin className="h-4 w-4 mr-1" />
                      )}
                      {isHikePinned(hike.id) ? 'Unpin' : 'Pin'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`${hike.shared 
                        ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' 
                        : 'text-muted-foreground hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      onClick={() => handleShareHike(hike.id)}
                    >
                      {hike.shared ? (
                        <Share2 className="h-4 w-4 mr-1" />
                      ) : (
                        <Share className="h-4 w-4 mr-1" />
                      )}
                      {hike.shared ? 'Shared' : 'Share'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-summit hover:text-summit hover:bg-muted"
                      onClick={() => handleViewRouteMap(hike)}
                    >
                      <Map className="h-4 w-4 mr-1" />
                      Route Map
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-forest hover:text-forest hover:bg-muted"
                      onClick={() => handleEditHike(hike)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteHike(hike.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
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

        {/* Edit Hike Form */}
        <NewHikeEntryForm 
          open={isEditHikeOpen}
          onOpenChange={setIsEditHikeOpen}
          onSubmit={handleSubmitEditHike}
          initialData={editingHike}
          title="Edit Hike"
        />

        {/* Start Hike Form */}
        <Dialog open={isStartHikeFormOpen} onOpenChange={setIsStartHikeFormOpen}>
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
                  placeholder="Where are you starting from?"
                  className="border-border"
                />
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
                  Current Weather (Optional)
                </label>
                <Input
                  id="start-weather"
                  placeholder="e.g., Sunny, 22°C"
                  className="border-border"
                />
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
                      location: document.getElementById('start-location').value || 'Unknown Location',
                      date: document.getElementById('start-date').value || new Date().toISOString().split('T')[0],
                      weather: document.getElementById('start-weather').value || '',
                      notes: document.getElementById('start-notes').value || '',
                      difficulty: 'Easy'
                    };
                    handleStartActiveHike(formData);
                    setIsStartHikeFormOpen(false);
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

        {/* Route Map Modal */}
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