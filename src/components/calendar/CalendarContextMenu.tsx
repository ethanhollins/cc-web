"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { Card } from "@/ui/card";

// Union type for different context menu types
export type CalendarContextMenuState =
  | { show: boolean; x: number; y: number; type: "event"; eventId?: string; googleCalendarId?: string }
  | { show: boolean; x: number; y: number; type: "selection"; startDate?: Date; endDate?: Date };

interface CalendarContextMenuProps {
  contextMenu: CalendarContextMenuState;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Context menu for calendar interactions (right-click events or time selections)
 * Touch-optimized with larger tap targets
 * Accepts menu items as children for maximum flexibility
 */
export function CalendarContextMenu({ contextMenu, onClose, children }: CalendarContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!contextMenu.show) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [contextMenu.show, onClose]);

  // Position menu to stay on screen
  useEffect(() => {
    if (!contextMenu.show || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = contextMenu.x;
    let y = contextMenu.y;

    // Adjust if menu goes off right edge
    if (x + rect.width > viewportWidth) {
      x = viewportWidth - rect.width - 8;
    }

    // Adjust if menu goes off bottom edge
    if (y + rect.height > viewportHeight) {
      y = viewportHeight - rect.height - 8;
    }

    menu.style.left = `${Math.max(8, x)}px`;
    menu.style.top = `${Math.max(8, y)}px`;
  }, [contextMenu.show, contextMenu.x, contextMenu.y]);

  if (!contextMenu.show) return null;

  return (
    <Card ref={menuRef} className="fixed z-50 w-48 rounded border border-gray-200 bg-white p-1 shadow-lg" style={{ left: contextMenu.x, top: contextMenu.y }}>
      {children}
    </Card>
  );
}
