import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Function to safely parse the service account key
const getServiceAccount = (): ServiceAccount => {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountJson) {
    throw new Error(
      'Firebase Admin SDK service account credentials are not set in FIREBASE_SERVICE_ACCOUNT_KEY environment variable.'
    );
  }

  try {
    const parsedKey = JSON.parse(serviceAccountJson);
    // Ensure private_key has correct newlines, as it might be escaped in the env var
    parsedKey.private_key = parsedKey.private_key.replace(/\\n/g, '\n');
    return parsedKey;
  } catch (e) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', e);
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not a valid JSON object.');
  }
};

let app: App;
let adminDb: Firestore;
let adminAuth: Auth;

try {
  const serviceAccount = getServiceAccount();
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
