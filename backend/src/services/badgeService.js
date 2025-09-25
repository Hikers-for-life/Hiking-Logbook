// backend/src/services/badgeService.js
import { getDatabase, admin } from '../config/firebase.js';

/**
 * Rules and checks.
 * Adjust the checks to match how you store data (distance units, isPeak flag, duration units).
 */
const BADGE_RULES = [
  {
    name: "First Steps",
    description: "Completed your very first hike",
    check: (stats) => stats.totalHikes >= 1,
  },
  {
    name: "Distance Walker",
    description: "Hiked a total distance of 100 km",
    check: (stats) => (stats.totalDistance || 0) >= 100,
  },
  {
    name: "Peak Collector",
    description: "Summited 10 peaks",
    check: (stats) => (stats.totalPeaks || 0) >= 10,
  },
  {
    name: "Early Bird",
    description: "Completed a hike that started before 7 AM",
    check: (stats) => !!stats.hasEarlyBird,
  },
  {
    name: "Endurance Master",
    description: "Completed a hike longer than 8 hours",
    check: (stats) => !!stats.hasEndurance,
  },
  {
    name: "Trail Explorer",
    description: "Completed 25 unique trails",
    check: (stats) => (stats.uniqueTrails || 0) >= 25,
  },
];

export async function evaluateAndAwardBadges(userId, stats) {
  const db = getDatabase();
  const userRef = db.collection('users').doc(userId);
  const userSnap = await userRef.get();
  const currentBadges = (userSnap.exists && userSnap.data().badges) || [];

  const newBadges = [];

  for (const rule of BADGE_RULES) {
    const already = currentBadges.some(b => b.name === rule.name);
    if (!already && rule.check(stats)) {
      newBadges.push({
        name: rule.name,
        description: rule.description,
        earnedDate: admin.firestore.Timestamp.now()
      });
    }
  }

  if (newBadges.length > 0) {
    // Append new badges and update updatedAt
    await userRef.update({
      badges: [...currentBadges, ...newBadges],
      updatedAt: new Date()
    });
  }

  return newBadges; // return array to allow logging if desired
}
