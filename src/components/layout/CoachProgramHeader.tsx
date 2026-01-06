import Image from "next/image";
import type { CoachProgram } from "@/types/program";

interface CoachProgramHeaderProps {
  program: CoachProgram;
  size?: "default" | "compact";
}

export function CoachProgramHeader({ program, size = "default" }: CoachProgramHeaderProps) {
  const isCompact = size === "compact";

  return (
    <>
      {/* Postcard stamp in the top-right corner */}
      <div
        className={
          isCompact
            ? "absolute right-2 top-2 z-20 hidden select-none sm:block"
            : "absolute right-3 top-3 z-20 select-none transition-all duration-150 hover:-translate-y-2"
        }
      >
        <div
          className={
            isCompact
              ? "rotate-6 rounded-full border-2 border-[var(--accent-soft)] bg-[var(--surface)] px-3 py-1 text-left text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)] shadow-sm"
              : "rotate-6 rounded-full border-2 border-[var(--accent-soft)] bg-[var(--surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)] shadow-sm"
          }
        >
          <span className="block leading-[0.9]">Coach Mail</span>
          <span
            className={
              isCompact
                ? "mt-[1px] block text-[8px] tracking-[0.18em] text-[var(--text-muted)]"
                : "mt-[1px] block text-[9px] tracking-[0.18em] text-[var(--text-muted)]"
            }
          >
            {program.coachName}
          </span>
        </div>
      </div>

      {/* Header with coach, domain, program title, and yields */}
      {isCompact ? (
        <div className="space-y-1 pr-10 text-left">
          <h2 className="line-clamp-1 text-xs font-semibold text-[var(--text)] sm:text-sm">{program.title}</h2>
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-[var(--text-muted)] sm:text-xs">
            <p className="text-[10px] text-[var(--text-muted)] sm:text-xs">
              {program.domain} · {program.coachName}
            </p>

            {program.yieldIconPaths && program.yieldIconPaths.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                {program.yieldIconPaths.slice(0, 3).map((src, index) => (
                  <div key={`${src}-${index}`} className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-muted)]">
                    <Image src={src} alt="Program yield" width={12} height={12} className="object-contain" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col gap-2 border-b border-dashed border-[var(--border-subtle)] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[var(--text)] sm:text-lg">{program.title}</h2>

            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)] sm:text-sm">
              <p className="text-xs text-[var(--text-muted)] sm:text-sm">
                {program.domain} · {program.coachName}
              </p>

              {program.yieldIconPaths && program.yieldIconPaths.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  {program.yieldIconPaths.map((src, index) => (
                    <div key={`${src}-${index}`} className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-muted)]">
                      <Image src={src} alt="Program yield" width={16} height={16} className="object-contain" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start gap-1 text-[10px] text-[var(--text-muted)] sm:items-end sm:text-xs">
            <span className="rounded-full bg-[var(--surface-muted)] px-2 py-[2px] text-[10px] font-medium text-[var(--text-muted)]">2–4 week program</span>
          </div>
        </div>
      )}
    </>
  );
}
