import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// This function ensures that Firebase Admin is initialized only once.
export function getFirebaseAdmin() {
  if (!getApps().length) {
    admin.initializeApp();
  }
  return {
    auth: admin.auth(),
    db: admin.firestore(),
  };
}

// You can still export them for convenience, but they will be initialized lazily.
export const adminAuth = getFirebaseAdmin().auth;
export const adminDb = getFirebaseAdmin().db;
