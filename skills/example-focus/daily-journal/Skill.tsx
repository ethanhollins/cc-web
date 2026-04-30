"use client";

import { useEffect, useState } from "react";
import { BookOpen, Save, Trash2 } from "lucide-react";
import { getSkillData, setSkillData, deleteSkillData } from "@skills-api";
import { Button } from "@/ui/button";
import { ScrollArea } from "@/ui/scroll-area";

interface DailyJournalSkillProps {
  focusId?: string;
  skillId?: string;
}

const DEFAULT_FOCUS_ID = "example-focus";
const DEFAULT_SKILL_ID = "daily-journal";

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Daily Journal Skill
 *
 * Lets users write a daily note that is persisted at the skill scope
 * via the @skills-api persistent data layer.
 *
 * This is an example skill demonstrating:
 *  - Importing from @skills-api
 *  - Using skill-scoped persistent data (getSkillData / setSkillData)
 *  - Standard skill component structure (default export, no required props)
 *
 * `focusId` and `skillId` can be provided as props to override the defaults;
 * this lets the component be reused in a different focus/skill context.
 */
export default function DailyJournalSkill({ focusId = DEFAULT_FOCUS_ID, skillId = DEFAULT_SKILL_ID }: DailyJournalSkillProps) {
  const todayKey = getTodayKey();
  const [entry, setEntry] = useState<string>("");
  const [savedEntry, setSavedEntry] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load today's entry on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const record = await getSkillData(focusId, skillId, todayKey);
      if (!cancelled) {
        const text = typeof record?.text === "string" ? record.text : "";
        setEntry(text);
        setSavedEntry(text);
        setIsLoaded(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [focusId, skillId, todayKey]);

  const isDirty = entry !== savedEntry;

  async function handleSave() {
    setIsSaving(true);
    try {
      await setSkillData(focusId, skillId, { id: todayKey, text: entry });
      setSavedEntry(entry);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    await deleteSkillData(focusId, skillId, todayKey);
    setEntry("");
    setSavedEntry("");
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[var(--accent)]" />
          <h2 className="text-lg font-semibold text-[var(--text)]">Daily Journal</h2>
          <span className="text-sm text-[var(--text-muted)]">— {todayKey}</span>
        </div>

        <div className="flex items-center gap-2">
          {savedEntry && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[var(--text-muted)] hover:text-red-500"
              aria-label="Delete today's entry"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            className="gap-1.5"
            disabled={!isDirty || isSaving}
            onClick={handleSave}
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {/* Text area */}
      <ScrollArea className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
        {!isLoaded ? (
          <div className="flex h-24 items-center justify-center text-sm text-[var(--text-muted)]">Loading…</div>
        ) : (
          <textarea
            className="h-full min-h-[200px] w-full resize-none bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none"
            placeholder="Write today's journal entry…"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
        )}
      </ScrollArea>

      {isDirty && (
        <p className="text-xs text-[var(--text-muted)]">Unsaved changes — press Save to persist.</p>
      )}
    </div>
  );
}
