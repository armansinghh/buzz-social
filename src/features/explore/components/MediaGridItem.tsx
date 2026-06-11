"use client"

import { FaHeart, FaComment } from "react-icons/fa6";
import type { Post } from "@/types/post";

export default function MediaGridItem({ post, onClick }: { post: Post; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative aspect-square rounded-xl overflow-hidden bg-(--bg-tertiary) group"
    >
      {post.media?.type === "image" ? (
        <img
          src={post.media.url}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : post.media?.type === "video" ? (
        <video
          src={post.media.url}
          className="w-full h-full object-cover"
          muted
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-3">
          <p className="text-xs text-(--text-secondary) text-center line-clamp-4 leading-relaxed">
            {post.caption}
          </p>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-end p-2 opacity-0 group-hover:opacity-100">
        <div className="flex items-center gap-2 text-white text-xs font-semibold drop-shadow">
          <span className="flex items-center justify-center gap-1 whitespace-nowrap">
            <FaHeart /> {post.likes.length}
          </span>
          <span className="flex items-center justify-center gap-1 whitespace-nowrap">
            <FaComment /> {post.comments.length}
          </span>
        </div>
      </div>
      {post.media?.type === "video" && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      )}
    </button>
  );
}