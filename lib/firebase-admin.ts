import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { getMessaging } from "firebase-admin/messaging";
import path from "path";

if (!getApps().length) {
  // Use service-account.json for local dev, or env vars for production
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({
      credential: cert(serviceAccount),
      projectId: "ultra-mobile-652ff",
      storageBucket: "ultra-mobile-652ff.firebasestorage.app",
    });
  } else {
    const serviceAccountPath = path.join(process.cwd(), "service-account.json");
    initializeApp({
      credential: cert(serviceAccountPath),
      projectId: "ultra-mobile-652ff",
      storageBucket: "ultra-mobile-652ff.firebasestorage.app",
    });
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
export const adminStorage = getStorage();
export const adminMessaging = getMessaging();
