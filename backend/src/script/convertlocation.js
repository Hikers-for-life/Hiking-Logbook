// migrateUsers.mjs
import admin from 'firebase-admin';
import fetch from 'node-fetch'; // If using Node >=18, fetch is built-in

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(
    'C:/Users/Stelly Jane/Downloads/Hiking-Logbook/backend/serviceAccountKey.json'
  ),
});

const db = admin.firestore();
const OPENWEATHER_API_KEY = 'cab9498470bd6dc008fb5b9af5c995e9';

// Function to geocode city name
async function geocodeCity(city) {
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data || data.length === 0) {
    throw new Error(`No coordinates found for city: ${city}`);
  }
  return { latitude: data[0].lat, longitude: data[0].lon };
}

// Migration function
async function migrateUsers() {
  const usersRef = db.collection('users'); // change if your collection name is different
  const snapshot = await usersRef.get();

  for (const doc of snapshot.docs) {
    const user = doc.data();

    // Skip if lat/lon already exist
    if (user.latitude && user.longitude) continue;

    if (user.location) {
      try {
        const coords = await geocodeCity(user.location);
        await doc.ref.update(coords);
        console.log(`Updated user ${doc.id} with coordinates:`, coords);
      } catch (err) {
        console.error(`Failed to geocode user ${doc.id}:`, err.message);
      }
    } else {
      console.log(`User ${doc.id} has no location, skipping.`);
    }
  }

  console.log('Migration complete!');
}

// Run migration
migrateUsers().catch(console.error);
