"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const { onAuthStateChanged } = await import("firebase/auth");
      const { doc, getDoc } = await import("firebase/firestore");
      const { getFirebaseAuth, getFirebaseDb } = await import("@/lib/firebase");

      const firebaseAuth = await getFirebaseAuth();
      const firebaseDb = await getFirebaseDb();

      unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
          try {
            const userDoc = await getDoc(doc(firebaseDb, "users", firebaseUser.uid));
            if (userDoc.exists() && userDoc.data().role === "admin") {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } catch {
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        setLoading(false);
      });
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const logout = async () => {
    const { signOut } = await import("firebase/auth");
    const { getFirebaseAuth } = await import("@/lib/firebase");
    const auth = await getFirebaseAuth();
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
