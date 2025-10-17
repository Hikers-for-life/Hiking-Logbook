// Testable functions extracted from the main codebase
// This file contains core business logic that can be easily tested

// Data parsing utilities (extracted from database.js)
const parseDistance = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(String(value).replace(/[^\d.]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

const parseElevation = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

const parseDuration = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
};

// Data validation functions
const validateHikeData = (hikeData) => {
  const errors = [];

  if (!hikeData || typeof hikeData !== 'object') {
    errors.push('Hike data is required');
    return { isValid: false, errors };
  }

  if (!hikeData.title || hikeData.title.trim() === '') {
    errors.push('Title is required');
  }

  if (!hikeData.location || hikeData.location.trim() === '') {
    errors.push('Location is required');
  }

  if (hikeData.distance !== undefined && parseDistance(hikeData.distance) < 0) {
    errors.push('Distance must be positive');
  }

  if (
    hikeData.elevation !== undefined &&
    parseElevation(hikeData.elevation) < -500
  ) {
    errors.push('Elevation seems unrealistic');
  }

  const validDifficulties = ['Easy', 'Moderate', 'Hard', 'Extreme'];
  if (hikeData.difficulty && !validDifficulties.includes(hikeData.difficulty)) {
    errors.push('Invalid difficulty level');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// User data validation
const validateUserData = (userData) => {
  const errors = [];

  if (!userData || typeof userData !== 'object') {
    errors.push('User data is required');
    return { isValid: false, errors };
  }

  if (!userData.email || userData.email.trim() === '') {
    errors.push('Email is required');
  } else if (!userData.email.includes('@')) {
    errors.push('Invalid email format');
  }

  if (!userData.displayName || userData.displayName.trim() === '') {
    errors.push('Display name is required');
  }

  if (userData.password && userData.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Statistics calculation functions
const calculateHikeStats = (hikes) => {
  if (!hikes || !Array.isArray(hikes)) {
    return {
      totalHikes: 0,
      totalDistance: 0,
      totalElevation: 0,
      totalDuration: 0,
      byDifficulty: { Easy: 0, Moderate: 0, Hard: 0, Extreme: 0 },
      byStatus: { completed: 0, active: 0, paused: 0 },
    };
  }

  const stats = {
    totalHikes: hikes.length,
    totalDistance: hikes.reduce(
      (sum, hike) => sum + parseDistance(hike.distance),
      0
    ),
    totalElevation: hikes.reduce(
      (sum, hike) => sum + parseElevation(hike.elevation),
      0
    ),
    totalDuration: hikes.reduce(
      (sum, hike) => sum + parseDuration(hike.duration),
      0
    ),
    byDifficulty: { Easy: 0, Moderate: 0, Hard: 0, Extreme: 0 },
    byStatus: { completed: 0, active: 0, paused: 0 },
  };

  hikes.forEach((hike) => {
    if (hike.difficulty && stats.byDifficulty.hasOwnProperty(hike.difficulty)) {
      stats.byDifficulty[hike.difficulty]++;
    }

    if (hike.status && stats.byStatus.hasOwnProperty(hike.status)) {
      stats.byStatus[hike.status]++;
    }
  });

  return stats;
};

// Streak calculation
const calculateStreaks = (hikes) => {
  if (!hikes || !Array.isArray(hikes) || hikes.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Filter and sort completed hikes by date
  const completedHikes = hikes
    .filter((hike) => hike.status === 'completed' && hike.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (completedHikes.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Calculate current streak from most recent hike
  const today = new Date();
  const lastHikeDate = new Date(completedHikes[0].date);
  const daysDiff = Math.floor((today - lastHikeDate) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 7) {
    // Within a week
    currentStreak = 1;

    for (let i = 1; i < completedHikes.length; i++) {
      const prevDate = new Date(completedHikes[i - 1].date);
      const currDate = new Date(completedHikes[i].date);
      const diff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));

      if (diff <= 14) {
        // Within 2 weeks
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < completedHikes.length; i++) {
    const prevDate = new Date(completedHikes[i - 1].date);
    const currDate = new Date(completedHikes[i].date);
    const diff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));

    if (diff <= 14) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
};

// Monthly activity aggregation
const generateMonthlyActivity = (hikes) => {
  if (!hikes || !Array.isArray(hikes)) {
    return [];
  }

  const monthlyData = {};

  hikes.forEach((hike) => {
    if (!hike.date) return;

    try {
      const date = new Date(hike.date);
      if (isNaN(date.getTime())) return; // Invalid date

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, hikes: 0, distance: 0 };
      }

      monthlyData[monthKey].hikes++;
      monthlyData[monthKey].distance += parseDistance(hike.distance);
    } catch (error) {
      // Skip invalid dates
      console.warn('Invalid date in hike data:', hike.date);
    }
  });

  return Object.values(monthlyData).sort((a, b) =>
    a.month.localeCompare(b.month)
  );
};

// Response formatting utilities
const formatSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
};

const formatErrorResponse = (error, statusCode = 500) => {
  return {
    success: false,
    error: error.message || error || 'An error occurred',
    statusCode,
    timestamp: new Date().toISOString(),
  };
};

// Data processing utilities
const processHikeData = (rawData) => {
  if (!rawData || typeof rawData !== 'object') {
    return {
      title: '',
      location: '',
      distance: 0,
      elevation: 0,
      difficulty: 'Easy',
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return {
    title: rawData.title || '',
    location: rawData.location || '',
    distance: parseDistance(rawData.distance),
    elevation: parseElevation(rawData.elevation),
    difficulty: rawData.difficulty || 'Easy',
    weather: rawData.weather || '',
    notes: rawData.notes || '',
    status: rawData.status || 'completed',
    pinned: Boolean(rawData.pinned),
    shared: Boolean(rawData.shared),
    createdAt: rawData.createdAt || new Date(),
    updatedAt: new Date(),
    userId: rawData.userId || null,
  };
};

const processUserData = (rawData) => {
  if (!rawData || typeof rawData !== 'object') {
    return {
      email: '',
      displayName: '',
      bio: '',
      location: null,
      preferences: {
        units: 'metric',
        privacy: 'friends',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return {
    email: rawData.email || '',
    displayName: rawData.displayName || '',
    bio: rawData.bio || '',
    location: rawData.location || null,
    photoURL: rawData.photoURL || '',
    preferences: {
      difficulty: rawData.preferences?.difficulty || 'beginner',
      terrain: rawData.preferences?.terrain || 'mixed',
      distance: rawData.preferences?.distance || 'short',
      units: rawData.preferences?.units || 'metric',
      privacy: rawData.preferences?.privacy || 'friends',
    },
    stats: {
      totalHikes: 0,
      totalDistance: 0,
      totalElevation: 0,
      achievements: [],
    },
    createdAt: rawData.createdAt || new Date(),
    updatedAt: new Date(),
  };
};

// Badge evaluation logic
const evaluateBadges = (userStats) => {
  const badges = [];

  // First Hike badge
  if (userStats.totalHikes >= 1) {
    badges.push({
      name: 'First Hike',
      description: 'Completed your first hike',
      earnedAt: new Date(),
    });
  }

  // Distance milestones
  if (userStats.totalDistance >= 10) {
    badges.push({
      name: '10K Walker',
      description: 'Walked 10 kilometers total',
      earnedAt: new Date(),
    });
  }

  if (userStats.totalDistance >= 100) {
    badges.push({
      name: '100K Walker',
      description: 'Walked 100 kilometers total',
      earnedAt: new Date(),
    });
  }

  // Elevation milestones
  if (userStats.totalElevation >= 1000) {
    badges.push({
      name: 'Peak Climber',
      description: 'Climbed 1000 meters total elevation',
      earnedAt: new Date(),
    });
  }

  if (userStats.totalElevation >= 5000) {
    badges.push({
      name: 'Mountain Climber',
      description: 'Climbed 5000 meters total elevation',
      earnedAt: new Date(),
    });
  }

  // Hike count milestones
  if (userStats.totalHikes >= 10) {
    badges.push({
      name: 'Regular Hiker',
      description: 'Completed 10 hikes',
      earnedAt: new Date(),
    });
  }

  if (userStats.totalHikes >= 50) {
    badges.push({
      name: 'Hiking Enthusiast',
      description: 'Completed 50 hikes',
      earnedAt: new Date(),
    });
  }

  // Streak badges
  if (userStats.currentStreak >= 5) {
    badges.push({
      name: 'Consistent Hiker',
      description: 'Maintained a 5-hike streak',
      earnedAt: new Date(),
    });
  }

  return badges;
};

// CommonJS exports
module.exports = {
  parseDistance,
  parseElevation,
  parseDuration,
  validateHikeData,
  validateUserData,
  calculateHikeStats,
  calculateStreaks,
  generateMonthlyActivity,
  formatSuccessResponse,
  formatErrorResponse,
  processHikeData,
  processUserData,
  evaluateBadges,
};
