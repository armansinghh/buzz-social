import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    // Append the app brand name automatically to maintain uniform tab styling
    document.title = `${title} • Buzz`;
  }, [title]);
}