import admin from 'firebase-admin';
import { db } from '../config/firebase.js'; // your Firestore instance

async function migrateAuthUsersToFirestore() {
  let nextPageToken;
  do {
    const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
    
    for (const userRecord of listUsersResult.users) {
      const userDoc = db.collection('users').doc(userRecord.uid);
      const docSnap = await userDoc.get();

      if (!docSnap.exists) {
        // Create main user doc
        await userDoc.set({
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || "No name",
          bio: "",
          location: "",
          photoURL: userRecord.photoURL || "",
          stats: {
            totalHikes: 0,
            totalDistance: 0,
            totalElevation: 0,
            achievementsCount: 0,
          },
          preferences: {
            difficulty: "",
            distance: "",
            terrain: "",
            
          },
          
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

           

            // Optional: add placeholder doc in each subcollection
            // Achievements subcollection
            // Achievements subcollection
            const achievementsCol = userDoc.collection('achievements');

            await achievementsCol.add({
            description: '',
            earnedAt: null,
            title: ''
            });

            

            // Goals subcollection
            const goalsCol = userDoc.collection('goals');

            await goalsCol.add({
            currentValue: 0,
            status: 0,
            targetValue: 0,
            title: '',
            });

            // Hikes subcollection
            const hikesCol = userDoc.collection('hikes');

            
            await hikesCol.add({
            date: null,
            difficulty: '',
            distanceKm: 0,
            duration: null,
            trailName: '',
            });



        console.log(`Created Firestore profile and subcollections for ${userRecord.uid}`);
      }
    }

    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);

  console.log('Migration complete!');
}

migrateAuthUsersToFirestore()
  .catch((err) => console.error('Migration failed:', err));
