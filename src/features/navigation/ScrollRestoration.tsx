import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollRestoration({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const location = useLocation();

  const getKey = (path: string) => `scroll:${path}`;

  // restore scroll when route changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const saved = Number(
      localStorage.getItem(getKey(location.pathname)) || 0
    );

    // wait for layout to stabilize
    requestAnimationFrame(() => {
      container.scrollTop = saved;
    });
  }, [location.pathname]);

  // Save scroll while scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      localStorage.setItem(
        getKey(location.pathname),
        String(container.scrollTop)
      );
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);

      // ensure last position is saved on route change
      localStorage.setItem(
        getKey(location.pathname),
        String(container.scrollTop)
      );
    };
  }, [location.pathname]);

  return null;
}