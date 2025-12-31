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
    NodeDragHandler,
    NodeTypes,
    SelectionMode,
    addEdge,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { Ticket } from "@/old/app/home-screen";
import { useAutoSaveQueue } from "@/old/hooks/use-auto-save-queue";
import { Objective, Skill, SkillStage, SkillStageNode } from "@/old/types/skills";
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
    onUnlinkTicket?: (ticketId: string, skillId: string, stageId: string) => void;
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
 * Calculate criterion scores from connected tickets
 */
const calculateScoresFromTickets = (connectedTicketIds: string[], allTickets: Ticket[]): Array<{ criterion_id: string; score: number }> => {
    const scoreMap = new Map<string, { total: number; count: number }>();

    console.log("calculateScoresFromTickets called with:", {
        connectedTicketIds,
        ticketCount: allTickets.length,
        ticketsWithScores: allTickets.filter((t) => (t as any).criterionScores?.length > 0).length,
    });

    // Aggregate scores from all connected tickets
    connectedTicketIds.forEach((ticketId) => {
        const ticket = allTickets.find((t) => t.ticket_id === ticketId);
        console.log("Processing ticket:", ticketId, "found:", !!ticket, "scores:", (ticket as any)?.criterionScores);
        if (ticket && (ticket as any).criterionScores) {
            (ticket as any).criterionScores.forEach((cs: { criterion_id: string; score: number }) => {
                const existing = scoreMap.get(cs.criterion_id) || { total: 0, count: 0 };
                scoreMap.set(cs.criterion_id, {
                    total: existing.total + cs.score,
                    count: existing.count + 1,
                });
            });
        }
    });

    // Calculate averages and sort alphabetically by criterion_id
    return Array.from(scoreMap.entries())
        .map(([criterion_id, { total, count }]) => ({
            criterion_id,
            score: Math.round(total / count),
        }))
        .sort((a, b) => a.criterion_id.localeCompare(b.criterion_id));
};

/**
 * Calculate overall progress percentage from criterion scores
 * Progress = (sum of all scores) / (sum of all total_scores/weights) * 100
 */
