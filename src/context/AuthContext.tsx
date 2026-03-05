import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { auth } from '../config/firebaseConfig';
import { signOut, onAuthStateChanged, type Unsubscribe } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let unsubscribe: Unsubscribe;

    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // In production, fetch full user data from Firestore
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            role: 'student', // This should come from Firestore
            phone: firebaseUser.phoneNumber || '',
            isVerified: firebaseUser.emailVerified,
            createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime) : new Date(),
            lastLogin: firebaseUser.metadata.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : new Date(),
            isActive: true,
          };
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
      throw err;
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
