import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

// 🔹 Save user in Firestore
const saveUser = async (user: any) => {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      name: user.displayName || "Anonymous",
      email: user.email,
      avatar: user.photoURL || "",
      createdAt: new Date(),
    });
  }
};

// 🔹 Google Login
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  await saveUser(user);
  return user;
};

// 🔹 Email Signup
export const signUp = async (email: string, password: string) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  await saveUser(res.user);
  return res.user;
};

// 🔹 Email Login
export const login = async (email: string, password: string) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};

// 🔹 Logout
export const logout = async () => {
  await signOut(auth);
};