
import { dbUtils } from "../config/database.js";
import { hikeSchema } from "../models/hikeSchema.js";

// Simple validation against schema
function validateHikeData(hikeData) {
  // Only validate required fields
  const requiredFields = ['title', 'location'];
  requiredFields.forEach((field) => {
    if (!hikeData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  });
}

// Create a hike
export async function createHike(userId, hikeData) {
  validateHikeData(hikeData);
  return dbUtils.addHike(userId, hikeData);
}

// Get a hike by ID
export async function getHike(userId, hikeId) {
  return dbUtils.getHike(userId, hikeId);
}

// Update a hike
export async function updateHike(userId, hikeId, hikeData) {
  return dbUtils.updateHike(userId, hikeId, hikeData);
}

// Delete a hike
export async function deleteHike(userId, hikeId) {
  return dbUtils.deleteHike(userId, hikeId);
}

// Query hikes (e.g. by userId)
export async function getUserHikes(userId, filters = {}) {
  return dbUtils.getUserHikes(userId, filters);
}
