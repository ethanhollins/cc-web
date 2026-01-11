/**
 * Generate a deterministic color from a string that ensures good contrast with white text
 * @param str - The string to generate a color from (e.g., assignee name)
 * @returns A hex color string (e.g., "#4b5563")
 */
export function generateColorFromString(str: string): string {
  if (!str) return "#4b5563"; // default gray

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate RGB values with reduced range to ensure darker colors
  // Using range 40-180 instead of 0-255 to keep colors darker for white text contrast
  const r = Math.abs((hash & 0xff) % 140) + 40;
  const g = Math.abs(((hash >> 8) & 0xff) % 140) + 40;
  const b = Math.abs(((hash >> 16) & 0xff) % 140) + 40;

  // Convert to hex
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
