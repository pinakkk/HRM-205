import type { GamificationLevel } from "@/types/domain";

const TIERS: { tier: GamificationLevel["tier"]; min: number }[] = [
  { tier: "Beginner", min: 0 },
  { tier: "Performer", min: 500 },
  { tier: "Achiever", min: 2000 },
  { tier: "Expert", min: 5000 },
  { tier: "Champion", min: 10000 },
];

export function levelFromPoints(lifetimeTotal: number): GamificationLevel {
  const pts = Math.max(0, Math.floor(lifetimeTotal));
  for (let i = TIERS.length - 1; i >= 0; i--) {
    const cur = TIERS[i];
    if (pts >= cur.min) {
      const next = TIERS[i + 1];
      return {
        tier: cur.tier,
        min: cur.min,
        max: next ? next.min - 1 : Number.POSITIVE_INFINITY,
        next: next ? next.min : null,
      };
    }
  }
  return { tier: "Beginner", min: 0, max: TIERS[1].min - 1, next: TIERS[1].min };
}

export function progressToNext(lifetimeTotal: number): number {
  const lvl = levelFromPoints(lifetimeTotal);
  if (lvl.next === null) return 1;
  const span = lvl.next - lvl.min;
  return Math.min(1, Math.max(0, (lifetimeTotal - lvl.min) / span));
}
