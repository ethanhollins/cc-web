import React from "react";
import { Eye, Trash01 } from "@untitledui/icons";
import { ContextMenu } from "@/hooks/use-calendar-interactions";

interface CalendarContextMenuProps {
    contextMenu: ContextMenu;
    onOpenEvent: () => void;
    onDeleteEvent: () => void;
}

/**
 * Shared context menu component for calendar events
 */
export function CalendarContextMenu({ contextMenu, onOpenEvent, onDeleteEvent }: CalendarContextMenuProps) {
    if (!contextMenu.show) {
        return null;
    }

    return (
        <div
            className="fixed z-50 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
            style={{
                left: `${contextMenu.x}px`,
                top: `${contextMenu.y}px`,
            }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <button className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-gray-50" onClick={onOpenEvent}>
                <Eye className="mr-2 size-4" />
                Open Event
            </button>
            <button className="flex w-full items-center px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" onClick={onDeleteEvent}>
                <Trash01 className="mr-2 size-4" />
                Delete Event
            </button>
        </div>
    );
}
