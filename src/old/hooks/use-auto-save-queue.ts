/**
 * Auto-save queue hook for batching position updates
 * Queues changes and sends them after 5 seconds of inactivity
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { updateNodePositions } from "@/old/utils/skills-api";

type PositionUpdate = {
    node_id: string;
    node_type: "ticket" | "stage" | "mastery" | "objective";
    position: { x: number; y: number };
};

export function useAutoSaveQueue(skillId: string | null) {
    const [queue, setQueue] = useState<Map<string, PositionUpdate>>(new Map());
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isSavingRef = useRef(false);

    // Function to add/update a position in the queue
    const queuePositionUpdate = useCallback((nodeId: string, nodeType: "ticket" | "stage" | "mastery" | "objective", position: { x: number; y: number }) => {
        console.log(`Queuing position update for ${nodeType} node ${nodeId}:`, position);
        setQueue((prev) => {
            const newQueue = new Map(prev);
            newQueue.set(nodeId, { node_id: nodeId, node_type: nodeType, position });
            return newQueue;
        });
    }, []);

    // Function to save all queued positions
    const saveQueue = useCallback(async () => {
        if (!skillId || queue.size === 0 || isSavingRef.current) return;

        isSavingRef.current = true;
        const allUpdates = Array.from(queue.values());

        console.log(`Saving ${allUpdates.length} position updates:`, allUpdates);

        try {
            if (allUpdates.length > 0) {
                await updateNodePositions(skillId, allUpdates);
                console.log(`Saved ${allUpdates.length} node position updates`);
            }

            setQueue(new Map()); // Clear the queue after successful save
        } catch (error) {
            console.error("Failed to save position updates:", error);
            // Keep items in queue on error so they can be retried
        } finally {
            isSavingRef.current = false;
        }
    }, [skillId, queue]);

    // Effect to handle the auto-save timer
    useEffect(() => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // If there are items in the queue, start a new timeout
        if (queue.size > 0) {
            timeoutRef.current = setTimeout(() => {
                saveQueue();
            }, 5000); // 5 seconds
        }

        // Cleanup on unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [queue, saveQueue]);

    // Force save immediately (useful for cleanup)
    const forceSave = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        saveQueue();
    }, [saveQueue]);

    return {
        queuePositionUpdate,
        forceSave,
        queueSize: queue.size,
        isSaving: isSavingRef.current,
    };
}
