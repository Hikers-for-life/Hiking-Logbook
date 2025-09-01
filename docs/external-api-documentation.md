# External API Usage Documentation - GPS/Geolocation API

## Overview
This document details the external API usage implemented in the Hiking Logbook application to meet the sprint requirements for external API integration.

---
e commitin
## API Used: Web Geolocation API

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


## Conclusion

The Web Geolocation API successfully fulfills the external API requirement by providing essential GPS functionality that enables:

- Real-time location tracking during hikes
- GPS waypoint creation and storage  
- Elevation monitoring from altitude data
- Location-based accomplishment tracking
- Foundation for future route mapping features

This API integration is fundamental to the hiking application's core functionality and directly supports the brief's requirements for location tracking and GPS waypoint management.
