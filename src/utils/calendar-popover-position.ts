export function getAnchoredPopoverPosition(
  triggerRect: DOMRect,
  popoverWidth: number,
  popoverHeight: number,
  viewportWidth?: number,
  viewportHeight?: number,
  margin = 8,
): { x: number; y: number } {
  const vw = viewportWidth ?? (typeof window !== "undefined" ? window.innerWidth : popoverWidth);
  const vh = viewportHeight ?? (typeof window !== "undefined" ? window.innerHeight : popoverHeight);

  let x = triggerRect.right - popoverWidth;
  let y = triggerRect.bottom + 4;

  if (x < margin) x = margin;
  if (x + popoverWidth > vw - margin) {
    x = vw - popoverWidth - margin;
  }

  if (y + popoverHeight > vh - margin) {
    y = triggerRect.top - popoverHeight - 4;
  }

  return { x, y };
}
