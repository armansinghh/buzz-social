import { useEffect } from "react";
import EmptyState from "@/components/ui/EmptyState";
import PeopleCard from "../components/PeopleCard";
import PeopleSkeleton from "@/components/skeletons/PeopleSkeleton";
import { useExploreUsers } from "../hooks/useExploreUsers";


const PeopleEmptyIcon = (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default function PeopleTab() {
  const { users, usersLoading, hasMoreUsers, loadingMoreUsers, loadUsers, loadMoreUsers } = useExploreUsers();

  // Fire on mount when this tab is selected
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) mb-3">
        People on Buzz
      </h2>
      {usersLoading ? (
        <PeopleSkeleton />
      ) : users.length === 0 ? (
        <EmptyState icon={PeopleEmptyIcon} title="No users found" subtitle="Invite your friends to join Buzz!" />
      ) : (
        <>
          {users.map((u) => (
            <PeopleCard key={u.uid} person={u} />
          ))}
          {hasMoreUsers && (
            <div className="flex justify-center pt-2">
              <button
                onClick={loadMoreUsers}
                disabled={loadingMoreUsers}
                className="px-5 py-2 rounded-xl bg-(--bg-primary) border border-(--border-color) text-sm hover:bg-(--bg-secondary) transition"
              >
                {loadingMoreUsers ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}