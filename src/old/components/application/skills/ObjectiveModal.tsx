"use client";

import React from "react";
import { Target04, X } from "@untitledui/icons";
import { Objective } from "@/old/types/skills";
import { getCriterionColor } from "@/old/utils/criterion-colors";

type ObjectiveModalProps = {
  open: boolean;
  objective: Objective | null;
  onClose: () => void;
  onTicketClick?: (ticketId: string) => void;
  calculatedScores?: { criterion_id: string; score: number }[];
};

/**
 * Objective modal component
 * Shows a single-stage rubric for objectives like promotions
 */
export const ObjectiveModal: React.FC<ObjectiveModalProps> = ({ open, objective, onClose, onTicketClick, calculatedScores = [] }) => {
  if (!open || !objective) return null;

  // Calculate actual progress based on criterion total_scores
  const totalPossibleScore = objective.rubric.criteria.reduce((sum, criterion) => sum + (criterion.weight ?? 100), 0);
  const currentScore = objective.rubric.criteria.reduce((sum, criterion) => {
    const calculatedScore = calculatedScores?.find((s) => s.criterion_id === criterion.criterion_id);
    const score = calculatedScore?.score ?? criterion.score ?? 0;
    return sum + score;
  }, 0);
  const progress = totalPossibleScore > 0 ? Math.round((currentScore / totalPossibleScore) * 100) : 0;
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
                <p className="text-sm text-gray-600">Objective</p>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {objective.rubric.criteria.map((criterion) => {
                      const calculatedScore = calculatedScores?.find((s) => s.criterion_id === criterion.criterion_id);
                      const score = calculatedScore?.score ?? criterion.score ?? 0;
                      const totalScore = criterion.weight ?? 100;
                      const criterionColor = getCriterionColor(criterion.criterion_id);
                      const percentage = totalScore > 0 ? (score / totalScore) * 100 : 0;
                      return (
                        <tr key={criterion.criterion_id} className="group relative hover:bg-gray-50">
                          {/* Colored left border */}
                          <td className="relative px-4 py-3 text-sm font-medium text-gray-900">
                            <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: criterionColor }} />
                            {criterion.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{criterion.description}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col items-center gap-1">
                              <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200">
                                <div
                                  className="h-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(percentage, 100)}%`,
                                    backgroundColor: percentage >= 100 ? "#10b981" : objective.color || "#10b981",
                                  }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-700">
                                {score}/{totalScore}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
