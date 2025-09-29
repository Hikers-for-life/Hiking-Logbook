import { db } from './firebase.js';
import { evaluateAndAwardBadges } from '../services/badgeService.js';

// Database utilities for comprehensive hike management

export const collections = {
  USERS: 'users',
  HIKES: 'hikes',
  TRAILS: 'trails',
  ACHIEVEMENTS: 'achievements',
};
export const dbUtils = {
  // Helper: return db & FieldValue
  getDb() {
    return db;
  },

  _FieldValue() {
    const db = this.getDb();
    // Firestore libs sometimes expose FieldValue differently; attempt both
    return db.FieldValue || (db.firestore && db.firestore.FieldValue) || (db.firebase && db.firebase.firestore && db.firebase.firestore.FieldValue);
  },

  // -----------------------
  // Generic Helpers
  // -----------------------
  _safeDocData(doc) {
    if (!doc) return null;
    return { id: doc.id, ...(doc.data ? doc.data() : {}) };
  },

  async _getUserProfileIfExists(userId) {
    try {
      if (!userId) return null;
      const db = this.getDb();
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) return null;
      return { id: userDoc.id, ...userDoc.data() };
    } catch (err) {
      console.warn(`_getUserProfileIfExists(${userId}) failed:`, err.message);
      return null;
    }
  },
  // -----------------------
  // Generic CRUD
  // -----------------------

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
  // -----------------------
  // Planned Hikes
  // -----------------------
  async addPlannedHike(userId, plannedHikeData) {
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
      };

      const db = this.getDb();
      const docRef = await db.collection('users').doc(userId).collection('hikes').add(mapped);

      // Re-evaluate badges/stats
      const stats = await this.getUserHikeStats(userId);
      await evaluateAndAwardBadges(userId, stats).catch(e => console.warn('Badge eval failed:', e.message));

      return { success: true, id: docRef.id };
    } catch (err) {
      throw new Error(`addHike failed: ${err.message}`);
    }
  },

  async addPlannedHike(userId, plannedHikeData) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const mapped = {
        title: plannedHikeData.title || '',
        date: plannedHikeData.date || new Date(),
        startTime: plannedHikeData.startTime || null,
        location: plannedHikeData.location || '',
        distance: plannedHikeData.distance || '',
        difficulty: plannedHikeData.difficulty || 'Easy',
        description: plannedHikeData.description || '',
        notes: plannedHikeData.notes || '',
        status: 'planning',
        participants: plannedHikeData.participants || [userId],
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        maxParticipants: plannedHikeData.maxParticipants || 10
      };

      const db = this.getDb();
      const docRef = await db.collection('users').doc(userId).collection('plannedHikes').add(mapped);

      // Re-evaluate badges/stats
      const stats = await this.getUserHikeStats(userId);
      await evaluateAndAwardBadges(userId, stats).catch(e => console.warn('Badge eval failed:', e.message));

      return { success: true, id: docRef.id };
    } catch (err) {
      throw new Error(`addPlannedHike failed: ${err.message}`);
    }
  },

  async getUserPlannedHikes(userId, filters = {}) {
    try {
      const db = this.getDb();
      let query = db.collection('users').doc(userId).collection('plannedHikes').orderBy('date', 'asc');
      const snapshot = await query.get();
      const planned = [];
      snapshot.forEach(d => planned.push({ id: d.id, ...d.data() }));

      // apply simple js filters (keeps query simple, avoids composite index needs)
      let result = planned;
      if (!filters.includeCancelled) result = result.filter(h => h.status !== 'cancelled');
      if (filters.status) result = result.filter(h => h.status === filters.status);
      if (filters.difficulty) result = result.filter(h => h.difficulty === filters.difficulty);
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        result = result.filter(h => (h.date && new Date(h.date) >= from));
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        result = result.filter(h => (h.date && new Date(h.date) <= to));
      }
      return result;
    } catch (err) {
      throw new Error(`getUserPlannedHikes failed: ${err.message}`);
    }
  },

  async getPlannedHike(userId, plannedHikeId) {
    try {
      const db = this.getDb();
      const doc = await db.collection('users').doc(userId).collection('plannedHikes').doc(plannedHikeId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (err) {
      throw new Error(`getPlannedHike failed: ${err.message}`);
    }
  },

  async updatePlannedHike(userId, plannedHikeId, updateData) {
    try {
      const db = this.getDb();
      await db.collection('users').doc(userId).collection('plannedHikes').doc(plannedHikeId).update({
        ...updateData,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (err) {
      throw new Error(`updatePlannedHike failed: ${err.message}`);
    }
  },

  async deletePlannedHike(userId, plannedHikeId) {
    try {
      const db = this.getDb();
      await db.collection('users').doc(userId).collection('plannedHikes').doc(plannedHikeId).delete();
      return { success: true };
    } catch (err) {
      throw new Error(`deletePlannedHike failed: ${err.message}`);
    }
  },

   // GEAR CHECKLIST METHODS
  // Get user's gear checklist
  async getUserGearChecklist(userId) {
    try {
      const doc = await this.getDb().collection('users').doc(userId).get();
      
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
      const userDoc = await this.getDb().collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        // Create user profile with gear checklist
        await this.createUserProfile(userId, {
          gearChecklist: gearItems
        });
      } else {
        // Update existing user profile
        await this.getDb()
          .collection('users')
          .doc(userId)
          .update({
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
  },

  // -----------------------
  // Hikes (core)
  // -----------------------
  _mapHikeDoc(doc) {
    const data = doc.data ? doc.data() : doc;
    const mapped = {
      id: doc.id || data.id,
      title: data.title || data.trailName || 'Untitled Hike',
      location: data.location || '',
      route: data.route || data.trailName || '',
      date: data.date || data.createdAt || null,
      startTime: data.startTime || data.actualStartTime || null,
      endTime: data.endTime || null,
      duration: data.duration || 0,
      distance: data.distance || '',
      elevation: data.elevation || 0,
      difficulty: data.difficulty || 'Easy',
      weather: data.weather || '',
      notes: data.notes || data.description || '',
      photos: data.photos || data.photo || 0,
      waypoints: data.waypoints || [],
      status: data.status || 'completed',
      pinned: !!data.pinned,
      shared: !!data.shared,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      userId: data.userId || null,
      createdBy: data.createdBy || data.userId || null,
      plannedHikeId: data.plannedHikeId || null
    };

    return mapped;
  },

  async addHike(userId, hikeData) {
    try {
      const mapped = {
        title: hikeData.title || hikeData.trailName || '',
        location: hikeData.location || '',
        route: hikeData.route || hikeData.trailName || '',
        date: hikeData.date || new Date(),
        startTime: hikeData.startTime || null,
        actualStartTime: hikeData.actualStartTime || null,
        endTime: hikeData.endTime || null,
        duration: hikeData.duration || 0,
        distance: hikeData.distance || hikeData.distanceKm || '',
        elevation: hikeData.elevation || 0,
        difficulty: hikeData.difficulty || 'Easy',
        weather: hikeData.weather || '',
        notes: hikeData.notes || hikeData.description || '',
        photos: hikeData.photos || hikeData.photo || 0,
        waypoints: hikeData.waypoints || [],
        gpsTrack: hikeData.gpsTrack || [],
        plannedHikeId: hikeData.plannedHikeId || null,
        status: hikeData.status || 'completed',
        pinned: !!hikeData.pinned,
        shared: !!hikeData.shared,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId
      };

      const db = this.getDb();
      const docRef = await db.collection('users').doc(userId).collection('hikes').add(mapped);

      // re-evaluate badges/stats after adding
      const stats = await this.getUserHikeStats(userId);
      await evaluateAndAwardBadges(userId, stats).catch(e => console.warn('Badge eval failed:', e.message));

      return { success: true, id: docRef.id };
    } catch (err) {
      throw new Error(`addHike failed: ${err.message}`);
    }
  },

  async startHike(userId, hikeData) {
    try {
      const mapped = {
        ...hikeData,
        status: 'active',
        date: hikeData.date || new Date(),
        actualStartTime: new Date(),
        startTime: hikeData.startTime || new Date(),
        pinned: !!hikeData.pinned,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        waypoints: hikeData.waypoints || [],
        gpsTrack: hikeData.gpsTrack || [],
        plannedHikeId: hikeData.plannedHikeId || null
      };

      const db = this.getDb();
      const docRef = await db.collection('users').doc(userId).collection('hikes').add(mapped);
      return { success: true, id: docRef.id };
    } catch (err) {
      throw new Error(`startHike failed: ${err.message}`);
    }
  },

  async completeHike(userId, hikeId, endData) {
    try {
      const update = {
        status: 'completed',
        endTime: endData.endTime || new Date(),
        duration: endData.duration || endData.duration || 0,
        distance: endData.distance || endData.distance || undefined,
        elevation: endData.elevation || endData.elevation || undefined,
        weather: endData.weather || undefined,
        notes: endData.notes || undefined,
        endLocation: endData.endLocation || null,
        photos: endData.photos || undefined,
        updatedAt: new Date()
      };

      // remove undefined fields for patch-like update
      Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

      const db = this.getDb();
      await db.collection('users').doc(userId).collection('hikes').doc(hikeId).update(update);

      // Re-evaluate badges
      const stats = await this.getUserHikeStats(userId);
      await evaluateAndAwardBadges(userId, stats).catch(e => console.warn('Badge eval failed:', e.message));

      return { success: true };
    } catch (err) {
      throw new Error(`completeHike failed: ${err.message}`);
    }
  },

  async addWaypoint(userId, hikeId, waypoint) {
    try {
      const FieldValue = this._FieldValue();
      if (!FieldValue) throw new Error('FieldValue not available on Firestore instance');
      const waypointData = {
        latitude: waypoint.latitude,
        longitude: waypoint.longitude,
        elevation: waypoint.elevation || 0,
        timestamp: waypoint.timestamp || new Date(),
        description: waypoint.description || '',
        type: waypoint.type || 'milestone'
      };

      const db = this.getDb();
      await db.collection('users').doc(userId).collection('hikes').doc(hikeId).update({
        waypoints: FieldValue.arrayUnion(waypointData),
        updatedAt: new Date()
      });
      return { success: true };
    } catch (err) {
      throw new Error(`addWaypoint failed: ${err.message}`);
    }
  },



  // Create user profile
  async createUserProfile(userId, profileData) {
    try {
      const db = this.getDb();
      await db
        .collection('users')
        .doc(userId)
        .set({
          ...profileData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      return { success: true };
    } catch (err) {
      throw new Error(`createUserProfile failed: ${err.message}`);
    }
  },


  // Get user hiking statistics
  async getUserHikes(userId, filters = {}) {
    try {
      const db = this.getDb();
      let query = db.collection('users').doc(userId).collection('hikes');

      if (filters.status) query = query.where('status', '==', filters.status);
      if (filters.difficulty) query = query.where('difficulty', '==', filters.difficulty);
      if (filters.dateFrom) query = query.where('date', '>=', filters.dateFrom);
      if (filters.dateTo) query = query.where('date', '<=', filters.dateTo);
      if (filters.pinned !== undefined) query = query.where('pinned', '==', filters.pinned);

      // avoid composite index needs where possible
      if (filters.pinned === undefined && filters.difficulty === undefined) {
        query = query.orderBy('createdAt', 'desc');
      }

      const snapshot = await query.get();
      const hikes = [];
      snapshot.forEach(doc => hikes.push(this._mapHikeDoc(doc)));

      if (filters.search) {
        const term = filters.search.toLowerCase();
        return hikes.filter(h => (h.title || '').toLowerCase().includes(term) || (h.location || '').toLowerCase().includes(term) || (h.notes || '').toLowerCase().includes(term));
      }

      // If we used filters requiring client-side sort, sort by createdAt descending
      if (filters.pinned !== undefined || filters.difficulty !== undefined) {
        hikes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return hikes;
    } catch (err) {
      throw new Error(`getUserHikes failed: ${err.message}`);
    }
  },

  async getHike(userId, hikeId) {
    try {
      const db = this.getDb();
      const doc = await db.collection('users').doc(userId).collection('hikes').doc(hikeId).get();
      if (!doc.exists) return null;

      const mapped = this._mapHikeDoc(doc);

      // Attach owner's profile (userName, userAvatar) to guarantee feed displays proper name/avatar
      let ownerProfile = null;
      if (mapped.userId) {
        ownerProfile = await this._getUserProfileIfExists(mapped.userId);
      } else {
        // If userId missing, try to read createdBy or fallback to user profile of requestor (best-effort)
        ownerProfile = await this._getUserProfileIfExists(userId);
      }

      return {
        ...mapped,
        userName: ownerProfile?.displayName || ownerProfile?.name || ownerProfile?.email?.split?.('@')?.[0] || 'Unknown',
        userAvatar: ownerProfile?.avatar || (ownerProfile?.displayName ? ownerProfile.displayName[0].toUpperCase() : (ownerProfile?.email ? ownerProfile.email[0].toUpperCase() : 'U'))
      };
    } catch (err) {
      throw new Error(`getHike failed: ${err.message}`);
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

  // Helper function to parse elevation string (e.g., '2,400m' -> 2400)
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
    const match = elevationStr.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  },

  // Helper function to parse duration string (e.g., '2h 30m' -> 150 minutes)
  parseDuration(durationStr) {
    if (!durationStr) return 0;

    // If it's already a number, return it
    if (typeof durationStr === 'number') return durationStr;

    // If it's not a string, return 0
    if (typeof durationStr !== 'string') return 0;

    // Extract hours and minutes from string like '2h 30m' or '2:30'
    const hourMatch = durationStr.match(/(\d+)h/);
    const minuteMatch = durationStr.match(/(\d+)m/);
    const colonMatch = durationStr.match(/(\d+):(\d+)/);

    let totalMinutes = 0;

    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1]) * 60;
    }

    if (minuteMatch) {
      totalMinutes += parseInt(minuteMatch[1]);
    }

    if (colonMatch) {
      totalMinutes += parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2]);
    }

    // If no patterns matched, try to extract just a number
    if (totalMinutes === 0) {
      const numberMatch = durationStr.match(/(\d+(?:\.\d+)?)/);
      if (numberMatch) {
        totalMinutes = parseFloat(numberMatch[1]);
      }
    }

    return totalMinutes;
  },

  async updateHike(userId, hikeId, hikeData) {
    try {
      const updateData = { ...hikeData, updatedAt: new Date() };
      const db = this.getDb();
      await db.collection('users').doc(userId).collection('hikes').doc(hikeId).update(updateData);

      // Re-evaluate badges
      const stats = await this.getUserHikeStats(userId);
      await evaluateAndAwardBadges(userId, stats).catch(e => console.warn('Badge eval failed:', e.message));

      return { success: true };
    } catch (err) {
      throw new Error(`updateHike failed: ${err.message}`);
    }
  },

  async deleteHike(userId, hikeId) {
    try {
      const db = this.getDb();

      // Try direct doc deletion first (normal case)
      const docRef = db.collection('users').doc(userId).collection('hikes').doc(hikeId);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        await docRef.delete();
        return { success: true };
      }

      // Fallback: iterate collection to find mismatched id stored in data.id (robust for malformed data)
      const snapshot = await db.collection('users').doc(userId).collection('hikes').get();
      let found = null;
      snapshot.forEach(d => {
        const data = d.data();
        if (d.id === hikeId || data.id === hikeId) {
          found = d;
        }
      });

      if (found) {
        await found.ref.delete();
        return { success: true };
      }

      throw new Error('Hike not found');
    } catch (err) {
      throw new Error(`deleteHike failed: ${err.message}`);
    }
  },

  // -----------------------
  // Stats & Profile
  // -----------------------
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


  // Get global statistics across all users (for public API)
  async getGlobalStats() {
    try {
      const db = this.getDb();
      const usersSnapshot = await db.collection('users').get();

      let totalUsers = 0;
      let totalHikes = 0;
      let totalDistance = 0;
      let totalElevation = 0;
      let totalDuration = 0;
      const locations = new Set();
      const allHikes = [];

      // Get all hikes from all users
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const hikesSnapshot = await db.collection('users').doc(userId).collection('hikes').get();

        hikesSnapshot.forEach(hikeDoc => {
          const hike = { id: hikeDoc.id, ...hikeDoc.data() };
          allHikes.push(hike);

          // parse numbers safely
          const distMatch = (hike.distance || '').toString().match(/(\d+(?:\.\d+)?)/);
          if (distMatch) totalDistance += parseFloat(distMatch[1]);

          const elevMatch = (hike.elevation || '').toString().match(/(\d+(?:\.\d+)?)/);
          if (elevMatch) totalElevation += parseFloat(elevMatch[1]);

          const durMatch = (hike.duration || '').toString().match(/(\d+(?:\.\d+)?)/);
          if (durMatch) totalDuration += parseFloat(durMatch[1]);

          if (hike.location) {
            const parts = hike.location.split(',').map(p => p.trim());
            if (parts.length > 0) locations.add(parts[parts.length - 1]);
          }
        });

        totalUsers++;
      }

      totalHikes = allHikes.length;

      // streaks
      const { currentStreak, longestStreak } = this.calculateStreaks(allHikes);

      return {
        totalUsers,
        totalHikes,
        totalDistance: Math.round(totalDistance * 10) / 10,
        totalElevation: Math.round(totalElevation),
        totalDuration: Math.round(totalDuration),
        statesExplored: locations.size,
        currentStreak,
        longestStreak
      };
    } catch (err) {
      throw new Error(`getGlobalStats failed: ${err.message}`);
    }
  },

  calculateStreaks(hikes = []) {
    try {
      const completed = hikes
        .filter(h => h.status === 'completed' && (h.date || h.createdAt))
        .map(h => ({ ...h, hikeDate: new Date(h.date || h.createdAt) }))
        .sort((a, b) => b.hikeDate - a.hikeDate);

      if (completed.length === 0) return { currentStreak: 0, longestStreak: 0 };

      let current = 0;
      let longest = 1;
      let temp = 1;

      // current streak (from today backwards)
      const today = new Date(); today.setHours(0, 0, 0, 0);
      let pointer = new Date(today);
      for (let i = 0; i < completed.length; i++) {
        const d = new Date(completed[i].hikeDate); d.setHours(0, 0, 0, 0);
        if (d.getTime() === pointer.getTime()) {
          current++;
          pointer.setDate(pointer.getDate() - 1);
        } else if (d.getTime() < pointer.getTime()) {
          break;
        }
      }

      // longest streak
      for (let i = 1; i < completed.length; i++) {
        const prev = new Date(completed[i - 1].hikeDate); prev.setHours(0, 0, 0, 0);
        const curr = new Date(completed[i].hikeDate); curr.setHours(0, 0, 0, 0);
        const deltaDays = Math.round((prev - curr) / (1000 * 60 * 60 * 24));
        if (deltaDays === 1) {
          temp++;
          longest = Math.max(longest, temp);
        } else {
          temp = 1;
        }
      }

      return { currentStreak: current, longestStreak: longest };
    } catch (err) {
      console.warn('calculateStreaks error:', err.message);
      return { currentStreak: 0, longestStreak: 0 };
    }
  },

  async getUserProfile(userId) {
    try {
      const db = this.getDb();
      const doc = await db.collection('users').doc(userId).get();
      if (!doc.exists) return null;
      const data = doc.data();
      return {
        id: doc.id,
        displayName: data.displayName || data.name || data.email?.split?.('@')?.[0] || '',
        avatar: data.avatar || data.photoURL || (data.displayName ? data.displayName[0].toUpperCase() : (data.email ? data.email[0].toUpperCase() : 'U')),
        ...data
      };
    } catch (err) {
      throw new Error(`getUserProfile failed: ${err.message}`);
    }
  },

  async createUserProfile(userId, profileData) {
    try {
      const db = this.getDb();
      await db.collection('users').doc(userId).set({
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true };
    } catch (err) {
      throw new Error(`createUserProfile failed: ${err.message}`);
    }
  },

  async updateUserProfile(userId, profileData) {
    try {
      const db = this.getDb();
      await db.collection('users').doc(userId).update({
        ...profileData,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (err) {
      throw new Error(`updateUserProfile failed: ${err.message}`);
    }
  },

  // -----------------------
  // Cleanup / Admin
  // -----------------------
  async deleteUser(userId) {
    try {
      const db = this.getDb();

      // delete hikes
      const hikesSnap = await db.collection('users').doc(userId).collection('hikes').get();
      const hikeDeletes = hikesSnap.docs.map(d => d.ref.delete());
      await Promise.all(hikeDeletes);

      // delete planned hikes
      const plannedSnap = await db.collection('users').doc(userId).collection('plannedHikes').get();
      const plannedDeletes = plannedSnap.docs.map(d => d.ref.delete());
      await Promise.all(plannedDeletes);

      // delete user doc
      await db.collection('users').doc(userId).delete();
      return { success: true };
    } catch (err) {
      throw new Error(`deleteUser failed: ${err.message}`);
    }
  }

};

export default dbUtils;
