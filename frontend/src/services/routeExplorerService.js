// src/services/routeExplorerService.js

// Get API key dynamically to support testing
const getORSAPIKey = () => process.env.REACT_APP_OPENROUTESERVICE_API_KEY;

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

  orsFeatures.forEach((feature) => {
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
  return [...new Map(trails.map((item) => [item.id, item])).values()];
};

// Note: API key testing removed due to CORS restrictions

export const routeExplorerService = {
  /**
   * MODIFIED: Discovers nearby hiking trails using the OpenRouteService POI API.
   * Falls back to curated South African trails if API key is missing.
   */
  async discoverNearbyTrails(lat, lng, radiusKm) {
    // Check if API key is available
    if (!getORSAPIKey()) {
      console.warn('OpenRouteService API key not found. Using curated South African trails.');
      return this.getNearbyCuratedTrails(lat, lng, radiusKm);
    }

    const radiusMeters = radiusKm * 1000;

    try {
      console.log('Attempting to fetch nearby trails from OpenRouteService...');
      console.log('API Key present:', !!getORSAPIKey());
      console.log('Location:', { lat, lng, radiusKm });

      // Try different API endpoints and formats
      const apiEndpoints = [
        'https://api.openrouteservice.org/pois',
        'https://api.openrouteservice.org/v2/pois'
      ];
      
      let response = null;
      let lastError = null;
      
      for (const endpoint of apiEndpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          
          response = await fetch(endpoint, {
            method: 'POST',
                headers: {
                  'Authorization': getORSAPIKey(),
                  'Content-Type': 'application/json',
                },
            body: JSON.stringify({
              request: 'pois',
              geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              },
              buffer: radiusMeters,
              filters: {
                category_group_ids: [38], // Category Group ID for "Touristic"
                category_ids: [7308, 7309, 7310], // Hiking, Walking, and Nature trails
              },
              limit: 50, // Get up to 50 results
            }),
          });
          
          if (response.ok) {
            console.log(`Success with endpoint: ${endpoint}`);
            break;
          } else {
            lastError = `Endpoint ${endpoint} returned ${response.status}`;
            console.log(lastError);
          }
        } catch (error) {
          lastError = `Endpoint ${endpoint} failed: ${error.message}`;
          console.log(lastError);
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`All API endpoints failed. Last error: ${lastError}`);
      }

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('OpenRouteService response:', data);
      
      const orsTrails = transformORSData(data.features || []);
      console.log('Transformed trails:', orsTrails);
      
      // If no trails found from API, fall back to curated trails
      if (orsTrails.length === 0) {
        console.log('No trails found from API, using curated trails');
        return this.getNearbyCuratedTrails(lat, lng, radiusKm);
      }
      
      return orsTrails;
    } catch (error) {
      console.warn('OpenRouteService API failed, using curated trails:', error.message);
      return this.getNearbyCuratedTrails(lat, lng, radiusKm);
    }
  },

  /**
   * Helper function to get curated trails near a location
   */
  getNearbyCuratedTrails(lat, lng, radiusKm) {
    const allTrails = this.getAllCuratedTrails();
    const nearbyTrails = [];

    allTrails.forEach(trail => {
      if (trail.coordinates && trail.coordinates[0]) {
        const [trailLng, trailLat] = trail.coordinates[0];
        const distance = calculateDistance(
          { lat, lon: lng },
          { lat: trailLat, lon: trailLng }
        );
        
        if (distance <= radiusKm) {
          nearbyTrails.push({
            ...trail,
            distance: distance.toFixed(1) + ' km away'
          });
        }
      }
    });

    // If no trails found within radius, expand search to 200km and show closest ones
    if (nearbyTrails.length === 0) {
      console.log('No trails found within radius, expanding search to 200km...');
      allTrails.forEach(trail => {
        if (trail.coordinates && trail.coordinates[0]) {
          const [trailLng, trailLat] = trail.coordinates[0];
          const distance = calculateDistance(
            { lat, lon: lng },
            { lat: trailLat, lon: trailLng }
          );
          
          if (distance <= 200) { // 200km radius
            nearbyTrails.push({
              ...trail,
              distance: distance.toFixed(1) + ' km away'
            });
          }
        }
      });
    }

    // Sort by distance and return up to 10 results
    return nearbyTrails
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
      .slice(0, 10);
  },

  /**
   * Get all curated South African trails
   */
  getAllCuratedTrails() {
    return [
      // Western Cape
      {
        id: 'sa-1',
        name: "Lion's Head Summit",
        description: 'Iconic Cape Town hike with 360-degree views of the city and ocean.',
        distance: '5.5',
        difficulty: 'Moderate',
        surface: 'rocky',
        coordinates: [[18.388, -33.935]],
        region: 'Western Cape',
        elevation: '669m',
        duration: '2-3 hours'
      },
      {
        id: 'sa-2',
        name: 'Platteklip Gorge',
        description: 'The most direct route to the top of Table Mountain.',
        distance: '2.9',
        difficulty: 'Hard',
        surface: 'rocky',
        coordinates: [[18.404, -33.963]],
        region: 'Western Cape',
        elevation: '1085m',
        duration: '2-4 hours'
      },
      {
        id: 'sa-3',
        name: 'Cape Point Trail',
        description: 'Scenic coastal walk to the southernmost tip of the Cape Peninsula.',
        distance: '8.0',
        difficulty: 'Easy',
        surface: 'paved',
        coordinates: [[18.496, -34.357]],
        region: 'Western Cape',
        elevation: '200m',
        duration: '3-4 hours'
      },
      {
        id: 'sa-4',
        name: 'Kirstenbosch Botanical Gardens',
        description: 'Easy family-friendly trails through beautiful indigenous gardens.',
        distance: '3.0',
        difficulty: 'Easy',
        surface: 'paved',
        coordinates: [[18.430, -33.988]],
        region: 'Western Cape',
        elevation: '100m',
        duration: '1-2 hours'
      },
      
      // KwaZulu-Natal
      {
        id: 'sa-5',
        name: 'Tugela Falls Hiking Trail',
        description: "Hike to the top of the world's second-tallest waterfall.",
        distance: '13.0',
        difficulty: 'Hard',
        surface: 'rocky',
        coordinates: [[28.896, -28.752]],
        region: 'KwaZulu-Natal',
        elevation: '948m',
        duration: '6-8 hours'
      },
      {
        id: 'sa-6',
        name: 'Cathedral Peak',
        description: 'Challenging Drakensberg hike with spectacular mountain views.',
        distance: '12.0',
        difficulty: 'Hard',
        surface: 'rocky',
        coordinates: [[29.234, -28.956]],
        region: 'KwaZulu-Natal',
        elevation: '3004m',
        duration: '8-10 hours'
      },
      
      // Gauteng
      {
        id: 'sa-7',
        name: 'Magaliesberg Hiking Trail',
        description: 'Popular day hike with panoramic views of the Highveld.',
        distance: '6.0',
        difficulty: 'Moderate',
        surface: 'rocky',
        coordinates: [[27.850, -25.900]],
        region: 'Gauteng',
        elevation: '600m',
        duration: '3-4 hours'
      },
      {
        id: 'sa-8',
        name: 'Walter Sisulu Botanical Gardens',
        description: 'Easy trails with waterfall views and bird watching opportunities.',
        distance: '2.5',
        difficulty: 'Easy',
        surface: 'paved',
        coordinates: [[27.917, -26.083]],
        region: 'Gauteng',
        elevation: '50m',
        duration: '1-2 hours'
      },
      
      // Mpumalanga
      {
        id: 'sa-9',
        name: 'Blyde River Canyon Trail',
        description: 'Scenic canyon walk with breathtaking views and rock formations.',
        distance: '10.0',
        difficulty: 'Moderate',
        surface: 'rocky',
        coordinates: [[30.817, -24.583]],
        region: 'Mpumalanga',
        elevation: '400m',
        duration: '4-6 hours'
      },
      
      // Eastern Cape
      {
        id: 'sa-10',
        name: 'Amatola Hiking Trail',
        description: 'Multi-day trail through indigenous forests and mountain streams.',
        distance: '100.0',
        difficulty: 'Hard',
        surface: 'mixed',
        coordinates: [[27.150, -32.750]],
        region: 'Eastern Cape',
        elevation: '1200m',
        duration: '6 days'
      }
    ];
  },

  /**
   * Enhanced nationwide search with more South African trails
   */
  async discoverNationwideHikes() {
    return this.getAllCuratedTrails();
  },

  /**
   * Enriches a trail with elevation data from OpenRouteService.
   */
  async enrichTrailWithElevation(trail) {
    if (!ORS_API_KEY) {
      console.warn(
        'OpenRouteService API key is missing. Skipping elevation data.'
      );
      return { ...trail, ascent: 0, descent: 0, duration: 'N/A' };
    }

    if (!trail.coordinates || trail.coordinates.length < 2) {
      return trail;
    }

    const response = await fetch(
      'https://api.openrouteservice.org/elevation/line',
      {
        method: 'POST',
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json',
        },
        // The API expects coordinates in [longitude, latitude] format
        body: JSON.stringify({
          format_in: 'geojson',
          geometry: { coordinates: trail.coordinates },
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch elevation data.');
      return trail; // Return original trail on failure
    }

    const data = await response.json();
    const elevations = data.geometry.coordinates.map((coord) => coord[2]); // Elevation is the 3rd item

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
    const timeInMinutes = trail.distance * 12 + ascent / 10;
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
  },
};
