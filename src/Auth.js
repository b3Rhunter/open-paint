// Auth.js
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const signUp = (email, password) => {
    createUserWithEmailAndPassword(auth, email, password).catch(error => alert(error.message));
  };

  const signIn = (email, password) => {
    signInWithEmailAndPassword(auth, email, password).catch(error => alert(error.message));
  };

  const signOutUser = () => {
    signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  return { user, signUp, signIn, signOutUser };
};

export default useAuth;
