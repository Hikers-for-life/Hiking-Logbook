// src/components/RouteExplorer.jsx (Updated with Difficulty Filter)

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
  MapPin,
  Mountain,
  Navigation,
  Compass,
  Calendar,
  AlertTriangle,
  Info,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  Globe,
} from 'lucide-react';
import { routeExplorerService } from '../services/routeExplorerService';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
if (typeof window !== 'undefined' && L?.Icon?.Default?.prototype) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Custom trail icon
const trailIcon = typeof window !== 'undefined' && L?.Icon
  ? new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })
  : {};

const RouteExplorer = ({ isOpen, onOpenChange, onPlanHike }) => {
  const [trails, setTrails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // NEW: State for difficulty filter. Default is 'All'.
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  const getCurrentLocation = useCallback(() => {
    setError(null);
    setIsLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoading(false);
        },
        (err) => {
          console.error('Error getting user location:', err);
          setError(
            'Could not get your location. Please enable location services and try again.'
          );
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setIsLoading(false);
    }
  }, []);

  const discoverNearbyTrails = useCallback(async () => {
    if (!userLocation) {
      setError('Your location is not available. Please allow location access.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      setSelectedTrail(null);

      // MODIFIED: Search radius is now fixed to a large 100km.
      const discoveredTrails = await routeExplorerService.discoverNearbyTrails(
        userLocation.lat,
        userLocation.lng,
        100 // Fixed 100km radius
      );

      setTrails(discoveredTrails);
      if (discoveredTrails.length === 0) {
        setError(
          'No trails found within 100km. This is unusual, please try again.'
        );
      }
    } catch (err) {
      console.error('Error discovering trails:', err);
      setError(err.message || 'Failed to discover trails.');
    } finally {
      setIsLoading(false);
    }
  }, [userLocation]);

  // NEW: Function to discover nationwide hikes

  const showNationwideHikes = async () => {
    setError(null);
    setSelectedTrail(null);
    setTrails([]); // Clear previous results
    setIsLoading(true);
    try {
      const nationwideTrails =
        await routeExplorerService.discoverNationwideHikes();
      setTrails(nationwideTrails);
      if (nationwideTrails.length === 0) {
        setError('Could not find any notable nationwide trails at the moment.');
      }
    } catch (err) {
      console.error('Error discovering nationwide trails:', err);
      setError(err.message || 'Failed to discover nationwide trails.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !userLocation) {
      getCurrentLocation();
    }
  }, [isOpen, userLocation, getCurrentLocation]);

  const viewTrailDetails = async (trail) => {
    setSelectedTrail(trail); // Immediately show basic info
    setIsEnriching(true);

    try {
      // Always try to enrich the trail, whether it's from a nearby or nationwide search
      const enrichedTrail =
        await routeExplorerService.enrichTrailWithElevation(trail);
      setSelectedTrail(enrichedTrail);
    } catch (err) {
      console.error('Failed to enrich trail details:', err);
      // Keep basic info displayed even if enrichment fails
    } finally {
      setIsEnriching(false);
    }
  };

  // MODIFIED: Apply the difficulty filter to the trails list.
  const filteredTrails = trails.filter((trail) => {
    if (difficultyFilter === 'All') {
      return true; // Show all trails
    }
    return trail.difficulty === difficultyFilter;
  });

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'Easy') return 'bg-green-500';
    if (difficulty === 'Moderate') return 'bg-yellow-500';
    if (difficulty === 'Hard') return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-7xl h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Compass className="h-6 w-6 text-forest" />
            Explore Trails
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Search and Filters section */}
          <Card className="mb-4">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Button
                  onClick={discoverNearbyTrails}
                  disabled={!userLocation || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4 mr-2" />
                  )}
                  Find Nearby
                </Button>
                <Button
                  onClick={showNationwideHikes}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4 mr-2" />
                  )}
                  Find Nationwide
                </Button>
              </div>
              {/* Difficulty filter buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
                <Button
                  variant={difficultyFilter === 'All' ? 'default' : 'outline'}
                  onClick={() => setDifficultyFilter('All')}
                >
                  All
                </Button>
                <Button
                  variant={difficultyFilter === 'Easy' ? 'default' : 'outline'}
                  onClick={() => setDifficultyFilter('Easy')}
                >
                  Easy
                </Button>
                <Button
                  variant={
                    difficultyFilter === 'Moderate' ? 'default' : 'outline'
                  }
                  onClick={() => setDifficultyFilter('Moderate')}
                >
                  Moderate
                </Button>
                <Button
                  variant={difficultyFilter === 'Hard' ? 'default' : 'outline'}
                  onClick={() => setDifficultyFilter('Hard')}
                >
                  Hard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results - Now with better layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
            {/* Trail List */}
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-semibold mb-4">Available Trails</h3>
              <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                {/* Error and Loading states */}
                {isLoading && trails.length === 0 && (
                  <p className="text-muted-foreground">
                    Searching for trails...
                  </p>
                )}
                {error && <p className="text-red-500">{error}</p>}
                {!isLoading &&
                  filteredTrails.length === 0 &&
                  trails.length > 0 && (
                    <p className="text-muted-foreground">
                      No trails match the selected difficulty. Try another
                      filter.
                    </p>
                  )}

                {filteredTrails.map((trail) => (
                  <Card
                    key={trail.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => viewTrailDetails(trail)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold mb-2 pr-2">
                          {trail.name}
                        </h4>
                        <Badge className={getDifficultyColor(trail.difficulty)}>
                          {trail.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground gap-4">
                        <span className="flex items-center gap-1">
                          <Mountain className="h-4 w-4" />
                          {trail.distance} km
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {trail.ascent === null ? 'N/A' : `${trail.ascent} m`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Trail Details and Map */}
            <div className="flex flex-col h-full">
              {selectedTrail ? (
                <div className="flex flex-col h-full space-y-4">
                  {/* Trail Details Card */}
                  <Card className="flex-shrink-0">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <h3 className="text-xl">{selectedTrail.name}</h3>
                        <Badge
                          className={getDifficultyColor(selectedTrail.difficulty)}
                        >
                          {selectedTrail.difficulty}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{selectedTrail.description}</p>

                      {isEnriching ? (
                        <div className="flex justify-center items-center h-24">
                          <RefreshCw className="h-6 w-6 animate-spin text-forest" />
                          <p className="ml-2 text-muted-foreground">
                            Calculating elevation...
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Mountain className="h-4 w-4 text-forest" />
                            <span>Distance: {selectedTrail.distance} km</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>
                              Duration: {selectedTrail.duration || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span>
                              Ascent:{' '}
                              {selectedTrail.ascent === null
                                ? 'N/A'
                                : `${selectedTrail.ascent} m`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            <span>
                              Descent:{' '}
                              {selectedTrail.descent === null
                                ? 'N/A'
                                : `${selectedTrail.descent} m`}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button 
                          className="flex-1" 
                          disabled={isEnriching}
                          onClick={() => {
                            if (onPlanHike && selectedTrail) {
                              onPlanHike(selectedTrail);
                              onOpenChange(false); // Close the trail explorer
                            }
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-2" /> Plan This Hike
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (
                              selectedTrail.coordinates &&
                              selectedTrail.coordinates.length > 0
                            ) {
                              setShowMap(!showMap);
                            }
                          }}
                          disabled={
                            !selectedTrail.coordinates ||
                            selectedTrail.coordinates.length === 0
                          }
                        >
                          <MapPin className="h-4 w-4 mr-2" /> {showMap ? 'Hide Map' : 'View Trail'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Integrated Map View */}
                  {showMap && selectedTrail.coordinates && selectedTrail.coordinates.length > 0 && (
                    <Card className="flex-1 min-h-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-forest" />
                          Trail Location
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 h-full">
                        <div className="h-80 w-full rounded-lg overflow-hidden">
                          <MapContainer
                            center={[selectedTrail.coordinates[0][1], selectedTrail.coordinates[0][0]]}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker
                              position={[selectedTrail.coordinates[0][1], selectedTrail.coordinates[0][0]]}
                              icon={trailIcon}
                            >
                              <Popup>
                                <div className="p-2">
                                  <h4 className="font-semibold text-sm mb-2">{selectedTrail.name}</h4>
                                  <div className="space-y-1 text-xs">
                                    <div>
                                      <strong>Difficulty:</strong> {selectedTrail.difficulty}
                                    </div>
                                    <div>
                                      <strong>Distance:</strong> {selectedTrail.distance} km
                                    </div>
                                    <div>
                                      <strong>Lat:</strong> {selectedTrail.coordinates[0][1].toFixed(6)}
                                    </div>
                                    <div>
                                      <strong>Lng:</strong> {selectedTrail.coordinates[0][0].toFixed(6)}
                                    </div>
                                    {selectedTrail.ascent && (
                                      <div>
                                        <strong>Ascent:</strong> {selectedTrail.ascent} m
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Popup>
                            </Marker>
                          </MapContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="border-dashed flex items-center justify-center h-full">
                  <CardContent className="p-8 text-center">
                    <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Select a Trail</h3>
                    <p className="text-muted-foreground">
                      Click a trail to see its full details and location on the map.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RouteExplorer;
