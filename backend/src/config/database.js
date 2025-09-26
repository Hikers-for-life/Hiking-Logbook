import { getDatabase } from './firebase.js';
import { evaluateAndAwardBadges } from '../services/badgeService.js';

// Database utilities for comprehensive hike management
export const dbUtils = {
  // Add a new hike with comprehensive data
  async addHike(userId, hikeData) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      // Map and validate the hike data
      const mappedHikeData = {
        // Basic information
        title: hikeData.title || hikeData.trailName || '',
        location: hikeData.location || '',
        route: hikeData.route || hikeData.trailName || '',
        
        // Timing
        date: hikeData.date || new Date(),
        startTime: hikeData.startTime || null,
        endTime: hikeData.endTime || null,
        duration: hikeData.duration || 0,
        
        // Physical metrics
        distance: hikeData.distance || hikeData.distanceKm || 0,
        elevation: hikeData.elevation || 0,
        difficulty: hikeData.difficulty || 'Easy',
        
        // Environmental
        weather: hikeData.weather || '',
        
        // Additional details
        notes: hikeData.notes || '',
        
        // GPS and tracking
        waypoints: hikeData.waypoints || [],
        startLocation: hikeData.startLocation || null,
        endLocation: hikeData.endLocation || null,
        routeMap: hikeData.routeMap || '',
        gpsTrack: hikeData.gpsTrack || [],
        
        // Metadata
        status: hikeData.status || 'completed',
        pinned: hikeData.pinned || false,
        shared: hikeData.shared || false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId
      };

      const db = getDatabase();
      const docRef = await db
        .collection('users')
        .doc(userId)
        .collection('hikes')
        .add(mappedHikeData);
        
      // After saving hike, evaluate badges
      const stats = await this.getUserHikeStats(userId);
      await evaluateAndAwardBadges(userId, stats);

      return { success: true, id: docRef.id };

    } catch (error) {
      throw new Error(`Failed to add hike: ${error.message}`);
    }
  },

  // Get all hikes for a user with optional filtering
  async getUserHikes(userId, filters = {}) {
    try {
      const db = getDatabase();
      let query = db
        .collection('users')
        .doc(userId)
        .collection('hikes');
      
      // Apply filters
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters.difficulty) {
        query = query.where('difficulty', '==', filters.difficulty);
      }
      if (filters.dateFrom) {
        query = query.where('date', '>=', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.where('date', '<=', filters.dateTo);
      }
      if (filters.pinned !== undefined) {
        query = query.where('pinned', '==', filters.pinned);
      }
      
      // Only add orderBy if we don't have filters that require composite indexes
      // (pinned and difficulty filters require composite indexes with orderBy)
      if (filters.pinned === undefined && filters.difficulty === undefined) {
        query = query.orderBy('createdAt', 'desc');
      }
      
      const snapshot = await query.get();
      
      let hikes = [];
      snapshot.forEach(doc => {
        const hikeData = { id: doc.id, ...doc.data() };
        hikes.push(hikeData);
      });
      
      // Apply search filter on the client side (Firestore doesn't support full-text search)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        hikes = hikes.filter(hike => {
          const title = (hike.title || '').toLowerCase();
          const location = (hike.location || '').toLowerCase();
          const notes = (hike.notes || '').toLowerCase();
          return title.includes(searchTerm) || 
                 location.includes(searchTerm) || 
                 notes.includes(searchTerm);
        });
      }
      
      // If we filtered by pinned or difficulty, sort by createdAt on the client side
      // (to avoid Firestore composite index requirements)
      if (filters.pinned !== undefined || filters.difficulty !== undefined) {
        hikes.sort((a, b) => {
          const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return bTime - aTime; // Newest first
        });
      }
      
      return hikes;
    } catch (error) {
      throw new Error(`Failed to get user hikes: ${error.message}`);
    }
  },

  // Get a specific hike by ID
  async getHike(userId, hikeId) {
    try {
      const db = getDatabase();
      const doc = await db
        .collection('users')
        .doc(userId)
        .collection('hikes')
        .doc(hikeId)
        .get();
      

      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to get hike: ${error.message}`);
    }
  },

  // Update a hike
  async updateHike(userId, hikeId, hikeData) {
    try {
      const updateData = {
        ...hikeData,
        updatedAt: new Date()
      };
      

      const db = getDatabase();
      await db
        .collection('users')
        .doc(userId)
        .collection('hikes')
        .doc(hikeId)
        .update(updateData);
        
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update hike: ${error.message}`);
    }
  },

  // Delete a hike
  async deleteHike(userId, hikeId) {
    try {

      
      // Get all hikes and find the one to delete
      const db = getDatabase();
      const snapshot = await db
        .collection('users')
        .doc(userId)
        .collection('hikes')
        .get();
      
      let targetDoc = null;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        // Match by document ID (for proper Firestore IDs) or by data.id field (for malformed data)
        if (doc.id == hikeId || data.id == hikeId) {

          targetDoc = doc;
        }
      });
      
      if (targetDoc) {
        await targetDoc.ref.delete();

        return { success: true };
      } else {

        throw new Error('Hike not found');
      }
      
    } catch (error) {
      console.error(`Failed to delete hike ${hikeId}:`, error.message);
      throw new Error(`Failed to delete hike: ${error.message}`);
    }
  },

  // Start tracking a new hike (for active hikes)
  async startHike(userId, hikeData) {
    try {
      const activeHikeData = {
        ...hikeData,
        status: 'active',
        date: hikeData.date || new Date(), // Ensure date field exists for ordering
        startTime: new Date(),
        pinned: hikeData.pinned || false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId,
        waypoints: [],
        gpsTrack: []
      };

      const db = getDatabase();
      const docRef = await db
        .collection('users')
        .doc(userId)
        .collection('hikes')
        .add(activeHikeData);
        
      return { success: true, id: docRef.id };
    } catch (error) {
      throw new Error(`Failed to start hike: ${error.message}`);
    }
  },

  // Update hike with GPS waypoint
  async addWaypoint(userId, hikeId, waypoint) {
    try {
      const db = getDatabase();
      const waypointData = {
        latitude: waypoint.latitude,
        longitude: waypoint.longitude,
        elevation: waypoint.elevation || 0,
        timestamp: waypoint.timestamp || new Date(),
        description: waypoint.description || '',
        type: waypoint.type || 'milestone'
      };

      await db
        .collection('users')
        .doc(userId)
        .collection('hikes')
        .doc(hikeId)
        .update({
          waypoints: db.FieldValue.arrayUnion(waypointData),
          updatedAt: new Date()
        });
        
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to add waypoint: ${error.message}`);
    }
  },

  // Complete a hike
  async completeHike(userId, hikeId, endData) {
    try {

      const completionData = {
        status: 'completed',
        endTime: endData.endTime || new Date(),
        duration: endData.duration || 0,
        endLocation: endData.endLocation || null,
        updatedAt: new Date()
      };

      const db = getDatabase();
      await db
        .collection('users')
        .doc(userId)
        .collection('hikes')
        .doc(hikeId)
        .update(completionData);

       // After marking hike completed, check badges again
      const stats = await this.getUserHikeStats(userId);
      await evaluateAndAwardBadges(userId, stats);
        
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to complete hike: ${error.message}`);
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const db = getDatabase();
      const doc = await db.collection('users').doc(userId).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  },



  // Create user profile
  async createUserProfile(userId, profileData) {
    try {
      const db = getDatabase();
      await db
        .collection('users')
        .doc(userId)
        .set({
          ...profileData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  },

  // Get user hiking statistics
  async getUserStats(userId) {
    try {
      const db = getDatabase();
      // Get all hikes for statistics calculation
      const snapshot = await db
        .collection('users')
        .doc(userId)
        .collection('hikes')
        .get();
      
      let totalHikes = 0;
      let totalDistance = 0;
      let totalElevation = 0;
      let totalDuration = 0;
      const locations = new Set();
      
      snapshot.forEach(doc => {
        const hike = doc.data();
        totalHikes++;
        
        // Parse distance (handle different formats like "5 mi", "5 miles", "5")
        const distanceStr = hike.distance || '0';
        const distanceMatch = distanceStr.match(/(\d+(?:\.\d+)?)/);
        if (distanceMatch) {
          const distance = parseFloat(distanceMatch[1]);
          totalDistance += distance;
        }
        
        // Parse elevation (handle different formats like "1000 ft", "1000 feet", "1000")
        const elevationStr = hike.elevation || '0';
        const elevationMatch = elevationStr.match(/(\d+(?:\.\d+)?)/);
        if (elevationMatch) {
          const elevation = parseFloat(elevationMatch[1]);
          totalElevation += elevation;
        }
        
        // Parse duration (handle different formats like "120 min", "2 hours", "120")
        const durationStr = hike.duration || '0';
        const durationMatch = durationStr.match(/(\d+(?:\.\d+)?)/);
        if (durationMatch) {
          const duration = parseFloat(durationMatch[1]);
          totalDuration += duration;
        }
        
        // Track unique locations (extract state/country from location)
        if (hike.location) {
          const locationParts = hike.location.split(',').map(part => part.trim());
          if (locationParts.length > 1) {
            locations.add(locationParts[locationParts.length - 1]);
          }
        }
      });
      
      return {
        totalHikes,
        totalDistance: Math.round(totalDistance * 10) / 10, // Round to 1 decimal
        totalElevation: Math.round(totalElevation),
        totalDuration: Math.round(totalDuration),
        statesExplored: locations.size
      };
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error.message}`);
    }
  },

  // Update user profile
  async updateUserProfile(userId, profileData) {
    try {
      const db = getDatabase();
      await db
        .collection('users')
        .doc(userId)
        .update({
          ...profileData,
          updatedAt: new Date(),
        });
        
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  },

  // Helper function to parse distance string (e.g., "5km" -> 5)
  parseDistance(distanceStr) {
    if (!distanceStr || typeof distanceStr !== 'string') return 0;
    const match = distanceStr.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  },

  // Helper function to parse elevation string (e.g., "2,400m" -> 2400)
  parseElevation(elevationStr) {
    if (!elevationStr || typeof elevationStr !== 'string') return 0;
    const match = elevationStr.match(/(\d+(?:,\d+)?)/);
    return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
  },

  // Helper function to parse duration string (e.g., "1h 30m" -> 90 minutes)
  parseDuration(durationStr) {
    if (!durationStr || typeof durationStr !== 'string') return 0;
    
    let totalMinutes = 0;
    
    // Parse hours (e.g., "1h" or "1h 30m")
    const hourMatch = durationStr.match(/(\d+)h/);
    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1]) * 60;
    }
    
    // Parse minutes (e.g., "30m" or "1h 30m")
    const minuteMatch = durationStr.match(/(\d+)m/);
    if (minuteMatch) {
      totalMinutes += parseInt(minuteMatch[1]);
    }
    
    return totalMinutes;
  },

  // Calculate hiking streaks based on completed hikes
  calculateStreaks(hikes) {
    try {
      // Filter only completed hikes and sort by date
      const completedHikes = hikes
        .filter(hike => {
          const hasDate = hike.date || hike.createdAt;
          return hike.status === 'completed' && hasDate;
        })
        .map(hike => ({
          ...hike,
          hikeDate: new Date(hike.date || hike.createdAt)
        }))
        .sort((a, b) => b.hikeDate - a.hikeDate); // Most recent first
      
      if (completedHikes.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
      }
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      // Calculate current streak (consecutive days from today backwards)
      let checkDate = new Date(today);
      checkDate.setHours(0, 0, 0, 0); // Start of day
      
      for (let i = 0; i < completedHikes.length; i++) {
        const hikeDate = new Date(completedHikes[i].hikeDate);
        hikeDate.setHours(0, 0, 0, 0);
        
        // If this hike is from the day we're checking
        if (hikeDate.getTime() === checkDate.getTime()) {
          currentStreak++;
          tempStreak++;
          
          // Move to previous day
          checkDate.setDate(checkDate.getDate() - 1);
        }
        // If this hike is from an earlier day, we've broken the streak
        else if (hikeDate.getTime() < checkDate.getTime()) {
          break;
        }
        // If this hike is from a future day (shouldn't happen), skip it
      }
      
      // Calculate longest streak by looking at all consecutive days
      tempStreak = 1;
      longestStreak = 1;
      
      for (let i = 1; i < completedHikes.length; i++) {
        const prevHikeDate = new Date(completedHikes[i-1].hikeDate);
        const currHikeDate = new Date(completedHikes[i].hikeDate);
        
        prevHikeDate.setHours(0, 0, 0, 0);
        currHikeDate.setHours(0, 0, 0, 0);
        
        const daysDifference = Math.floor((prevHikeDate.getTime() - currHikeDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // If hikes are on consecutive days, continue streak
        if (daysDifference === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1; // Reset streak
        }
      }
      
      return { currentStreak, longestStreak };
    } catch (error) {
      throw new Error('Failed to calculate streaks');
    }
  },

  // Get hike statistics for a user
  async getUserHikeStats(userId) {
    try {
      const hikes = await this.getUserHikes(userId);
      
      // Calculate streaks
      const { currentStreak, longestStreak } = this.calculateStreaks(hikes);
      
      const stats = {
        totalHikes: hikes.length,
        totalDistance: hikes.reduce((sum, hike) => sum + this.parseDistance(hike.distance), 0),
        totalElevation: hikes.reduce((sum, hike) => sum + this.parseElevation(hike.elevation), 0),
        totalDuration: hikes.reduce((sum, hike) => sum + this.parseDuration(hike.duration), 0),
        currentStreak,
        longestStreak,
        byDifficulty: {
          Easy: hikes.filter(h => h.difficulty === 'Easy').length,
          Moderate: hikes.filter(h => h.difficulty === 'Moderate').length,
          Hard: hikes.filter(h => h.difficulty === 'Hard').length,
          Extreme: hikes.filter(h => h.difficulty === 'Extreme').length
        },
        byStatus: {
          completed: hikes.filter(h => h.status === 'completed').length,
          active: hikes.filter(h => h.status === 'active').length,
          paused: hikes.filter(h => h.status === 'paused').length
        }
      };
      
      return stats;
    } catch (error) {
      throw new Error(`Failed to get hike stats: ${error.message}`);
    }
  },

  // Delete user and all their data
  async deleteUser(userId) {
    try {
      // Delete all hikes first
      const db = getDatabase();
      const hikesSnapshot = await db
        .collection('users')
        .doc(userId)
        .collection('hikes')
        .get();
      
      const deletePromises = hikesSnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
      
      // Delete the user document
      await db.collection('users').doc(userId).delete();
      
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
};
