
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // Use applicationDefault() to automatically find credentials in a Firebase environment.
    admin.initializeApp();
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
