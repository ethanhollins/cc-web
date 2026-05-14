export interface CalculateEloResult {
  delta: number;
  newElo: number;
}

export function calculateElo(playerElo: number, effectiveDrillElo: number, score: number, totalAttemptCount: number): CalculateEloResult {
  const clampedScore = Math.max(0, Math.min(1, score));
  const expectedScore = 1 / (1 + 10 ** ((effectiveDrillElo - playerElo) / 400));

  const baseK = 32;
  const decay = Math.min(16, Math.floor(totalAttemptCount / 20) * 2);
  const kFactor = Math.max(12, baseK - decay);

  const delta = Math.round(kFactor * (clampedScore - expectedScore));
  const newElo = Math.max(100, playerElo + delta);

  return {
    delta,
    newElo,
  };
}
