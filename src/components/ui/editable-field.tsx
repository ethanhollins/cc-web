"use client";

import { type KeyboardEvent } from "react";
import { Check, X } from "lucide-react";

interface EditableInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  maxLength?: number;
  type?: "text" | "email" | "url";
}

/**
 * Editable input field with X (cancel) and Check (save) buttons
 * Used for single-line text editing
 */
export function EditableInput({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder,
  className = "",
  autoFocus = true,
  maxLength,
  type = "text",
}: EditableInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-2 text-xl font-semibold text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${className}`}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={maxLength}
        onKeyDown={handleKeyDown}
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--danger)] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--danger)]"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
        <button
          onClick={onSave}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          aria-label="Save"
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface EditableTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  minHeight?: string;
}

/**
 * Editable textarea field with X (cancel) and Check (save) buttons
 * Used for multi-line text editing like descriptions
 */
export function EditableTextarea({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder,
  className = "",
  autoFocus = true,
  minHeight = "min-h-[200px]",
}: EditableTextareaProps) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${minHeight} w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${className}`}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--danger)] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--danger)]"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
        <button
          onClick={onSave}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          aria-label="Save"
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface EditableSmallInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  maxLength?: number;
  type?: "text" | "email" | "url";
  label?: string;
}

/**
 * Small editable input field with X (cancel) and Check (save) buttons
 * Used for compact property editing like project key, color, etc.
 */
export function EditableSmallInput({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder,
  className = "",
  autoFocus = true,
  maxLength,
  type = "text",
  label,
}: EditableSmallInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div>
      {label && <label className="mb-1 block text-xs text-[var(--text-muted)]">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1 font-mono text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${className}`}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={maxLength}
        onKeyDown={handleKeyDown}
      />
      <div className="mt-1 flex justify-end gap-1">
        <button
          onClick={onCancel}
          className="flex h-6 w-6 items-center justify-center rounded bg-[var(--danger)] text-white hover:opacity-90"
          aria-label="Cancel"
        >
          <X className="h-3 w-3" />
        </button>
        <button onClick={onSave} className="flex h-6 w-6 items-center justify-center rounded bg-[var(--accent)] text-white hover:opacity-90" aria-label="Save">
          <Check className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
