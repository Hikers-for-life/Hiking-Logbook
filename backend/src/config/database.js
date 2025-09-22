import { getDatabase } from './firebase.js';

// Database utilities for comprehensive hike management
export const dbUtils = {
  // Helper method to get database instance
  getDb() {
    return getDatabase();
  },

  //Naledi start
  // PLANNED HIKES METHODS
  // Add a new planned hike
  async addPlannedHike(userId, plannedHikeData) {
    try {
      // Map and validate the planned hike data
      const mappedPlannedHikeData = {
        title: plannedHikeData.title || '',
        date: plannedHikeData.date || new Date(),
        location: plannedHikeData.location || '',
        distance: plannedHikeData.distance || 0,
        estimatedDuration: plannedHikeData.estimatedDuration || '',
        difficulty: plannedHikeData.difficulty || 'Easy',
        maxParticipants: plannedHikeData.maxParticipants || 8,
        description: plannedHikeData.description || '',
        meetingPoint: plannedHikeData.meetingPoint || '',
        notes: plannedHikeData.notes || '',
        
        // Additional metadata
        status: 'planned',
        participants: [userId], // Creator is automatically a participant
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId
      };

      const docRef = await this.getDb()
        .collection('users')
        .doc(userId)
        .collection('plannedHikes')
        .add(mappedPlannedHikeData);
        
      return { success: true, id: docRef.id };

    } catch (error) {
      throw new Error(`Failed to add planned hike: ${error.message}`);
    }
  },

  // Get all planned hikes for a user with optional filtering
  async getUserPlannedHikes(userId, filters = {}) {
    try {
      let query = this.getDb()
        .collection('users')
        .doc(userId)
        .collection('plannedHikes');
      
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
      
      // Order by date (upcoming first)
      query = query.orderBy('date', 'asc');
      
      const snapshot = await query.get();
      
      const plannedHikes = [];
      snapshot.forEach(doc => {
        plannedHikes.push({ id: doc.id, ...doc.data() });
      });
      
      return plannedHikes;
    } catch (error) {
      throw new Error(`Failed to get user planned hikes: ${error.message}`);
    }
  },

  // Get a specific planned hike by ID
  async getPlannedHike(userId, plannedHikeId) {
    try {
      const doc = await this.getDb()
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

      await this.getDb()
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
      await this.getDb()
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

  // Join a planned hike (add participant)
  async joinPlannedHike(userId, plannedHikeId, participantId) {
    try {
      const hikeRef = this.getDb()
        .collection('users')
        .doc(userId)
        .collection('plannedHikes')
        .doc(plannedHikeId);

      const doc = await hikeRef.get();
      if (!doc.exists) {
        throw new Error('Planned hike not found');
      }

      const hikeData = doc.data();
      const participants = hikeData.participants || [];
      
      // Check if already a participant
      if (participants.includes(participantId)) {
        throw new Error('User is already a participant');
      }

      // Check if max participants reached
      if (participants.length >= hikeData.maxParticipants) {
        throw new Error('Maximum participants reached');
      }

      // Add participant
      participants.push(participantId);
      
      await hikeRef.update({
        participants: participants,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to join planned hike: ${error.message}`);
    }
  },

  // Leave a planned hike (remove participant)
  async leavePlannedHike(userId, plannedHikeId, participantId) {
    try {
      const hikeRef = this.getDb()
        .collection('users')
        .doc(userId)
        .collection('plannedHikes')
        .doc(plannedHikeId);

      const doc = await hikeRef.get();
      if (!doc.exists) {
        throw new Error('Planned hike not found');
      }

      const hikeData = doc.data();
      const participants = hikeData.participants || [];
      
      // Remove participant
      const updatedParticipants = participants.filter(id => id !== participantId);
      
      await hikeRef.update({
        participants: updatedParticipants,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to leave planned hike: ${error.message}`);
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
  //Naledi end

  // HIKES METHODS
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

  //USER PROFILE METHODS
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

      // Delete all planned hikes
      const plannedHikesSnapshot = await this.getDb()
        .collection('users')
        .doc(userId)
        .collection('plannedHikes')
        .get();
      
      const deletePlannedPromises = plannedHikesSnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePlannedPromises);
      
      // Delete the user document
      await this.getDb().collection('users').doc(userId).delete();
      
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
};

