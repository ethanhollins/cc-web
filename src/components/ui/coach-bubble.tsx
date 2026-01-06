import { cn } from "@/lib/utils";

interface CoachBubbleProps {
  coachName: string;
  message: string;
  isVisible: boolean;
  onDismiss?: () => void;
  className?: string;
  hasAction?: boolean;
  onAction?: () => void;
}

export function CoachBubble({ coachName, message, isVisible, onDismiss, className, hasAction, onAction }: CoachBubbleProps) {
  const handleClick = () => {
    if (hasAction && onAction) {
      onAction();
    } else {
      onDismiss?.();
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes flash-gold {
          0%,
          100% {
            border-color: rgb(251, 191, 36);
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
          }
          50% {
            border-color: rgb(234, 179, 8);
            box-shadow: 0 0 30px rgba(234, 179, 8, 0.7);
          }
        }
      `}</style>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "bg-[var(--surface)]/95 relative w-full cursor-pointer overflow-hidden rounded-2xl border py-3 pl-4 pr-7 text-left text-xs shadow-lg backdrop-blur-sm transition-all duration-200 sm:text-sm",
          isVisible ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-1 scale-95 opacity-0",
          hasAction ? "border-amber-400" : "border-[var(--border-subtle)]",
          className,
        )}
        style={hasAction ? { animation: "flash-gold 2s ease-in-out infinite" } : undefined}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.22),transparent_45%)]" />
        <div className="relative z-10">
          <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">{coachName}</div>
          <p className="text-sm leading-relaxed text-[var(--text)]">{message}</p>
          <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            {hasAction ? "Click to continue" : "Click to hide"}
          </div>
        </div>
      </button>
    </>
  );
}
