
import { getAuth } from '../config/firebase.js';
import { dbUtils } from '../config/database.js';



export class AuthService {
  // Create a new user account
  static async createUser(userData) {
    //const auth = getAuth();//ANNAH HERE
    try {
      const auth = getAuth();
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

      await dbUtils.updateUserProfile(userRecord.uid, profileData);

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

  // Get user profile by UID
  static async getUserProfile(uid) {
    try {
      const profile = await dbUtils.getUserProfile(uid);
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
      const safeUpdateData = { ...updateData };
      delete safeUpdateData.email;
      delete safeUpdateData.uid;

      await dbUtils.updateUserProfile(uid, safeUpdateData);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  // Delete user account
  static async deleteUser(uid) {
    //const auth = getAuth();//ANNAH HERE
    try {
      const auth = getAuth();
      // Delete from Firestore first
      await dbUtils.deleteUser(uid);

      // Delete from Firebase Authentication
      await auth.deleteUser(uid);

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }


}
