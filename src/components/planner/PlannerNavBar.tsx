"use client";

import type { ReactNode } from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";

export interface PlannerNavBarItem {
  id: string;
  icon: ReactNode;
  label: string;
}

interface PlannerNavBarProps {
  items: PlannerNavBarItem[];
  /** The id of the currently active/open panel, or null when none are open. */
  activeId: string | null;
  /** Called when a nav item is clicked. */
  onSelect: (id: string) => void;
  /** Whether the planner is currently using the dark theme. */
  isDark: boolean;
  /** Toggle between light and dark themes. */
  onToggleTheme: () => void;
}

/**
 * Vertical planner navigation bar anchored to the right-hand side.
 *
 * - Top: primary action buttons (e.g. tickets, future panels)
 * - Bottom: theme toggle (soft light/dark)
 *
 * The nav itself does not manage which drawer is open; it simply exposes
 * selection events so the layout can show/hide the appropriate panel.
 */
export function PlannerNavBar({ items, activeId, onSelect, isDark, onToggleTheme }: PlannerNavBarProps) {
  return (
    <div className={cn("flex w-12 flex-col items-center border-l border-[var(--border-subtle)] bg-[var(--planner-sidebar-bg)] py-4")}>
      <div className="flex flex-1 flex-col items-center gap-2">
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <Button
              key={item.id}
              type="button"
              variant="ghost"
              size="icon"
              aria-label={item.label}
              className={cn(
                "h-10 w-10 rounded-lg transition-colors",
                isActive
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)]",
              )}
              onClick={() => onSelect(item.id)}
            >
              {item.icon}
            </Button>
          );
        })}
      </div>

      {/* Theme toggle pinned to bottom */}
      <div className="mt-4 flex flex-col items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          className={cn(
            "h-10 w-10 rounded-lg transition-colors",
            isDark ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)]",
          )}
          onClick={onToggleTheme}
        >
          {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
