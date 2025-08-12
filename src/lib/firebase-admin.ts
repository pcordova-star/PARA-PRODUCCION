
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
 
let adminDb: Firestore;
let adminAuth: Auth;

if (!getApps().length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      initializeApp();
    }
  } catch (error: any) {}
}
adminDb = getFirestore();
adminAuth = getAuth();
export { adminDb, adminAuth };

