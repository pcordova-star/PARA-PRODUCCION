// src/app/api/auth/session/route.ts
'use server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const idToken = await request.text();
    if (!idToken) {
        return NextResponse.json({ status: 'error', message: 'ID token is missing.' }, { status: 400 });
    }
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ status: 'success' });
    response.cookies.set('__session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    return response;
  } catch (error: any) {
    console.error('Error creating session cookie:', error.message);
    return NextResponse.json({ status: 'error', message: 'Failed to create session', error: error.message }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ status: 'success' });
    response.cookies.set('__session', '', {
      maxAge: -1,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    return response;
  } catch (error) {
    console.error('Error deleting session cookie:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to delete session' }, { status: 500 });
  }
}
