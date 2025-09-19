import { getDatabase } from './firebase.js';

// Database utilities for comprehensive hike management
export const dbUtils = {
  // Helper method to get database instance
  getDb() {
    return getDatabase();
  },
  // Add a new hike with comprehensive data
  async addHike(userId, hikeData) {
    try {

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
        photos: hikeData.photos || 0,
        
        // GPS and tracking
        waypoints: hikeData.waypoints || [],
        startLocation: hikeData.startLocation || null,
        endLocation: hikeData.endLocation || null,
        routeMap: hikeData.routeMap || '',
        gpsTrack: hikeData.gpsTrack || [],
        
        // Metadata
        status: hikeData.status || 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId
      };

      const docRef = await this.getDb()
        .collection('users')
        .doc(userId)
        .collection('hikes')
        .add(mappedHikeData);
        
      return { success: true, id: docRef.id };

    } catch (error) {
      throw new Error(`Failed to add hike: ${error.message}`);
    }
  },

  // Get all hikes for a user with optional filtering
  async getUserHikes(userId, filters = {}) {
    try {
      let query = this.getDb()
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
      
      // Order by createdAt (newest first) 
      query = query.orderBy('createdAt', 'desc');
      
      const snapshot = await query.get();
      
      const hikes = [];
      snapshot.forEach(doc => {
        hikes.push({ id: doc.id, ...doc.data() });
      });
      
      return hikes;
    } catch (error) {
      throw new Error(`Failed to get user hikes: ${error.message}`);
    }
  },

  // Get a specific hike by ID
  async getHike(userId, hikeId) {
    try {
      const doc = await this.getDb()
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
      

      await this.getDb()
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
      const snapshot = await this.getDb()
        .collection('users')
        .doc(userId)
        .collection('hikes')
        .get();
      
      let targetDoc = null;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        // Match by document ID 
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
      console.error(`DB: Failed to delete hike ${hikeId}:`, error.message);
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
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId,
        waypoints: [],
        gpsTrack: []
      };

      const docRef = await this.getDb()
        .collection('users')
        .doc(userId)
        .collection('hikes')
        .add(activeHikeData);
        
      return { success: true, id: docRef.id };
    } catch (error) {
      throw new Error(`Failed to start hike: ${error.message}`);
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

      await this.getDb()
        .collection('users')
        .doc(userId)
        .collection('hikes')
        .doc(hikeId)
        .update(completionData);
        

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to complete hike: ${error.message}`);
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {

      const doc = await this.getDb().collection('users').doc(userId).get();
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
      await this.getDb()
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

  // Update user profile
  async updateUserProfile(userId, profileData) {
    try {
      await this.getDb()
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

  // Get hike statistics for a user
  async getUserHikeStats(userId) {
    try {
      const hikes = await this.getUserHikes(userId);
      
      const stats = {
        totalHikes: hikes.length,
        totalDistance: hikes.reduce((sum, hike) => sum + (hike.distance || 0), 0),
        totalElevation: hikes.reduce((sum, hike) => sum + (hike.elevation || 0), 0),
        totalDuration: hikes.reduce((sum, hike) => sum + (hike.duration || 0), 0),
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
      const hikesSnapshot = await this.getDb()
        .collection('users')
        .doc(userId)
        .collection('hikes')
        .get();
      
      const deletePromises = hikesSnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
      
      // Delete the user document
      await this.getDb().collection('users').doc(userId).delete();
      
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
};

