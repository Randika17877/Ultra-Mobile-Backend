// Ultra Mobile Firebase Configuration
// Project: ultra-mobile-652ff

const firebaseConfig = {
  apiKey: "AIzaSyDz9HwCuzvv8q9zQbxIPPvZ14nHQEQUKI0",
  authDomain: "ultra-mobile-652ff.firebaseapp.com",
  projectId: "ultra-mobile-652ff",
  storageBucket: "ultra-mobile-652ff.firebasestorage.app",
  messagingSenderId: "595013417103",
  appId: "1:595013417103:android:c396c877461bb43aa298fa",
};

let _app: unknown = null;
let _auth: unknown = null;
let _db: unknown = null;
let _storage: unknown = null;

async function getFirebaseApp() {
  if (!_app) {
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return _app;
}

export async function getFirebaseAuth() {
  if (!_auth) {
    const app = await getFirebaseApp();
    const { getAuth } = await import("firebase/auth");
    _auth = getAuth(app as import("firebase/app").FirebaseApp);
  }
  return _auth as import("firebase/auth").Auth;
}

export async function getFirebaseDb() {
  if (!_db) {
    const app = await getFirebaseApp();
    const { getFirestore } = await import("firebase/firestore");
    _db = getFirestore(app as import("firebase/app").FirebaseApp);
  }
  return _db as import("firebase/firestore").Firestore;
}

export async function getFirebaseStorage() {
  if (!_storage) {
    const app = await getFirebaseApp();
    const { getStorage } = await import("firebase/storage");
    _storage = getStorage(app as import("firebase/app").FirebaseApp);
  }
  return _storage as import("firebase/storage").FirebaseStorage;
}

export { firebaseConfig };
