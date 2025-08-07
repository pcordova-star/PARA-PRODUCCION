
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let adminDb: Firestore;
let adminAuth: Auth;

try {
  if (!getApps().length) {
    // Read from the new, non-reserved environment variable name
    const serviceAccountKey = process.env.SARA_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error('Firebase Admin SDK service account key is not set in environment variables (SARA_SERVICE_ACCOUNT_KEY).');
    }
    
    const serviceAccount = JSON.parse(serviceAccountKey);

    app = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    app = getApps()[0];
  }
  adminDb = getFirestore(app);
  adminAuth = getAuth(app);
} catch (error: any) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
  throw new Error('Failed to initialize Firebase Admin SDK. Please check your service account credentials.');
}

export { adminDb, adminAuth };
