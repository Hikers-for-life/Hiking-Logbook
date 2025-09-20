import { getAuth } from "firebase/auth";
import { API_BASE } from '../api/api.js';
import { getFirestore, doc, deleteDoc } from "firebase/firestore";


const API_URL = API_BASE;

async function getToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

export async function fetchFeed(page = 1, limit = 10) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/feed?page=${page}&limit=${limit}`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch feed: ${res.status} ${errText}`);
  }

  return res.json();
}

export async function likeFeed(id, like) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/feed/${id}/like`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ like }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to like feed: ${res.status} ${errText}`);
  }

  return res.json();
}

export async function commentFeed(id, content) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/feed/${id}/comment`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to comment: ${res.status} ${errText}`);
  }

  return res.json();
}

export async function deleteCommentFeed(activityId, commentId) {
  const token = await getToken();

  const res = await fetch(`${API_URL}/feed/${activityId}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete comment: ${res.status} ${errorText}`);
  }

  return res.json();
}



export const shareFeed = async (feedId, payload) => {
  const res = await fetch(`${API_URL}/feed/${feedId}/share`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getToken()}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to share");
  return res.json();
};

export const deleteFeed = async (activityId) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}/feed/${activityId}`, {
    method: "DELETE",
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete post: ${res.status} ${errorText}`);
  }

  return res.json();
};

