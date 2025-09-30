import { db } from "../config/firebase.js";
import { collection, query, where, getDocs, getCountFromServer } from "firebase/firestore";

export const searchUsers = async (name) => {
  const q = query(
    collection(db, "users"),
    where("displayName", "==", name)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return [];

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserHikeCount = async (userId) => {
  try {
    const coll = collection(db, "users", userId, "hikes");
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
  } catch (err) {
    console.error("Failed to fetch hike count:", err);
    return 0;
  }
};



