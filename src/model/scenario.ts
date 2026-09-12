import type {
  EvidenceEstimate,
  InformationComparison,
  ScenarioInput,
  ScenarioResult,
  SimulationSummary,
} from '@/types';
import { evidenceById } from './evidence';

const DRAWS = 10_000;
const SEED = 20260910;

export const STANDARD_DISCLAIMER =
  'This is an evidence-based risk scenario, not your predicted probability. It is an educational synthesis of published cohort estimates, has not been validated on individual-level data, cannot diagnose T1D, and must not guide medical decisions.';

interface CoreEstimate {
  anchor: EvidenceEstimate | null;
  modifiers: EvidenceEstimate[];
  simulation: SimulationSummary | null;
  reason: string | null;
}

function logit(p: number): number {
  return Math.log(p / (1 - p));
}

function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(random: () => number): number {
  const u = Math.max(Number.EPSILON, random());
  const v = Math.max(Number.EPSILON, random());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function quantile(sorted: number[], p: number): number {
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * sorted.length)));
  return sorted[index]!;
}

function sampleLogitRisk(e: EvidenceEstimate, z: number): number {
  const sd = (logit(e.upper95) - logit(e.lower95)) / (2 * 1.96);
  return logistic(logit(e.point) + z * sd);
}

function sampleLogHr(e: EvidenceEstimate, z: number): number {
  const sd = (Math.log(e.upper95) - Math.log(e.lower95)) / (2 * 1.96);
  return Math.exp(Math.log(e.point) + z * sd);
}

/**
 * Monte Carlo propagation uses logit-normal published absolute risks and
 * log-normal published hazard ratios. Modifiers are combined under a stated
 * proportional-hazards approximation: R* = 1 - (1 - R)^product(HR).
 */
export function simulate(anchor: EvidenceEstimate, modifiers: EvidenceEstimate[]): SimulationSummary {
  const random = mulberry32(SEED);
  const draws: number[] = [];
  for (let i = 0; i < DRAWS; i++) {
    const baseRisk = sampleLogitRisk(anchor, normal(random));
    const hazardMultiplier = modifiers.reduce(
      (product, modifier) => product * sampleLogHr(modifier, normal(random)),
      1,
    );
    draws.push(1 - Math.pow(1 - baseRisk, hazardMultiplier));
  }
  draws.sort((a, b) => a - b);
  const pointMultiplier = modifiers.reduce((product, modifier) => product * modifier.point, 1);
  return {
    point: 1 - Math.pow(1 - anchor.point, pointMultiplier),
    interval95: [quantile(draws, 0.025), quantile(draws, 0.975)],
    draws: DRAWS,
    seed: SEED,
  };
}

function autoimmunityCore(input: ScenarioInput): CoreEstimate {
  if (input.autoantibodies !== 'negative') {
    return { anchor: null, modifiers: [], simulation: null, reason: 'Stage 1 requires confirmed antibody-negative status at baseline.' };
  }
  if (input.hla !== 'dr3-dr4-dq8' && input.hla !== 'dr4-dq8-homozygous') {
    return { anchor: null, modifiers: [], simulation: null, reason: 'TEDDY published this estimate only for DR3/DR4-DQ8 or DR4-DQ8/DR4-DQ8.' };
  }
  if (input.familyHistory !== 'none') {
    return { anchor: null, modifiers: [], simulation: null, reason: 'The applicable TEDDY analysis excluded children with a first-degree relative with T1D.' };
  }
  const id = input.geneticScore === 'teddy-high'
    ? 'teddy-mia-grs-high'
    : input.geneticScore === 'teddy-not-high'
      ? 'teddy-mia-grs-not-high'
      : 'teddy-mia-high-hla-all-grs';
  const anchor = evidenceById(id);
  return { anchor, modifiers: [], simulation: simulate(anchor, []), reason: null };
}

function progressionCore(input: ScenarioInput): CoreEstimate {
  if (input.autoantibodies !== 'single' && input.autoantibodies !== 'multiple') {
    return { anchor: null, modifiers: [], simulation: null, reason: 'Stage 2 requires confirmed persistent single or multiple islet autoantibodies.' };
  }
  const anchor = evidenceById(
    input.autoantibodies === 'multiple' ? 'pooled-multiple-ab-10y' : 'pooled-single-ab-10y',
  );
  const modifiers: EvidenceEstimate[] = [];
  if (input.autoantibodies === 'multiple') {
    if (input.hla === 'dr3-dr4-dq8') modifiers.push(evidenceById('pooled-hla-dr3-dr4-hr'));
    if (input.seroconversionAge === 'under-3') modifiers.push(evidenceById('pooled-young-seroconversion-hr'));
    if (input.sex === 'female') modifiers.push(evidenceById('pooled-female-hr'));
  }
  return { anchor, modifiers, simulation: simulate(anchor, modifiers), reason: null };
}

