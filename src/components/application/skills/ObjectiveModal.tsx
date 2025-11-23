"use client";

import React from "react";
import { Target04, X } from "@untitledui/icons";
import { Objective } from "@/types/skills";
import { getCriterionColor } from "@/utils/criterion-colors";

type ObjectiveModalProps = {
    open: boolean;
    objective: Objective | null;
    onClose: () => void;
    onTicketClick?: (ticketId: string) => void;
};

/**
 * Objective modal component
 * Shows a single-stage rubric for objectives like promotions
 */
export const ObjectiveModal: React.FC<ObjectiveModalProps> = ({ open, objective, onClose, onTicketClick }) => {
    if (!open || !objective) return null;

    const progress = objective.progress;
    const isAchieved = objective.is_achieved;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-200 p-6">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                            <div
                                className={`flex size-12 items-center justify-center rounded-xl ${isAchieved ? "bg-green-100" : "bg-gray-100"}`}
                                style={!isAchieved ? { backgroundColor: objective.color + "20" } : {}}
                            >
                                <Target04 className="size-8" style={isAchieved ? { color: "#10b981" } : { color: objective.color }} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold text-gray-900">{objective.name}</h2>
                                    {isAchieved && <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">✓ Achieved</span>}
                                </div>
                                <p className="text-sm text-gray-600">Objective • {objective.rubric.estimated_duration}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700">{objective.description}</p>

                        {/* Overall progress */}
                        <div className="mt-4">
                            <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700">Progress</span>
                                <span className="font-bold text-gray-900">{progress}%</span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${progress}%`,
                                        backgroundColor: isAchieved ? "#10b981" : objective.color || "#10b981",
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
                    <div className="space-y-6">
                        {/* Requirements */}
                        <div className={`rounded-lg border-2 p-4 ${isAchieved ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                            <h3 className="mb-3 text-lg font-bold text-gray-900">Requirements</h3>
                            <ul className="space-y-2">
                                {objective.rubric.requirements.map((req, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                        <span className="mt-0.5 text-gray-400">•</span>
                                        <span>{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Criteria rubric */}
                        <div>
                            <h3 className="mb-3 text-lg font-bold text-gray-900">Assessment Rubric</h3>
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
                                        {objective.rubric.criteria.map((criterion) => {
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
                                                                    className="h-full transition-all duration-500"
                                                                    style={{
                                                                        width: `${score}%`,
                                                                        backgroundColor: score === 100 ? "#10b981" : objective.color || "#10b981",
                                                                    }}
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

                        {/* Connected tickets */}
                        {objective.connected_ticket_ids.length > 0 && (
                            <div>
                                <h3 className="mb-3 text-lg font-bold text-gray-900">Connected Tickets</h3>
                                <div className="flex flex-wrap gap-2">
                                    {objective.connected_ticket_ids.map((ticketId: string) => (
                                        <button
                                            key={ticketId}
                                            onClick={() => onTicketClick?.(ticketId)}
                                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                                        >
                                            {ticketId}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
