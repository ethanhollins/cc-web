"use client";

import { Plus } from "@untitledui/icons";
import { Objective, Skill } from "@/types/skills";

type SkillCardProps = {
    skill: Skill;
    onClick: () => void;
};

export function SkillCard({ skill, onClick }: SkillCardProps) {
    const currentProgress = skill.stage_progress[skill.current_stage];

    return (
        <button
            onClick={onClick}
            className="group flex h-40 w-56 flex-shrink-0 flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
        >
            <div>
                <div className="mb-2 flex items-start justify-between">
                    <div className="size-2.5 rounded-full bg-blue-500" />
                    <div className="text-xs text-gray-500">Mastery</div>
                </div>
                <div className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900">{skill.name}</div>
            </div>
            <div>
                <div className="mb-2 text-xs text-gray-600">
                    <span className="font-medium">{skill.current_stage}</span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${currentProgress}%` }} />
                </div>
                <div className="mt-1 text-xs text-gray-500">{currentProgress}% complete</div>
            </div>
        </button>
    );
}

type ObjectiveCardProps = {
    objective: Objective;
    onClick: () => void;
};

export function ObjectiveCard({ objective, onClick }: ObjectiveCardProps) {
    return (
        <button
            onClick={onClick}
            className="group flex h-40 w-56 flex-shrink-0 flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md"
        >
            <div>
                <div className="mb-2 flex items-start justify-between">
                    <div className="size-2.5 rounded-full bg-emerald-500" />
                    <div className="text-xs text-gray-500">Objective</div>
                </div>
                <div className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900">{objective.name}</div>
            </div>
            <div>
                {/* Progress bar */}
                <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${objective.progress}%` }} />
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">{objective.progress}% complete</div>
                    {objective.is_achieved && <div className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">✓</div>}
                </div>
            </div>
        </button>
    );
}

type AddCardProps = {
    type: "skill" | "objective";
    onClick: () => void;
};

export function AddCard({ type, onClick }: AddCardProps) {
    const isSkill = type === "skill";
    return (
        <button
            onClick={onClick}
            className={`group flex h-40 w-56 flex-shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${
                isSkill
                    ? "border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:bg-blue-50"
                    : "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300 hover:bg-emerald-50"
            }`}
        >
            <div
                className={`mb-2 flex size-10 items-center justify-center rounded-full ${
                    isSkill ? "bg-blue-100 text-blue-600 group-hover:bg-blue-200" : "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200"
                }`}
            >
                <Plus className="size-5" />
            </div>
            <div className={`text-sm font-medium ${isSkill ? "text-blue-700" : "text-emerald-700"}`}>Add {isSkill ? "Skill" : "Objective"}</div>
        </button>
    );
}
