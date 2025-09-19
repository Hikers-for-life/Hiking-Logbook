import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

export const discoverFriends = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);

  const currentUserData = snapshot.docs.find(doc => doc.id === currentUser.uid)?.data();
  if (!currentUserData) return [];

  const friendsSet = new Set(currentUserData.friends || []);

  const suggestions = snapshot.docs
    .filter(doc => doc.id !== currentUser.uid && !friendsSet.has(doc.id))
    .map(doc => {
      const data = doc.data();
      const mutualFriends = data.friends?.filter(f => friendsSet.has(f)).length || 0;
      return {
        id: doc.id,
        name: data.displayName,
        avatar: data.avatar || data.displayName?.[0] || "?",
        mutualFriends,
        commonTrails: (data.trails || []).filter(t => currentUserData.trails?.includes(t)),
      };
    })
    .sort((a, b) => b.mutualFriends - a.mutualFriends) // prioritize mutuals
    .slice(0, 20); // ✅ apply limit *after* filtering

  return suggestions;
};
