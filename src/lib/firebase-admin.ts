import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Note: This code relies on GOOGLE_APPLICATION_CREDENTIALS environment variable
// being set in the deployment environment. For local development, you might need
// to point to a service account key file.

let app: App;
if (!getApps().length) {
  app = initializeApp();
} else {
  app = getApps()[0];
}

export const adminDb: Firestore = getFirestore(app);
export const adminAuth: Auth = getAuth(app);
