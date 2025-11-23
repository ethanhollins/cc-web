"use client";

import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
    Background,
    BackgroundVariant,
    Connection,
    Controls,
    Edge,
    EdgeTypes,
    MarkerType,
    MiniMap,
    Node,
    NodeTypes,
    SelectionMode,
    addEdge,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { Ticket } from "@/app/home-screen";
import { TICKET_CRITERION_SCORES } from "@/data/ticket-criterion-scores";
import { Objective, Skill, SkillStage, SkillStageNode } from "@/types/skills";
import FloatingEdge from "./FloatingEdge";
import { NodeBlobs } from "./NodeBlobs";
import { ObjectiveNode } from "./ObjectiveNode";
import { SkillNode } from "./SkillNode";
import { StageNode } from "./StageNode";
import { TicketNode } from "./TicketNode";

type SkillGraphProps = {
    skills: Skill[];
    objectives?: Objective[];
    stageNodes?: SkillStageNode[];
    tickets?: Ticket[];
    onSkillClick?: (skill: Skill) => void;
    onObjectiveClick?: (objective: Objective) => void;
    onStageClick?: (stage: SkillStageNode) => void;
    onTicketClick?: (ticket: Ticket) => void;
    onAddTicketToStage?: (stageId: string) => void;
    onAddTicketToObjective?: (objectiveId: string) => void;
    blobsEnabled?: boolean;
};

const nodeTypes: NodeTypes = {
    skill: SkillNode,
    objective: ObjectiveNode,
    stage: StageNode,
    ticket: TicketNode,
};

const edgeTypes: EdgeTypes = {
    floating: FloatingEdge,
};

/**
 * Get color based on current stage
 */
const getStageColor = (stage: SkillStage): string => {
    switch (stage) {
        case "Foundation":
            return "#6b7280"; // gray-500
        case "Practitioner":
            return "#3b82f6"; // blue-500
        case "Expert":
            return "#a855f7"; // purple-500
        case "Authority":
            return "#f59e0b"; // amber-500
        case "Master":
            return "#eab308"; // yellow-500
        default:
            return "#8b5cf6";
    }
};

/**
 * Skill graph component with interactive canvas
 */
