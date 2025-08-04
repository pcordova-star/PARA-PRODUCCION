import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
if (!getApps().length) {
  app = initializeApp();
} else {
  app = getApps()[0];
}

const adminDb: Firestore = getFirestore(app);
const adminAuth: Auth = getAuth(app);

export function getFirebaseAdmin() {
  return { db: adminDb, auth: adminAuth };
}
