# External API Usage Documentation - GPS/Geolocation & Map Visualization APIs

## Overview
This document details the external API usage implemented in the Hiking Logbook application to meet the sprint requirements for external API integration.

---
## API 1: Web Geolocation API

### **What is it?**
The **Web Geolocation API** is a browser-provided JavaScript API that allows web applications to access the user's geographical location information through GPS, Wi-Fi, cellular towers, or IP address.

### **Why We Used It**
The Geolocation API is essential for our hiking application because:

1. **Core Functionality Requirement**: Real-time hike tracking requires knowing the user's current location
2. **GPS Waypoint Creation**: Users need to mark specific geographic coordinates during their hikes
3. **Elevation Tracking**: GPS altitude data helps track elevation changes during hikes
4. **Route Recording**: Continuous location tracking enables route mapping and distance calculation
5. **Safety Features**: Location data can be used for emergency situations or sharing location with friends

### **Brief Alignment**
The brief specifically mentioned:
- "Keep notes on location, weather, elevation, and route"
- "GPS waypoints" as part of logbook data
- Real-time tracking during hikes

The Geolocation API directly enables these features by providing accurate location data.

---

## Implementation Details

### **API Integration Location**
**File:** `frontend/src/components/ActiveHike.jsx`  
**Lines:** 52-84 (GPS tracking setup), 174-188 (waypoint creation)

### **API Methods Used**

#### **1. `navigator.geolocation.watchPosition()`**
```javascript
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
```

**Purpose**: Continuously tracks user's location during active hikes
**Returns**: Position object with coordinates (latitude, longitude, altitude)

#### **2. `navigator.geolocation.clearWatch()`**
```javascript
navigator.geolocation.clearWatch(watchId);
```

**Purpose**: Stops GPS tracking when hike is paused/completed to save battery

### **Configuration Options Used**

| Option | Value | Purpose |
|--------|--------|---------|
| `enableHighAccuracy` | `true` | Use GPS for most accurate positioning |
| `timeout` | `5000` | Maximum time (5 seconds) to wait for position |
| `maximumAge` | `0` | Always get fresh position data, no caching |

---

## Data Retrieved from API

### **Position Object Structure**
```javascript
{
  coords: {
    latitude: 40.3428,        // Decimal degrees
    longitude: -105.6836,     // Decimal degrees  
    altitude: 2100,           // Meters above sea level
    accuracy: 10,             // Accuracy in meters
    altitudeAccuracy: 15,     // Altitude accuracy in meters
    heading: 45,              // Direction of travel (degrees)
    speed: 1.2               // Speed in meters/second
  },
  timestamp: 1705312200000    // Unix timestamp
}
```

### **How We Use the Data**

#### **Real-time Tracking**
- **Latitude/Longitude**: Display current GPS coordinates
- **Altitude**: Convert to feet and track elevation changes
- **Timestamp**: Record when position was captured

#### **Waypoint Creation**
```javascript
const waypoint = {
  id: Date.now(),
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
  altitude: position.coords.altitude,
  timestamp: new Date(),
  distance: currentDistance,
  notes: ""
};
```

#### **Accomplishment Tracking**
- Location data attached to user accomplishments
- GPS coordinates saved with each milestone

---

## User Experience Flow

### **1. Permission Request**
When user clicks "Start Hike":
```
Browser → "Allow location access?" → User grants permission
```

### **2. GPS Status Indicator**
```javascript
<Badge variant={currentLocation ? "default" : "destructive"}>
  {currentLocation ? "Tracking" : "No Signal"}
</Badge>
```

### **3. Continuous Tracking**
- Updates every few seconds while hike is active
- Shows real-time elevation changes
- Enables waypoint marking at any time

### **4. Data Persistence**
- All GPS data saved with completed hike
- Waypoints include precise coordinates
- Can be used later for route mapping

---

## Error Handling

### **Common GPS Errors**
```javascript
(error) => {
  console.error("Geolocation error:", error);
}
```

**Error Types:**
- `PERMISSION_DENIED`: User denied location access
- `POSITION_UNAVAILABLE`: GPS signal not available
- `TIMEOUT`: Location request timed out

### **Fallback Behavior**
- App continues to function without GPS
- Users can manually enter location names
- Distance can be updated manually
- Elevation tracking disabled gracefully

---

## Privacy and Security

### **User Consent**
- Browser automatically requests permission
- Users must explicitly allow location access
- Permission can be revoked at any time

### **Data Usage**
- Location data only used during active hikes
- GPS tracking stops when hike is completed/paused
- No location data transmitted without user action

### **Local Storage**
- GPS coordinates stored locally during hike
- Only sent to backend when user completes hike
- User controls when data is shared

---

## Technical Benefits

### **Accuracy**
- `enableHighAccuracy: true` uses GPS satellites for precise positioning
- Typical accuracy: 3-5 meters in open areas
- Altitude accuracy: 10-15 meters

### **Performance**
- Efficient battery usage with `clearWatch()` when not needed
- `timeout` prevents app from hanging on slow GPS
- `maximumAge: 0` ensures fresh data for accurate tracking

### **Real-time Updates**
- `watchPosition()` provides continuous location updates
- Enables live elevation tracking
- Supports dynamic waypoint creation

---

## API 2: Map Visualization APIs

### **What are they?**
The map visualization system uses three complementary technologies to display interactive hiking routes:

