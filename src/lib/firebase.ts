import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCrV33zfMBme_gWggSkPOBTzSyVzQUcaDU",
  authDomain: "buzz-social-52827.firebaseapp.com",
  projectId: "buzz-social-52827",
  storageBucket: "buzz-social-52827.firebasestorage.app",
  messagingSenderId: "974839938234",
  appId: "1:974839938234:web:7c39de25977f91b1875683"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);