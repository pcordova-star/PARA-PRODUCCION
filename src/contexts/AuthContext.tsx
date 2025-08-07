
// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
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
    
    // Check if the document already exists to avoid overwriting trial data
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30);

        const userData: Omit<UserProfile, 'uid'> = {
          name,
          email,
          role,
          createdAt: new Date().toISOString(),
          subscriptionStatus: 'trialing',
          trialEndsAt: trialEndDate.toISOString(),
        };
        if (mobilePhone) {
          userData.mobilePhone = mobilePhone;
        }
        await setDoc(userDocRef, userData);
    } else {
        // If user exists, only update specified fields, don't touch subscription data
        const existingData = docSnap.data();
        const userData: Partial<UserProfile> = {
          ...existingData, // carry over existing data
          name,
          email,
          role,
        };
         if (mobilePhone) {
          userData.mobilePhone = mobilePhone;
        }
        await setDoc(userDocRef, userData, { merge: true });
    }
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setLoading(true);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setCurrentUser({ uid: user.uid, ...doc.data() } as UserProfile);
          } else {
            // This case can happen if a user is in auth but not yet in firestore.
            // Or if the user was deleted from firestore but not from auth.
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
