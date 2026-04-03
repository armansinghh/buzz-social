import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProtectedRoute({ children }: any) {
  const { user, loading } = useAuth();

  const [checking, setChecking] = useState(true);
  const [hasUsername, setHasUsername] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists() && snap.data().username) {
        setHasUsername(true);
      }

      setChecking(false);
    };

    checkUser();
  }, [user]);

  // ⏳ still loading auth OR checking Firestore
  if (loading || checking) {
    return <div>Loading...</div>;
  }

  // ❌ not logged in
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // ❌ logged in but no username
  if (!hasUsername) {
    return <Navigate to="/onboarding" />;
  }

  // ✅ all good
  return children;
}