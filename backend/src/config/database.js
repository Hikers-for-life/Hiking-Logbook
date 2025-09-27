import { getDatabase } from './firebase.js';
import { evaluateAndAwardBadges } from '../services/badgeService.js';

export const collections = {
  users: 'users',
  hikes: 'hikes',
  plannedHikes: 'plannedHikes'
};

export const dbUtils = {
  // Helper: return db & FieldValue
  getDb() {
    return getDatabase();
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


  // -----------------------
  // Planned Hikes
  // -----------------------
  async addPlannedHike(userId, plannedHikeData) {
    try {
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
      let totalDistance = 0;
      let totalElevation = 0;
      let totalDuration = 0;
      const locations = new Set();

      hikes.forEach(h => {
        // parse numbers safely
        const distMatch = (h.distance || '').toString().match(/(\d+(?:\.\d+)?)/);
        if (distMatch) totalDistance += parseFloat(distMatch[1]);

        const elevMatch = (h.elevation || '').toString().match(/(\d+(?:\.\d+)?)/);
        if (elevMatch) totalElevation += parseFloat(elevMatch[1]);

        const durMatch = (h.duration || '').toString().match(/(\d+(?:\.\d+)?)/);
        if (durMatch) totalDuration += parseFloat(durMatch[1]);

        if (h.location) {
          const parts = h.location.split(',').map(p => p.trim());
          if (parts.length > 0) locations.add(parts[parts.length - 1]);
        }
      });

      // streaks
      const { currentStreak, longestStreak } = this.calculateStreaks(hikes);

      return {
        totalHikes: hikes.length,
        totalDistance: Math.round(totalDistance * 10) / 10,
        totalElevation: Math.round(totalElevation),
        totalDuration: Math.round(totalDuration),
        statesExplored: locations.size,
        currentStreak,
        longestStreak
      };
    } catch (err) {
      throw new Error(`getUserHikeStats failed: ${err.message}`);
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
