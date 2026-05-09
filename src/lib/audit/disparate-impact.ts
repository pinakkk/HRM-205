/**
 * Bias audit primitives. All deterministic — LLM only narrates the result.
 */

export type GroupedRewards = Record<string, number[]>;

/**
 * Disparate Impact Ratio (4/5ths rule).
 * Returns mean(group_A) / mean(group_B). Flag if < 0.8.
 */
export function disparateImpactRatio(groupA: number[], groupB: number[]) {
  const ma = mean(groupA);
  const mb = mean(groupB);
  if (mb === 0) return { ratio: null, flagged: false, ma, mb };
  const ratio = ma / mb;
  return { ratio, flagged: ratio < 0.8, ma, mb };
}

/**
 * Pairwise DIR for every group vs the highest-mean group.
 */
export function pairwiseDIR(groups: GroupedRewards) {
  const means: Record<string, number> = {};
  for (const [g, vals] of Object.entries(groups)) means[g] = mean(vals);

  const ref = Object.entries(means).sort((a, b) => b[1] - a[1])[0];
  if (!ref) return [];

  return Object.entries(means)
    .filter(([g]) => g !== ref[0])
    .map(([g, m]) => {
      const ratio = ref[1] === 0 ? null : m / ref[1];
      return {
        group: g,
        reference: ref[0],
        ratio,
        flagged: ratio !== null && ratio < 0.8,
      };
    });
}

/**
 * One-way ANOVA F-statistic. Returns F and a *very rough* p approximation
 * (good enough to flag p < 0.05 for our use; replace with `simple-statistics`
 * if higher precision is required).
 */
export function anovaF(groups: GroupedRewards) {
  const arrays = Object.values(groups).filter((g) => g.length > 0);
  if (arrays.length < 2) return { f: null, pApprox: null, flagged: false };

  const all = arrays.flat();
  const grandMean = mean(all);
  const k = arrays.length;
  const N = all.length;

  let ssBetween = 0;
  let ssWithin = 0;
  for (const g of arrays) {
    const m = mean(g);
    ssBetween += g.length * (m - grandMean) ** 2;
    for (const x of g) ssWithin += (x - m) ** 2;
  }

  const dfBetween = k - 1;
  const dfWithin = N - k;
  if (dfBetween <= 0 || dfWithin <= 0 || ssWithin === 0) {
    return { f: null, pApprox: null, flagged: false };
  }

  const f = ssBetween / dfBetween / (ssWithin / dfWithin);
  // Heuristic — F > ~3 with reasonable df ≈ p < 0.05.
  const flagged = f > 3;
  return { f, pApprox: flagged ? "<0.05" : ">=0.05", flagged };
}

/**
 * Manager-skew: per-manager z-score on mean feedback sentiment.
 */
export function managerSkew(perManager: Record<string, number[]>) {
  const managers = Object.entries(perManager).map(([id, vals]) => ({
    manager_id: id,
    mean: mean(vals),
    n: vals.length,
  }));
  if (managers.length < 2) return [];

  const overallMean = mean(managers.map((m) => m.mean));
  const sd = stdDev(managers.map((m) => m.mean));
  if (sd === 0) return managers.map((m) => ({ ...m, z: 0, flagged: false }));

  return managers.map((m) => {
    const z = (m.mean - overallMean) / sd;
    return { ...m, z, flagged: Math.abs(z) > 2 };
  });
}

// ─── helpers ─────────────────────────────────────────
export function mean(xs: number[]) {
  if (xs.length === 0) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

export function stdDev(xs: number[]) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const v = xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}
