import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import BottomNav from "./BottomNav";
import CreatePostModal from "@/features/posts/components/CreatePostModal";
import NotificationModal from "@/features/notifications/components/NotificationModal";
import CommentsModal from "@/features/posts/components/CommentsModal";
import EmojiPickerPortal from "@/features/posts/components/EmojiPickerPortal";

export default function AppLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-(--bg-primary) text-(--text-primary)">
      <header className="border-b border-(--border-color) shrink-0">
        <Navbar />
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Left sidebar */}
        <aside className="w-64 border-r border-(--border-color) px-4 py-4 hidden md:flex flex-col bg-(--bg-primary) shrink-0">
          <LeftSidebar />
        </aside>

        {/* Main feed */}
        <main className="flex-1 overflow-y-auto bg-(--bg-secondary) main-scroll pb-20 md:pb-0">
          <div className="max-w-xl mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="w-64 border-l border-(--border-color) px-4 py-4 hidden xl:flex flex-col bg-(--bg-primary) shrink-0">
          <RightSidebar />
        </aside>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Modals + Global UI */}
      <CreatePostModal />
      <NotificationModal />
      <CommentsModal />
      <EmojiPickerPortal /> {/* ✅ ADD THIS */}
    </div>
  );
}