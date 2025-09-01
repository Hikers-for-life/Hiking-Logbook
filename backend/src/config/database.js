import { db } from './firebase.js';
import admin from "firebase-admin";

// Database collections
export const collections = {
  USERS: 'users',
  HIKES: 'hikes',
  TRAILS: 'trails',
  ACHIEVEMENTS: 'achievements',
};

// Database utility functions
export const dbUtils = {
  // Create a new document
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

  // Get a document by ID
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

  // Update a document
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

  // Delete a document
  async delete(collection, docId) {
    try {
      await db.collection(collection).doc(docId).delete();
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  },

  // Query documents
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
};

export default db;
