
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminDb: Firestore;
let adminAuth: Auth;

if (!getApps().length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error('Firebase Admin SDK service account key is not set in environment variables (FIREBASE_SERVICE_ACCOUNT_KEY).');
    }
    
    const serviceAccount = JSON.parse(serviceAccountKey);

    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    throw new Error('Failed to initialize Firebase Admin SDK. Please check your service account credentials.');
  }
}

adminDb = getFirestore();
adminAuth = getAuth();

export { adminDb, adminAuth };

