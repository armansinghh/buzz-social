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
    const cleanedUsername = username.trim().toLowerCase();

    if (!cleanedUsername) {
      setError("Username is required");
      return;
    }

    setLoading(true);
    setError("");

    const isAvailable = await checkUsername(cleanedUsername);

    if (!isAvailable) {
      setError("Username already taken");

      setLoading(false);
      return;
    }

    await setDoc(
      doc(db, "users", user.uid),
      {
        username: cleanedUsername,
      },
      { merge: true },
    );

    await refreshProfile();

    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-(--bg-secondary)">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-(--accent)">Welcome to Buzz</p>

          <h1 className="mt-2 text-4xl font-bold text-(--text-primary)">
            Let’s set up your profile
          </h1>

          <p className="mt-3 text-sm text-(--text-muted)">
            Pick a username so people can find you easily.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-(--text-secondary)">
              Username
            </label>

            <div className="flex items-center px-4 py-3 rounded-2xl border border-(--border-color) bg-(--bg-primary) focus-within:border-(--accent) transition">
              <span className="mr-2 text-(--text-muted)">@</span>

              <input
                type="text"
                placeholder="yourusername"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                className="flex-1 bg-transparent outline-none text-sm text-(--text-primary) placeholder:text-(--text-muted)"
              />
            </div>

            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !username.trim()}
            className="w-full py-3 rounded-2xl bg-(--accent) text-(--bg-primary) font-medium disabled:opacity-50 hover:opacity-90 transition"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
