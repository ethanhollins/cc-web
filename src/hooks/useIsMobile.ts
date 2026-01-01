"use client";

import { useEffect, useState } from "react";

/**
 * Shared hook to detect if the current viewport is considered mobile.
 *
 * Mobile breakpoint is aligned with Tailwind's `lg` breakpoint (1024px).
 */
export function useIsMobile() {
  // Default to false during SSR; hydrate on client
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // TODO: Improve breakpoint handling if design system changes
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);

    return () => {
      window.removeEventListener("resize", updateIsMobile);
    };
  }, []);

  return isMobile;
}
