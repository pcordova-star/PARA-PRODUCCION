// src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { auth: adminAuth } = getFirebaseAdmin();
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    const response = NextResponse.json({ status: 'success' }, { status: 200 });
    response.cookies.set(options);
    
    return response;
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ status: 'success' }, { status: 200 });
  response.cookies.set({
    name: 'session',
    value: '',
    expires: new Date(0),
  });
  return response;
}
