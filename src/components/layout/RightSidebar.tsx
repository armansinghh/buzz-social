import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Avatar from "@/components/ui/Avatar";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useAuth } from "@/features/auth/AuthContext";
import { useFollow } from "@/features/follow/FollowContext";

interface SuggestedUser {
  uid: string;
  username: string;
  name?: string;
  avatar?: string;
}

export default function RightSidebar() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    following,
    followUser,
  } = useFollow();

  const [
    suggestedUsers,
    setSuggestedUsers,
  ] = useState<
    SuggestedUser[]
  >([]);

  useEffect(() => {
    const fetchSuggestedUsers =
      async () => {
        const snap =
          await getDocs(
            collection(
              db,
              "users"
            )
          );

        const users =
          snap.docs
            .map(
              (
                doc
              ) =>
                doc.data() as SuggestedUser
            )
            .filter(
              (
                suggestedUser
              ) =>
                suggestedUser.uid !==
                  user?.uid &&
                !following.includes(
                  suggestedUser.uid
                )
            )
            .slice(
              0,
              4
            );

        setSuggestedUsers(
          users
        );
      };

    fetchSuggestedUsers();
  }, [
    user,
    following,
  ]);

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3 px-1">
          Suggested for You
        </h2>

        <div className="flex flex-col gap-1">
          {suggestedUsers.map(
            (
              suggestedUser
            ) => (
              <div
                key={
                  suggestedUser.uid
                }
                onClick={() =>
                  navigate(
                    `/profile/${suggestedUser.username}`
                  )
                }
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-(--bg-tertiary) transition-colors cursor-pointer group"
              >
                <Avatar
                  name={
                    suggestedUser.name ||
                    suggestedUser.username
                  }
                  src={
                    suggestedUser.avatar
                  }
                  size="sm"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-(--text-primary) truncate">
                    {suggestedUser.name ||
                      suggestedUser.username}
                  </p>

                  <p className="text-xs text-(--text-muted) truncate">
                    @
                    {
                      suggestedUser.username
                    }
                  </p>
                </div>

                <button
                  onClick={(
                    e
                  ) => {
                    e.stopPropagation();

                    followUser(
                      suggestedUser.uid
                    );
                  }}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Follow
                </button>
              </div>
            )
          )}
        </div>
      </div>

      <div className="px-1">
        <p className="text-[11px] text-(--text-muted) leading-relaxed">
          © 2026 Buzz · Made with ❤️ by Arman Singh
        </p>
      </div>
    </div>
  );
}