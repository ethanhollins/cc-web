"use client";

import { useEffect } from "react";

export interface HotkeyConfig {
  key: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  callback: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
  enabled?: boolean;
}

/**
 * Hook to register keyboard shortcuts
 * @param hotkeys - Array of hotkey configurations
 *
 * @example
 * useHotkeys([
 *   {
 *     key: ' ', // Space
 *     shiftKey: true,
 *     callback: () => console.log('Shift + Space pressed'),
 *     preventDefault: true
 *   }
 * ]);
 */
export function useHotkeys(hotkeys: HotkeyConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const hotkey of hotkeys) {
        // Skip if hotkey is disabled
        if (hotkey.enabled === false) continue;

        // Check if all modifiers match
        const shiftMatch = hotkey.shiftKey === undefined || hotkey.shiftKey === event.shiftKey;
        const ctrlMatch = hotkey.ctrlKey === undefined || hotkey.ctrlKey === event.ctrlKey;
        const metaMatch = hotkey.metaKey === undefined || hotkey.metaKey === event.metaKey;
        const altMatch = hotkey.altKey === undefined || hotkey.altKey === event.altKey;
        const keyMatch = hotkey.key.toLowerCase() === event.key.toLowerCase();

        if (keyMatch && shiftMatch && ctrlMatch && metaMatch && altMatch) {
          // Don't trigger hotkeys when typing in input fields
          const target = event.target as HTMLElement;
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

          if (!isInput) {
            if (hotkey.preventDefault) {
              event.preventDefault();
            }
            hotkey.callback(event);
            break;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hotkeys]);
}
