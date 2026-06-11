"use client";

import { useRef } from "react";
import ScrollRestoration from "@/features/navigation/ScrollRestoration";
import Navbar from "./Navbar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import BottomNav from "./BottomNav";
import CreatePostModal from "@/features/posts/components/CreatePostModal";
import NotificationModal from "@/features/notifications/components/NotificationModal";
import CommentsModal from "@/features/posts/components/CommentsModal";
import EmojiPickerPortal from "@/features/posts/components/EmojiPickerPortal";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const mainRef = useRef<HTMLDivElement>(null);

  return (
    // Changed h-screen to h-[100dvh] for mobile browser safety
    <div className="h-dvh flex flex-col overflow-hidden bg-(--bg-primary) text-(--text-primary)">
      <header className="border-b border-(--border-color) shrink-0 z-10">
        <Navbar />
      </header>

      <div className="flex flex-1 min-h-0 relative">
        {/* Left sidebar - Added aria-label */}
        <aside
          aria-label="Primary Navigation"
          className="w-64 border-r border-(--border-color) px-4 py-4 hidden md:flex flex-col bg-(--bg-primary) shrink-0 z-0"
        >
          <LeftSidebar />
        </aside>

        <main
          ref={mainRef}
          // Kept this exactly as you had it
          className="flex-1 overflow-y-auto bg-(--bg-secondary) main-scroll pb-20 md:pb-0"
        >
          <ScrollRestoration containerRef={mainRef} />

          {/* Consider moving max-w-xl mx-auto into the actual Page components 
            instead of the layout, so non-feed pages can use the full width! 
            For now, I've left it, but made sure it has w-full so it spans properly.
          */}
          <div className="w-full max-w-xl mx-auto px-4 py-6">{children}</div>
        </main>

        {/* Right sidebar - Added aria-label */}
        <aside
          aria-label="Secondary Sidebar"
          className="w-64 border-l border-(--border-color) px-4 py-4 hidden xl:flex flex-col bg-(--bg-primary) shrink-0 z-0"
        >
          <RightSidebar />
        </aside>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Modals + Global UI */}
      <CreatePostModal />
      <NotificationModal />
      <CommentsModal />
      <EmojiPickerPortal />
    </div>
  );
}
