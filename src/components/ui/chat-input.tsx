"use client";

import { Mic, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void | Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  /** Additional action buttons to render (e.g., Accept, Deny) */
  children?: React.ReactNode;
  className?: string;
}

export function ChatInput({ value, onChange, onSubmit, placeholder, disabled, textareaRef, children, className }: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className={cn("pointer-events-auto flex w-full flex-col gap-2", className)}>
      <div
        className="relative flex w-full items-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2"
        style={{ boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.25), 0 4px 6px -4px rgb(0 0 0 / 0.15)" }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={1}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "max-h-[72px] w-full flex-1 resize-none border-none bg-transparent px-2 py-1.5 pr-40 text-sm text-[var(--text)]",
            "placeholder:text-[var(--text-muted)] focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />

        {/* Action buttons inside the input on the right */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1.5">
          <button type="button" className="pointer-events-auto flex h-8 w-8 items-center justify-center text-[var(--text-muted)]" disabled={disabled}>
            <Mic className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="pointer-events-auto hidden h-8 w-8 items-center justify-center rounded-full bg-black text-white shadow-sm sm:flex"
            disabled={disabled || !value.trim()}
            onClick={() => {
              if (!disabled && value.trim()) {
                void onSubmit(new Event("submit") as unknown as React.FormEvent);
              }
            }}
          >
            <Send className="h-4 w-4" />
          </button>
          <button
            type="submit"
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black text-white shadow-sm sm:hidden"
            disabled={disabled || !value.trim()}
          >
            <Send className="h-4 w-4" />
          </button>

          {/* Additional action buttons passed as children */}
          {children}
        </div>
      </div>
    </form>
  );
}
