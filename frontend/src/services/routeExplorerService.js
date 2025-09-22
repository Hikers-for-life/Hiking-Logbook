// services/routeExplorerService.js

/**
 * Route Explorer Service - Free hiking route discovery
 * Uses OpenStreetMap, Overpass API, and elevation data
 */
export class RouteExplorerService {
  constructor() {
    this.overpassEndpoint = 'https://overpass-api.de/api/interpreter';
    this.elevationEndpoint = 'https://api.open-elevation.com/api/v1/lookup';
  }

  /**
   * Discover hiking trails near a location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude  
   * @param {number} radiusKm - Search radius in kilometers
   * @returns {Promise<Array>} Array of trail data
   */
  async discoverNearbyTrails(lat, lng, radiusKm = 25) {
    try {
      const radiusMeters = radiusKm * 1000;
      
      const overpassQuery = `
        [out:json][timeout:30];
        (
          way["highway"~"^(path|track|footway)$"]["foot"!="no"]["name"](around:${radiusMeters},${lat},${lng});
          way["highway"="cycleway"]["foot"!="no"]["name"](around:${radiusMeters},${lat},${lng});
          relation["route"="hiking"]["name"](around:${radiusMeters},${lat},${lng});
          way["natural"="cliff"]["climbing"!="no"]["name"](around:${radiusMeters},${lat},${lng});
        );
        out geom meta;
      `;

      const response = await fetch(this.overpassEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(overpassQuery)}`
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trail data');
      }

      const data = await response.json();
      return this.processTrailData(data.elements);

    } catch (error) {
      console.error('Error discovering trails:', error);
      throw new Error('Unable to discover trails at this time');
    }
  }

  /**
   * Get detailed route information
   * @param {string} routeId - OpenStreetMap way/relation ID
   * @returns {Promise<Object>} Detailed route information
   */
  async getRouteDetails(routeId) {
    try {
      const overpassQuery = `
        [out:json][timeout:25];
        (
          way(${routeId});
          relation(${routeId});
        );
        out geom meta tags;
      `;

      const response = await fetch(this.overpassEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(overpassQuery)}`
      });

      if (!response.ok) {
        throw new Error('Failed to fetch route details');
      }

      const data = await response.json();
      if (data.elements.length === 0) {
        throw new Error('Route not found');
      }

