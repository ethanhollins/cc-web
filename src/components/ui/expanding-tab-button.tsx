import React from "react";
import { cn } from "@/lib/utils";

interface ExpandingTabButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  variant?: "purple" | "blue" | "green" | "orange" | "red";
  labelWidth?: string;
  size?: "sm" | "md" | "lg";
  showActiveBackground?: boolean;
}

const variantStyles = {
  purple: {
    active: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    inactive: "text-[var(--text-muted)] hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400",
  },
  blue: {
    active: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    inactive: "text-[var(--text-muted)] hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400",
  },
  green: {
    active: "bg-green-500/20 text-green-600 dark:text-green-400",
    inactive: "text-[var(--text-muted)] hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400",
  },
  orange: {
    active: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
    inactive: "text-[var(--text-muted)] hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400",
  },
  red: {
    active: "bg-red-500/20 text-red-600 dark:text-red-400",
    inactive: "text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400",
  },
};

const sizeStyles = {
  sm: "gap-1.5 rounded-md px-3 py-1.5 text-sm",
  md: "gap-1.5 rounded-lg px-3 py-2 text-base",
  lg: "gap-2.5 rounded-lg px-5 py-2.5 text-lg",
};

/**
 * Expanding tab button with animated label
 * Shows icon always, expands label text when active
 */
export function ExpandingTabButton({
  icon,
  label,
  isActive,
  onClick,
  variant = "purple",
  labelWidth = "w-20",
  size = "sm",
  showActiveBackground = true,
}: ExpandingTabButtonProps) {
  const styles = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center font-medium transition-all duration-200",
        sizeStyles[size],
        isActive && showActiveBackground ? styles.active : styles.inactive,
      )}
      aria-label={label}
      aria-pressed={isActive}
    >
      <span className="shrink-0">{icon}</span>
      <span className={cn("overflow-hidden whitespace-nowrap transition-all duration-200", isActive ? `${labelWidth} opacity-100` : "w-0 opacity-0")}>
        {label}
      </span>
    </button>
  );
}
