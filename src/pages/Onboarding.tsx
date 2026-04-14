import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const checkUsername = async (username: string) => {
    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);
    return snap.empty;
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setLoading(true);
    setError("");

    const isAvailable = await checkUsername(username);

    if (!isAvailable) {
      setError("Username already taken");
      setLoading(false);
      return;
    }

    await setDoc(
      doc(db, "users", user.uid),
      {
        username,
      },
      { merge: true },
    );

    await refreshProfile();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg-secondary)">
      <div className="w-full max-w-sm bg-(--bg-primary) p-6 rounded-2xl border border-(--border-color)">
        <h1 className="text-lg font-semibold mb-4">Choose a username</h1>

        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 rounded-xl border border-(--border-color) bg-(--bg-secondary)"
        />

        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-4 bg-(--accent) p-3 rounded-xl text-(--bg-primary)"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
