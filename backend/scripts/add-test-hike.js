import { db } from '../src/config/firebase.js';

const addTestHike = async () => {
  try {
    // Replace this with your actual user ID from Firebase Console
    const userId = 'Your user ID'; // Your user ID
    
    console.log('Adding test hike for user:', userId);
    
    const testHike = {
      title: 'Test Hike',
      location: 'Test Location',
      date: new Date(),
      distance: 2.0,
      duration: 60,
      difficulty: 'Easy',
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: userId
    };
    
    const docRef = await db
      .collection('users')
      .doc(userId)
      .collection('hikes')
      .add(testHike);
    
    console.log('Test hike added successfully!');
    console.log('Hike ID:', docRef.id);
    console.log('');
    console.log('NOW check Firebase Console:');
    console.log('1. Go to Firestore Database');
    console.log('2. Look at your user document');
    console.log('3. You should now see a "hikes" subcollection!');
    
  } catch (error) {
    console.error('Error adding test hike:', error);
  }
};

// Run the script
addTestHike();

