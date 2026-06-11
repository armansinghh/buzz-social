"use client"

import { useLayoutEffect, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function ScrollRestoration({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const location = usePathname();
  const isRestoringRef = useRef(false);

  const getKey = (path: string) => `scroll:${path}`;

  // 1. Restore scroll synchronously before paint
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Lock the scroll listener to prevent it from saving this programmatic shift
    isRestoringRef.current = true;

    const saved = Number(localStorage.getItem(getKey(location)) || 0);
    container.scrollTop = saved;

    // Unlock after the browser paints and settles
    const frameId = requestAnimationFrame(() => {
      isRestoringRef.current = false;
    });

    return () => cancelAnimationFrame(frameId);
  }, [location]);

  // 2. Save scroll while scrolling (Debounced)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      // If we are currently restoring the page's scroll position, IGNORE THE EVENT.
      // This stops scroll contamination dead in its tracks.
      if (isRestoringRef.current) return;

      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        localStorage.setItem(
          getKey(location),
          String(container.scrollTop)
        );
      }, 150);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
      
      // DELETED: the localStorage save on unmount.
      // When a component unmounts, the DOM is often collapsing or empty. 
      // Saving here accidentally overwrites your good saved data with `0`.
    };
  }, [location]);

  return null;
}