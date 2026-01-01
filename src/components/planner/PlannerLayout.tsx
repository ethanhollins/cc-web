"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Feather } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";

interface PlannerLayoutProps {
  sidebar: ReactNode;
  calendar: ReactNode;
  navigation?: ReactNode;
}

const MAX_HEIGHT_VH = 85; // Maximum 85vh
const CLOSED_HEIGHT = 76;
const OPEN_HEIGHT_VH = 50; // Default open height (1/2 of screen)

/**
 * Main layout component for planner page
 * Mobile: Full-screen calendar with drawer sidebar
 * Desktop: Side-by-side with collapsible sidebar
 */
export function PlannerLayout({ sidebar, calendar, navigation }: PlannerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState(CLOSED_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const isMobile = useIsMobile();
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  // Trigger calendar resize when sidebar state changes
  useEffect(() => {
    // Single resize event - instant snap is less jarring than partial animation
    window.dispatchEvent(new Event("resize"));

    // Final resize after transition to ensure correctness
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 10);

    return () => clearTimeout(timer);
  }, [desktopSidebarCollapsed]);

  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    dragStartY.current = clientY;
    dragStartHeight.current = drawerHeight;
  };
  const handleDragMove = useCallback((clientY: number) => {
    const deltaY = dragStartY.current - clientY;
    const vh = window.innerHeight / 100;
    const maxHeightPx = MAX_HEIGHT_VH * vh;
    // Allow dragging all the way down to closed height
    const newHeight = Math.max(CLOSED_HEIGHT, Math.min(maxHeightPx, dragStartHeight.current + deltaY));

    setDrawerHeight(newHeight);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);

    // Only snap closed if dragged very close to bottom
    if (drawerHeight < CLOSED_HEIGHT + 20) {
      setSidebarOpen(false);
      setDrawerHeight(CLOSED_HEIGHT);
    } else {
      // Keep exactly where user dragged it
      setSidebarOpen(true);
    }
  }, [drawerHeight]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent pull-to-refresh
    handleDragStart(e.touches[0].clientY);
  };

  // Add/remove global event listeners
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        handleDragMove(e.clientY);
      };

      const handleMouseUp = () => {
        handleDragEnd();
      };

      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault(); // Prevent pull-to-refresh and scrolling
        handleDragMove(e.touches[0].clientY);
      };

      const handleTouchEnd = () => {
        handleDragEnd();
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Navigation placeholder */}
      {navigation}

      {/* Main content area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Calendar - shrinks when sidebar expands */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Calendar takes full height, with bottom padding equal to drawer height on mobile so content isn't hidden behind the tickets drawer */}
          <div className="flex-1 overflow-hidden" style={{ paddingBottom: isMobile ? (sidebarOpen || isDragging ? drawerHeight : CLOSED_HEIGHT) : 0 }}>
            {calendar}
          </div>

          {/* Mobile: Bottom drawer with peek */}
          <div className="lg:hidden">
            {/* Drawer container */}
            <div
              className={cn(
                "fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]",
                !isDragging && "transition-all duration-300 ease-in-out",
              )}
              style={{ height: `${drawerHeight}px` }}
            >
              {/* Toggle/drag bar - always visible */}
              <div
                className="flex h-10 w-full cursor-grab items-center justify-center bg-white active:cursor-grabbing"
                style={{ touchAction: "none" }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onClick={() => {
                  // Only toggle if not dragging
                  if (!isDragging) {
                    if (sidebarOpen) {
                      setSidebarOpen(false);
                      setDrawerHeight(CLOSED_HEIGHT);
                    } else {
                      const vh = window.innerHeight / 100;
                      const openHeightPx = OPEN_HEIGHT_VH * vh;
                      setSidebarOpen(true);
                      setDrawerHeight(openHeightPx);
                    }
                  }
                }}
              >
                <div className="flex flex-col items-center">
                  {/* Drag handle indicator */}
                  <div className="h-1 w-12 rounded-full bg-gray-300" />
                </div>
              </div>

              {/* Drawer content */}
              <div className="flex-1 overflow-hidden">{sidebar}</div>
            </div>
          </div>
        </div>

        {/* Desktop: Side-by-side sidebar */}
        <div className="relative hidden lg:flex">
          {/* Expanded sidebar content */}
          <div
            className={cn(
              "flex flex-col border-l border-gray-200 bg-white transition-all duration-150",
              desktopSidebarCollapsed ? "w-0 overflow-hidden opacity-0" : "xl:w-70 w-60 opacity-100",
            )}
          >
            {!desktopSidebarCollapsed && <div className="flex-1 overflow-hidden">{sidebar}</div>}
          </div>

          {/* Collapsed thin sidebar with icons - stays on right */}
          <div className={cn("flex w-12 flex-col items-center bg-white py-4", desktopSidebarCollapsed && "border-l border-gray-200")}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-lg transition-colors",
                !desktopSidebarCollapsed ? "bg-violet-50 text-violet-700" : "text-gray-600 hover:bg-gray-100",
              )}
              onClick={() => setDesktopSidebarCollapsed(!desktopSidebarCollapsed)}
              aria-label="Toggle tickets sidebar"
            >
              <Feather className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
