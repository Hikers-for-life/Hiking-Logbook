// src/services/routeExplorerService.js

const ORS_API_KEY = process.env.REACT_APP_OPENROUTESERVICE_API_KEY;

// Helper function to calculate distance (Haversine formula) - no changes needed
const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLon = (coord2.lon - coord1.lon) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

/**
 * NEW: Transforms the raw GeoJSON data from the ORS POI API into our app-friendly format.
 */
const transformORSData = (orsFeatures) => {
  const trails = [];
  
  orsFeatures.forEach(feature => {
    const properties = feature.properties;
    const trailName = properties.osm_tags?.name || 'Unnamed Trail';
    const coordinates = feature.geometry.coordinates;

    // The POI for a trail is often just a point, not the full path.
    // For now, we will represent it as a starting point.
    // The details view will still show it correctly on a map.
    // We will assign a default distance and difficulty for discovered POIs.
    
    trails.push({
      id: properties.osm_id,
      name: trailName,
      description: `A trail discovered near you. The full details will be available upon selection.`,
      distance: 'N/A', // Distance cannot be calculated from a single POI point
      difficulty: 'Moderate', // Assign a default difficulty
      surface: properties.osm_tags?.surface || 'unpaved',
      // Coordinates are already [lon, lat] from GeoJSON
      coordinates: coordinates,
      duration: null,
      ascent: null,
      descent: null,
      source: 'OpenRouteService',
    });
  });
  
  // Remove duplicates by ID
  return [...new Map(trails.map(item => [item.id, item])).values()];
};


export const routeExplorerService = {
  /**
   * MODIFIED: Discovers nearby hiking trails using the OpenRouteService POI API.
   */
  async discoverNearbyTrails(lat, lng, radiusKm) {
    const radiusMeters = radiusKm * 1000;
    
    const response = await fetch('https://api.openrouteservice.org/pois', {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Search for OSM features with "route=hiking"
        "request": "pois",
        "geometry": {
          "circle": {
            "radius": radiusMeters,
            "coordinates": [lng, lat]
          }
        },
        "filters": {
          "category_group_ids": [38], // Category Group ID for "Touristic"
           "category_ids": [7308] // Category ID for "Hiking"
        },
        "limit": 50 // Get up to 50 results
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from OpenRouteService.');
    }

    const data = await response.json();
    return transformORSData(data.features);
  },
  
  /**
   * NOTE: A nationwide search for POIs is less practical with ORS than with Overpass.
   * For now, we will return a curated list as a reliable fallback.
   * If a dynamic nationwide search is critical, we would need a different strategy.
   */
  async discoverNationwideHikes() {
    // Fallback to a curated list for a better user experience
    return [
        { id: 'nationwide-1', name: "Lion's Head Summit", description: "Iconic Cape Town hike with 360-degree views.", distance: '5.5', difficulty: 'Moderate', coordinates: [[18.388, -33.935]] },
        { id: 'nationwide-2', name: 'Platteklip Gorge', description: 'The most direct route to the top of Table Mountain.', distance: '2.9', difficulty: 'Hard', coordinates: [[18.404, -33.963]] },
        { id: 'nationwide-3', name: 'Tugela Falls Hiking Trail', description: 'Hike to the top of the world\'s second-tallest waterfall.', distance: '13', difficulty: 'Moderate', coordinates: [[28.896, -28.752]] }
    ];
  },
  
  /**
   * Enriches a trail with elevation data from OpenRouteService.
   */
  async enrichTrailWithElevation(trail) {
    if (!ORS_API_KEY) {
      console.warn("OpenRouteService API key is missing. Skipping elevation data.");
      return { ...trail, ascent: 0, descent: 0, duration: 'N/A' };
    }
    
    if (!trail.coordinates || trail.coordinates.length < 2) {
      return trail;
    }

    const response = await fetch('https://api.openrouteservice.org/elevation/line', {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json',
      },
      // The API expects coordinates in [longitude, latitude] format
      body: JSON.stringify({ format_in: 'geojson', geometry: { coordinates: trail.coordinates } }),
    });

    if (!response.ok) {
      console.error("Failed to fetch elevation data.");
      return trail; // Return original trail on failure
    }

    const data = await response.json();
    const elevations = data.geometry.coordinates.map(coord => coord[2]); // Elevation is the 3rd item

    let ascent = 0;
    let descent = 0;
    for (let i = 1; i < elevations.length; i++) {
      const diff = elevations[i] - elevations[i - 1];
      if (diff > 0) {
        ascent += diff;
      } else {
        descent -= diff;
      }
    }

    // Estimate duration based on distance and ascent
    const timeInMinutes = (trail.distance * 12) + (ascent / 10);
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = Math.round(timeInMinutes % 60);
    const estimatedDuration = `${hours}h ${minutes}m`;

    return {
      ...trail,
      ascent: Math.round(ascent),
      descent: Math.round(descent),
      duration: estimatedDuration,
      elevationProfile: elevations, // For drawing charts
    };
  }
};