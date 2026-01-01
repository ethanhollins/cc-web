import { Node, Position, XYPosition } from "reactflow";

/**
 * Get the dimensions of a node - for circular nodes, we'll use a fixed size
 */
function getNodeDimensions(node: Node): { width: number; height: number } {
  // For our circular skill nodes, use 104x104
  // For stage nodes, use 80x80
  // For ticket nodes, use 60x60
  if (node.type === "skill") {
    return { width: 104, height: 104 };
  } else if (node.type === "stage") {
    return { width: 80, height: 80 };
  } else if (node.type === "ticket") {
    return { width: 60, height: 60 };
  }
  return { width: 100, height: 100 }; // default
}

/**
 * Returns the intersection point of the line between the center of the
 * intersectionNode and the target node with the intersectionNode's boundary
 */
function getNodeIntersection(intersectionNode: Node, targetNode: Node): XYPosition {
  const { width: intersectionNodeWidth, height: intersectionNodeHeight } = getNodeDimensions(intersectionNode);
  const targetDimensions = getNodeDimensions(targetNode);

  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNode.position.x + w;
  const y2 = intersectionNode.position.y + h;
  const x1 = targetNode.position.x + targetDimensions.width / 2;
  const y1 = targetNode.position.y + targetDimensions.height / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

/**
 * Returns the position (top, right, bottom, left) of the node
 * compared to the intersection point
 */
function getEdgePosition(node: Node, intersectionPoint: XYPosition): Position {
  const { width, height } = getNodeDimensions(node);
  const nx = Math.round(node.position.x);
  const ny = Math.round(node.position.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= ny + height - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

/**
 * Returns the parameters needed to create a floating edge
 */
export function getEdgeParams(source: Node, target: Node) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}
