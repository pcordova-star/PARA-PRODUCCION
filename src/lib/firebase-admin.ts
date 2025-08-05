
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import serviceAccount from '../../sara-produccion-c10b5-firebase-adminsdk-fbsvc-b5d82a042e.json';

let app: App;
let adminDb: Firestore;
let adminAuth: Auth;

try {
  if (!getApps().length) {
    app = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    app = getApps()[0];
  }
  adminDb = getFirestore(app);
  adminAuth = getAuth(app);
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  // Re-throwing the error to make it visible during development or in logs.
  throw error;
}


export { adminDb, adminAuth };
