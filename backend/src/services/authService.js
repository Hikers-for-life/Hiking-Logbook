

import { getAuth } from '../config/firebase.js';
import { dbUtils } from '../config/database.js';

import { auth, db } from '../config/firebase.js';
import {collections,  dbUtils } from '../config/database.js';




export class AuthService {
  // Create a new user account
  static async createUser(userData) {
    //const auth = getAuth();//ANNAH HERE
    try {
      
      const { email, password, displayName, bio, location } = userData;

      // Create user in Firebase Authentication
      const userRecord = await auth.createUser({
        email,
        password,
        displayName,
        emailVerified: false,
      });

      // Create user profile in Firestore
      const profileData = {
        uid: userRecord.uid,
        email,
        displayName,
        bio: bio || '',
        location: location || null,
        photoURL: '',
        friends: [],     // ✅ initialize
        trails: [],    
        preferences: {
          difficulty: 'beginner',
          terrain: 'mixed',
          distance: 'short',
        },
        stats: {
          totalHikes: 0,
          totalDistance: 0,
          totalElevation: 0,
          achievements: [],
        },
      };

      await dbUtils.create(collections.USERS, userRecord.uid, profileData);


      return {
        success: true,
        uid: userRecord.uid,
        user: profileData,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }



  static async  updateUserProfile(uid, data) {
  const userRef = firestore.collection('users').doc(uid);

  const updateData = {
    ...(data.displayName && { displayName: data.displayName }),
    ...(data.bio && { bio: data.bio }),
    ...(data.location && { location: data.location }),
  };

  await userRef.set(updateData, { merge: true });

  // Optionally update Firebase Auth
  

  const updatedDoc = await userRef.get();
  return updatedDoc.data();
}




  // Get user profile by UID
  static async getUserProfile(uid) {
    try {
      const profile = await dbUtils.getById(collections.USERS, uid);
      if (!profile) {
        throw new Error('User profile not found');
      }
      return profile;
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  // Update user profile
  static async updateUserProfile(uid, updateData) {
    try {
      // Remove sensitive fields that shouldn't be updated
      const { email, uid: _, ...safeUpdateData } = updateData;

      await dbUtils.update(collections.USERS, uid, safeUpdateData);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }


  // Delete user account
  static async deleteUser(uid) {
    //const auth = getAuth();//ANNAH HERE
    try {
      // Delete from Firestore first
      await dbUtils.delete(collections.USERS, uid);

      // Delete from Firebase Authentication
      await auth.deleteUser(uid);

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }


  // Verify user email
  static async verifyEmail(uid) {
    try {
      
      await auth.updateUser(uid, { emailVerified: true });
      await dbUtils.updateUserProfile(uid, { emailVerified: true });
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to verify email: ${error.message}`);
    }
  }


   static async getUserAchievements(userId) {
    try {
      // Subcollection version:
      const snapshot = await db.collection('users')
        .doc(userId)
        .collection('achievements')
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // If you used array field instead, then:
      // const userDoc = await db.collection('users').doc(userId).get();
      // return userDoc.data().achievements || [];
    } catch (error) {
      console.error("Error fetching achievements:", error);
      throw error;
    }
  }


  static async getUserHikes(userId) {
    try {
      // Subcollection version:
      const snapshot = await db.collection('users')
        .doc(userId)
        .collection('hikes')
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // If you used array field instead, then:
      // const userDoc = await db.collection('users').doc(userId).get();
      // return userDoc.data().achievements || [];
    } catch (error) {
      console.error("Error fetching hikes:", error);
      throw error;
    }
  }
  


  static async getUserGoals(userId) {
    try {
      // Subcollection version:
      const snapshot = await db.collection('users')
        .doc(userId)
        .collection('goals')
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // If you used array field instead, then:
      // const userDoc = await db.collection('users').doc(userId).get();
      // return userDoc.data().achievements || [];
    } catch (error) {
      console.error("Error fetching goals:", error);
      throw error;
    }
  }

  // Reset user password
  static async resetPassword(email) {
    try {
     
      const userRecord = await auth.getUserByEmail(email);
      // Note: Firebase Admin SDK cannot send password reset emails
      // This would typically be handled by the frontend Firebase Auth
      return { success: true, uid: userRecord.uid };
    } catch (error) {
      throw new Error(`Failed to reset password: ${error.message}`);
    }
  }

}
