export type BallCountOption = 3 | 5 | 8;
export type SpreadOption = "easy_clusters" | "standard" | "tight_spread";

interface DrillTier {
  label: string;
  baseElo: number;
}

interface DrillAdjustment<TValue extends string | number> {
  value: TValue;
  label: string;
  eloModifier: number;
}

export interface PottingAccuracyDrillConfig {
  drillKey: string;
  displayName: string;
  setupInstructions: string[];
  tiers: DrillTier[];
  ballCountAdjustments: DrillAdjustment<BallCountOption>[];
  spreadAdjustments: DrillAdjustment<SpreadOption>[];
}

export const pottingAccuracyDrillConfig: PottingAccuracyDrillConfig = {
  drillKey: "potting_accuracy_core",
  displayName: "Line-Up Potting Ladder",
  setupInstructions: [
    "Rack and spread the selected number of object balls in open table positions.",
    "Start with cue ball in hand and attempt to pot every selected ball in sequence.",
    "Tap each successful pot on the counter. Use Miss to end immediately.",
  ],
  tiers: [{ label: "Standard", baseElo: 1200 }],
  ballCountAdjustments: [
    { value: 3, label: "3 balls", eloModifier: -200 },
    { value: 5, label: "5 balls", eloModifier: 0 },
    { value: 8, label: "8 balls", eloModifier: 200 },
  ],
  spreadAdjustments: [
    { value: "easy_clusters", label: "Easy clusters", eloModifier: -150 },
    { value: "standard", label: "Standard spread", eloModifier: 0 },
    { value: "tight_spread", label: "Tight spread", eloModifier: 200 },
  ],
};
