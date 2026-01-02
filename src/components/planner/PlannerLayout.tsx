"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Feather } from "lucide-react";
import { PlannerNavBar } from "@/components/planner/PlannerNavBar";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePlannerTheme } from "@/hooks/usePlannerTheme";
import { cn } from "@/lib/utils";

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
  const { theme, containerClass, setTheme } = usePlannerTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [activePanelId, setActivePanelId] = useState<string | null>("tickets");
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

  const isDark = theme === "soft-dark";

  return (
    <div className={cn(containerClass, "flex h-full w-full flex-col bg-[var(--planner-bg)]")}>
      {/* Optional top navigation bar; omit entirely when no navigation is provided */}
      {navigation && (
        <div className="flex items-center justify-between px-3 pb-2 pt-2 sm:px-4 sm:pt-3">
          <div className="min-w-0 flex-1">{navigation}</div>
        </div>
      )}

      {/* Main content area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Calendar - shrinks when sidebar expands */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Calendar takes full height, with bottom padding equal to drawer height on mobile so content isn't hidden behind the tickets drawer */}
          <div
            className="flex-1 overflow-hidden bg-[var(--planner-surface)] shadow-[var(--planner-card-shadow)] lg:mx-4 lg:mt-3"
            style={{
              // On mobile, keep the calendar flush with the viewport edges
              // (no rounding). On desktop, round only the top corners so the
              // bottom edge lines up cleanly against the drawer/sidebar.
              borderRadius: isMobile ? 0 : "var(--planner-surface-radius) var(--planner-surface-radius) 0 0",
              paddingBottom: isMobile ? (sidebarOpen || isDragging ? drawerHeight : CLOSED_HEIGHT) : 0,
            }}
          >
            {calendar}
          </div>

          {/* Mobile: Bottom drawer with peek */}
          <div className="lg:hidden">
            {/* Drawer container */}
            <div
              className={cn(
                "fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--planner-sidebar-surface,var(--planner-sidebar-bg))] shadow-[0_-4px_18px_rgba(15,23,42,0.18)]",
                !isDragging && "transition-all duration-300 ease-in-out",
              )}
              style={{ height: `${drawerHeight}px` }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_45%)]" />
              <div className="relative z-10 flex h-full flex-col">
                {/* Toggle/drag bar - always visible */}
                <div
                  className="flex h-10 w-full cursor-grab items-center justify-center active:cursor-grabbing"
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
                    <div className="h-1 w-12 rounded-full bg-[var(--border-strong)]" />
                  </div>
                </div>

                {/* Drawer content */}
                <div className="flex-1 overflow-hidden">{sidebar}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Side-by-side sidebar */}
        <div className="relative hidden lg:flex">
          {/* Expanded side panel area driven by nav bar selection */}
          <div
            className={cn(
              "relative flex flex-col overflow-hidden border-l border-[var(--border-subtle)] bg-[var(--planner-sidebar-surface,var(--planner-sidebar-bg))] transition-all duration-150",
              desktopSidebarCollapsed || !activePanelId ? "w-0 overflow-hidden opacity-0" : "xl:w-70 w-60 opacity-100",
            )}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_35%)]" />
            <div className="relative z-10 flex h-full flex-col">
              {!desktopSidebarCollapsed && activePanelId === "tickets" && <div className="flex-1 overflow-hidden">{sidebar}</div>}
            </div>
          </div>

          {/* Nav bar anchored to the right */}
          <PlannerNavBar
            items={[
              {
                id: "tickets",
                icon: <Feather className="h-5 w-5" />,
                label: "Project tickets",
              },
            ]}
            activeId={!desktopSidebarCollapsed ? activePanelId : null}
            onSelect={(id) => {
              // Toggle behaviour: clicking the active id collapses; otherwise switch panel and expand.
              if (!desktopSidebarCollapsed && activePanelId === id) {
                setDesktopSidebarCollapsed(true);
                return;
              }

              setActivePanelId(id);
              setDesktopSidebarCollapsed(false);
            }}
            isDark={isDark}
            onToggleTheme={() => setTheme(isDark ? "soft-light" : "soft-dark")}
          />
        </div>
      </div>
    </div>
  );
}
