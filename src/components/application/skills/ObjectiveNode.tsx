import React from "react";
import { Target04 } from "@untitledui/icons";
import { Handle, Position } from "reactflow";
import { Objective } from "@/types/skills";

type ObjectiveNodeProps = {
    data: Objective & {
        onAddTicket?: () => void;
    };
    selected?: boolean;
};

/**
 * Objective node component for the graph
 * Objectives are single-stage goals (like promotions) with a distinct visual style
 */
export const ObjectiveNode: React.FC<ObjectiveNodeProps> = ({ data, selected }) => {
    const progress = data.progress;
    const nodeWidth = 200;
    const nodeHeight = 80;
    const strokeWidth = 4;
    const borderRadius = 12;
    const gap = 4;
    const progressWidth = nodeWidth + gap * 2;
    const progressHeight = nodeHeight + gap * 2;
    const svgWidth = progressWidth + strokeWidth * 2;
    const svgHeight = progressHeight + strokeWidth * 2;
    const offset = strokeWidth;

    // Create rounded rectangle path for progress
    const x = offset;
    const y = offset;
    const w = progressWidth;
    const h = progressHeight;
    const r = borderRadius;

    const pathData = `
        M ${x + w / 2} ${y}
        L ${x + w - r} ${y}
        Q ${x + w} ${y} ${x + w} ${y + r}
        L ${x + w} ${y + h - r}
        Q ${x + w} ${y + h} ${x + w - r} ${y + h}
        L ${x + r} ${y + h}
        Q ${x} ${y + h} ${x} ${y + h - r}
        L ${x} ${y + r}
        Q ${x} ${y} ${x + r} ${y}
        L ${x + w / 2} ${y}
    `;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData.trim());
    const pathLength = path.getTotalLength?.() || 2 * (progressWidth + progressHeight - 4 * r) + 2 * Math.PI * r;
    const strokeDashoffset = pathLength - (progress / 100) * pathLength;
    const objectiveColor = data.color || "#10b981"; // Default emerald-500

    const isAchieved = data.is_achieved;

    return (
        <div className="relative flex items-center justify-center">
            {/* Progress ring */}
            <svg className="absolute -z-10" width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ overflow: "visible" }}>
                {/* Background rounded rect */}
                <rect
                    x={offset}
                    y={offset}
                    width={progressWidth}
                    height={progressHeight}
                    rx={borderRadius}
                    ry={borderRadius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                />
                {/* Progress path */}
                <path
                    d={pathData.trim()}
                    fill="none"
                    stroke={isAchieved ? "#10b981" : objectiveColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={pathLength}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                />
            </svg>

            {/* Objective card */}
            <div
                className={`relative flex h-[${nodeHeight}px] w-[${nodeWidth}px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 bg-white p-3 shadow-lg transition-all hover:scale-105 hover:shadow-xl ${
                    selected ? "ring-4 ring-blue-400 ring-offset-2" : ""
                } ${isAchieved ? "border-green-500 bg-green-50" : "border-gray-200"}`}
                style={{ width: nodeWidth, height: nodeHeight }}
            >
                {/* Target icon and name */}
                <div className="flex w-full items-center gap-2">
                    <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${isAchieved ? "bg-green-100" : "bg-gray-100"}`}
                        style={!isAchieved ? { backgroundColor: objectiveColor + "20" } : {}}
                    >
                        <Target04 className="size-5" style={isAchieved ? { color: "#10b981" } : { color: objectiveColor }} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-gray-900" title={data.name}>
                            {data.name}
                        </h3>
                        <p className="text-xs text-gray-600">{isAchieved ? "✓ Achieved" : `${progress}% Complete`}</p>
                    </div>
                </div>

                {/* Achievement badge */}
                {isAchieved && (
                    <div className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white shadow-md">
                        ✓
                    </div>
                )}
            </div>

            {/* Connection handles */}
            <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-2 !border-gray-400 !bg-white" />
            <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-2 !border-gray-400 !bg-white" />
            <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-2 !border-gray-400 !bg-white" />
            <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-2 !border-gray-400 !bg-white" />
        </div>
    );
};
