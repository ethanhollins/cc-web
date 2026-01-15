"use client";

import { CircleStar, Feather, MoonStar, SunMedium, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { ExpandingTabButton } from "@/ui/expanding-tab-button";

export type MobileTab = "tickets" | "domains" | "coaches";

interface MobileTabMenuProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isDrawerOpen: boolean;
  onOpenDrawer: () => void;
}

/**
 * Mobile tab menu component positioned in the drawer
 * Provides navigation between tickets and focuses views, plus theme toggle
 */
export function MobileTabMenu({ activeTab, onTabChange, isDark, onToggleTheme, isDrawerOpen, onOpenDrawer }: MobileTabMenuProps) {
  const handleTabClick = (tab: MobileTab) => {
    onTabChange(tab);
    if (!isDrawerOpen) {
      onOpenDrawer();
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      {/* Left: Tab buttons */}
      <div className="flex items-center gap-1.5">
        <ExpandingTabButton
          icon={<Feather className="h-5 w-5" />}
          label="Tickets"
          isActive={activeTab === "tickets"}
          onClick={() => handleTabClick("tickets")}
          variant="blue"
          size="md"
          labelWidth="w-16"
          showActiveBackground={isDrawerOpen}
        />
        <ExpandingTabButton
          icon={<Target className="h-5 w-5" />}
          label="Focuses"
          isActive={activeTab === "domains"}
          onClick={() => handleTabClick("domains")}
          variant="purple"
          size="md"
          labelWidth="w-18"
          showActiveBackground={isDrawerOpen}
        />
        <ExpandingTabButton
          icon={<CircleStar className="h-5 w-5" />}
          label="Coaches"
          isActive={activeTab === "coaches"}
          onClick={() => handleTabClick("coaches")}
          variant="orange"
          size="md"
          labelWidth="w-18"
          showActiveBackground={isDrawerOpen}
        />
      </div>

      {/* Right: Theme toggle */}
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
        {isDark ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
      </Button>
    </div>
  );
}
