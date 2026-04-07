import {
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

// Save user to Firestore (only on first sign-in)
export const saveUser = async (user: any) => {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      name: user.displayName || "Anonymous",
      email: user.email,
      photoURL: user.photoURL || "",
      username: user.username || "Anonymous",
      createdAt: new Date(),
    });
  }
};

// Google Login
// - Dev (localhost): popup — redirect doesn't work without Firebase Hosting
// - Prod (Firebase Hosting / Vercel): redirect — avoids COOP browser security issues
export const signInWithGoogle = async () => {
  if (import.meta.env.DEV) {
    const result = await signInWithPopup(auth, provider);
    await saveUser(result.user);
  } else {
    await signInWithRedirect(auth, provider);
    // saveUser is called in AuthContext after getRedirectResult resolves
  }
};

// Email Signup
export const signUp = async (email: string, password: string) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  await saveUser(res.user);
  return res.user;
};

// Email Login
export const login = async (email: string, password: string) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};

// Logout
export const logout = async () => {
  await signOut(auth);
};