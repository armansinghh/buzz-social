import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollRestoration({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const location = useLocation();

  const getKey = (path: string) => `scroll:${path}`;

  // 1. Restore scroll when route changes (with rAF cleanup)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const saved = Number(
      localStorage.getItem(getKey(location.pathname)) || 0
    );

    // Save the frame ID so we can cancel it if the component unmounts
    const frameId = requestAnimationFrame(() => {
      container.scrollTop = saved;
    });

    return () => cancelAnimationFrame(frameId);
  }, [location.pathname]);

  // 2. Save scroll while scrolling (Debounced for performance)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      // Clear the previous timeout if the user is still scrolling
      clearTimeout(timeoutId);

      // Only write to localStorage after they stop scrolling for 150ms
      timeoutId = setTimeout(() => {
        localStorage.setItem(
          getKey(location.pathname),
          String(container.scrollTop)
        );
      }, 150);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);

      // Ensure last position is saved immediately on route change or unmount
      localStorage.setItem(
        getKey(location.pathname),
        String(container.scrollTop)
      );
    };
  }, [location.pathname]);

  return null;
}