import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase.js';

export const getUserStats = async (userId) => {
  const hikesRef = collection(db, 'users', userId, 'hikes');
  const snapshot = await getDocs(hikesRef);

  let totalDistance = 0;
  let totalElevation = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();

    // Make sure distance/elevation are numbers
    const distance = data.distance
      ? parseFloat(data.distance.slice(0, -2)) // remove last 2 chars ("km")
      : 0;

    const elevation = data.elevation
      ? parseFloat(data.elevation.slice(0, -2)) // remove last 2 chars ("ft")
      : 0;

    totalDistance += distance;
    totalElevation += elevation;
  });

  return { totalDistance, totalElevation };
};
