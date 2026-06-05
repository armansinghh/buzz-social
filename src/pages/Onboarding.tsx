import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  usePageTitle("Complete Your Profile");

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Safety net: if the user already has a username (e.g. they landed here
  // due to a previous offline bug), redirect them home immediately.
  useEffect(() => {
    if (!user) return;

    const checkExisting = async () => {
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data()?.username) {
          // Already has a username — do not let them overwrite it
          navigate("/", { replace: true });
          return;
        }
      } catch (err) {
        // If this check fails offline, just let them proceed —
        // the submit handler has its own guard too
        console.warn("Could not verify existing username:", err);
      } finally {
        setChecking(false);
      }
    };

    checkExisting();
  }, [user, navigate]);

  if (!user || checking) return null;

  const checkUsernameAvailable = async (username: string) => {
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

    try {
      // Double-check they don't already have a username before writing
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data()?.username) {
        // Already has one — just go home
        navigate("/", { replace: true });
        return;
      }

      const isAvailable = await checkUsernameAvailable(cleanedUsername);
      if (!isAvailable) {
        setError("Username already taken");
        setLoading(false);
        return;
      }

      await setDoc(ref, { username: cleanedUsername }, { merge: true });

      await refreshProfile();
      navigate("/");
    } catch (err) {
      console.error("Failed saving username:", err);
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-(--bg-secondary)">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-(--accent)">Welcome to Buzz</p>
          <h1 className="mt-2 text-4xl font-bold text-(--text-primary)">
            Let's set up your profile
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
