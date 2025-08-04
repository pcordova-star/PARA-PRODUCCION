// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/types';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  updateUserProfileInFirestore?: (uid: string, email: string, role: UserRole, name: string, mobilePhone?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

const updateUserProfileInFirestore = async (uid: string, email: string, role: UserRole, name: string, mobilePhone?: string) => {
    const userDocRef = doc(db, 'users', uid);
    const userData: Omit<UserProfile, 'uid'> = {
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    };
    if (mobilePhone) {
      userData.mobilePhone = mobilePhone;
    }
    await setDoc(userDocRef, userData);
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setLoading(true);
      if (user) {
        // Create session cookie
        const idToken = await user.getIdToken();
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });

        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setCurrentUser({ uid: user.uid, ...doc.data() } as UserProfile);
          } else {
            setCurrentUser(null); 
          }
          setLoading(false);
        }, (error) => {
           console.error("Error onSnapshot:", error);
           setCurrentUser(null);
           setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        // Clear session cookie
        await fetch('/api/auth/session', { method: 'DELETE' });
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    updateUserProfileInFirestore,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
