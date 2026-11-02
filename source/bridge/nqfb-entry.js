// NQ Journal's thin bridge to Firebase (sign-in + Firestore). The page only talks to window.NQFB, so it can be
// tested with a stand-in and the SDK stays out of the page's own code.
import { initializeApp } from 'firebase/app';
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, onAuthStateChanged,
         signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { initializeFirestore, getFirestore, persistentLocalCache, persistentMultipleTabManager,
         doc, collection, setDoc, getDoc, getDocFromCache, deleteDoc, onSnapshot, deleteField, waitForPendingWrites } from 'firebase/firestore';

let app, auth, db;
const days = uid => collection(db, 'users', uid, 'days');
const shots = uid => collection(db, 'users', uid, 'shots');

window.NQFB = {
  init(config) {
    app = initializeApp(config);
    auth = initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence] });
    try { db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }); }
    catch (e) { db = getFirestore(app); }          // no offline storage available (private window): online only
  },
  onAuth(cb) { return onAuthStateChanged(auth, u => cb(u ? { uid: u.uid, email: u.email || '' } : null)); },
  signIn(email, password) { return signInWithEmailAndPassword(auth, email, password).then(() => true); },
  signOut() { return signOut(auth); },
  resetPassword(email) { return sendPasswordResetEmail(auth, email); },
  subscribeDays(uid, next, error) {
    return onSnapshot(days(uid), { includeMetadataChanges: true }, snap => next({
      docs: snap.docs.map(d => ({ id: d.id, data: d.data() })),
      fromCache: snap.metadata.fromCache, pending: snap.metadata.hasPendingWrites
    }), error);
  },
  mergeDay(uid, key, data) { return setDoc(doc(days(uid), key), data, { merge: true }); },
  removeTrade(uid, key, id) { return setDoc(doc(days(uid), key), { trades: { [id]: deleteField() } }, { merge: true }); },
  deleteDay(uid, key) { return deleteDoc(doc(days(uid), key)); },
  newId() { return doc(collection(db, '_ids')).id; },
  putShot(uid, id, dataUrl) { return setDoc(doc(shots(uid), id), { d: dataUrl, t: Date.now() }); },
  async getShot(uid, id) {
    const ref = doc(shots(uid), id);
    try { const c = await getDocFromCache(ref); if (c.exists()) return c.data().d; } catch (e) {}
    const s = await getDoc(ref);
    return s.exists() ? s.data().d : null;
  },
  deleteShot(uid, id) { return deleteDoc(doc(shots(uid), id)); },
  synced() { return waitForPendingWrites(db); }
};
