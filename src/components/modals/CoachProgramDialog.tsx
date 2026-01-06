"use client";

import { useRef, useState } from "react";
import { CoachDialog } from "@/components/modals/CoachDialog";
import { CoachCommunicationInput } from "@/components/sections/CoachCommunicationInput";
import { CoachEnvelopeView } from "@/components/sections/CoachEnvelopeView";
import { CoachProgramView } from "@/components/sections/CoachProgramView";
import { mockCoachCompletionMessage } from "@/data/mock-programs";
import { cn } from "@/lib/utils";
import type { CoachProgram } from "@/types/program";
import type { Ticket } from "@/types/ticket";
import { DialogContent, DialogTitle } from "@/ui/dialog";

interface CoachProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: CoachProgram;
  /** Latest coach message to show in the floating bubble. */
  coachMessage: string;
  /** Called when the user submits a new message. */
  onSubmitMessage: (message: string) => void | Promise<void>;
  /** Optional loading state while waiting for backend coach response. */
  isSubmitting?: boolean;
  /** Optional handler for clicking a milestone ticket to open the ticket modal. */
  onTicketClick?: (ticket: Ticket) => void;
}

export function CoachProgramDialog({ open, onOpenChange, program, coachMessage, onSubmitMessage, isSubmitting, onTicketClick }: CoachProgramDialogProps) {
  const [draft, setDraft] = useState<string>("");
  const [isCoachBubbleVisible, setIsCoachBubbleVisible] = useState(true);
  const [hasOpenedEnvelope, setHasOpenedEnvelope] = useState(false);
  const [internalCoachMessage, setInternalCoachMessage] = useState(coachMessage);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [coachBubbleAction, setCoachBubbleAction] = useState<(() => void) | undefined>();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSign = () => {
    // Wait for the signature animation to complete (1.2s) before showing the success message
    setTimeout(() => {
      // Update the coach message - this will trigger the bubble to show automatically
      setInternalCoachMessage(mockCoachCompletionMessage);

      // Disable the input
      setIsInputDisabled(true);

      // Set the action for when they click the bubble to close the dialog
      setCoachBubbleAction(() => () => {
        handleOpenChange(false);
      });
    }, 1200);
  };

  const handleCancel = () => {
    // Close the dialog when cancelling
    handleOpenChange(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isSubmitting) return;

    await onSubmitMessage(trimmed);
    setDraft("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
    }
  };

  // Reset the envelope state whenever the dialog is closed so it starts
  // as an unopened envelope the next time it is shown.
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setHasOpenedEnvelope(false);
      setIsInputDisabled(false);
      setInternalCoachMessage(coachMessage);
      setCoachBubbleAction(undefined);
    }
  };

  const showEnvelope = open && !hasOpenedEnvelope;

  return (
    <CoachDialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          showEnvelope
            ? "max-h-[90vh] w-auto gap-4 overflow-visible rounded-[18px] border-none bg-transparent p-0 shadow-none sm:rounded-[18px]"
            : "h-screen w-screen gap-0 overflow-visible border-none bg-transparent p-0 shadow-none sm:max-w-3xl",
        )}
        hideCloseButton
        disableDefaultMaxWidth
        disableDefaultFullWidth
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogTitle className="sr-only">Coach program: {program.title}</DialogTitle>
        {showEnvelope ? (
          <CoachEnvelopeView program={program} onOpen={() => setHasOpenedEnvelope(true)} />
        ) : (
          <>
            <style jsx>{`
              @keyframes scale-in-center {
                0% {
                  transform: scale(0);
                  opacity: 0;
                }
                100% {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            `}</style>
            <div
              className="h-full overflow-y-auto px-4 pb-32 pt-12 sm:px-8 sm:pb-36 sm:pt-12"
              style={{
                animation: "scale-in-center 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both",
              }}
            >
              <div
                className="mx-auto max-w-4xl rounded-2xl p-[3px]"
                style={{
                  backgroundColor: "#ffffff",
                  backgroundImage: "repeating-linear-gradient(45deg, #f97373 0, #f97373 8px, #60a5fa 8px, #60a5fa 16px, #ffffff 16px, #ffffff 24px)",
                }}
              >
                <CoachProgramView program={program} onTicketClick={onTicketClick} onSign={handleSign} onCancel={handleCancel} />
              </div>
            </div>
            <CoachCommunicationInput
              program={program}
              coachMessage={internalCoachMessage}
              isCoachBubbleVisible={isCoachBubbleVisible}
              onToggleBubble={setIsCoachBubbleVisible}
              draft={draft}
              onDraftChange={(value) => {
                setDraft(value);
                const el = textareaRef.current;
                if (!el) return;
                el.style.height = "0px";
                const scrollHeight = el.scrollHeight;
                const maxHeight = 72;
                el.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
              }}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              textareaRef={textareaRef}
              disabled={isInputDisabled}
              coachBubbleAction={coachBubbleAction}
            />
          </>
        )}
      </DialogContent>
    </CoachDialog>
  );
}
