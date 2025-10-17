import * as firestore from 'firebase/firestore';

test('Firestore mocks are callable', () => {
  const db = firestore.getFirestore();
  const col = firestore.collection(db, 'users');

  const docRef = firestore.doc(col, 'abc123');

  firestore.setDoc(docRef, { name: 'Alice' });
  firestore.getDoc(docRef);

  expect(firestore.getFirestore).toHaveBeenCalled();
  expect(firestore.collection).toHaveBeenCalledWith(db, 'users');
  expect(firestore.doc).toHaveBeenCalledWith(col, 'abc123');
  expect(firestore.setDoc).toHaveBeenCalledWith(docRef, { name: 'Alice' });
  expect(firestore.getDoc).toHaveBeenCalledWith(docRef);
});