      return this.processDetailedRoute(data.elements[0]);

    } catch (error) {
      console.error('Error getting route details:', error);
      throw error;
    }
  }

  /**
   * Search trails by name and location
   * @param {string} searchTerm - Trail name or keyword
   * @param {number} lat - Center latitude
   * @param {number} lng - Center longitude
   * @param {number} radiusKm - Search radius
   * @returns {Promise<Array>} Matching trails
   */
  async searchTrails(searchTerm, lat, lng, radiusKm = 50) {
    try {
      const radiusMeters = radiusKm * 1000;
      const searchRegex = searchTerm.toLowerCase().replace(/\s+/g, '.*');
      
      const overpassQuery = `
        [out:json][timeout:30];
        (
          way["highway"~"^(path|track|footway)$"]["name"~"${searchRegex}",i](around:${radiusMeters},${lat},${lng});
          relation["route"="hiking"]["name"~"${searchRegex}",i](around:${radiusMeters},${lat},${lng});
        );
        out geom meta;
      `;

      const response = await fetch(this.overpassEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(overpassQuery)}`
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      return this.processTrailData(data.elements);

    } catch (error) {
      console.error('Error searching trails:', error);
      throw new Error('Trail search unavailable');
    }
  }

  /**
   * Get elevation profile for a route
   * @param {Array} coordinates - Array of [lng, lat] coordinates
   * @returns {Promise<Array>} Elevation profile data
   */
  async getElevationProfile(coordinates) {
    try {
      // Sample coordinates for elevation (max 100 points for free API)
      const sampledCoords = this.sampleCoordinates(coordinates, 50);
      
      const locations = sampledCoords.map(coord => ({
        latitude: coord[1],
        longitude: coord[0]
      }));

      const response = await fetch(this.elevationEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations })
      });

      if (!response.ok) {
        throw new Error('Failed to get elevation data');
      }

      const data = await response.json();
      return this.processElevationData(data.results, sampledCoords);

    } catch (error) {
      console.error('Error getting elevation profile:', error);
      return []; // Return empty array if elevation fails
    }
  }

  /**
   * Discover points of interest along a route
   * @param {Array} coordinates - Route coordinates
   * @param {number} bufferKm - Search buffer in kilometers
   * @returns {Promise<Array>} Points of interest
   */
  async getRoutePointsOfInterest(coordinates, bufferKm = 2) {
    try {
      // Get bounding box for the route
      const bbox = this.getBoundingBox(coordinates, bufferKm);
      
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["tourism"~"^(viewpoint|attraction|information)$"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
          node["amenity"~"^(shelter|drinking_water|toilets)$"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
          node["natural"~"^(peak|waterfall|spring)$"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
          node["man_made"~"^(tower|mast)$"]["tower:type"="observation"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        );
        out meta;
      `;

      const response = await fetch(this.overpassEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(overpassQuery)}`
      });

      if (!response.ok) {
        return []; // Return empty if POI search fails
      }

      const data = await response.json();
      return this.processPointsOfInterest(data.elements);

    } catch (error) {
      console.error('Error getting POIs:', error);
      return [];
    }
  }

  // Private helper methods

  processTrailData(elements) {
    return elements
      .filter(element => element.tags && element.tags.name)
      .map(element => {
        const coords = this.extractCoordinates(element);
        const distance = coords.length > 1 ? this.calculateDistance(coords) : 0;
        
        return {
          id: element.id,
          type: element.type,
          name: element.tags.name,
          description: element.tags.description || '',
          difficulty: this.estimateDifficulty(element.tags),
          surface: element.tags.surface || 'unknown',
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
          coordinates: coords,
          tags: element.tags,
          source: 'OpenStreetMap'
        };
      })
      .filter(trail => trail.distance > 0.5) // Filter out very short segments
      .sort((a, b) => a.distance - b.distance); // Sort by distance
  }

  processDetailedRoute(element) {
    const coords = this.extractCoordinates(element);
    const distance = this.calculateDistance(coords);
    
    return {
      id: element.id,
      type: element.type,
      name: element.tags.name || 'Unnamed Trail',
      description: element.tags.description || '',
      difficulty: this.estimateDifficulty(element.tags),
      surface: element.tags.surface || 'unknown',
      distance: Math.round(distance * 100) / 100,
      coordinates: coords,
      waypoints: this.extractWaypoints(coords),
      tags: element.tags,
      source: 'OpenStreetMap',
      lastModified: element.timestamp
    };
  }

  processElevationData(elevationResults, coordinates) {
    return elevationResults.map((result, index) => {
      const distance = index > 0 
        ? this.calculateDistance(coordinates.slice(0, index + 1))
        : 0;
      
      return {
        distance: Math.round(distance * 100) / 100,
        elevation: result.elevation,
        coordinates: [result.longitude, result.latitude]
      };
    });
  }

  processPointsOfInterest(elements) {
    return elements
      .filter(element => element.lat && element.lon)
      .map(element => ({
        id: element.id,
        name: element.tags.name || this.getPoiTypeName(element.tags),
        type: this.getPoiType(element.tags),
        coordinates: [element.lon, element.lat],
        description: element.tags.description || '',
        tags: element.tags
      }));
  }

  extractCoordinates(element) {
    if (element.type === 'way' && element.geometry) {
      return element.geometry.map(point => [point.lon, point.lat]);
    } else if (element.type === 'relation' && element.members) {
      // For relations, we'd need to fetch member ways - simplified here
      return [];
    }
    return [];
  }

  calculateDistance(coordinates) {
    if (coordinates.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      totalDistance += this.haversineDistance(
        coordinates[i - 1][1], coordinates[i - 1][0],
        coordinates[i][1], coordinates[i][0]
      );
    }
    return totalDistance;
  }

  haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  estimateDifficulty(tags) {
    // Simple difficulty estimation based on OSM tags
    if (tags.sac_scale) {
      const scale = parseInt(tags.sac_scale);
      if (scale <= 2) return 'Easy';
      if (scale <= 4) return 'Moderate';
      return 'Hard';
    }
    
    if (tags.difficulty) {
      const difficulty = tags.difficulty.toLowerCase();
      if (difficulty.includes('easy') || difficulty.includes('green')) return 'Easy';
      if (difficulty.includes('intermediate') || difficulty.includes('blue')) return 'Moderate';
      if (difficulty.includes('difficult') || difficulty.includes('red')) return 'Hard';
    }
    
    return 'Moderate'; // Default
  }

  sampleCoordinates(coordinates, maxPoints) {
    if (coordinates.length <= maxPoints) return coordinates;
    
    const step = Math.floor(coordinates.length / maxPoints);
    const sampled = [];
    for (let i = 0; i < coordinates.length; i += step) {
      sampled.push(coordinates[i]);
    }
    
    // Always include the last point
    if (sampled[sampled.length - 1] !== coordinates[coordinates.length - 1]) {
      sampled.push(coordinates[coordinates.length - 1]);
    }
    
    return sampled;
  }

  getBoundingBox(coordinates, bufferKm) {
    const lats = coordinates.map(coord => coord[1]);
    const lngs = coordinates.map(coord => coord[0]);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    // Add buffer (rough conversion: 1 degree ≈ 111 km)
    const buffer = bufferKm / 111;
    
    return {
      south: minLat - buffer,
      west: minLng - buffer,
      north: maxLat + buffer,
      east: maxLng + buffer
    };
  }

  extractWaypoints(coordinates) {
    // Extract key waypoints (start, end, and some intermediate points)
    const waypoints = [coordinates[0]]; // Start
    
    // Add some intermediate points
    const numIntermediate = Math.min(3, Math.floor(coordinates.length / 4));
    for (let i = 1; i <= numIntermediate; i++) {
      const index = Math.floor((coordinates.length * i) / (numIntermediate + 1));
      waypoints.push(coordinates[index]);
    }
    
    waypoints.push(coordinates[coordinates.length - 1]); // End
    return waypoints;
  }

  getPoiType(tags) {
    if (tags.tourism) return tags.tourism;
    if (tags.amenity) return tags.amenity;
    if (tags.natural) return tags.natural;
    if (tags.man_made) return tags.man_made;
    return 'poi';
  }

  getPoiTypeName(tags) {
    const type = this.getPoiType(tags);
    const typeNames = {
      viewpoint: 'Viewpoint',
      attraction: 'Attraction',
      information: 'Information',
      shelter: 'Shelter',
      drinking_water: 'Water Source',
      toilets: 'Restrooms',
      peak: 'Peak',
      waterfall: 'Waterfall',
      spring: 'Spring',
      tower: 'Tower'
    };
    return typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }
}

// Export singleton instance
export const routeExplorerService = new RouteExplorerService();