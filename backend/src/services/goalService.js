// backend/src/services/goalService.js
import { getDatabase } from '../config/firebase.js';

const GOALS_SUBCOL = 'goals';
const ALLOWED_CATEGORIES = new Set([
  'distance',
  'time',
  'elevation',
  'hikes',
  'streak',
  'custom',
]);

function validatePayload(payload, requireAll = true) {
  if (requireAll) {
    if (
      !payload.title ||
      typeof payload.title !== 'string' ||
      !payload.title.trim()
    ) {
      return 'title is required';
    }
    if (!payload.category || !ALLOWED_CATEGORIES.has(payload.category)) {
      return `category must be one of: ${[...ALLOWED_CATEGORIES].join(', ')}`;
    }
    if (
      payload.targetValue === undefined ||
      payload.targetValue === null ||
      typeof payload.targetValue !== 'number' ||
      Number.isNaN(payload.targetValue) ||
      payload.targetValue < 0
    ) {
      return 'targetValue must be a non-negative number';
    }
    if (!payload.unit || typeof payload.unit !== 'string') {
      return 'unit is required';
    }
  } else {
    // partial validation for updates - only validate present fields
    if (payload.category && !ALLOWED_CATEGORIES.has(payload.category)) {
      return `category must be one of: ${[...ALLOWED_CATEGORIES].join(', ')}`;
    }
    if (
      payload.targetValue !== undefined &&
      (typeof payload.targetValue !== 'number' ||
        Number.isNaN(payload.targetValue) ||
        payload.targetValue < 0)
    ) {
      return 'targetValue must be a non-negative number';
    }
  }
  return null;
}

function normalizePayload(payload) {
  return {
    title: payload.title?.trim(),
    description: payload.description || '',
    category: payload.category,
    targetValue:
      typeof payload.targetValue === 'number'
        ? payload.targetValue
        : Number(payload.targetValue),
    unit: payload.unit || '',
    targetDate: payload.targetDate ? new Date(payload.targetDate) : null,
  };
}

export async function addGoal(userId, payload) {
  const err = validatePayload(payload, true);
  if (err) throw { status: 400, message: err };

  const db = getDatabase();
  const now = new Date();

  const doc = {
    ...normalizePayload(payload),
    userId,
    currentProgress: 0,
    status: 'active', // active | completed | cancelled
    createdAt: now,
    updatedAt: now,
  };

  try {
    const ref = await db
      .collection('users')
      .doc(userId)
      .collection(GOALS_SUBCOL)
      .add(doc);
    const snap = await ref.get();
    return { id: ref.id, ...snap.data() };
  } catch (e) {
    throw { status: 500, message: `Failed to create goal: ${e.message}` };
  }
}

export async function listGoals(userId) {
  try {
    const db = getDatabase();
    const snap = await db
      .collection('users')
      .doc(userId)
      .collection(GOALS_SUBCOL)
      .orderBy('createdAt', 'desc')
      .get();

    const goals = [];
    snap.forEach((doc) => {
      const goalData = doc.data();

      // Convert Firestore timestamps to ISO strings
      if (goalData.createdAt && goalData.createdAt.toDate) {
        goalData.createdAt = goalData.createdAt.toDate().toISOString();
      }
      if (goalData.updatedAt && goalData.updatedAt.toDate) {
        goalData.updatedAt = goalData.updatedAt.toDate().toISOString();
      }
      if (goalData.targetDate && goalData.targetDate.toDate) {
        goalData.targetDate = goalData.targetDate.toDate().toISOString();
      }

      goals.push({ id: doc.id, ...goalData });
    });
    return goals;
  } catch (e) {
    throw { status: 500, message: `Failed to list goals: ${e.message}` };
  }
}

export async function getGoal(userId, goalId) {
  try {
    const db = getDatabase();
    const docRef = db
      .collection('users')
      .doc(userId)
      .collection(GOALS_SUBCOL)
      .doc(goalId);
    const snap = await docRef.get();
    if (!snap.exists) throw { status: 404, message: 'Goal not found' };

    const goalData = snap.data();

    // Convert Firestore timestamps to ISO strings
    if (goalData.createdAt && goalData.createdAt.toDate) {
      goalData.createdAt = goalData.createdAt.toDate().toISOString();
    }
    if (goalData.updatedAt && goalData.updatedAt.toDate) {
      goalData.updatedAt = goalData.updatedAt.toDate().toISOString();
    }
    if (goalData.targetDate && goalData.targetDate.toDate) {
      goalData.targetDate = goalData.targetDate.toDate().toISOString();
    }

    return { id: snap.id, ...goalData };
  } catch (e) {
    if (e && e.status) throw e;
    throw { status: 500, message: `Failed to get goal: ${e.message}` };
  }
}

export async function updateGoal(userId, goalId, updates) {
  // Validate only provided fields
  const err = validatePayload(updates, false);
  if (err) throw { status: 400, message: err };

  try {
    const db = getDatabase();
    const docRef = db
      .collection('users')
      .doc(userId)
      .collection(GOALS_SUBCOL)
      .doc(goalId);
    const snap = await docRef.get();
    if (!snap.exists) throw { status: 404, message: 'Goal not found' };

    // Ensure the goal belongs to the user (stored in subcollection - belongs by path)
    const now = new Date();
    const updateObj = { ...updates, updatedAt: now };
    if (updateObj.targetDate)
      updateObj.targetDate = new Date(updateObj.targetDate);

    await docRef.update(updateObj);
    const updatedSnap = await docRef.get();
    return { id: updatedSnap.id, ...updatedSnap.data() };
  } catch (e) {
    if (e && e.status) throw e;
    throw { status: 500, message: `Failed to update goal: ${e.message}` };
  }
}

export async function removeGoal(userId, goalId) {
  try {
    const db = getDatabase();
    const docRef = db
      .collection('users')
      .doc(userId)
      .collection(GOALS_SUBCOL)
      .doc(goalId);
    const snap = await docRef.get();
    if (!snap.exists) throw { status: 404, message: 'Goal not found' };

    await docRef.delete();
    return { success: true };
  } catch (e) {
    if (e && e.status) throw e;
    throw { status: 500, message: `Failed to delete goal: ${e.message}` };
  }
}
