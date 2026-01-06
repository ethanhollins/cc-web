import { useEffect, useState } from "react";

/**
 * Hook to detect and track the on-screen keyboard offset on mobile devices.
 * Uses the Visual Viewport API to calculate how much the viewport height changes
 * when the keyboard appears.
 *
 * @returns The keyboard offset in pixels (0 when keyboard is hidden)
 */
export function useKeyboardOffset(): number {
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined" || !window.visualViewport) return;

      const viewport = window.visualViewport;
      const offset = window.innerHeight - viewport.height;
      setKeyboardOffset(offset > 0 ? offset : 0);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.visualViewport.removeEventListener("scroll", handleResize);
      }
    };
  }, []);

  return keyboardOffset;
}