1. **Leaflet** - Lightweight JavaScript library for interactive maps
2. **React-Leaflet** - React components that wrap Leaflet functionality  
3. **OpenStreetMap** - Free, open-source map tile service

### **Why We Used Them**
The map visualization APIs were added to enhance the hiking experience because:

1. **Route Visualization Requirement**: Users need to see their hiking path on a real map
2. **Interactive Experience**: Clickable markers and route lines improve user engagement
3. **Cost-Effective Solution**: OpenStreetMap provides free map tiles without API key requirements
4. **Mobile-Friendly**: Leaflet is optimized for touch interactions on mobile devices
5. **Real-Time Display**: Shows GPS waypoints and route tracing as users hike

### **Brief Alignment**
The brief specifically mentioned:
- "Route map" functionality
- GPS waypoint visualization
- Interactive hiking experience

The map APIs directly enable these features by providing visual representation of hiking data.

---

### **Implementation Details**

#### **API Integration Location**
**File:** `frontend/src/components/RouteMap.jsx`  
**Lines:** 1-150 (map component implementation)

#### **Leaflet Integration**
```javascript
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons for start/end points
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
```

#### **OpenStreetMap Tile Integration**
```javascript
<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
```

### **Map Features Implemented**

#### **1. Route Line Visualization**
```javascript
<Polyline
  positions={routeCoordinates}
  pathOptions={{
    color: '#10b981',
    weight: 4,
    opacity: 0.8
  }}
/>
```
**Purpose**: Draws a green line connecting all GPS waypoints to show the hiking route

#### **2. Custom Markers**
- **Start Marker**: Green marker at the first waypoint
- **End Marker**: Red marker at the final waypoint  
- **Waypoint Markers**: Blue markers for intermediate points
- **Interactive Popups**: Click markers to see coordinates, distance, elevation

#### **3. Auto-Fit Map Bounds**
```javascript
useEffect(() => {
  if (mapRef.current && waypoints && waypoints.length > 1) {
    const bounds = getMapBounds();
    if (bounds) {
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }
}, [waypoints]);
```
**Purpose**: Automatically zooms map to show the entire hiking route

### **Data Integration with GPS API**

#### **Waypoint Processing**
```javascript
const routeCoordinates = waypoints.map(wp => [wp.latitude, wp.longitude]);

{waypoints.map((waypoint, index) => (
  <Marker
    key={index}
    position={[waypoint.latitude, waypoint.longitude]}
    icon={index === 0 ? startIcon : index === waypoints.length - 1 ? endIcon : waypointIcon}
  >
    <Popup>
      <div>
        <h4>{index === 0 ? 'Start' : index === waypoints.length - 1 ? 'End' : `Waypoint ${index + 1}`}</h4>
        <div><strong>Lat:</strong> {waypoint.latitude?.toFixed(6)}</div>
        <div><strong>Lng:</strong> {waypoint.longitude?.toFixed(6)}</div>
        {waypoint.altitude && (
          <div><strong>Elevation:</strong> {Math.round(waypoint.altitude * 3.28084)} ft</div>
        )}
        {waypoint.distance && (
          <div><strong>Distance:</strong> {waypoint.distance.toFixed(1)} km</div>
        )}
      </div>
    </Popup>
  </Marker>
))}
```

### **User Experience Flow**

#### **1. Map Display**
- Route map modal opens when user clicks "View Route" on completed hikes
- Map automatically loads with OpenStreetMap tiles
- Route line and markers render based on GPS waypoint data

#### **2. Interactive Features**
- **Zoom/Pan**: Users can explore different areas of their route
- **Marker Popups**: Click any marker to see detailed waypoint information
- **Auto-fit**: Map automatically shows the complete route

#### **3. Mobile Optimization**
- Touch-friendly map interactions
- Responsive design adapts to different screen sizes
- Efficient rendering for mobile devices

### **Technical Benefits**

#### **Performance**
- **Lightweight**: Leaflet is much smaller than Google Maps
- **Fast Loading**: OpenStreetMap tiles load quickly
- **Efficient Rendering**: Only renders visible map tiles

#### **Cost Effectiveness**
- **No API Keys**: OpenStreetMap doesn't require authentication
- **No Usage Limits**: Unlimited map tile requests
- **Free Service**: No licensing costs for commercial use

#### **Customization**
- **Custom Icons**: Easy to modify marker appearance
- **Route Styling**: Configurable colors and line weights
- **Responsive Design**: Adapts to different screen sizes

### **Error Handling**

#### **Fallback Behavior**
```javascript
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
```

#### **Browser Compatibility**
- **Modern Browsers**: Full support in Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: Optimized for iOS Safari and Chrome Mobile
- **Graceful Degradation**: Falls back to text display if maps fail to load

---

## Conclusion

The combination of Web Geolocation API and Map Visualization APIs successfully fulfills the external API requirement by providing comprehensive GPS and mapping functionality that enables:

**GPS Functionality:**
- Real-time location tracking during hikes
- GPS waypoint creation and storage  
- Elevation monitoring from altitude data
- Location-based accomplishment tracking

**Map Visualization:**
- Interactive route mapping with real map tiles
- Visual representation of hiking paths
- Custom markers for start/end/waypoints
- Route line tracing and auto-fit zoom

These API integrations are fundamental to the hiking application's core functionality and directly support the brief's requirements for location tracking, GPS waypoint management, and route visualization. The combination provides a complete hiking experience from real-time tracking to post-hike route analysis.
