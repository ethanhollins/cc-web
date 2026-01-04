import type { Ticket, TicketYield, TicketYieldRarity } from "@/types/ticket";

/**
 * Mock yield metadata for tickets.
 *
 * This is a temporary client-side helper that decorates tickets/events with
 * optional score and yield information so we can validate UI without
 * requiring backend changes yet.
 *
 * TODO(CC-52): Replace this mock helper once the backend exposes
 * real coach score and yield fields for tickets/events.
 */

const YIELD_DEFINITIONS: Record<
  string,
  {
    label: string;
    icon: string;
    rarity: TicketYieldRarity;
  }
> = {
  streak: {
    label: "Streak",
    icon: "/coaches/streak_yield.png",
    rarity: "common",
  },
  words: {
    label: "Words",
    icon: "/coaches/words_yield.png",
    rarity: "common",
  },
  workouts: {
    label: "Workouts",
    icon: "/coaches/workouts_yield.png",
    rarity: "uncommon",
  },
  completion: {
    label: "Completion",
    icon: "/coaches/completion_yield.png",
    rarity: "rare",
  },
  logged: {
    label: "Logged",
    icon: "/coaches/logged_yield.png",
    rarity: "uncommon",
  },
  combos: {
    label: "Combos",
    icon: "/coaches/combos_yield.png",
    rarity: "uncommon",
  },
  milestone: {
    label: "Milestone",
    icon: "/coaches/milestone_yield.png",
    rarity: "rare",
  },
  mastery: {
    label: "Mastery",
    icon: "/coaches/mastery_yield.png",
    rarity: "rare",
  },
};

function simpleHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash + input.charCodeAt(i)) % 997; // small stable hash
  }
  return hash;
}

function computeScoreFromYields(yields: TicketYield[]): number {
  const base = 10 * yields.reduce((sum, y) => sum + y.count, 0);
  const rarityBonus = yields.reduce((sum, y) => {
    if (y.rarity === "rare") return sum + 40;
    if (y.rarity === "uncommon") return sum + 20;
    return sum + 5;
  }, 0);

  return base + rarityBonus;
}

function buildYieldsForTicket(ticket: Ticket): { score?: number; yields?: TicketYield[] } {
  // Only consider tickets that belong to a project (coach-managed domain analogue)
  if (!ticket.project_id) return {};

  // Explicit mock cases for showcasing specific common-yield stack sizes
  if (ticket.ticket_key === "CC-49" || ticket.ticket_key === "CC-51") {
    const def = YIELD_DEFINITIONS.streak;
    const count = ticket.ticket_key === "CC-49" ? 4 : 5; // 4-icon and 5+ icon examples

    const yields: TicketYield[] = [
      {
        id: "streak",
        label: def.label,
        icon: def.icon,
        rarity: def.rarity,
        count,
      },
    ];

    const score = computeScoreFromYields(yields);

    return { score, yields };
  }

  const hash = simpleHash(ticket.ticket_id || ticket.ticket_key || ticket.title);
  const bucket = hash % 10;

  // Most tickets: no yields/score
  if (bucket <= 6) {
    return {};
  }

  const yields: TicketYield[] = [];

  // Helper to push yield instances safely
  const addYield = (id: keyof typeof YIELD_DEFINITIONS, count: number) => {
    const def = YIELD_DEFINITIONS[id];
    if (!def) return;
    yields.push({
      id,
      label: def.label,
      icon: def.icon,
      rarity: def.rarity,
      count,
    });
  };

  // Buckets:
  // 7-8: common-only yields
  // 9: uncommon + rare mix (at most one of each per ticket)
  if (bucket === 7 || bucket === 8) {
    addYield("streak", 1 + (hash % 3));
    if (hash % 2 === 0) {
      addYield("words", 1 + ((hash >> 1) % 3));
    }
  } else if (bucket === 9) {
    const uncommonCandidates: Array<keyof typeof YIELD_DEFINITIONS> = ["logged", "workouts", "combos"];
    const rareCandidates: Array<keyof typeof YIELD_DEFINITIONS> = ["mastery", "milestone", "completion"];

    const uncommonId = uncommonCandidates[hash % uncommonCandidates.length];
    const rareId = rareCandidates[(hash >> 1) % rareCandidates.length];

    // At most one uncommon and one rare yield icon per ticket
    addYield(uncommonId, 1 + (hash % 2));
    addYield(rareId, 1);
  }

  if (!yields.length) {
    return {};
  }

  // Simple score heuristic: base on total yield counts and rarity
  const score = computeScoreFromYields(yields);

  return { score, yields };
}

export function attachMockYieldsAndScore<T extends Ticket>(ticket: T): T {
  // For now, only mock yields/scores on a small set of demo tickets
  // so that the UI remains mostly representative of real data.
  const MOCKED_TICKET_KEYS = new Set(["CC-48", "CC-49", "CC-51", "CC-52"]);

  if (!MOCKED_TICKET_KEYS.has(ticket.ticket_key)) {
    return ticket;
  }

  const { score, yields } = buildYieldsForTicket(ticket);

  if (!score && (!yields || yields.length === 0)) {
    return ticket;
  }

  return {
    ...ticket,
    score,
    yields,
  };
}
