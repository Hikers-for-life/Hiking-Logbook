import { getAuth } from '../config/firebase.js';
import { collections, dbUtils } from '../config/database.js';


export class AuthService {
  // Create a new user account
  static async createUser(userData) {
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
    try {
      const auth = getAuth();
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
      const auth = getAuth();
      await auth.updateUser(uid, { emailVerified: true });
      await dbUtils.update(collections.USERS, uid, { emailVerified: true });
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to verify email: ${error.message}`);
    }
  }

  // Reset user password
  static async resetPassword(email) {
    try {
      const auth = getAuth();
      const userRecord = await auth.getUserByEmail(email);
      // Note: Firebase Admin SDK cannot send password reset emails
      // This would typically be handled by the frontend Firebase Auth
      return { success: true, uid: userRecord.uid };
    } catch (error) {
      throw new Error(`Failed to reset password: ${error.message}`);
    }
  }
}
