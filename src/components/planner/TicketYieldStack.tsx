"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { TicketYield } from "@/types/ticket";

/**
 * TODO(CC-52): This component currently renders mocked yield icons.
 * Once real yield metadata is available from the backend, wire it up
 * to real data and revisit the visual treatment if needed.
 */

interface TicketYieldStackProps {
  yields?: TicketYield[];
  /**
   * stacked: overlapping icons, no counts (events, compact card surfaces)
   * inline: spaced icons, optional +X counts (modal/sidebar surfaces)
   */
  variant?: "stacked" | "inline";
  /** When true (inline variant), show +X count next to each yield. */
  showCounts?: boolean;
  className?: string;
}

export function TicketYieldStack({ yields, variant = "stacked", showCounts = false, className }: TicketYieldStackProps) {
  if (!yields || yields.length === 0) return null;

  const items = yields.slice(0, 3);

  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap items-center gap-1", className)}>
        {items.map((yieldItem) => (
          <div key={yieldItem.id} className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
            {yieldItem.icon ? (
              <div className="relative h-4 w-4 overflow-hidden rounded-full bg-white" title={yieldItem.label} aria-label={yieldItem.label}>
                <Image src={yieldItem.icon} alt={yieldItem.label} fill sizes="16px" className="scale-[1.15] object-contain opacity-100" />
              </div>
            ) : (
              <span className="inline-block h-4 w-4 rounded-full bg-black" aria-hidden="true" />
            )}
            {showCounts && <span className="font-semibold">+{yieldItem.count}</span>}
          </div>
        ))}
      </div>
    );
  }

  // Default: stacked icons, no counts (used on tickets and events)
  return (
    <div className={cn("flex items-center", className)}>
      {items.map((yieldItem, index) => {
        const isCommon = yieldItem.rarity === "common";
        const rawCount = typeof yieldItem.count === "number" ? yieldItem.count : 1;
        const count = Math.max(1, rawCount);
        const isClusterLarge = isCommon && count >= 5;
        const smallStackCount = isCommon ? Math.min(count, 4) : 1;
        if (!yieldItem.icon) {
          return (
            <span
              key={`${yieldItem.id}-${index}`}
              className={cn("h-4 w-4 rounded-full bg-black", index > 0 && "ml-1.5")}
              aria-hidden="true"
              style={{ zIndex: items.length - index }}
            />
          );
        }

        return (
          <div
            key={`${yieldItem.id}-${index}`}
            className={cn(
              "relative h-4 w-4 rounded-full",
              index > 0 && "ml-1.5",
              // Rare yields: strong purple glow (mastery, milestone, completion)
              (yieldItem.rarity === "rare" || ["mastery", "milestone", "completion"].includes(yieldItem.id)) && "shadow-[0_0_8px_rgba(168,85,247,0.9)]",
              // Uncommon highlight: softer green glow for key yields (books_read, logged, workouts)
              yieldItem.rarity === "uncommon" &&
                ["logged", "workouts", "books", "books_read"].includes(yieldItem.id) &&
                "shadow-[0_0_5px_rgba(34,197,94,0.85)]",
            )}
            style={{ zIndex: items.length - index }}
            title={yieldItem.label}
            aria-label={yieldItem.label}
          >
            {isClusterLarge ? (
              <Image src={yieldItem.icon} alt={yieldItem.label} fill sizes="16px" className="scale-[1.3] object-contain opacity-100" />
            ) : (
              Array.from({ length: smallStackCount }).map((_, iconIndex) => {
                const step = 3; // px, controls how tight the horizontal stack is
                const offsetX = (iconIndex - (smallStackCount - 1) / 2) * step;

                return (
                  <Image
                    key={`${yieldItem.id}-icon-${iconIndex}`}
                    src={yieldItem.icon}
                    alt={yieldItem.label}
                    fill
                    sizes="16px"
                    className="object-contain opacity-100"
                    style={{
                      transform: `translate(${offsetX}px, 0px)`,
                      zIndex: iconIndex + 1,
                      // Slightly darken underlying icons to create depth, keep top icon full brightness
                      filter: iconIndex < smallStackCount - 1 ? "brightness(0.8)" : undefined,
                    }}
                  />
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}
