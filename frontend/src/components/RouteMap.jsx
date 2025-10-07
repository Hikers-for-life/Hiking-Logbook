import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet (only in browser environment)
if (typeof window !== 'undefined' && L?.Icon?.Default?.prototype) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Custom icons for start and end points (only in browser environment)
const startIcon = typeof window !== 'undefined' && L?.Icon ? new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}) : {};

const endIcon = typeof window !== 'undefined' && L?.Icon ? new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}) : {};

const waypointIcon = typeof window !== 'undefined' && L?.Icon ? new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -34],
  shadowSize: [32, 32]
}) : {};

const RouteMap = ({ waypoints }) => {
  const mapRef = useRef();

  // Calculate center point and bounds for the map
  const getMapCenter = () => {
    if (!waypoints || waypoints.length === 0) {
      return [39.8283, -98.5795]; // Default to center of US
    }
    
    const lat = waypoints.reduce((sum, wp) => sum + wp.latitude, 0) / waypoints.length;
    const lng = waypoints.reduce((sum, wp) => sum + wp.longitude, 0) / waypoints.length;
    return [lat, lng];
  };

  const getMapBounds = () => {
    if (!waypoints || waypoints.length < 2) return null;
    
    const lats = waypoints.map(wp => wp.latitude);
    const lngs = waypoints.map(wp => wp.longitude);
    
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    ];
  };

  // Auto-fit map to route when waypoints change
  useEffect(() => {
    if (mapRef.current && waypoints && waypoints.length > 1) {
      const bounds = getMapBounds();
      if (bounds) {
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [waypoints]);

  if (!waypoints || waypoints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg border-2 border-dashed border-border">
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No GPS Data</h3>
        <p className="text-muted-foreground text-center">
          This hike doesn't have any recorded waypoints or GPS tracking data.
        </p>
      </div>
    );
  }

  // Prepare route line data
  const routeCoordinates = waypoints.map(wp => [wp.latitude, wp.longitude]);

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={getMapCenter()}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Route line */}
        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: '#10b981',
            weight: 4,
            opacity: 0.8
          }}
        />
        
        {/* Waypoints */}
        {waypoints.map((waypoint, index) => {
          const isStart = index === 0;
          const isEnd = index === waypoints.length - 1;
          
          let icon = waypointIcon;
          let label = `Waypoint ${index + 1}`;
          
          if (isStart) {
            icon = startIcon;
            label = 'Start';
          } else if (isEnd) {
            icon = endIcon;
            label = 'End';
          }

          return (
            <Marker
              key={index}
              position={[waypoint.latitude, waypoint.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold text-sm mb-2">{label}</h4>
                  <div className="space-y-1 text-xs">
                    <div><strong>Lat:</strong> {waypoint.latitude?.toFixed(6)}</div>
                    <div><strong>Lng:</strong> {waypoint.longitude?.toFixed(6)}</div>
                    {waypoint.altitude && (
                      <div><strong>Elevation:</strong> {Math.round(waypoint.altitude * 3.28084)} ft</div>
                    )}
                    {waypoint.distance && (
                      <div><strong>Distance:</strong> {waypoint.distance.toFixed(1)} km</div>
                    )}
                    {waypoint.notes && (
                      <div className="mt-2"><strong>Notes:</strong> {waypoint.notes}</div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default RouteMap;
