"use client";

import { MoreVertical } from "lucide-react";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";

export interface VerticalDotsMenuItem {
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  onClick: () => void;
}

interface VerticalDotsMenuProps {
  items: VerticalDotsMenuItem[];
  triggerClassName?: string;
}

/**
 * Reusable vertical dots menu component
 * Styled using themes.css design tokens
 */
export function VerticalDotsMenu({ items, triggerClassName }: VerticalDotsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`ml-2 h-7 w-7 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] ${triggerClassName ?? ""}`}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={item.onClick}
            className={`flex cursor-pointer items-center gap-2 ${
              item.variant === "danger"
                ? "text-[var(--danger)] hover:bg-[var(--danger)] hover:bg-opacity-10"
                : "text-[var(--text)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
