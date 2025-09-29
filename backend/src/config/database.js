import { getDatabase } from './firebase.js';
import { evaluateAndAwardBadges } from '../services/badgeService.js';


import { db } from './firebase.js';

// Database utilities for comprehensive hike management

export const collections = {
  USERS: 'users',
  HIKES: 'hikes',
  TRAILS: 'trails',
  ACHIEVEMENTS: 'achievements',
};
export const dbUtils = {
  // Helper method to get database instance
  getDb() {
    return getDatabase();
  },


  async create(collection, docId, data) {
    try {
      await db
        .collection(collection)
        .doc(docId)
        .set({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      return { success: true, id: docId };
    } catch (error) {
      throw new Error(`Failed to create document: ${error.message}`);
    }
  },

  async getById(collection, docId) {
    try {
      const doc = await db.collection(collection).doc(docId).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to get document: ${error.message}`);
    }
  },
  async update(collection, docId, data) {
    try {
      await db
        .collection(collection)
        .doc(docId)
        .update({
          ...data,
          updatedAt: new Date(),
        });
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }
  },

  async query(collection, conditions = []) {
    try {
      let query = db.collection(collection);

      conditions.forEach(({ field, operator, value }) => {
        query = query.where(field, operator, value);
      });

      const snapshot = await query.get();
      const docs = [];

      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });

      return docs;
    } catch (error) {
      throw new Error(`Failed to query documents: ${error.message}`);
    }
  },



  // Add a new hike with comprehensive data
  
      //const db = getDatabase();

// Database utilities for hike management

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
        date: hikeData.date ? (typeof hikeData.date === 'string' ? new Date(hikeData.date) : hikeData.date) : new Date(),
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
      
      // Apply search filter on the client side 
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
        date: endData.date || new Date().toISOString(), // Update the date field
        endTime: endData.endTime || new Date(),
        duration: endData.duration || 0,
        endLocation: endData.endLocation || null,
        // Add missing fields that were being lost
        elevation: endData.elevation || 0,
        distance: endData.distance || 0,
        waypoints: endData.waypoints || [],
        notes: endData.notes || '',
        weather: endData.weather || '',
        difficulty: endData.difficulty || 'Easy',
        title: endData.title || '',
        location: endData.location || '',
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
    if (!distanceStr) return 0;
    
    // If it's already a number, return it
    if (typeof distanceStr === 'number') return distanceStr;
    
    // If it's not a string, return 0
    if (typeof distanceStr !== 'string') return 0;
    
    // Clean up the string - remove extra text and get the first valid number
    // Handle cases like "04.1 miles000.0 miles05km205km220" by extracting the first number
    const cleanStr = distanceStr.replace(/[^\d.,]/g, ' ').trim();
    const numbers = cleanStr.split(/\s+/).filter(n => n && !isNaN(parseFloat(n)));
    
    if (numbers.length > 0) {
      return parseFloat(numbers[0]);
    }
    
    // Fallback to original regex method
    const match = distanceStr.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  },

  // Helper function to parse elevation string (e.g., "2,400m" -> 2400)
  parseElevation(elevationStr) {
    if (!elevationStr) return 0;
    
    // If it's already a number, return it
    if (typeof elevationStr === 'number') return elevationStr;
    
    // If it's not a string, return 0
    if (typeof elevationStr !== 'string') return 0;
    
    // Clean up the string - remove extra text and get the first valid number
    const cleanStr = elevationStr.replace(/[^\d.,]/g, ' ').trim();
    const numbers = cleanStr.split(/\s+/).filter(n => n && !isNaN(parseFloat(n.replace(/,/g, ''))));
    
    if (numbers.length > 0) {
      return parseFloat(numbers[0].replace(/,/g, ''));
    }
    
    // Fallback to original regex method
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
  },

  // Get global statistics across all users (for public API)
  async getGlobalStats() {
    try {
      const db = getDatabase();
      const usersSnapshot = await db.collection('users').get();
      
      let totalUsers = 0;
      let totalHikes = 0;
      let totalDistance = 0;
      let totalElevation = 0;
      const monthlyActivity = {};
      const popularDifficulties = { Easy: 0, Moderate: 0, Hard: 0 };
      
      for (const userDoc of usersSnapshot.docs) {
        totalUsers++;
        const userId = userDoc.id;
        
        // Get user's hikes
        const hikesSnapshot = await db
          .collection('users')
          .doc(userId)
          .collection('hikes')
          .get();
          
        for (const hikeDoc of hikesSnapshot.docs) {
          const hike = hikeDoc.data();
          totalHikes++;
          
          // Parse distance and elevation properly
          const distance = this.parseDistance(hike.distance);
          const elevation = this.parseElevation(hike.elevation);
          
          totalDistance += distance;
          totalElevation += elevation;
          
          // Count difficulties
          const difficulty = hike.difficulty || 'Easy';
          if (popularDifficulties.hasOwnProperty(difficulty)) {
            popularDifficulties[difficulty]++;
          }
          
          // Monthly activity - handle date parsing more robustly
          let hikeDate = null;
          try {
            if (hike.date?.toDate) {
              hikeDate = hike.date.toDate();
            } else if (hike.date) {
              hikeDate = new Date(hike.date);
            } else if (hike.createdAt?.toDate) {
              hikeDate = hike.createdAt.toDate();
            } else if (hike.createdAt) {
              hikeDate = new Date(hike.createdAt);
            }
          } catch (dateError) {
            console.warn('Invalid date for hike:', hikeDoc.id, dateError.message);
            continue; // Skip this hike if date is invalid
          }
          
          if (hikeDate && !isNaN(hikeDate.getTime())) {
            const monthKey = `${hikeDate.getFullYear()}-${String(hikeDate.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyActivity[monthKey]) {
              monthlyActivity[monthKey] = { month: monthKey, hikes: 0, distance: 0 };
            }
            monthlyActivity[monthKey].hikes++;
            monthlyActivity[monthKey].distance += distance;
          }
        }
      }
      
      return {
        totalUsers,
        totalHikes,
        totalDistance: Math.round(totalDistance * 100) / 100, // Round to 2 decimals
        totalElevation: Math.round(totalElevation),
        monthlyActivity: Object.values(monthlyActivity).sort((a, b) => a.month.localeCompare(b.month)),
        popularDifficulties
      };
    } catch (error) {
      throw new Error(`Failed to get global stats: ${error.message}`);
    }
  },

  // Get popular hiking locations (for public API)
  async getPopularLocations() {
    try {
      const db = getDatabase();
      const usersSnapshot = await db.collection('users').get();
      
      const locationStats = {};
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        
        // Get user's hikes
        const hikesSnapshot = await db
          .collection('users')
          .doc(userId)
          .collection('hikes')
          .get();
          
        for (const hikeDoc of hikesSnapshot.docs) {
          const hike = hikeDoc.data();
          const location = hike.location;
          
          if (location) {
            if (!locationStats[location]) {
              locationStats[location] = {
                name: location,
                region: this.extractRegion(location),
                hikesLogged: 0,
                totalDistance: 0,
                difficulties: [],
                lastHiked: null
              };
            }
            
            locationStats[location].hikesLogged++;
            locationStats[location].totalDistance += this.parseDistance(hike.distance);
            locationStats[location].difficulties.push(hike.difficulty || 'Easy');
            
            // Handle date parsing more robustly
            let hikeDate = null;
            try {
              if (hike.date?.toDate) {
                hikeDate = hike.date.toDate();
              } else if (hike.date) {
                hikeDate = new Date(hike.date);
              } else if (hike.createdAt?.toDate) {
                hikeDate = hike.createdAt.toDate();
              } else if (hike.createdAt) {
                hikeDate = new Date(hike.createdAt);
              }
            } catch (dateError) {
              console.warn('Invalid date for hike in location stats:', hikeDoc.id, dateError.message);
            }
            
            if (hikeDate && !isNaN(hikeDate.getTime()) && (!locationStats[location].lastHiked || hikeDate > locationStats[location].lastHiked)) {
              locationStats[location].lastHiked = hikeDate;
            }
          }
        }
      }
      
      // Process and sort locations
      const locations = Object.values(locationStats)
        .map(loc => ({
          name: loc.name,
          region: loc.region,
          hikesLogged: loc.hikesLogged,
          averageDifficulty: this.getMostCommonDifficulty(loc.difficulties),
          averageDistance: Math.round((loc.totalDistance / loc.hikesLogged) * 100) / 100,
          lastHiked: loc.lastHiked?.toISOString() || null
        }))
        .sort((a, b) => b.hikesLogged - a.hikesLogged)
        .slice(0, 20); // Top 20 locations
        
      return locations;
    } catch (error) {
      throw new Error(`Failed to get popular locations: ${error.message}`);
    }
  },

  // Helper function to extract region from location string
  extractRegion(location) {
    // Simple region extraction - you can make this more sophisticated
    const parts = location.split(',');
    return parts.length > 1 ? parts[parts.length - 1].trim() : 'Unknown';
  },

  // Helper function to get most common difficulty
  getMostCommonDifficulty(difficulties) {
    const counts = {};
    difficulties.forEach(d => counts[d] = (counts[d] || 0) + 1);
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'Easy');
  },

  // Add external hike (for public API submissions)
  async addExternalHike(hikeData) {
    try {
      const db = getDatabase();
      
      // Create a special collection for external hikes
      const externalHikeData = {
        ...hikeData,
        source: 'external_api',
        createdAt: new Date(),
        updatedAt: new Date(),
        verified: false // Mark as unverified until reviewed
      };
      
      const docRef = await db
        .collection('external_hikes')
        .add(externalHikeData);
        
      return { success: true, id: docRef.id };
    } catch (error) {
      throw new Error(`Failed to add external hike: ${error.message}`);
    }
  },

  // PLANNED HIKES METHODS
  // Add a new planned hike
  async addPlannedHike(userId, plannedHikeData) {
    try {
      // Map and validate the planned hike data with updated schema
      const mappedPlannedHikeData = {
        title: plannedHikeData.title || '',
        date: plannedHikeData.date || new Date(),
        startTime: plannedHikeData.startTime || '', // New field
        location: plannedHikeData.location || '',
        distance: plannedHikeData.distance || '',
        difficulty: plannedHikeData.difficulty || 'Easy',
        description: plannedHikeData.description || '',
        notes: plannedHikeData.notes || '',
        
        // Additional metadata
        status: 'planning', // Default status
        participants: [userId], // Creator is automatically a participant
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId
      };

      const db = getDatabase();
      const docRef = await db
        .collection('users')
        .doc(userId)
        .collection('plannedHikes')
        .add(mappedPlannedHikeData);
        
      // After saving hike, evaluate badges
      const stats = await this.getUserHikeStats(userId);
      await evaluateAndAwardBadges(userId, stats);

      return { success: true, id: docRef.id };

    } catch (error) {
      throw new Error(`Failed to add planned hike: ${error.message}`);
    }
  },

  // Get a specific planned hike by ID
  async getPlannedHike(userId, plannedHikeId) {
    try {
      const doc = await getDatabase()
        .collection('users')
        .doc(userId)
        .collection('plannedHikes')
        .doc(plannedHikeId)
        .get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to get planned hike: ${error.message}`);
    }
  },

  // Update a planned hike
  async updatePlannedHike(userId, plannedHikeId, plannedHikeData) {
    try {
      const updateData = {
        ...plannedHikeData,
        updatedAt: new Date()
      };

      await getDatabase()
        .collection('users')
        .doc(userId)
        .collection('plannedHikes')
        .doc(plannedHikeId)
        .update(updateData);

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update planned hike: ${error.message}`);
    }
  },

  // Delete a planned hike
  async deletePlannedHike(userId, plannedHikeId) {
    try {
      await getDatabase()
        .collection('users')
        .doc(userId)
        .collection('plannedHikes')
        .doc(plannedHikeId)
        .delete();

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete planned hike: ${error.message}`);
    }
  },

  // Convert planned hike to active hike
  async startPlannedHike(userId, plannedHikeId) {
    try {
      const plannedHike = await this.getPlannedHike(userId, plannedHikeId);
      if (!plannedHike) {
        throw new Error('Planned hike not found');
      }

      // Create active hike from planned hike data
      const activeHikeData = {
        title: plannedHike.title,
        location: plannedHike.location,
        distance: plannedHike.distance,
        difficulty: plannedHike.difficulty,
        description: plannedHike.description,
        notes: plannedHike.notes,
        status: 'active',
        startTime: new Date(),
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId,
        waypoints: [],
        gpsTrack: [],
        plannedHikeId: plannedHikeId
      };

      const activeHikeResult = await this.addHike(userId, activeHikeData);

      // Update planned hike status
      await this.updatePlannedHike(userId, plannedHikeId, { status: 'started' });

      return activeHikeResult;
    } catch (error) {
      throw new Error(`Failed to start planned hike: ${error.message}`);
    }
  },

  // Get user's planned hikes with optional filters
  async getUserPlannedHikes(userId, filters = {}) {
    try {
      // Simple query - just get all planned hikes ordered by date
      const query = getDatabase()
        .collection('users')
        .doc(userId)
        .collection('plannedHikes')
        .orderBy('date', 'asc');
      
      const snapshot = await query.get();
      
      let plannedHikes = [];
      snapshot.forEach(doc => {
        plannedHikes.push({ id: doc.id, ...doc.data() });
      });
      
      // Apply filters in JavaScript to avoid complex Firestore indexes
      if (!filters.includeCancelled) {
        plannedHikes = plannedHikes.filter(hike => hike.status !== 'cancelled');
      }
      
      if (filters.status) {
        plannedHikes = plannedHikes.filter(hike => hike.status === filters.status);
      }
      
      if (filters.difficulty) {
        plannedHikes = plannedHikes.filter(hike => hike.difficulty === filters.difficulty);
      }
      
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        plannedHikes = plannedHikes.filter(hike => {
          const hikeDate = hike.date && hike.date._seconds 
            ? new Date(hike.date._seconds * 1000)
            : new Date(hike.date);
          return hikeDate >= dateFrom;
        });
      }
      
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        plannedHikes = plannedHikes.filter(hike => {
          const hikeDate = hike.date && hike.date._seconds 
            ? new Date(hike.date._seconds * 1000)
            : new Date(hike.date);
          return hikeDate <= dateTo;
        });
      }
      
      return plannedHikes;
    } catch (error) {
      throw new Error(`Failed to get planned hikes: ${error.message}`);
    }
  },

  // GEAR CHECKLIST METHODS (from remote branch)
  // Get user's gear checklist
  async getUserGearChecklist(userId) {
    try {
      const doc = await getDatabase().collection('users').doc(userId).get();
      
      if (!doc.exists) {
        // Return default gear checklist if user doesn't exist yet
        return [
          { item: "Hiking Boots", checked: false },
          { item: "Water (3L)", checked: false },
          { item: "Trail Snacks", checked: false },
          { item: "First Aid Kit", checked: false }
        ];
      }
      
      const userData = doc.data();
      return userData.gearChecklist || [
        { item: "Hiking Boots", checked: false },
        { item: "Water (3L)", checked: false },
        { item: "Trail Snacks", checked: false },
        { item: "First Aid Kit", checked: false }
      ];
    } catch (error) {
      throw new Error(`Failed to get gear checklist: ${error.message}`);
    }
  },

  // Update user's gear checklist
  async updateUserGearChecklist(userId, gearItems) {
    try {
      // Ensure user profile exists
      const userDoc = await getDatabase().collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        // Create user profile with gear checklist
        await getDatabase().collection('users').doc(userId).set({
          gearChecklist: gearItems,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Update existing user profile
        await getDatabase().collection('users').doc(userId).update({
          gearChecklist: gearItems,
          updatedAt: new Date()
        });
      }
      
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update gear checklist: ${error.message}`);
    }
  },

  // Add item to gear checklist
  async addGearItem(userId, newItem) {
    try {
      const currentChecklist = await this.getUserGearChecklist(userId);
      const updatedChecklist = [...currentChecklist, { item: newItem, checked: false }];
      
      await this.updateUserGearChecklist(userId, updatedChecklist);
      return { success: true, checklist: updatedChecklist };
    } catch (error) {
      throw new Error(`Failed to add gear item: ${error.message}`);
    }
  },

  // Remove item from gear checklist
  async removeGearItem(userId, itemIndex) {
    try {
      const currentChecklist = await this.getUserGearChecklist(userId);
      const updatedChecklist = currentChecklist.filter((_, index) => index !== itemIndex);
      
      await this.updateUserGearChecklist(userId, updatedChecklist);
      return { success: true, checklist: updatedChecklist };
    } catch (error) {
      throw new Error(`Failed to remove gear item: ${error.message}`);
    }
  },

  // Toggle gear item checked status
  async toggleGearItem(userId, itemIndex) {
    try {
      const currentChecklist = await this.getUserGearChecklist(userId);
      const updatedChecklist = currentChecklist.map((item, index) =>
        index === itemIndex ? { ...item, checked: !item.checked } : item
      );
      
      await this.updateUserGearChecklist(userId, updatedChecklist);
      return { success: true, checklist: updatedChecklist };
    } catch (error) {
      throw new Error(`Failed to toggle gear item: ${error.message}`);
    }
  }

};
    
