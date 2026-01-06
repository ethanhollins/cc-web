import Image from "next/image";
import { cn } from "@/lib/utils";

interface CoachAvatarProps {
  coachName: string;
  coachImageSrc?: string;
  onClick?: () => void;
  className?: string;
}

export function CoachAvatar({ coachName, coachImageSrc, onClick, className }: CoachAvatarProps) {
  if (coachImageSrc) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn("sm:h-17 sm:w-17 group pointer-events-auto relative mb-1 h-14 w-14 flex-shrink-0 overflow-hidden rounded-full", className)}
        style={{ filter: "drop-shadow(0 10px 8px rgb(0 0 0 / 0.4)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.3))" }}
        aria-label={`${coachName} coach avatar`}
      >
        <Image src={coachImageSrc} alt={coachName} fill sizes="80px" className="object-contain transition-transform duration-150 group-hover:scale-105" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pointer-events-auto mb-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)] shadow-lg transition-transform duration-150 hover:scale-110 sm:h-12 sm:w-12",
        className,
      )}
      aria-label={`${coachName} coach avatar`}
    >
      {coachName.charAt(0)}
    </button>
  );
}