export const SkillGraph: React.FC<SkillGraphProps> = ({
    skills,
    objectives = [],
    stageNodes = [],
    tickets = [],
    onSkillClick,
    onObjectiveClick,
    onStageClick,
    onTicketClick,
    onAddTicketToStage,
    onAddTicketToObjective,
    blobsEnabled = true,
}) => {
    const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
    const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);
    const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
    const [lastClickedNodeId, setLastClickedNodeId] = useState<string | null>(null);

    // Initialize nodes from skills, objectives, stages, and tickets
    const getInitialNodes = (): Node[] => {
        const baseNodes: Node[] = [
            // Skill nodes
            ...skills.map((skill) => ({
                id: skill.skill_id,
                type: "skill" as const,
                position: skill.position || { x: Math.random() * 800, y: Math.random() * 600 },
                data: skill,
                selected: skill.skill_id === selectedSkillId,
                zIndex: -1,
            })),
            // Objective nodes
            ...objectives.map((objective) => ({
                id: objective.skill_id,
                type: "objective" as const,
                position: objective.position || { x: Math.random() * 800, y: Math.random() * 600 },
                data: {
                    ...objective,
                    onAddTicket: selectedObjectiveId === objective.skill_id ? () => onAddTicketToObjective?.(objective.skill_id) : undefined,
                },
                selected: objective.skill_id === selectedObjectiveId,
                zIndex: -1,
            })),
            // Stage nodes
            ...stageNodes.map((stage) => ({
                id: stage.stage_node_id,
                type: "stage" as const,
                position: stage.position || { x: Math.random() * 800, y: Math.random() * 600 },
                data: {
                    ...stage,
                    onAddTicket: selectedStageId === stage.stage_node_id ? () => onAddTicketToStage?.(stage.stage_node_id) : undefined,
                },
                selected: stage.stage_node_id === selectedStageId,
                zIndex: -1,
            })),
            // Ticket nodes - include criterion scores in data
            ...tickets.map((ticket, index) => {
                const criterionScores = TICKET_CRITERION_SCORES[ticket.ticket_id] || [];
                return {
                    id: ticket.ticket_id,
                    type: "ticket" as const,
                    position: (ticket as any).position || { x: 100 + (index % 5) * 250, y: 100 + Math.floor(index / 5) * 150 },
                    data: {
                        ...ticket,
                        criterionScores,
                    },
                };
            }),
        ];

        return baseNodes;
    };

    // Initialize edges from skill and stage connections
    const getInitialEdges = (): Edge[] => {
        const baseEdges: Edge[] = [];

        // Edges from skills to stages (with dynamic connection points)
        skills.forEach((skill) => {
            skill.connected_stage_ids.forEach((stageId: string) => {
                const stage = stageNodes.find((s) => s.stage_node_id === stageId);
                if (stage) {
                    const stageColor = getStageColor(stage.stage);
                    baseEdges.push({
                        id: `${skill.skill_id}-${stageId}`,
                        source: skill.skill_id,
                        target: stageId,
                        type: "floating",
                        animated: false,
                        style: { stroke: stageColor, strokeWidth: 2 },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: stageColor,
                        },
                    });
                }
            });
        });

        // Edges from tickets to stages (with dynamic connection points)
        stageNodes.forEach((stage) => {
            stage.connected_ticket_ids.forEach((ticketId: string) => {
                const ticket = tickets.find((t) => t.ticket_id === ticketId);
                if (ticket) {
                    const stageColor = getStageColor(stage.stage);

                    baseEdges.push({
                        id: `${ticketId}-${stage.stage_node_id}`,
                        source: ticketId,
                        target: stage.stage_node_id,
                        type: "floating",
                        animated: true,
                        style: { stroke: stageColor, strokeWidth: 2 },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: stageColor,
                        },
                    });
                }
            });
        });

        // Edges from tickets to objectives (direct connection, no stages)
        objectives.forEach((objective) => {
            objective.connected_ticket_ids.forEach((ticketId: string) => {
                const ticket = tickets.find((t) => t.ticket_id === ticketId);
                if (ticket) {
                    const objectiveColor = objective.color || "#10b981";

                    baseEdges.push({
                        id: `${ticketId}-${objective.skill_id}`,
                        source: ticketId,
                        target: objective.skill_id,
                        type: "floating",
                        animated: true,
                        style: { stroke: objectiveColor, strokeWidth: 2 },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: objectiveColor,
                        },
                    });
                }
            });
        });

        return baseEdges;
    };

    const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes());
    const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialEdges());

    // Update node selection state without resetting positions
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                selected: node.id === selectedSkillId || node.id === selectedObjectiveId || node.id === selectedStageId,
                data:
                    node.type === "stage" && node.id === selectedStageId
                        ? {
                              ...(node.data as SkillStageNode),
                              onAddTicket: () => onAddTicketToStage?.(node.id),
                          }
                        : node.type === "objective" && node.id === selectedObjectiveId
                          ? {
                                ...(node.data as Objective),
                                onAddTicket: () => onAddTicketToObjective?.(node.id),
                            }
                          : node.data,
            })),
        );
    }, [selectedSkillId, selectedObjectiveId, selectedStageId, onAddTicketToStage, onAddTicketToObjective]);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onNodeClick = useCallback(
        (_event: React.MouseEvent, node: Node) => {
            if (node.type === "skill") {
                const skillId = node.id;
                // If clicking the same skill that's already selected, open the modal
                if (lastClickedNodeId === skillId && selectedSkillId === skillId) {
                    onSkillClick?.(node.data as Skill);
                } else {
                    // First click: select the skill
                    setSelectedSkillId(skillId);
                    setSelectedObjectiveId(null);
                    setSelectedStageId(null);
                    setLastClickedNodeId(skillId);
                }
            } else if (node.type === "objective") {
                const objectiveId = node.id;
                // If clicking the same objective that's already selected, open the modal
                if (lastClickedNodeId === objectiveId && selectedObjectiveId === objectiveId) {
                    onObjectiveClick?.(node.data as Objective);
                } else {
                    // First click: select the objective
                    setSelectedObjectiveId(objectiveId);
                    setSelectedSkillId(null);
                    setSelectedStageId(null);
                    setLastClickedNodeId(objectiveId);
                }
            } else if (node.type === "stage") {
                const stageId = node.id;
                // If clicking the same stage that's already selected, open the modal (if implemented)
                if (lastClickedNodeId === stageId && selectedStageId === stageId) {
                    onStageClick?.(node.data as SkillStageNode);
                } else {
                    // First click: select the stage
                    setSelectedStageId(stageId);
                    setSelectedSkillId(null);
                    setSelectedObjectiveId(null);
                    setLastClickedNodeId(stageId);
                }
            } else if (node.type === "ticket") {
                onTicketClick?.(node.data as Ticket);
            }
        },
        [onSkillClick, onObjectiveClick, onStageClick, onTicketClick, lastClickedNodeId, selectedSkillId, selectedObjectiveId, selectedStageId],
    );

    // Deselect nodes when clicking on the canvas
    const onPaneClick = useCallback(() => {
        setSelectedSkillId(null);
        setSelectedObjectiveId(null);
        setSelectedStageId(null);
        setLastClickedNodeId(null);
    }, []);

    return (
        <div className="h-full w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                minZoom={0.2}
                maxZoom={1.2}
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                className="bg-gray-50"
                selectionMode={SelectionMode.Partial}
                panOnDrag={[1, 2]}
                selectionOnDrag
                multiSelectionKeyCode="Meta"
            >
                {blobsEnabled && (
                    <svg
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            pointerEvents: "none",
                            zIndex: -10,
                            willChange: "transform",
                        }}
                    >
                        <NodeBlobs nodes={nodes} edges={edges} />
                    </svg>
                )}
                <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
                <Controls className="rounded-lg border border-gray-200 bg-white shadow-sm" />
                <MiniMap
                    className="rounded-lg border border-gray-200 bg-white shadow-sm"
                    nodeColor={(node) => {
                        if (node.type === "skill") {
                            return getStageColor((node.data as Skill).current_stage);
                        } else if (node.type === "objective") {
                            return (node.data as Objective).color || "#10b981";
                        }
                        return "#94a3b8";
                    }}
                    maskColor="rgba(0, 0, 0, 0.1)"
                />
            </ReactFlow>
        </div>
    );
};
