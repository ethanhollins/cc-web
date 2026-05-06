"use client";

import { Target } from "lucide-react";

interface ComingSoonSkillProps {
  title: string;
  description: string;
}

export function ComingSoonSkill({ title, description }: ComingSoonSkillProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl items-center justify-center p-4 sm:p-6">
      <div className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Target className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--text)] sm:text-xl">{title}</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{description}</p>
      </div>
    </div>
  );
}
