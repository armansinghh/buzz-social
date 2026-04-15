import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase";

import Avatar from "@/components/ui/Avatar";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchUser {
  uid: string;
  username: string;
  name: string;
  avatar?: string;
}

export default function Search() {
  const [search, setSearch] = useState("");

  const [users, setUsers] = useState<SearchUser[]>([]);

  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearch.trim()) {
        setUsers([]);
        return;
      }

      try {
        setLoading(true);

        const q = query(
          collection(db, "users"),
          orderBy("username"),
          where("username", ">=", debouncedSearch),
          where("username", "<=", debouncedSearch + "\uf8ff"),
        );

        const snapshot = await getDocs(q);

        const results = snapshot.docs.map((doc) => doc.data()) as SearchUser[];

        setUsers(results);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearch]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Search Users</h1>

      <input
        type="text"
        placeholder="Search by username..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 rounded-xl border border-(--border-color) bg-(--bg-primary)"
      />

      {loading && <p className="text-(--text-muted)">Searching...</p>}

      {!loading && users.length === 0 && debouncedSearch && (
        <p className="text-(--text-muted)">No users found.</p>
      )}

      <div className="space-y-3">
        {users.map((user) => (
          <Link
            key={user.uid}
            to={`/profile/${user.username}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-(--bg-secondary) transition"
          >
            <Avatar name={user.username} src={user.avatar} size="md" />

            <div>
              <p className="font-medium">{user.username}</p>

              <p className="text-sm text-(--text-muted)">{user.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
