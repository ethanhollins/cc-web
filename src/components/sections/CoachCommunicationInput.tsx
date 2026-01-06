"use client";

import { useEffect, useRef } from "react";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { cn } from "@/lib/utils";
import type { CoachProgram } from "@/types/program";
import { ChatInput } from "@/ui/chat-input";
import { CoachAvatar } from "@/ui/coach-avatar";
import { CoachBubble } from "@/ui/coach-bubble";

interface CoachCommunicationInputProps {
  program: CoachProgram;
  coachMessage: string;
  isCoachBubbleVisible: boolean;
  onToggleBubble: (visible: boolean) => void;
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void | Promise<void>;
  isSubmitting?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  disabled?: boolean;
  coachBubbleAction?: () => void;
}

export function CoachCommunicationInput({
  program,
  coachMessage,
  isCoachBubbleVisible,
  onToggleBubble,
  draft,
  onDraftChange,
  onSubmit,
  isSubmitting,
  textareaRef,
  disabled,
  coachBubbleAction,
}: CoachCommunicationInputProps) {
  const keyboardOffset = useKeyboardOffset();
  const prevMessageRef = useRef(coachMessage);

  // Automatically show bubble when message changes
  useEffect(() => {
    if (coachMessage && coachMessage !== prevMessageRef.current) {
      onToggleBubble(true);
      prevMessageRef.current = coachMessage;
    }
  }, [coachMessage, onToggleBubble]);

  return (
    <div
      className="pointer-events-none fixed left-2 right-2 flex flex-col items-end gap-3 sm:!bottom-3 sm:left-8 sm:right-8"
      style={{ bottom: `${Math.max(48, keyboardOffset + 48)}px` }}
    >
      <div className={cn("flex w-full items-end justify-end gap-3 sm:max-w-[80%]", isCoachBubbleVisible && "pointer-events-auto")}>
        <CoachBubble
          coachName={program.coachName}
          message={coachMessage}
          isVisible={isCoachBubbleVisible}
          onDismiss={() => onToggleBubble(false)}
          hasAction={!!coachBubbleAction}
          onAction={coachBubbleAction}
        />

        <CoachAvatar
          coachName={program.coachName}
          coachImageSrc={program.coachImageSrc}
          onClick={() => onToggleBubble(!isCoachBubbleVisible)}
          className="-mr-2 sm:-mr-10"
        />
      </div>

      {/* User input row - underneath bubble/avatar */}
      <ChatInput
        value={draft}
        onChange={onDraftChange}
        onSubmit={onSubmit}
        placeholder="Ask a question or share thoughts..."
        disabled={isSubmitting || disabled}
        textareaRef={textareaRef}
      />
    </div>
  );
}
