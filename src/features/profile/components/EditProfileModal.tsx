import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  updateDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth/AuthContext";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Avatar from "@/components/ui/Avatar";
import { invalidateUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/contexts/ToastContext";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  onSaved,
}: EditProfileModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && profile) {
      setName(profile.name ?? "");
      setUsername(profile.username ?? "");
      setAvatarFile(null);
      setAvatarPreview(null);
      setError("");
      setUsernameError("");
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isOpen, saving, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Avatar size verification check (5MB Limit)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Profile picture is too large! Max size is 5MB.", "error");
      e.target.value = ""; // Clear the native input element selection
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const validateUsername = (value: string) => {
    if (!value.trim()) return "Username is required";
    if (value.length < 3) return "At least 3 characters";
    if (value.length > 30) return "Max 30 characters";
    if (!/^[a-z0-9_]+$/.test(value))
      return "Only lowercase letters, numbers, and underscores";
    return "";
  };

  const handleUsernameChange = (value: string) => {
    const clean = value.toLowerCase().replace(/\s/g, "");
    setUsername(clean);
    setUsernameError(validateUsername(clean));
  };

  const handleSave = async () => {
    const usernameErr = validateUsername(username);
    if (usernameErr) {
      setUsernameError(usernameErr);
      return;
    }

    setSaving(true);
    setError("");

    try {
      // Check username uniqueness only if changed
      if (username !== profile?.username) {
        const q = query(
          collection(db, "users"),
          where("username", "==", username),
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setUsernameError("Username already taken");
          setSaving(false);
          return;
        }
      }

      // Upload new avatar if changed
      let avatarUrl = profile?.avatar ?? "";
      if (avatarFile) {
        const result = await uploadToCloudinary(avatarFile);
        avatarUrl = result.url;
      }

      //  Changed type to 'any' so we can conditionally add the avatar
      const updates: Record<string, any> = {
        name: name.trim(),
        username: username.trim(),
      };

      // Only include the avatar field if it is actually a valid HTTPS URL
      if (avatarUrl && avatarUrl.startsWith("https://")) {
        updates.avatar = avatarUrl;
      }

      // 1. Save to Firestore user document
      await updateDoc(doc(db, "users", user.uid), updates);

      // 2. Bust the in-memory cache so every PostCard re-fetches this uid
      //    on next render — username + avatar will be fresh immediately
      invalidateUserProfile(user.uid);

      // 3. Refresh AuthContext so Navbar/profile header also updates
      await refreshProfile();

      // Construct the new profile object manually so we can pass it
      const nextProfile = { ...profile, ...updates, uid: user.uid };

      onSaved();

      if (username !== profile?.username) {
        navigate(`/profile/${username}`, {
          replace: true,
          // Pass the updated data directly to the new route!
          state: { preloadedProfile: nextProfile },
        });
      }

      onClose();
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const currentAvatar = avatarPreview ?? profile?.avatar;
  const currentName = profile?.name || profile?.username || "User";
  const hasChanges =
    name !== (profile?.name ?? "") ||
    username !== (profile?.username ?? "") ||
    avatarFile !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <div
        className="bg-(--bg-primary) w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-hidden modal-in border border-(--border-color)"
        style={{ boxShadow: "var(--shadow-md)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--border-color)">
          <button
            onClick={() => {
              if (!saving) onClose();
            }}
            className="text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors disabled:opacity-40"
            disabled={saving}
          >
            Cancel
          </button>

          <h2 className="text-sm font-semibold text-(--text-primary)">
            Edit Profile
          </h2>

          <button
            onClick={handleSave}
            disabled={saving || !hasChanges || !!usernameError}
            className={`text-sm font-semibold transition-opacity
              ${
                hasChanges && !usernameError
                  ? "text-blue-500 hover:text-blue-400"
                  : "text-(--text-muted) cursor-not-allowed opacity-50"
              }`}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center pt-6 pb-4 px-5 border-b border-(--border-color)">
          <div className="relative group">
            <Avatar
              name={currentName}
              src={currentAvatar}
              size="lg"
              className="ring-2 ring-(--border-color)"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              aria-label="Change avatar"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="sr-only"
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
          >
            Change photo
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-(--text-secondary) mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              maxLength={50}
              className="w-full border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) placeholder:text-(--text-muted) px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-(--accent)/20 focus:border-(--accent) transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-(--text-secondary) mb-1.5">
              Username
            </label>
            <div
              className={`flex items-center border bg-(--bg-secondary) px-3 py-2.5 rounded-xl transition
                ${
                  usernameError
                    ? "border-red-400 ring-2 ring-red-400/20"
                    : "border-(--border-color) focus-within:ring-2 focus-within:ring-(--accent)/20 focus-within:border-(--accent)"
                }`}
            >
              <span className="text-(--text-muted) text-sm mr-1.5">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="yourusername"
                maxLength={30}
                className="flex-1 bg-transparent text-(--text-primary) placeholder:text-(--text-muted) text-sm outline-none"
              />
            </div>
            {usernameError && (
              <p className="mt-1.5 text-xs text-red-500">{usernameError}</p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
              <span className="text-red-500 text-xs">⚠</span>
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )}
        </div>

        {saving && (
          <div className="px-5 pb-5">
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-(--text-muted)">
              <div className="w-4 h-4 border-2 border-(--border-color) border-t-(--text-secondary) rounded-full animate-spin" />
              <span>Saving changes…</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
