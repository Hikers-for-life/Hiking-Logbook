import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Navigation } from '../components/ui/navigation';
import {
  MapPin,
  Mountain,
  Navigation as NavIcon,
  Compass,
  Calendar,
  Info,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  Globe,
  Search,
  ArrowLeft,
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

const TrailExplorer = () => {
  const navigate = useNavigate();
  const [trails, setTrails] = useState([]);
  const [filteredTrails, setFilteredTrails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  const getCurrentLocation = useCallback(() => {
    setError(null);
    setIsLoading(true);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to retrieve your location. Please try again.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  const discoverNearbyTrails = async () => {
    if (!userLocation) {
      setError('Please enable location access to find nearby trails.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const nearbyTrails = await routeExplorerService.discoverNearbyTrails(
        userLocation.latitude,
        userLocation.longitude
      );
      setTrails(nearbyTrails);
      setFilteredTrails(nearbyTrails);
    } catch (err) {
      console.error('Failed to discover nearby trails:', err);
      setError('Failed to discover nearby trails. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showNationwideHikes = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const nationwideTrails = await routeExplorerService.discoverNationwideHikes();
      setTrails(nationwideTrails);
      setFilteredTrails(nationwideTrails);
    } catch (err) {
      console.error('Failed to discover nationwide hikes:', err);
      setError('Failed to discover nationwide hikes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const viewTrailDetails = async (trail) => {
    setSelectedTrail(trail);
    setIsEnriching(true);

    try {
      const enrichedTrail = await routeExplorerService.enrichTrailWithElevation(trail);
      setSelectedTrail(enrichedTrail);
    } catch (err) {
      console.error('Failed to enrich trail details:', err);
    } finally {
      setIsEnriching(false);
    }
  };

  const handlePlanHike = (trail) => {
    // Navigate to hike planner with pre-filled trail data
    const trailData = {
      trailName: trail.name,
      description: trail.description || '',
      distance: trail.distance ? trail.distance.replace(' km', '').replace(' km away', '') : '',
      difficulty: trail.difficulty || 'Moderate',
      location: trail.region || '',
      // Add more trail-specific data
      elevation: trail.elevation || '',
      duration: trail.duration || '',
      surface: trail.surface || '',
    };
    
    console.log('Planning hike with trail data:', trailData);
    
    // Store trail data in sessionStorage for the hike planner to pick up
    sessionStorage.setItem('selectedTrail', JSON.stringify(trailData));
    navigate('/hike-planner');
  };

  // Filter trails based on search query and difficulty
  useEffect(() => {
    let filtered = trails;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(trail =>
        trail.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trail.description && trail.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (trail.region && trail.region.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by difficulty
    if (difficultyFilter !== 'All') {
      filtered = filtered.filter(trail => trail.difficulty === difficultyFilter);
    }

    setFilteredTrails(filtered);
  }, [trails, searchQuery, difficultyFilter]);

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Auto-load nearby trails when location is available
  useEffect(() => {
    if (userLocation && trails.length === 0) {
      console.log('Location available, auto-loading nearby trails...');
      discoverNearbyTrails();
    }
  }, [userLocation, trails.length]);

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'Easy') return 'bg-green-500';
    if (difficulty === 'Moderate') return 'bg-yellow-500';
    if (difficulty === 'Hard') return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Compass className="h-8 w-8 text-forest" />
              Explore Trails
            </h1>
          </div>
          <p className="text-muted-foreground">
            Discover hiking trails near you or explore nationwide options
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trails by name, description, or region..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={discoverNearbyTrails}
                  disabled={!userLocation || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <NavIcon className="h-4 w-4 mr-2" />
                  )}
                  Find Nearby Trails
                </Button>
                <Button
                  onClick={showNationwideHikes}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4 mr-2" />
                  )}
                  Browse All Trails
                </Button>
              </div>

              {/* Difficulty Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">Filter by difficulty:</span>
                {['All', 'Easy', 'Moderate', 'Hard'].map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={difficultyFilter === difficulty ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDifficultyFilter(difficulty)}
                  >
                    {difficulty}
                  </Button>
                ))}
              </div>

              {/* Results Count */}
              {trails.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Showing {filteredTrails.length} of {trails.length} trails
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600">
                <Info className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trail List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Available Trails</h2>
            
            {isLoading && trails.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-forest" />
                  <p className="text-muted-foreground">
                    {userLocation ? 'Finding nearby trails...' : 'Getting your location...'}
                  </p>
                </CardContent>
              </Card>
            )}

            {!isLoading && trails.length === 0 && !userLocation && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Compass className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No Trails Found</h3>
                  <p className="text-muted-foreground">
                    Click "Find Nearby Trails" or "Browse All Trails" to discover hiking options.
                  </p>
                </CardContent>
              </Card>
            )}

            {!isLoading && trails.length === 0 && userLocation && (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No Trails Found Nearby</h3>
                  <p className="text-muted-foreground">
                    No trails found within 50km. Try "Browse All Trails" to see all available options.
                  </p>
                </CardContent>
              </Card>
            )}

            {!isLoading && trails.length > 0 && filteredTrails.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No Matching Trails</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or difficulty filter.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredTrails.map((trail) => (
                <Card
                  key={trail.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedTrail?.id === trail.id ? 'ring-2 ring-forest' : ''
                  }`}
                  onClick={() => viewTrailDetails(trail)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg pr-2">{trail.name}</h3>
                      <Badge className={getDifficultyColor(trail.difficulty)}>
                        {trail.difficulty}
                      </Badge>
                    </div>
                    
                    {trail.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {trail.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mountain className="h-4 w-4" />
                        {trail.distance} km
                      </span>
                      {trail.region && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {trail.region}
                        </span>
                      )}
                      {trail.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {trail.duration}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Trail Details and Map */}
          <div className="space-y-6">
            {selectedTrail ? (
              <>
                {/* Trail Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span className="text-xl">{selectedTrail.name}</span>
                      <Badge className={getDifficultyColor(selectedTrail.difficulty)}>
                        {selectedTrail.difficulty}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedTrail.description && (
                      <p className="text-sm">{selectedTrail.description}</p>
                    )}

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
                          <span>Duration: {selectedTrail.duration || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span>
                            Ascent: {selectedTrail.ascent === null ? 'N/A' : `${selectedTrail.ascent} m`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span>
                            Descent: {selectedTrail.descent === null ? 'N/A' : `${selectedTrail.descent} m`}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button 
                        className="flex-1" 
                        disabled={isEnriching}
                        onClick={() => handlePlanHike(selectedTrail)}
                      >
                        <Calendar className="h-4 w-4 mr-2" /> Plan This Hike
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowMap(!showMap)}
                        disabled={!selectedTrail.coordinates || selectedTrail.coordinates.length === 0}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {showMap ? 'Hide Map' : 'View Trail'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Map View */}
                {showMap && selectedTrail.coordinates && selectedTrail.coordinates.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-forest" />
                        Trail Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-96 w-full rounded-lg overflow-hidden">
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
                                  <div><strong>Difficulty:</strong> {selectedTrail.difficulty}</div>
                                  <div><strong>Distance:</strong> {selectedTrail.distance} km</div>
                                  <div><strong>Lat:</strong> {selectedTrail.coordinates[0][1].toFixed(6)}</div>
                                  <div><strong>Lng:</strong> {selectedTrail.coordinates[0][0].toFixed(6)}</div>
                                  {selectedTrail.ascent && (
                                    <div><strong>Ascent:</strong> {selectedTrail.ascent} m</div>
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
              </>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Select a Trail</h3>
                  <p className="text-muted-foreground">
                    Click on a trail from the list to see its details and location.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrailExplorer;
