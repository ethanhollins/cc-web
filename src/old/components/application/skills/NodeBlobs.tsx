"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Node, useViewport } from "reactflow";
import { Objective, Skill } from "@/types/skills";

type NodeBlobsProps = {
    nodes: Node[];
    edges: Array<{ source: string; target: string }>;
};

/**
 * Create organic blob path that follows edges between nodes
 * Creates a tube-like shape that wraps around the node connections
 */
const calculateBlobPath = (
    nodePoints: Array<{ x: number; y: number; width: number; height: number }>,
    sourceNode: { x: number; y: number; width: number; height: number },
    edges: Array<{ source: string; target: string }>,
    allNodesMap: Map<string, { position: { x: number; y: number }; width: number; height: number }>,
): string => {
    if (nodePoints.length === 0) return "";

    const nodePadding = 40;
    const tubePadding = 25; // Padding around edges

    // Collect all outline points: around nodes and along edges
    const allPoints: Array<{ x: number; y: number }> = [];

    // Add points around the source node
    const sourceCenter = {
        x: sourceNode.x + sourceNode.width / 2,
        y: sourceNode.y + sourceNode.height / 2,
    };

    const angles = 8; // Fewer points for better performance
    for (let i = 0; i < angles; i++) {
        const angle = (i / angles) * 2 * Math.PI;
        const radiusX = sourceNode.width / 2 + nodePadding;
        const radiusY = sourceNode.height / 2 + nodePadding;
        allPoints.push({
            x: sourceCenter.x + Math.cos(angle) * radiusX,
            y: sourceCenter.y + Math.sin(angle) * radiusY,
        });
    }

    // For each connected node, add points around it and along the connecting edge
    nodePoints.forEach((targetPoint) => {
        if (targetPoint.x === sourceNode.x && targetPoint.y === sourceNode.y) return; // Skip if it's the source node itself

        const targetCenter = {
            x: targetPoint.x + targetPoint.width / 2,
            y: targetPoint.y + targetPoint.height / 2,
        };

        // Add points around the target node
        for (let i = 0; i < angles; i++) {
            const angle = (i / angles) * 2 * Math.PI;
            const radiusX = targetPoint.width / 2 + nodePadding;
            const radiusY = targetPoint.height / 2 + nodePadding;
            allPoints.push({
                x: targetCenter.x + Math.cos(angle) * radiusX,
                y: targetCenter.y + Math.sin(angle) * radiusY,
            });
        }

        // Create tube along the edge
        const dx = targetCenter.x - sourceCenter.x;
        const dy = targetCenter.y - sourceCenter.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length > 0) {
            // Perpendicular vector for tube sides
            const perpX = (-dy / length) * tubePadding;
            const perpY = (dx / length) * tubePadding;

            // Add points along both sides of the edge
            const segments = Math.max(2, Math.floor(length / 100));
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const edgeX = sourceCenter.x + dx * t;
                const edgeY = sourceCenter.y + dy * t;

                allPoints.push({ x: edgeX + perpX, y: edgeY + perpY });
                allPoints.push({ x: edgeX - perpX, y: edgeY - perpY });
            }
        }
    });

    // Compute convex hull
    const convexHull = (pts: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> => {
        if (pts.length < 3) return pts;

        let start = pts[0];
        for (const p of pts) {
            if (p.y < start.y || (p.y === start.y && p.x < start.x)) {
                start = p;
            }
        }

        const sorted = pts.slice().sort((a, b) => {
            const angleA = Math.atan2(a.y - start.y, a.x - start.x);
            const angleB = Math.atan2(b.y - start.y, b.x - start.x);
            return angleA - angleB;
        });

        const hull: Array<{ x: number; y: number }> = [];

        for (const point of sorted) {
            while (hull.length >= 2) {
                const p1 = hull[hull.length - 2];
                const p2 = hull[hull.length - 1];
                const cross = (p2.x - p1.x) * (point.y - p1.y) - (p2.y - p1.y) * (point.x - p1.x);
                if (cross <= 0) {
                    hull.pop();
                } else {
                    break;
                }
            }
            hull.push(point);
        }

        return hull;
    };

    const hullPoints = convexHull(allPoints);

    if (hullPoints.length < 3) {
        const minX = Math.min(...nodePoints.map((p) => p.x)) - nodePadding;
        const maxX = Math.max(...nodePoints.map((p) => p.x + p.width)) + nodePadding;
        const minY = Math.min(...nodePoints.map((p) => p.y)) - nodePadding;
        const maxY = Math.max(...nodePoints.map((p) => p.y + p.height)) + nodePadding;
        const radius = 40;

        return `
            M ${minX + radius} ${minY}
            L ${maxX - radius} ${minY}
            Q ${maxX} ${minY} ${maxX} ${minY + radius}
            L ${maxX} ${maxY - radius}
            Q ${maxX} ${maxY} ${maxX - radius} ${maxY}
            L ${minX + radius} ${maxY}
            Q ${minX} ${maxY} ${minX} ${maxY - radius}
            L ${minX} ${minY + radius}
            Q ${minX} ${minY} ${minX + radius} ${minY}
            Z
        `;
    }

    // Create smooth curve with higher tension for tighter fit
    let path = `M ${hullPoints[0].x} ${hullPoints[0].y}`;

    for (let i = 0; i < hullPoints.length; i++) {
        const p0 = hullPoints[(i - 1 + hullPoints.length) % hullPoints.length];
        const p1 = hullPoints[i];
        const p2 = hullPoints[(i + 1) % hullPoints.length];
        const p3 = hullPoints[(i + 2) % hullPoints.length];

        const tension = 0.35; // Tighter curves
        const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
        const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
        const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
        const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    path += " Z";
    return path;
};

/**
 * Get the color for a skill/objective node
 */
const getNodeColor = (node: Node): string => {
    if (node.type === "skill") {
        const skill = node.data as Skill;
        // Use skill's accent color if available, otherwise use stage color
        if (skill.color) {
            return skill.color;
        }
        switch (skill.current_stage) {
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
    } else if (node.type === "objective") {
        const objective = node.data as Objective;
        return objective.color || "#10b981";
    }
    return "#94a3b8";
};

/**
 * Get node dimensions
 */
const getNodeDimensions = (node: Node): { width: number; height: number } => {
    if (node.type === "skill") {
        return { width: 104, height: 104 };
    } else if (node.type === "objective") {
        return { width: 200, height: 80 };
    } else if (node.type === "stage") {
        return { width: 140, height: 140 };
    } else if (node.type === "ticket") {
        return { width: 180, height: 100 };
    }
    return { width: 100, height: 100 };
};

/**
 * Component that renders blob backgrounds for connected node groups
 * This component is rendered inside ReactFlow and responds to viewport changes
 */
export const NodeBlobs: React.FC<NodeBlobsProps> = ({ nodes, edges }) => {
    const { zoom, x, y } = useViewport();
    const [isPanning, setIsPanning] = useState(false);
    const panTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastViewportRef = useRef({ x, y, zoom });

    // Detect when viewport changes (panning/zooming)
    useEffect(() => {
        const viewportChanged = lastViewportRef.current.x !== x || lastViewportRef.current.y !== y || lastViewportRef.current.zoom !== zoom;

        if (viewportChanged) {
            setIsPanning(true);

            // Clear existing timeout
            if (panTimeoutRef.current) {
                clearTimeout(panTimeoutRef.current);
            }

            // Set new timeout to re-enable blobs after panning stops
            panTimeoutRef.current = setTimeout(() => {
                setIsPanning(false);
            }, 100); // 100ms delay after last movement

            lastViewportRef.current = { x, y, zoom };
        }

        return () => {
            if (panTimeoutRef.current) {
                clearTimeout(panTimeoutRef.current);
            }
        };
    }, [x, y, zoom]);

    const blobs = useMemo(() => {
        const nodeMap = new Map(nodes.map((node) => [node.id, node]));
        const blobGroups: Array<{
            sourceNode: Node;
            connectedNodes: Node[];
            color: string;
        }> = [];

        // Find all skill and objective nodes
        const sourceNodes = nodes.filter((node) => node.type === "skill" || node.type === "objective");

        sourceNodes.forEach((sourceNode) => {
            // Find all connected stage and ticket nodes
            const connectedNodeIds = new Set<string>();

            // Get directly connected nodes (stages for skills, tickets for objectives)
            edges.forEach((edge) => {
                if (edge.source === sourceNode.id) {
                    connectedNodeIds.add(edge.target);
                }
                // Also check if tickets are connecting TO this node (for objectives)
                if (edge.target === sourceNode.id) {
                    connectedNodeIds.add(edge.source);
                }
            });

            // For skills: get tickets connected to the stages
            const directlyConnected = Array.from(connectedNodeIds);
            directlyConnected.forEach((nodeId) => {
                const connectedNode = nodeMap.get(nodeId);
                // Only traverse further for stage nodes (not for tickets connected to objectives)
                if (connectedNode?.type === "stage") {
                    edges.forEach((edge) => {
                        if (edge.target === nodeId && edge.source !== sourceNode.id) {
                            connectedNodeIds.add(edge.source);
                        }
                    });
                }
            });

            const connectedNodes = Array.from(connectedNodeIds)
                .map((id) => nodeMap.get(id))
                .filter((node): node is Node => node !== undefined);

            if (connectedNodes.length > 0) {
                blobGroups.push({
                    sourceNode,
                    connectedNodes,
                    color: getNodeColor(sourceNode),
                });
            }
        });

        return blobGroups;
    }, [nodes, edges]);

    // Calculate adaptive stroke width based on zoom
    const strokeWidth = Math.max(2, 3 / zoom);

    return (
        <g
            transform={`translate(${x}, ${y}) scale(${zoom})`}
            style={{
                willChange: "transform, opacity",
                opacity: isPanning ? 0 : 1,
                display: isPanning ? "none" : "block",
            }}
        >
            <defs>
                {blobs.map((blob, index) => (
                    <React.Fragment key={`defs-${index}`}>
                        <filter id={`blob-glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation={10 / zoom} result="blur" />
                            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" result="glow" />
                            <feMerge>
                                <feMergeNode in="glow" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <linearGradient id={`blob-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={blob.color} stopOpacity="0.06" />
                            <stop offset="100%" stopColor={blob.color} stopOpacity="0.03" />
                        </linearGradient>
                    </React.Fragment>
                ))}
            </defs>

            {blobs.map((blob, index) => {
                const allNodes = [blob.sourceNode, ...blob.connectedNodes];
                const points = allNodes.map((node) => {
                    const dims = getNodeDimensions(node);
                    return {
                        x: node.position.x,
                        y: node.position.y,
                        width: dims.width,
                        height: dims.height,
                    };
                });

                const sourceNodeDims = getNodeDimensions(blob.sourceNode);
                const sourceNodePoint = {
                    x: blob.sourceNode.position.x,
                    y: blob.sourceNode.position.y,
                    width: sourceNodeDims.width,
                    height: sourceNodeDims.height,
                };

                // Create a map of all nodes for edge lookup
                const nodesMap = new Map(
                    nodes.map((n) => [
                        n.id,
                        {
                            position: n.position,
                            ...getNodeDimensions(n),
                        },
                    ]),
                );

                const pathData = calculateBlobPath(points, sourceNodePoint, edges, nodesMap);

                // Parse color to RGB for custom styling
                const hexToRgb = (hex: string) => {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result
                        ? {
                              r: parseInt(result[1], 16),
                              g: parseInt(result[2], 16),
                              b: parseInt(result[3], 16),
                          }
                        : { r: 148, g: 163, b: 184 };
                };

                const rgb = hexToRgb(blob.color);
                const strokeColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
                // Disable expensive effects at lower zoom for better performance
                const useEffects = zoom > 0.5;

                return (
                    <g key={`blob-${index}`}>
                        {/* Main blob with gradient fill */}
                        <path
                            d={pathData}
                            fill={`url(#blob-gradient-${index})`}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${10 / zoom} ${6 / zoom}`}
                            filter={useEffects ? `url(#blob-glow-${index})` : undefined}
                            style={{
                                mixBlendMode: useEffects ? "multiply" : "normal",
                            }}
                        />
                    </g>
                );
            })}
        </g>
    );
};
