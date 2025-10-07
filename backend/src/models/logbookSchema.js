// Hike schema for validation and type checking
const hikeSchema = {
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

   //New field for pinning
  pinned: "boolean",         // Whether the hike is pinned (favorite)
  
  //Sharing field
  shared: "boolean",         // Whether the hike is shared with friends
  
  // Accomplishments during hike
  accomplishments: "array",  // Array of accomplishments recorded during the hike
};

// GPS waypoint structure
const waypointSchema = {
  latitude: "number",        // GPS latitude
  longitude: "number",       // GPS longitude
  elevation: "number",       // Elevation at this point
  timestamp: "timestamp",   // When this waypoint was recorded
  description: "string",     // Optional description
  type: "string",           // Start, end, milestone, photo, etc.
};

// GPS location structure
const locationSchema = {
  latitude: "number",        // GPS latitude
  longitude: "number",       // GPS longitude
  elevation: "number",       // Elevation
  accuracy: "number",        // GPS accuracy in meters
  timestamp: "timestamp",   // When location was recorded
};

// Hike status enum
const hikeStatus = {
  ACTIVE: "active",          // Currently being tracked
  PAUSED: "paused",         // Temporarily stopped
  COMPLETED: "completed",    // Hike finished
  DRAFT: "draft",           // Not yet started
};

// Difficulty levels
const difficultyLevels = {
  EASY: "Easy",
  MODERATE: "Moderate", 
  HARD: "Hard",
  EXTREME: "Extreme"
};

// Validation functions
function validateHikeData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data must be an object'] };
  }

  const errors = [];
  
  // Validate each field if present
  for (const [field, expectedType] of Object.entries(hikeSchema)) {
    if (data[field] !== undefined) {
      const value = data[field];
      
      if (expectedType === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      } else if (expectedType === 'number' && typeof value !== 'number') {
        errors.push(`${field} must be a number`);
      } else if (expectedType === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${field} must be a boolean`);
      } else if (expectedType === 'array' && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
      } else if (expectedType === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
        errors.push(`${field} must be an object`);
      } else if (expectedType === 'timestamp' && !(value instanceof Date) && typeof value !== 'string') {
        errors.push(`${field} must be a Date or timestamp string`);
      }
    }
  }

  // Validate specific field values
  if (data.difficulty && !Object.values(difficultyLevels).includes(data.difficulty)) {
    errors.push(`difficulty must be one of: ${Object.values(difficultyLevels).join(', ')}`);
  }
  
  if (data.status && !Object.values(hikeStatus).includes(data.status)) {
    errors.push(`status must be one of: ${Object.values(hikeStatus).join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

function validateWaypoint(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Waypoint data must be an object'] };
  }

  const errors = [];
  
  // Latitude and longitude are required
  if (data.latitude === undefined || data.longitude === undefined) {
    errors.push('Waypoint must have latitude and longitude');
    return { valid: false, errors };
  }

  // Validate each field if present
  for (const [field, expectedType] of Object.entries(waypointSchema)) {
    if (data[field] !== undefined) {
      const value = data[field];
      
      if (expectedType === 'number' && typeof value !== 'number') {
        errors.push(`${field} must be a number`);
      } else if (expectedType === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      } else if (expectedType === 'timestamp' && !(value instanceof Date) && typeof value !== 'string') {
        errors.push(`${field} must be a Date or timestamp string`);
      }
    }
  }

  // Validate coordinate ranges
  if (typeof data.latitude === 'number' && (data.latitude < -90 || data.latitude > 90)) {
    errors.push('latitude must be between -90 and 90');
  }
  
  if (typeof data.longitude === 'number' && (data.longitude < -180 || data.longitude > 180)) {
    errors.push('longitude must be between -180 and 180');
  }

  return { valid: errors.length === 0, errors };
}

function validateLocation(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Location data must be an object'] };
  }

  const errors = [];
  
  // Latitude and longitude are required
  if (data.latitude === undefined || data.longitude === undefined) {
    errors.push('Location must have latitude and longitude');
    return { valid: false, errors };
  }

  // Validate each field if present
  for (const [field, expectedType] of Object.entries(locationSchema)) {
    if (data[field] !== undefined) {
      const value = data[field];
      
      if (expectedType === 'number' && typeof value !== 'number') {
        errors.push(`${field} must be a number`);
      } else if (expectedType === 'timestamp' && !(value instanceof Date) && typeof value !== 'string') {
        errors.push(`${field} must be a Date or timestamp string`);
      }
    }
  }

  // Validate coordinate ranges
  if (typeof data.latitude === 'number' && (data.latitude < -90 || data.latitude > 90)) {
    errors.push('latitude must be between -90 and 90');
  }
  
  if (typeof data.longitude === 'number' && (data.longitude < -180 || data.longitude > 180)) {
    errors.push('longitude must be between -180 and 180');
  }

  // Validate accuracy (should be non-negative)
  if (data.accuracy !== undefined && typeof data.accuracy === 'number' && data.accuracy < 0) {
    errors.push('accuracy must be non-negative');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  hikeSchema,
  waypointSchema,
  locationSchema,
  hikeStatus,
  difficultyLevels,
  validateHikeData,
  validateWaypoint,
  validateLocation
};