const calculateProgress = (
    scores: Array<{ criterion_id: string; score: number }>,
    rubricCriteria: Array<{ criterion_id: string; weight?: number }>,
): number => {
    if (rubricCriteria.length === 0) return 0;

    // Calculate total score achieved and total possible score
    let totalScore = 0;
    let totalPossible = 0;

    rubricCriteria.forEach((criterion) => {
        const scoreEntry = scores.find((s) => s.criterion_id === criterion.criterion_id);
        const score = scoreEntry?.score || 0;
        const weight = criterion.weight || 100; // weight is the total_score for this criterion

        totalScore += score;
        totalPossible += weight;
    });

    const progress = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    console.log("calculateProgress:", { scores, rubricCriteria, totalScore, totalPossible, progress });
    return progress;
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
    onUnlinkTicket,
    blobsEnabled = true,
}) => {
    const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
    const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);
    const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [lastClickedNodeId, setLastClickedNodeId] = useState<string | null>(null);

    // Get the skill ID for auto-save (use the first skill if available)
    const activeSkillId = skills.length > 0 ? skills[0].skill_id : objectives.length > 0 ? objectives[0].skill_id : null;

    // Initialize auto-save queue for position updates
    const { queuePositionUpdate } = useAutoSaveQueue(activeSkillId);

    // Initialize nodes from skills, objectives, stages, and tickets
    const getInitialNodes = (): Node[] => {
        console.log("getInitialNodes called with:", {
            skillsCount: skills.length,
            stageNodesCount: stageNodes.length,
            ticketsCount: tickets.length,
            sampleTicket: tickets[0],
        });

        const baseNodes: Node[] = [
            // Skill nodes
            ...skills.map((skill) => {
                // Get all tickets connected to this skill's stages
                const connectedStages = stageNodes.filter((s) => s.skill_id === skill.skill_id);
                const allConnectedTicketIds = connectedStages.flatMap((s) => s.connected_ticket_ids);
                const scores = calculateScoresFromTickets(allConnectedTicketIds, tickets);

                // Calculate progress for each stage
                const stage_progress: Record<SkillStage, number> = {
                    Foundation: 0,
                    Practitioner: 0,
                    Expert: 0,
                    Authority: 0,
                    Master: 0,
                };

                connectedStages.forEach((stage) => {
                    const stageScores = calculateScoresFromTickets(stage.connected_ticket_ids, tickets);
                    const rubric = skill.rubrics.find((r) => r.stage === stage.stage);
                    const rubricCriteria = rubric?.criteria.map((c) => ({ criterion_id: c.criterion_id, weight: c.weight })) || [];
                    stage_progress[stage.stage] = calculateProgress(stageScores, rubricCriteria);
                });

                return {
                    id: skill.skill_id,
                    type: "skill" as const,
                    position: skill.position || { x: Math.random() * 800, y: Math.random() * 600 },
                    data: { ...skill, scores, stage_progress },
                    selected: skill.skill_id === selectedSkillId,
                    zIndex: -1,
                };
            }),
            // Objective nodes
            ...objectives.map((objective) => {
                // Calculate scores from connected tickets
                const connectedTicketIds = objective.connected_ticket_ids || [];
                const scores = calculateScoresFromTickets(connectedTicketIds, tickets);

                // Calculate progress using the objective's rubric
                const rubricCriteria = objective.rubric?.criteria.map((c) => ({ criterion_id: c.criterion_id, weight: c.weight })) || [];
                const progress = calculateProgress(scores, rubricCriteria);

                return {
                    id: objective.skill_id,
                    type: "objective" as const,
                    position: objective.position || { x: Math.random() * 800, y: Math.random() * 600 },
                    data: {
                        ...objective,
                        scores,
                        progress,
                        onAddTicket: selectedObjectiveId === objective.skill_id ? () => onAddTicketToObjective?.(objective.skill_id) : undefined,
                    },
                    selected: objective.skill_id === selectedObjectiveId,
                    zIndex: -1,
                };
            }),
            // Stage nodes
            ...stageNodes.map((stage) => {
                const scores = calculateScoresFromTickets(stage.connected_ticket_ids, tickets);
                // Find the parent skill to get rubric criteria
                const parentSkill = skills.find((s) => s.skill_id === stage.skill_id);
                const rubric = parentSkill?.rubrics.find((r) => r.stage === stage.stage);
                const rubricCriteria = rubric?.criteria.map((c) => ({ criterion_id: c.criterion_id, weight: c.weight })) || [];
                const progress = calculateProgress(scores, rubricCriteria);
                return {
                    id: stage.stage_node_id,
                    type: "stage" as const,
                    position: stage.position || { x: Math.random() * 800, y: Math.random() * 600 },
                    data: {
                        ...stage,
                        scores,
                        progress,
                        onAddTicket: selectedStageId === stage.stage_node_id ? () => onAddTicketToStage?.(stage.stage_node_id) : undefined,
                    },
                    selected: stage.stage_node_id === selectedStageId,
                    zIndex: -1,
                };
            }),
            // Ticket nodes - include criterion scores in data
            ...tickets.map((ticket, index) => {
                // Find which stage this ticket is connected to
                const connectedStage = stageNodes.find((s) => s.connected_ticket_ids.includes(ticket.ticket_id));

                return {
                    id: ticket.ticket_id,
                    type: "ticket" as const,
                    position: (ticket as any).position || { x: 100 + (index % 5) * 250, y: 100 + Math.floor(index / 5) * 150 },
                    data: {
                        ...ticket,
                        onUnlink:
                            selectedTicketId === ticket.ticket_id && connectedStage && onUnlinkTicket
                                ? () => onUnlinkTicket(ticket.ticket_id, connectedStage.skill_id, connectedStage.stage_node_id)
                                : undefined,
                    },
                    selected: selectedTicketId === ticket.ticket_id,
                };
            }),
        ];

        return baseNodes;
    };

    // Initialize edges from skill and stage connections
    const getInitialEdges = (): Edge[] => {
        const baseEdges: Edge[] = [];

        // Edges from stages to their parent skill/objective
        stageNodes.forEach((stage) => {
            const stageColor = getStageColor(stage.stage);
            baseEdges.push({
                id: `${stage.skill_id}-${stage.stage_node_id}`,
                source: stage.skill_id,
                target: stage.stage_node_id,
                type: "floating",
                animated: false,
                style: { stroke: stageColor, strokeWidth: 2 },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: stageColor,
                },
            });
        });

        // Edges from tickets to stages based on linked_stages
        tickets.forEach((ticket) => {
            const linkedStages = (ticket as any).linked_stages || [];

            linkedStages.forEach((stageName: string) => {
                // Find stage node by stage name (need to match the stage field)
                const normalizedStageName = stageName.charAt(0).toUpperCase() + stageName.slice(1).toLowerCase();
                const stage = stageNodes.find((s) => s.stage === normalizedStageName);

                if (stage) {
                    // Connect to stage node for mastery skills
                    const stageColor = getStageColor(stage.stage);
                    baseEdges.push({
                        id: `${ticket.ticket_id}-${stage.stage_node_id}`,
                        source: ticket.ticket_id,
                        target: stage.stage_node_id,
                        type: "floating",
                        animated: true,
                        style: { stroke: stageColor, strokeWidth: 2 },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: stageColor,
                        },
                    });
                } else if (stageName.toLowerCase() === "assessment" && objectives.length > 0) {
                    // For "assessment" stage, connect directly to the objective node
                    const objective = objectives[0]; // There's only one objective in the graph
                    baseEdges.push({
                        id: `${ticket.ticket_id}-${objective.skill_id}`,
                        source: ticket.ticket_id,
                        target: objective.skill_id,
                        type: "floating",
                        animated: true,
                        style: { stroke: "#10b981", strokeWidth: 2 }, // emerald-500
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: "#10b981",
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
            nds.map((node) => {
                const isSelected =
                    node.id === selectedSkillId || node.id === selectedObjectiveId || node.id === selectedStageId || node.id === selectedTicketId;

                return {
                    ...node,
                    selected: isSelected,
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
                              : node.type === "ticket" && node.id === selectedTicketId
                                ? (() => {
                                      const connectedStage = stageNodes.find((s) => s.connected_ticket_ids.includes(node.id));
                                      return {
                                          ...node.data,
                                          onUnlink:
                                              connectedStage && onUnlinkTicket
                                                  ? () => onUnlinkTicket(node.id, connectedStage.skill_id, connectedStage.stage_node_id)
                                                  : undefined,
                                      };
                                  })()
                                : node.data,
                };
            }),
        );
    }, [selectedSkillId, selectedObjectiveId, selectedStageId, selectedTicketId, onAddTicketToStage, onAddTicketToObjective, onUnlinkTicket, stageNodes]);

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
                const ticketId = node.id;
                if (selectedTicketId === ticketId) {
                    // Already selected - deselect it
                    setSelectedTicketId(null);
                    setLastClickedNodeId(null);
                } else {
                    // First click: select the ticket
                    setSelectedTicketId(ticketId);
                    setSelectedSkillId(null);
                    setSelectedObjectiveId(null);
                    setSelectedStageId(null);
                    setLastClickedNodeId(ticketId);
                }
            }
        },
        [
            onSkillClick,
            onObjectiveClick,
            onStageClick,
            onTicketClick,
            lastClickedNodeId,
            selectedSkillId,
            selectedObjectiveId,
            selectedStageId,
            selectedTicketId,
        ],
    );

    // Deselect nodes when clicking on the canvas
    const onPaneClick = useCallback(() => {
        setSelectedSkillId(null);
        setSelectedObjectiveId(null);
        setSelectedStageId(null);
        setSelectedTicketId(null);
        setLastClickedNodeId(null);
    }, []);

    // Handle node drag end - queue position updates for all node types
    const onNodeDragStop: NodeDragHandler = useCallback(
        (_event, node) => {
            console.log(`Node dragged: ${node.type} - ${node.id}`, node.position);
            // Queue position updates for all node types
            // For tickets, use node_id from data; for others, use the node.id
            let nodeId = node.id;
            if (node.type === "ticket" && node.data.node_id) {
                nodeId = node.data.node_id;
            } else if (node.type === "stage" && node.data.stage_node_id) {
                nodeId = node.data.stage_node_id;
            }

            if (node.type === "ticket" || node.type === "stage" || node.type === "skill" || node.type === "objective") {
                // @ts-ignore - Type mismatch between node types, needs refactoring
                queuePositionUpdate(nodeId, node.type, node.position);
            }
        },
        [queuePositionUpdate],
    );

    // Handle double-click to open modals
    const onNodeDoubleClick = useCallback(
        (_event: React.MouseEvent, node: Node) => {
            if (node.type === "skill") {
                onSkillClick?.(node.data as Skill);
            } else if (node.type === "objective") {
                onObjectiveClick?.(node.data as Objective);
            } else if (node.type === "stage") {
                onStageClick?.(node.data as SkillStageNode);
            } else if (node.type === "ticket") {
                onTicketClick?.(node.data as Ticket);
            }
        },
        [onSkillClick, onObjectiveClick, onStageClick, onTicketClick],
    );

    return (
        <div className="h-full w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onNodeDoubleClick={onNodeDoubleClick}
                onNodeDragStop={onNodeDragStop}
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
