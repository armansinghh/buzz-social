import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const provider = new GoogleAuthProvider();

const saveUser = async (user: any) => {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // 1. Build the base user data without the avatar field
    const newUserData: Record<string, any> = {
      uid: user.uid,
      name: user.displayName || "Anonymous",
      email: user.email,
      createdAt: serverTimestamp(), // accurate server time
    };

    // 2. Only add the avatar field if it is a valid HTTPS URL
    if (user.photoURL && user.photoURL.startsWith("https://")) {
      newUserData.avatar = user.photoURL;
    }

    // 3. Save to Firestore
    await setDoc(ref, newUserData);
  }
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  await saveUser(result.user);
  return result.user;
};

export const signUp = async (email: string, password: string) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  await saveUser(res.user);
  return res.user;
};

export const login = async (email: string, password: string) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};

export const logout = async () => {
  await signOut(auth);
};