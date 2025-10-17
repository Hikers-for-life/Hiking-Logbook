export const getAuth = jest.fn(() => ({}));

export class GoogleAuthProvider {}

export const createUserWithEmailAndPassword = jest.fn(() =>
  Promise.resolve({ user: { uid: 'mockUid', email: 'test@example.com' } })
);

export const signInWithEmailAndPassword = jest.fn(() =>
  Promise.resolve({ user: { uid: 'mockUid', email: 'test@example.com' } })
);

export const signOut = jest.fn(() => Promise.resolve());

export const onAuthStateChanged = jest.fn((auth, callback) => {
  // Immediately invoke callback with "no user"
  callback(null);
  return () => {}; // unsubscribe mock
});

export const updateProfile = jest.fn(() => Promise.resolve());

export const sendPasswordResetEmail = jest.fn(() => Promise.resolve());

export const signInWithPopup = jest.fn(() =>
  Promise.resolve({ user: { uid: 'mockUid', email: 'test@example.com' } })
);
