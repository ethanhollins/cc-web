"use client";

import { useEffect, useRef } from "react";
import { Edit, ExternalLink, Trash2 } from "lucide-react";
import type { ContextMenu } from "@/hooks/useCalendarInteractions";
import { Card } from "@/ui/card";

interface CalendarContextMenuProps {
  contextMenu: ContextMenu;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  onOpenInCalendar?: (googleCalendarId: string) => void;
  onClose: () => void;
}

/**
 * Context menu for calendar events (right-click or long-press)
 * Touch-optimized with larger tap targets
 */
export function CalendarContextMenu({ contextMenu, onEdit, onDelete, onOpenInCalendar, onClose }: CalendarContextMenuProps) {
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
      {/* Open Ticket */}
      <button
        onClick={() => {
          if (contextMenu.eventId && onEdit) onEdit(contextMenu.eventId);
          onClose();
        }}
        className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
      >
        <Edit className="h-4 w-4" />
        Open Ticket
      </button>

      {/* Delete */}
      <button
        onClick={() => {
          if (contextMenu.eventId && onDelete) onDelete(contextMenu.eventId);
          onClose();
        }}
        className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        Delete Event
      </button>

      {/* Open in Calendar */}
      {contextMenu.googleCalendarId && onOpenInCalendar && (
        <button
          onClick={() => {
            onOpenInCalendar(contextMenu.googleCalendarId!);
            onClose();
          }}
          className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
        >
          <ExternalLink className="h-4 w-4" />
          Open in Google Calendar
        </button>
      )}
    </Card>
  );
}
