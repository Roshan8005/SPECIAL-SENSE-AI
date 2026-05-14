import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial connection test
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Create/update user doc
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDocFromServer(userRef);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              email: currentUser.email ?? null,
              displayName: currentUser.displayName ?? null,
              photoURL: currentUser.photoURL ?? null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          } else {
            // Check if we need to update info
            const data = userSnap.data();
            if (data.displayName !== currentUser.displayName || data.photoURL !== currentUser.photoURL) {
              await setDoc(userRef, {
                displayName: currentUser.displayName ?? null,
                photoURL: currentUser.photoURL ?? null,
                updatedAt: serverTimestamp()
              }, { merge: true });
            }
          }
        } catch (e) {
          console.error("Error setting user doc", e);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
        {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
