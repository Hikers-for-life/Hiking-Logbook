// services/friendService.js
 // optional if you already have formatDate

// Fetch all friend profile data in one place
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date)) return "Unknown";

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  // Add ordinal suffix (st, nd, rd, th)
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  return `${month} ${day}${suffix}, ${year}`;
}
export async function getFriendProfile(uid, limit = 2) {
  try {
    // 1. Fetch hikes (preview only)
    const hikesRes = await fetch(`${API_BASE_URL}/users/${uid}/hikes?limit=${limit}`);
    const hikesData = await hikesRes.json();

    let recentHikes = [];
    if (hikesData.success) {
      recentHikes = hikesData.data
        .map((hike) => {
          let joinDate = "Unknown";
          if (hike?.createdAt) {
            const createdAt = hike.createdAt;
            if (createdAt.toDate) joinDate = formatDate(createdAt.toDate());
            else if (createdAt._seconds) joinDate = formatDate(new Date(createdAt._seconds * 1000));
            else joinDate = formatDate(new Date(createdAt));
          }

          return {
            ...hike,
            date: joinDate,
            createdAt: hike.createdAt
              ? (hike.createdAt.toDate ? hike.createdAt.toDate() : new Date(hike.createdAt))
              : null,
            title: hike.title || "Untitled Hike",
            location: hike.location || "Unknown Location",
            distance: hike.distance || "0 miles",
            duration: hike.duration || "0 min",
            difficulty: hike.difficulty || "Easy",
          };
        })
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    // 2. Fetch hike count
    const countRes = await fetch(`${API_BASE_URL}/users/${uid}/hikes/count`);
    const countData = await countRes.json();
    const totalHikes = countData.success ? countData.count : 0;

    // 3. Fetch stats (distance & elevation)
    const statsRes = await fetch(`${API_BASE_URL}/users/${uid}/stats`);
    const statsData = await statsRes.json();
    const totalDistance = statsData.success ? statsData.totalDistance : 0;
    const totalElevation = statsData.success ? statsData.totalElevation : 0;

    // ✅ Return combined profile data
    return {
      success: true,
      totalHikes,
      totalDistance,
      totalElevation,
      recentHikes: recentHikes.slice(0, limit),
    };
  } catch (err) {
    console.error("getFriendProfile error:", err);
    return { success: false, error: err.message };
  }
}
