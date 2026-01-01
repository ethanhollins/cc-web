/**
 * Hook for managing ticket-skill relationships
 */
import { useCallback, useState } from "react";
import { linkTicketToSkill, unlinkTicketFromSkill } from "@/old/utils/skills-api";

export function useTicketSkillLink() {
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkTicket = useCallback(async (skillId: string, stageId: string, ticketId: string) => {
    setIsLinking(true);
    setError(null);
    try {
      await linkTicketToSkill({ skill_id: skillId, stage_id: stageId, ticket_id: ticketId });
      console.log(`Linked ticket ${ticketId} to skill ${skillId}, stage ${stageId}`);
    } catch (err) {
      console.error("Failed to link ticket:", err);
      setError(err instanceof Error ? err.message : "Failed to link ticket");
      throw err;
    } finally {
      setIsLinking(false);
    }
  }, []);

  const unlinkTicket = useCallback(async (skillId: string, stageId: string, ticketId: string) => {
    setIsUnlinking(true);
    setError(null);
    try {
      await unlinkTicketFromSkill(skillId, stageId, ticketId);
      console.log(`Unlinked ticket ${ticketId} from skill ${skillId}, stage ${stageId}`);
    } catch (err) {
      console.error("Failed to unlink ticket:", err);
      setError(err instanceof Error ? err.message : "Failed to unlink ticket");
      throw err;
    } finally {
      setIsUnlinking(false);
    }
  }, []);

  return {
    linkTicket,
    unlinkTicket,
    isLinking,
    isUnlinking,
    error,
  };
}