function core(input: ScenarioInput): CoreEstimate {
  return input.question === 'autoimmunity' ? autoimmunityCore(input) : progressionCore(input);
}

function withoutField(input: ScenarioInput, field: InformationComparison['field']): ScenarioInput {
  if (field === 'hla') return { ...input, hla: 'unknown' };
  if (field === 'geneticScore') return { ...input, geneticScore: 'unknown' };
  if (field === 'familyHistory') return { ...input, familyHistory: 'unknown' };
  return { ...input, autoantibodies: 'unknown' };
}

function comparisons(input: ScenarioInput, original: CoreEstimate): InformationComparison[] {
  const fields: Array<[InformationComparison['field'], string]> = [
    ['hla', 'Without HLA information'],
    ['geneticScore', 'Without SNP / genetic-score information'],
    ['familyHistory', 'Without family-history information'],
    ['autoantibodies', 'Without antibody information'],
  ];
  return fields.map(([field, label]) => {
    const alternate = core(withoutField(input, field));
    if (!alternate.simulation) {
      return {
        field, label, status: 'not-estimable', estimate: null, interval95: null, change: null,
        note: alternate.reason ?? 'No compatible estimate is available.',
      };
    }
    const change = original.simulation ? alternate.simulation.point - original.simulation.point : null;
    const unchanged = change !== null && Math.abs(change) < 1e-12;
    let note = unchanged ? 'The number is unchanged because no compatible published coefficient is applied for this field.' : 'Recomputed with this information removed; this is a missing-information sensitivity analysis.';
    if (field === 'geneticScore' && input.question === 'progression') {
      note = 'Unchanged: the TrialNet GRS association is displayed as evidence but is not mixed with a different cohort’s absolute-risk anchor.';
    }
    if (field === 'familyHistory' && input.question === 'progression') {
      note = 'Unchanged numerically; family-history composition still limits transportability and is not treated as zero effect.';
    }
    return {
      field, label, status: unchanged ? 'unchanged' : 'estimated', estimate: alternate.simulation.point,
      interval95: alternate.simulation.interval95, change, note,
    };
  });
}

export function buildScenario(input: ScenarioInput): ScenarioResult {
  const estimate = core(input);
  const isAutoimmunity = input.question === 'autoimmunity';
  const warnings = estimate.anchor ? [estimate.anchor.applicabilityWarning, ...estimate.modifiers.map((m) => m.applicabilityWarning)] : [];
  warnings.push(
    'Ancestry transportability is limited: source genetic scores were developed mainly in European-ancestry data, and neither evidence base validates this synthesis across all ancestry groups.',
  );
  if (input.question === 'progression') {
    warnings.push('The pooled progression cohorts enrolled genetically at-risk children; results should not be generalized to adults or incidental community testing.');
  }
  const synthesisWarning = estimate.modifiers.length
    ? 'Exploratory synthesis: the adjusted scenario combines published hazard ratios with the cohort-wide absolute-risk anchor under proportional hazards. The authors did not publish or validate this exact combined probability.'
    : null;
  return {
    question: input.question,
    title: isAutoimmunity ? 'Stage 1 · Development of islet autoimmunity' : 'Stage 2 · Progression to clinical T1D',
    outcome: isAutoimmunity ? 'Persistent multiple islet autoantibodies' : 'Clinical type 1 diabetes after antibody seroconversion',
    horizon: isAutoimmunity ? 'By age 6 years' : '10 years after seroconversion',
    status: estimate.simulation ? 'estimated' : 'not-estimable',
    simulation: estimate.simulation,
    publishedAnchor: estimate.anchor,
    modifiers: estimate.modifiers,
    evidenceIds: [estimate.anchor?.id, ...estimate.modifiers.map((m) => m.id)].filter((id): id is string => Boolean(id)),
    populationMatch: estimate.reason ? [estimate.reason] : [estimate.anchor!.population, estimate.anchor!.sampleSize],
    applicabilityWarnings: warnings,
    comparisons: comparisons(input, estimate),
    synthesisWarning,
    disclaimer: STANDARD_DISCLAIMER,
  };
}
