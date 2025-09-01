
import { collections, dbUtils } from "../config/database.js";
import { hikeSchema } from "../models/hikeSchema.js";

// Simple validation against schema
function validateHikeData(hikeData) {
  Object.keys(hikeSchema).forEach((field) => {
    if (!(field in hikeData)) {
      throw new Error(`Missing field: ${field}`);
    }
  });
}

// Create a hike
export async function createHike(docId, hikeData) {
  validateHikeData(hikeData);
  return dbUtils.create(collections.HIKES, docId, hikeData);
}

// Get a hike by ID
export async function getHike(docId) {
  return dbUtils.getById(collections.HIKES, docId);
}

// Update a hike
export async function updateHike(docId, hikeData) {
  return dbUtils.update(collections.HIKES, docId, hikeData);
}

// Delete a hike
export async function deleteHike(docId) {
  return dbUtils.delete(collections.HIKES, docId);
}

// Query hikes (e.g. by userId)
export async function getUserHikes(userId) {
  return dbUtils.query(collections.HIKES, [
    { field: "userId", operator: "==", value: userId },
  ]);
}
