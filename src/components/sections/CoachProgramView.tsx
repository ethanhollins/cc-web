import { useState } from "react";
import { Calendar, CalendarPlus, CheckSquare } from "lucide-react";
import { CoachProgramHeader } from "@/components/layout/CoachProgramHeader";
import { cn } from "@/lib/utils";
import type { CoachProgram } from "@/types/program";
import type { Ticket } from "@/types/ticket";
import { AnimatedSignature } from "@/ui/signature";

interface CoachProgramViewProps {
  program: CoachProgram;
  onTicketClick?: (ticket: Ticket) => void;
  onSign?: () => void;
  onCancel?: () => void;
}

export function CoachProgramView({ program, onTicketClick, onSign, onCancel }: CoachProgramViewProps) {
  // NOTE: This is a first-pass visual structured view for CC-53.
  // Layout is mobile-first and can be refined as we iterate on design.

  const [isSigned, setIsSigned] = useState(false);

  const handleSign = () => {
    setIsSigned(true);
    onSign?.();
  };

  return (
    <div className="group relative flex flex-col gap-4 rounded-[18px] border border-[var(--border-subtle)] bg-[var(--surface)] p-4 shadow-md sm:p-5">
      <CoachProgramHeader program={program} />

      {/* Main postcard body: left = notes, right = structured program */}
      <div className="mt-1 grid gap-3 sm:grid-cols-2 sm:gap-4">
        {/* Left side: user needs & coach notes */}
        <div className="space-y-3 border-b border-dashed border-[var(--border-subtle)] pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
          <section className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Your starting point</h3>
            <p className="text-sm font-medium text-[var(--text)]">{program.currentState.headline}</p>
            {program.currentState.description && <p className="text-xs text-[var(--text-muted)]">{program.currentState.description}</p>}
          </section>

          <section className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">What you're aiming for</h3>
            <p className="text-sm text-[var(--text)]">{program.objective}</p>
          </section>

          {program.coachNotes && (
            <section className="space-y-1 rounded-xl bg-[var(--surface-elevated)] p-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Coach notes</h3>
              <p className="text-sm text-[var(--text)]">{program.coachNotes}</p>
            </section>
          )}
        </div>

        {/* Right side: structured program plan */}
        <div className="flex flex-col space-y-3 sm:space-y-4 sm:pl-4">
          {program.dueDateLabel && (
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Program window</h3>
              <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-[var(--surface-elevated)] px-2 py-[2px] text-[10px] font-medium text-[var(--text-muted)] sm:text-xs">
                <Calendar className="h-3 w-3" />
                <span>{program.dueDateLabel}</span>
              </div>
            </section>
          )}

          {/* Weekly milestones */}
          {program.milestones.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Weekly milestones</h3>
              <div className="flex flex-col gap-3">
                {program.milestones.map((milestone) => (
                  <div key={milestone.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3 text-xs sm:text-sm">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Week {milestone.weekNumber}</span>
                    </div>
                    <p className="text-sm font-medium text-[var(--text)]">{milestone.title}</p>
                    {milestone.description && <p className="mt-1 text-xs text-[var(--text-muted)]">{milestone.description}</p>}

                    {milestone.tickets && milestone.tickets.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {milestone.tickets.map((ticket) => {
                          const isDone = ticket.ticket_status.toLowerCase() === "done";

                          return (
                            <div
                              key={ticket.ticket_id}
                              role="button"
                              tabIndex={0}
                              onClick={() => onTicketClick?.(ticket)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  onTicketClick?.(ticket);
                                }
                              }}
                              className={cn(
                                "shadow-xs group flex w-full items-center justify-between rounded-lg border px-3 py-1.5 text-left transition-colors",
                                isDone
                                  ? "border-[var(--border-subtle)] bg-[var(--surface)] opacity-70"
                                  : "border-[var(--accent-subtle)] bg-[var(--surface)] hover:border-[var(--accent-soft)] hover:shadow-sm",
                              )}
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[var(--accent-subtle)] text-[var(--accent)]">
                                  <CheckSquare className="h-3.5 w-3.5" />
                                </span>
                                <div className="min-w-0">
                                  <p className={cn("truncate text-xs font-medium", isDone ? "text-[var(--text-muted)]" : "text-[var(--text)]")}>
                                    {ticket.title}
                                  </p>
                                  <p className="text-[10px] text-[var(--text-muted)]">
                                    {ticket.ticket_key} {ticket.ticket_status}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                className="ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)] transition-colors hover:bg-[var(--accent-subtle)]"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  // TODO: Wire up schedule picker for program tickets when backend + UX are ready.
                                }}
                              >
                                <CalendarPlus className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Success criteria as address-style lines */}
          {program.successCriteria.length > 0 && (
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Success criteria</h3>
              <div className="mt-2 space-y-2">
                {program.successCriteria.map((criterion, index) => (
                  <div key={index} className="border-b border-dashed border-[var(--border-subtle)] pb-1 text-xs sm:text-sm">
                    {criterion}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Animated signature at the bottom */}
      <AnimatedSignature onSign={handleSign} />

      {/* Cancel program button */}
      <div className="mt-6 text-center">
        <button
          type="button"
          className="text-sm text-[var(--text-muted)] underline decoration-dotted underline-offset-2 transition-colors hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-[var(--text-muted)]"
          onClick={onCancel}
          disabled={isSigned}
        >
          Not interested? Cancel this program
        </button>
      </div>
    </div>
  );
}
