import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { MapPin, Clock, Mountain, Navigation, Eye, EyeOff } from "lucide-react";

const RouteMapModal = ({ isOpen, onClose, hikeData }) => {
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);

  // Calculate route statistics
  const routeStats = {
    totalDistance: hikeData?.distance || 0,
    totalWaypoints: hikeData?.waypoints?.length || 0,
    duration: hikeData?.duration || 0,
    elevation: hikeData?.elevation || 0
  };

  // Generate mock map visualization (since we don't have external map API yet)
  const renderMapVisualization = () => {
    if (!hikeData?.waypoints || hikeData.waypoints.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg border-2 border-dashed border-border">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No GPS Data</h3>
          <p className="text-muted-foreground text-center">
            This hike doesn't have any recorded waypoints or GPS tracking data.
          </p>
        </div>
      );
    }

    // Simple visualization of waypoints as connected dots
    const waypoints = hikeData.waypoints;
    const startPoint = waypoints[0];
    const endPoint = waypoints[waypoints.length - 1];

    return (
      <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-border p-4 h-64">
        {/* Mock map background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg opacity-30"></div>
        
        {/* Waypoints visualization */}
        <div className="relative z-10 h-full">
          <div className="flex items-center justify-between h-full px-4">
            {/* Start point */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-green-600 rounded-full border-2 border-white shadow-lg mb-2"></div>
              <Badge variant="secondary" className="text-xs">Start</Badge>
            </div>

            {/* Route line with intermediate waypoints */}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                {waypoints.slice(1, -1).map((waypoint, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {index < waypoints.slice(1, -1).length - 1 && (
                      <div className="w-8 h-0.5 bg-blue-300"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* End point */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg mb-2"></div>
              <Badge variant="secondary" className="text-xs">End</Badge>
            </div>
          </div>

          {/* Route info overlay */}
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-1 mb-1">
                <Navigation className="h-3 w-3" />
                <span>{routeStats.totalWaypoints} waypoints</span>
              </div>
              <div className="flex items-center gap-1">
                <Mountain className="h-3 w-3" />
                <span>{routeStats.totalDistance} mi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWaypointsList = () => {
    if (!hikeData?.waypoints || hikeData.waypoints.length === 0) {
      return null;
    }

    return (
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {hikeData.waypoints.map((waypoint, index) => (
          <Card 
            key={index} 
            className={`cursor-pointer transition-colors ${
              selectedWaypoint === index ? 'bg-muted border-border' : 'hover:bg-muted/50'
            }`}
            onClick={() => setSelectedWaypoint(selectedWaypoint === index ? null : index)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-green-600' : 
                    index === hikeData.waypoints.length - 1 ? 'bg-red-600' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-sm">
                      {index === 0 ? 'Start Point' : 
                       index === hikeData.waypoints.length - 1 ? 'End Point' : 
                       `Waypoint ${index}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {waypoint.timestamp ? new Date(waypoint.timestamp).toLocaleTimeString() : 'Unknown time'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    {waypoint.latitude?.toFixed(6)}, {waypoint.longitude?.toFixed(6)}
                  </div>
                  {waypoint.altitude && (
                    <div className="text-xs text-muted-foreground">
                      {Math.round(waypoint.altitude * 3.28084)} ft
                    </div>
                  )}
                </div>
              </div>
              
              {selectedWaypoint === index && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium">Latitude:</span> {waypoint.latitude?.toFixed(6)}
                    </div>
                    <div>
                      <span className="font-medium">Longitude:</span> {waypoint.longitude?.toFixed(6)}
                    </div>
                    {waypoint.altitude && (
                      <div>
                        <span className="font-medium">Elevation:</span> {Math.round(waypoint.altitude * 3.28084)} ft
                      </div>
                    )}
                    {waypoint.distance && (
                      <div>
                        <span className="font-medium">Distance:</span> {waypoint.distance.toFixed(1)} mi
                      </div>
                    )}
                  </div>
                  {waypoint.notes && (
                    <div className="mt-2">
                      <span className="font-medium text-xs">Notes:</span>
                      <p className="text-xs text-muted-foreground mt-1">{waypoint.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] sm:max-h-[700px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-summit" />
            {hikeData?.title} - Route Map
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Route Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-card text-center border-border">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-forest">{routeStats.totalWaypoints}</div>
                <div className="text-sm text-muted-foreground">Waypoints</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card text-center border-border">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-trail">{routeStats.totalDistance}</div>
                <div className="text-sm text-muted-foreground">Miles</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card text-center border-border">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-summit">{routeStats.elevation}</div>
                <div className="text-sm text-muted-foreground">Elevation (ft)</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card text-center border-border">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-forest">{routeStats.duration}</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </CardContent>
            </Card>
          </div>

          {/* Map Visualization */}
          {renderMapVisualization()}

          {/* Waypoints List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                GPS Waypoints
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWaypoints(!showWaypoints)}
                className="flex items-center gap-2"
              >
                {showWaypoints ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showWaypoints ? 'Hide' : 'Show'} Details
              </Button>
            </div>
            
            {showWaypoints && renderWaypointsList()}
          </div>

          {/* Additional Info */}
          {hikeData?.notes && (
            <Card className="bg-gradient-subtle border-border">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-2">Hike Notes</h3>
                <p className="text-muted-foreground">{hikeData.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RouteMapModal;

