"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, X } from "@untitledui/icons";
import { Skill, SkillStage } from "@/types/skills";
import { getCriterionColor } from "@/utils/criterion-colors";
import { StageIcon, getStageBgColor, getStageBorderColor, getStageColor } from "./StageIcons";

type SkillModalProps = {
    open: boolean;
    skill: Skill | null;
    onClose: () => void;
    onTicketClick?: (ticketId: string) => void;
};

const STAGES_ORDER: SkillStage[] = ["Foundation", "Practitioner", "Expert", "Authority", "Master"];

/**
 * Stage rubric section component
 */
const StageRubricSection: React.FC<{
    skill: Skill;
    stage: SkillStage;
    isCurrentStage: boolean;
    isLocked: boolean;
}> = ({ skill, stage, isCurrentStage, isLocked }) => {
    const [isExpanded, setIsExpanded] = useState(isCurrentStage);
    const rubric = skill.rubrics.find((r) => r.stage === stage);
    const progress = skill.stage_progress[stage];

    if (!rubric) return null;

    const stageIndex = STAGES_ORDER.indexOf(stage);
    const isCompleted = progress === 100;

    return (
        <div className={`rounded-lg border-2 ${getStageBorderColor(stage)} ${getStageBgColor(stage)} ${isLocked ? "opacity-60" : ""}`}>
            {/* Stage header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-black/5"
            >
                <div className="flex items-center gap-3">
                    {/* Stage number badge */}
                    <div
                        className={`flex size-8 items-center justify-center rounded-full ${getStageBgColor(stage)} ${getStageBorderColor(stage)} border-2 font-bold ${getStageColor(stage)}`}
                    >
                        {stageIndex + 1}
                    </div>

                    {/* Stage icon and name */}
                    <div className="flex items-center gap-2">
                        <div className={getStageColor(stage)}>
                            <StageIcon stage={stage} className="size-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{stage}</h3>
                            <p className="text-xs text-gray-600">{rubric.estimated_duration}</p>
                        </div>
                    </div>

                    {/* Lock/Complete indicator */}
                    {isLocked && <span className="ml-2 text-xs font-medium text-gray-500">🔒 Locked</span>}
                    {isCompleted && <span className="ml-2 text-xs font-medium text-green-600">✓ Complete</span>}
                </div>

                <div className="flex items-center gap-3">
                    {/* Progress bar */}
                    {!isLocked && (
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className={`h-full transition-all duration-500 ${
                                        isCompleted
                                            ? "bg-green-500"
                                            : stage === "Foundation"
                                              ? "bg-gray-500"
                                              : stage === "Practitioner"
                                                ? "bg-blue-500"
                                                : stage === "Expert"
                                                  ? "bg-purple-500"
                                                  : stage === "Authority"
                                                    ? "bg-amber-500"
                                                    : "bg-yellow-500"
                                    }`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{progress}%</span>
                        </div>
                    )}

                    {/* Chevron */}
                    {isExpanded ? <ChevronDown className="size-5 text-gray-500" /> : <ChevronRight className="size-5 text-gray-500" />}
                </div>
            </button>

            {/* Expanded content */}
            {isExpanded && (
                <div className="border-t-2 border-gray-200 bg-white p-4">
                    {/* Requirements */}
                    <div className="mb-4">
                        <h4 className="mb-2 text-sm font-bold text-gray-900">Stage Requirements</h4>
                        <ul className="space-y-1">
                            {rubric.requirements.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="mt-0.5 text-gray-400">•</span>
                                    <span>{req}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Criteria table */}
                    <div>
                        <h4 className="mb-2 text-sm font-bold text-gray-900">Assessment Rubric</h4>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Criterion</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Description</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Progress</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Weight</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {rubric.criteria.map((criterion) => {
                                        const score = criterion.score ?? 0;
                                        const criterionColor = getCriterionColor(criterion.criterion_id);
                                        return (
                                            <tr key={criterion.criterion_id} className="group relative hover:bg-gray-50">
                                                {/* Colored left border */}
                                                <td className="relative px-4 py-3 text-sm font-medium text-gray-900">
                                                    <div className="absolute top-0 left-0 h-full w-1" style={{ backgroundColor: criterionColor }} />
                                                    {criterion.name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{criterion.description}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200">
                                                            <div
                                                                className={`h-full transition-all duration-500 ${
                                                                    score === 100
                                                                        ? "bg-green-500"
                                                                        : stage === "Foundation"
                                                                          ? "bg-gray-500"
                                                                          : stage === "Practitioner"
                                                                            ? "bg-blue-500"
                                                                            : stage === "Expert"
                                                                              ? "bg-purple-500"
                                                                              : stage === "Authority"
                                                                                ? "bg-amber-500"
                                                                                : "bg-yellow-500"
                                                                }`}
                                                                style={{ width: `${score}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-700">{score}/100</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{criterion.weight}%</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Skill modal component
 */
export const SkillModal: React.FC<SkillModalProps> = ({ open, skill, onClose, onTicketClick }) => {
    if (!open || !skill) return null;

    const currentStageIndex = STAGES_ORDER.indexOf(skill.current_stage);
    const overallProgress = STAGES_ORDER.reduce((sum, stage) => sum + skill.stage_progress[stage], 0) / STAGES_ORDER.length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-200 p-6">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                            <div style={{ color: skill.color }}>
                                <StageIcon stage={skill.current_stage} className="size-10" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{skill.name}</h2>
                                <p className="text-sm text-gray-600">Current Stage: {skill.current_stage}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700">{skill.description}</p>

                        {/* Overall progress */}
                        <div className="mt-4">
                            <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700">Overall Progress</span>
                                <span className="font-bold text-gray-900">{Math.round(overallProgress)}%</span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${overallProgress}%`,
                                        backgroundColor: skill.color || "#8b5cf6",
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Close button */}
                    <button onClick={onClose} className="ml-4 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                        <X className="size-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {STAGES_ORDER.map((stage, index) => {
                            const isCurrentStage = stage === skill.current_stage;
                            const isLocked = index > currentStageIndex && skill.stage_progress[STAGES_ORDER[index - 1]] < 100;

                            return <StageRubricSection key={stage} skill={skill} stage={stage} isCurrentStage={isCurrentStage} isLocked={isLocked} />;
                        })}
                    </div>

                    {/* Connected stages */}
                    {skill.connected_stage_ids.length > 0 && (
                        <div className="mt-6">
                            <h3 className="mb-3 text-lg font-bold text-gray-900">Connected Stages</h3>
                            <div className="flex flex-wrap gap-2">
                                {skill.connected_stage_ids.map((stageId: string) => (
                                    <div key={stageId} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700">
                                        {stageId}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
