import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import CreatePostModal from "@/features/posts/components/CreatePostModal";
import NotificationModal from "@/features/notifications/components/NotificationModal";
import CommentsModal from "@/features/posts/components/CommentsModal";

export default function AppLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-zinc-950 text-black dark:text-white">
      <header className="border-b border-gray-200 dark:border-zinc-700 px-6 flex items-center bg-white dark:bg-zinc-900">
        <Navbar />
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-72 border-r border-gray-200 dark:border-zinc-700 p-6 hidden lg:block bg-white dark:bg-zinc-900">
          <LeftSidebar />
        </aside>

        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-950 p-8 main-scroll">
          <div className="max-w-2xl mx-auto">
            <Outlet />
          </div>
        </main>

        <aside className="w-72 border-l border-gray-200 dark:border-zinc-700 p-6 hidden xl:block bg-white dark:bg-zinc-900">
          <RightSidebar />
        </aside>
      </div>

      <CreatePostModal />
      <NotificationModal />
      <CommentsModal />
    </div>
  );
}