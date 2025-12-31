/**
 * Generate a consistent color for a criterion based on its ID
 */
export function getCriterionColor(criterionId: string): string {
    // Predefined color palette for consistency
    const colors = [
        "#ef4444", // red-500
        "#f97316", // orange-500
        "#f59e0b", // amber-500
        "#eab308", // yellow-500
        "#84cc16", // lime-500
        "#22c55e", // green-500
        "#10b981", // emerald-500
        "#14b8a6", // teal-500
        "#06b6d4", // cyan-500
        "#0ea5e9", // sky-500
        "#3b82f6", // blue-500
        "#6366f1", // indigo-500
        "#8b5cf6", // violet-500
        "#a855f7", // purple-500
        "#d946ef", // fuchsia-500
        "#ec4899", // pink-500
        "#f43f5e", // rose-500
    ];

    // Generate a consistent index from the criterion ID
    let hash = 0;
    for (let i = 0; i < criterionId.length; i++) {
        hash = criterionId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;

    return colors[index];
}

/**
 * Get a lighter version of the criterion color for backgrounds
 */
export function getCriterionBgColor(criterionId: string): string {
    const color = getCriterionColor(criterionId);
    // Convert to rgba with low opacity for background
    return `${color}20`; // 20 is hex for ~12% opacity
}
