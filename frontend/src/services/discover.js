import { getAuth } from "firebase/auth";
import { API_BASE } from "../api/api.js";

const API_URL = `${API_BASE}/discover`;

// Get Firebase ID token for authentication
async function getToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

// Fetch suggested friends
export async function discoverFriends() {
  const token = await getToken();
  const res = await fetch(`${API_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch suggestions");
  return res.json(); // returns array of { id, name, avatar, mutualFriends, commonTrails }
}

// Add a friend
export async function addFriend(friendId) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ friendId }),
  });
  if (!res.ok) throw new Error("Failed to add friend");
  return res.json(); // returns { success: true }
}

export const getUserDetails = async (userId) => {
  const res = await api.get(`/discover/${userId}`);
  return res.data;
}