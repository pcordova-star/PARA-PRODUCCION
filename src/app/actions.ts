
'use server';

import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';

const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function createSessionCookie(idToken: string) {
  try {
    const decodedIdToken = await adminAuth.verifyIdToken(idToken, true);
    
    // Only process if the user just signed in in the last 5 minutes.
    if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
      const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
      cookies().set('__session', sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
      });
      return { success: true };
    }
    return { success: false, error: 'Recent sign-in required.' };
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return { success: false, error: 'Failed to create session cookie.' };
  }
}

export async function deleteSessionCookie() {
  cookies().delete('__session');
}
