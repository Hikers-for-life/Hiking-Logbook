import { getAuth } from "firebase/auth";
import { API_BASE } from '../api/api.js';

const API_URL = API_BASE;

// ---- Get Firebase ID Token ----
async function getToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

// ---- Create a Feed Post ----
export async function createFeed(postData) {
  // postData should include at least: { action, hike, description?, stats?, photo? }
  const token = await getToken();
  const res = await fetch(`${API_URL}/feed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(postData),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create feed: ${res.status} ${errText}`);
  }

  return res.json(); // returns created activity object (backend returns id + fields)
}

// ---- Fetch Feed (Unified: posts, hikes, achievements, shares) ----
export async function fetchFeed(page = 1, limit = 10) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/feed?page=${page}&limit=${limit}`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });

  if (!res.ok) {
    const errText = await res.text();
    // Handle 429 errors specifically
    if (res.status === 429) {
      throw new Error(`Failed to fetch feed: 429 Too many requests, please try again later.`);
    }
    throw new Error(`Failed to fetch feed: ${res.status} ${errText}`);
  }

  // Return array of activities: type = post | hike | achievement | share
  return res.json();
}

// ---- Like / Unlike Feed ----
export async function likeFeed(feedId, like = true) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/feed/${feedId}/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ like }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to like feed: ${res.status} ${errText}`);
  }

  return res.json(); // returns updated like info
}

// ---- Add Comment ----
export async function commentFeed(feedId, content) {
  if (!content?.trim()) throw new Error("Comment cannot be empty");

  const token = await getToken();
  const res = await fetch(`${API_URL}/feed/${feedId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to add comment: ${res.status} ${errText}`);
  }

  return res.json(); // returns the created comment object
}

// ---- Delete Comment ----
export async function deleteCommentFeed(feedId, commentId) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/feed/${feedId}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete comment: ${res.status} ${errText}`);
  }

  return res.json(); // confirmation of deletion
}

// ---- Share a Post ----
export async function shareFeed(feedId, payload) {
  // payload example: { sharerId, sharerName, sharerAvatar, original }
  const token = await getToken();
  const res = await fetch(`${API_URL}/feed/${feedId}/share`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to share feed: ${res.status} ${errText}`);
  }

  return res.json(); // returns new shared activity
}

// ---- Update a Feed Post ----
export async function updateFeed(feedId, updateData) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/feed/${feedId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update feed: ${res.status} ${errText}`);
  }

  return res.json(); // returns updated activity object
}

// ---- Delete a Feed Post ----
export async function deleteFeed(feedId) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/feed/${feedId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete feed: ${res.status} ${errText}`);
  }

  return res.json(); // confirmation of deletion
}
