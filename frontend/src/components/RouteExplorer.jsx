import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { 
  MapPin, 
  Mountain, 
  Navigation, 
  Search, 
  Filter,
  Compass,
  Eye,
  Calendar,
  AlertTriangle,
  Info,
  Camera
} from "lucide-react";
import { routeExplorerService } from "../services/routeExplorerService";

const RouteExplorer = ({ isOpen, onOpenChange }) => {
  const [trails, setTrails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [elevationData, setElevationData] = useState([]);
  const [pointsOfInterest, setPointsOfInterest] = useState([]);
  
  // Filter states
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [maxDistance, setMaxDistance] = useState(50);
  const [surfaceFilter, setSurfaceFilter] = useState('all');

  // Get user location on component mount
  useEffect(() => {
    if (isOpen && !userLocation) {
      getCurrentLocation();
    }
  }, [isOpen]);

  // Auto-discover trails when location is available
  useEffect(() => {
    if (userLocation && isOpen) {
      discoverNearbyTrails();
    }
  }, [userLocation, isOpen]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to get your location. Please enable location services.');
        // Default to a generic location (e.g., somewhere in Colorado for hiking)
        setUserLocation({ lat: 39.7392, lng: -104.9903 });
      }
    );
  };

  const discoverNearbyTrails = async () => {
    if (!userLocation) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const discoveredTrails = await routeExplorerService.discoverNearbyTrails(
        userLocation.lat, 
        userLocation.lng, 
        maxDistance
      );
      
      setTrails(discoveredTrails);
      
      if (discoveredTrails.length === 0) {
        setError('No trails found in your area. Try increasing the search radius.');
      }
    } catch (err) {
      console.error('Error discovering trails:', err);
      setError(err.message || 'Failed to discover trails. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const searchTrails = async () => {
    if (!userLocation || !searchTerm.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const searchResults = await routeExplorerService.searchTrails(
        searchTerm,
        userLocation.lat,
        userLocation.lng,
        maxDistance * 2 // Wider search for named trails
      );
      
      setTrails(searchResults);
      
      if (searchResults.length === 0) {
        setError(`No trails found matching "${searchTerm}". Try a different search term.`);
      }
    } catch (err) {
      console.error('Error searching trails:', err);
      setError(err.message || 'Failed to search trails. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const viewTrailDetails = async (trail) => {
    try {
      setSelectedTrail(trail);
      setElevationData([]);
      setPointsOfInterest([]);

      // Get detailed trail information
      const detailedTrail = await routeExplorerService.getRouteDetails(trail.id);
      setSelectedTrail(detailedTrail);

      // Get elevation profile if coordinates available
      if (detailedTrail.coordinates && detailedTrail.coordinates.length > 0) {
        try {
          const elevation = await routeExplorerService.getElevationProfile(detailedTrail.coordinates);
          setElevationData(elevation);
        } catch (elevErr) {
          console.warn('Could not load elevation profile:', elevErr);
        }

        // Get points of interest
        try {
          const pois = await routeExplorerService.getRoutePointsOfInterest(detailedTrail.coordinates);
          setPointsOfInterest(pois);
        } catch (poiErr) {
          console.warn('Could not load points of interest:', poiErr);
        }
      }
    } catch (err) {
      console.error('Error loading trail details:', err);
      setError('Failed to load trail details.');
    }
  };

  const filteredTrails = trails.filter(trail => {
    if (difficultyFilter !== 'all' && trail.difficulty !== difficultyFilter) return false;
    if (surfaceFilter !== 'all' && trail.surface !== surfaceFilter) return false;
    if (trail.distance > maxDistance) return false;
    return true;
  });

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': 'bg-green-100 text-green-800 border-green-200',
      'Moderate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Hard': 'bg-red-100 text-red-800 border-red-200',
      'Extreme': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchTrails();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Compass className="h-6 w-6 text-forest" />
            Explore Routes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search for trails by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={searchTrails} disabled={!searchTerm.trim() || isLoading}>
                    Search
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={discoverNearbyTrails} 
                    disabled={!userLocation || isLoading}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Nearby
                  </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty</label>
                    <select 
                      value={difficultyFilter} 
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="w-full p-2 border border-input rounded-md bg-background"
                    >
                      <option value="all">All Levels</option>
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Hard">Hard</option>
                      <option value="Extreme">Extreme</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Distance</label>
                    <select 
                      value={maxDistance} 
                      onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                      className="w-full p-2 border border-input rounded-md bg-background"
                    >
                      <option value={10}>10 km</option>
                      <option value={25}>25 km</option>
                      <option value={50}>50 km</option>
                      <option value={100}>100 km</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Surface</label>
                    <select 
                      value={surfaceFilter} 
                      onChange={(e) => setSurfaceFilter(e.target.value)}
                      className="w-full p-2 border border-input rounded-md bg-background"
                    >
                      <option value="all">All Surfaces</option>
                      <option value="paved">Paved</option>
                      <option value="unpaved">Unpaved</option>
                      <option value="ground">Ground</option>
                      <option value="gravel">Gravel</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setDifficultyFilter('all');
                        setMaxDistance(50);
                        setSurfaceFilter('all');
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Trail List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {isLoading ? 'Discovering trails...' : `Found ${filteredTrails.length} trails`}
                </h3>
                {filteredTrails.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    Click any trail for details
                  </span>
                )}
              </div>

              {error && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-4 flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </CardContent>
                </Card>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
                </div>
              )}

                              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {filteredTrails.map((trail) => (
                  <Card 
                    key={`${trail.id}-${trail.type}`} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => viewTrailDetails(trail)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{trail.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mountain className="h-3 w-3" />
                              {trail.distance} km
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {trail.surface}
                            </span>
                          </div>
                        </div>
                        <Badge className={getDifficultyColor(trail.difficulty)}>
                          {trail.difficulty}
                        </Badge>
                      </div>
                      {trail.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {trail.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {!isLoading && !error && filteredTrails.length === 0 && trails.length > 0 && (
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        No trails match your current filters. Try adjusting them above.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {!isLoading && !error && trails.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <Compass className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground mb-3">
                        No trails discovered yet. Try searching for trails in your area.
                      </p>
                      <Button 
                        onClick={discoverNearbyTrails} 
                        disabled={!userLocation}
                        variant="outline"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Discover Nearby Trails
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Trail Details */}
            <div className="space-y-4">
              {selectedTrail ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl">{selectedTrail.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Source: {selectedTrail.source}
                          </p>
                        </div>
                        <Badge className={getDifficultyColor(selectedTrail.difficulty)}>
                          {selectedTrail.difficulty}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedTrail.description && (
                        <p className="text-sm">{selectedTrail.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mountain className="h-4 w-4 text-forest" />
                          <span>Distance: {selectedTrail.distance} km</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-trail" />
                          <span>Surface: {selectedTrail.surface}</span>
                        </div>
                      </div>

                      {/* Elevation Profile */}
                      {elevationData.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <Mountain className="h-4 w-4" />
                            Elevation Profile
                          </h4>
                          <div className="h-32 bg-muted/50 rounded-lg p-4 relative overflow-hidden">
                            <svg className="w-full h-full" viewBox="0 0 400 100">
                              <polyline
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-forest"
                                points={elevationData.map((point, index) => {
                                  const x = (index / (elevationData.length - 1)) * 400;
                                  const minElevation = Math.min(...elevationData.map(p => p.elevation));
                                  const maxElevation = Math.max(...elevationData.map(p => p.elevation));
                                  const elevationRange = maxElevation - minElevation || 1;
                                  const y = 100 - ((point.elevation - minElevation) / elevationRange * 80 + 10);
                                  return `${x},${y}`;
                                }).join(' ')}
                              />
                            </svg>
                            <div className="absolute bottom-1 left-2 text-xs text-muted-foreground">
                              {Math.min(...elevationData.map(p => p.elevation))}m
                            </div>
                            <div className="absolute top-1 right-2 text-xs text-muted-foreground">
                              {Math.max(...elevationData.map(p => p.elevation))}m
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Points of Interest */}
                      {pointsOfInterest.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Points of Interest ({pointsOfInterest.length})
                          </h4>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {pointsOfInterest.slice(0, 5).map((poi, index) => (
                              <div key={poi.id || index} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded">
                                <div className="w-2 h-2 bg-summit rounded-full flex-shrink-0"></div>
                                <span className="flex-1">{poi.name}</span>
                                <span className="text-xs text-muted-foreground">{poi.type}</span>
                              </div>
                            ))}
                            {pointsOfInterest.length > 5 && (
                              <div className="text-xs text-muted-foreground text-center py-1">
                                +{pointsOfInterest.length - 5} more points of interest
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4">
                        <Button 
                          onClick={() => {
                            // Create a planned hike from this trail
                            onOpenChange(false);
                            // You could emit an event or call a callback here to pre-fill the new hike form
                          }}
                          className="flex-1"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Plan This Hike
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            // Open in external map application
                            if (selectedTrail.coordinates && selectedTrail.coordinates.length > 0) {
                              const [lng, lat] = selectedTrail.coordinates[0];
                              const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                              window.open(url, '_blank');
                            }
                          }}
                          disabled={!selectedTrail.coordinates || selectedTrail.coordinates.length === 0}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          View on Map
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Select a Trail</h3>
                    <p className="text-muted-foreground">
                      Click on any trail from the list to view detailed information, elevation profile, and points of interest.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Trail Data Sources</p>
                  <p>
                    Routes are discovered from OpenStreetMap, a collaborative mapping project. 
                    Trail conditions, accessibility, and safety can change frequently. Always check 
                    local conditions, weather, and regulations before hiking. Elevation data from Open-Elevation API.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RouteExplorer;