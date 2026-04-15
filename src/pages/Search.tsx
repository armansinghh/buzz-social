import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import Avatar from "@/components/ui/Avatar";

interface SearchUser {
  uid: string;
  username: string;
  name: string;
  avatar?: string;
}

export default function Search() {
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [query, setQuery] = useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap =
          await getDocs(
            collection(db, "users")
          );

        const fetchedUsers =
          snap.docs.map((doc) =>
            doc.data()
          ) as SearchUser[];

        setUsers(fetchedUsers);
      } catch (err) {
        console.error(
          "Failed to fetch users:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.username
        ?.toLowerCase()
        .includes(
          query.toLowerCase()
        ) ||
      user.name
        ?.toLowerCase()
        .includes(
          query.toLowerCase()
        )
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Search Users
      </h1>

      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) =>
          setQuery(e.target.value)
        }
        className="w-full p-3 rounded-xl border border-(--border-color) bg-(--bg-primary)"
      />

      {loading ? (
        <p className="text-(--text-muted)">
          Loading users...
        </p>
      ) : (
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <p className="text-(--text-muted)">
              No users found.
            </p>
          ) : (
            filteredUsers.map((user) => (
              <Link
                key={user.uid}
                to={`/profile/${user.username}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-(--bg-secondary) transition"
              >
                <Avatar
                  name={
                    user.username
                  }
                  src={
                    user.avatar
                  }
                  size="md"
                />

                <div>
                  <p className="font-medium">
                    {
                      user.username
                    }
                  </p>

                  <p className="text-sm text-(--text-muted)">
                    {user.name}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}