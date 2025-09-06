
export const hikeSchema = {
  // Basic hike information
  title: "string",           // Hike name/title
  location: "string",        // Where the hike took place
  route: "string",           // Specific trail/route name
  
  // Timing and dates
  date: "timestamp",         // When the hike happened
  startTime: "timestamp",    // Start time of the hike
  endTime: "timestamp",      // End time of the hike
  duration: "number",        // Duration in hours/minutes
  
  // Physical metrics
  distance: "number",        // Distance in km/miles
  elevation: "number",       // Elevation gain in meters/feet
  difficulty: "string",      // Easy, Moderate, Hard
  
  // Environmental conditions
  weather: "string",         // Weather conditions during hike
  
  // Additional details
  notes: "string",           // Optional notes and observations
  photos: "number",          // Number of photos taken
  
  // GPS and tracking data
  waypoints: "array",        // GPS waypoints array
  startLocation: "object",   // Starting GPS coordinates
  endLocation: "object",     // Ending GPS coordinates
  
  // Route tracking
  routeMap: "string",        // Route map data or reference
  gpsTrack: "array",         // Full GPS track data
  
  // Metadata
  createdAt: "timestamp",    // When the hike was recorded
  updatedAt: "timestamp",    // When the hike was last updated
  userId: "string",          // User who logged the hike
  status: "string",          // Active, completed, paused
};

// GPS waypoint structure
export const waypointSchema = {
  latitude: "number",        // GPS latitude
  longitude: "number",       // GPS longitude
  elevation: "number",       // Elevation at this point
  timestamp: "timestamp",   // When this waypoint was recorded
  description: "string",     // Optional description
  type: "string",           // Start, end, milestone, photo, etc.
};

// GPS location structure
export const locationSchema = {
  latitude: "number",        // GPS latitude
  longitude: "number",       // GPS longitude
  elevation: "number",       // Elevation
  accuracy: "number",        // GPS accuracy in meters
  timestamp: "timestamp",   // When location was recorded
};

// Hike status enum
export const hikeStatus = {
  ACTIVE: "active",          // Currently being tracked
  PAUSED: "paused",         // Temporarily stopped
  COMPLETED: "completed",    // Hike finished
  DRAFT: "draft",           // Not yet started
};

// Difficulty levels
export const difficultyLevels = {
  EASY: "Easy",
  MODERATE: "Moderate", 
  HARD: "Hard",
  EXTREME: "Extreme"
};
