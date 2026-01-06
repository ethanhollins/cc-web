"use client";

import { useRef, useState } from "react";
import { Dancing_Script } from "next/font/google";
import { CoachProgramHeader } from "@/components/layout/CoachProgramHeader";
import { cn } from "@/lib/utils";
import type { CoachProgram } from "@/types/program";

interface CoachEnvelopeViewProps {
  program: CoachProgram;
  onOpen: () => void;
}

const cursiveFont = Dancing_Script({ subsets: ["latin"], weight: ["400"] });

export function CoachEnvelopeView({ program, onOpen }: CoachEnvelopeViewProps) {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const openTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setIsPressed(true);
    }, 200);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // If a long press was detected, open immediately
    if (isPressed) {
      onOpen();
    }

    setIsPressed(false);
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsPressed(false);
  };

  const handleClick = () => {
    // For regular clicks, show animations then open after delay
    setIsPressed(true);
    openTimer.current = setTimeout(() => {
      onOpen();
    }, 500);
  };
  return (
    <div className="relative mx-auto flex w-[min(900px,100vw-64px)] items-center justify-center px-4 py-10">
      <style jsx>{`
        @keyframes golden-shimmer {
          0%,
          100% {
            filter: drop-shadow(0 0 25px rgba(234, 179, 8, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 50px rgba(234, 179, 8, 0.8));
          }
        }
        .shimmer-glow {
          animation: golden-shimmer 2s ease-in-out infinite;
        }
      `}</style>
      <button
        type="button"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className={cn(
          "group relative aspect-[4/3] w-full max-w-md cursor-pointer rounded-[18px] bg-transparent shadow-none transition-all duration-300",
          "hover:-translate-y-1",
          (isPressed || undefined) && "-translate-y-1",
        )}
        style={isPressed ? { animation: "golden-shimmer 2s ease-in-out infinite" } : undefined}
        onMouseEnter={(e) => {
          e.currentTarget.classList.add("shimmer-glow");
        }}
        onMouseLeave={(e) => {
          e.currentTarget.classList.remove("shimmer-glow");
        }}
      >
        <div className="relative h-full w-full">
          {/* Inner postcard peeking out – mirrors the top of CoachProgramView */}
          <div
            className={cn(
              "absolute inset-x-4 top-8 z-10 transition-transform duration-500 ease-out",
              "translate-y-16 group-hover:-translate-y-12 group-hover:rotate-[-3deg]",
              isPressed && "-translate-y-12 rotate-[-3deg]",
            )}
          >
            <div
              className="rounded-2xl p-[3px]"
              style={{
                backgroundColor: "#ffffff",
                backgroundImage: "repeating-linear-gradient(45deg, #f97373 0, #f97373 8px, #60a5fa 8px, #60a5fa 16px, #ffffff 16px, #ffffff 24px)",
              }}
            >
              <div className="relative flex flex-col gap-2 rounded-[16px] border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-3 shadow-sm">
                <CoachProgramHeader program={program} size="compact" />
              </div>
            </div>
          </div>

          {/* Envelope back/body */}
          <div className="absolute inset-x-3 bottom-3 top-8 z-10 overflow-hidden rounded-b-[18px] border border-[var(--border-subtle)] bg-white">
            {/* Fold lines inside the body, corner-to-seam */}
            <div className="pointer-events-none absolute inset-[6px]">
              <div className="bg-[var(--border-subtle)]/50 absolute bottom-0 left-0 h-[140%] w-px origin-bottom-left rotate-[32deg]" />
              <div className="bg-[var(--border-subtle)]/50 absolute bottom-0 right-0 h-[140%] w-px origin-bottom-right -rotate-[32deg]" />
            </div>

            {/* Handwritten address */}
            <div
              className={cn(
                "pointer-events-none absolute inset-x-8 top-[55%] text-2xl leading-snug text-[var(--text-muted)] opacity-80 sm:text-3xl",
                cursiveFont.className,
              )}
            >
              <div className="mr-24">To Ethan</div>
              <div className="ml-20 mt-1">from Coach {program.coachName}</div>
            </div>
          </div>

          {/* Envelope flap (top triangle, same width and aligned with body top) */}
          <div className={cn("absolute inset-x-3 top-8 flex h-[42%] items-start justify-center", "group-hover:z-5 z-30", isPressed && "z-5")}>
            <div
              className={cn(
                "relative h-full w-full origin-top transition-transform duration-0 ease-out",
                "group-hover:rotate-[180deg]",
                isPressed && "rotate-[180deg]",
              )}
            >
              {/* Filled flap shape */}
              <div className="absolute inset-0 bg-white shadow-sm" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />

              {/* Precise flap border following the triangle edges */}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 0 H100 L50 100 Z" fill="none" stroke="var(--border-subtle)" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
