import { CSSProperties } from "react";
import { EdgeProps, getBezierPath, useNodes } from "reactflow";
import { getEdgeParams } from "./edge-utils";

/**
 * Custom floating edge that connects to the closest point on nodes
 */
function FloatingEdge({ id, source, target, style, markerEnd }: EdgeProps) {
  const nodes = useNodes();
  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

  const [path] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  return (
    <g className="react-flow__connection">
      <path id={id} className="react-flow__edge-path" d={path} style={style as CSSProperties} markerEnd={markerEnd} />
    </g>
  );
}

export default FloatingEdge;
