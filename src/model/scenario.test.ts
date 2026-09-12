import { describe, expect, it } from 'vitest';
import { DEFAULT_INPUT, EXAMPLE_PROFILES } from '@/data/examples';
import parityScenarios from '@/data/parity-scenarios.json';
import type { ScenarioInput } from '@/types';
import { EVIDENCE_REGISTRY, validateEvidenceRegistry } from './evidence';
import { buildScenario, simulate } from './scenario';

describe('evidence registry', () => {
  it('has complete, internally valid traceability metadata', () => {
    expect(validateEvidenceRegistry()).toEqual([]);
    expect(EVIDENCE_REGISTRY.length).toBeGreaterThanOrEqual(8);
    EVIDENCE_REGISTRY.forEach((item) => {
      expect(item.population.length).toBeGreaterThan(20);
      expect(item.applicabilityWarning.length).toBeGreaterThan(20);
      expect(item.citation.url).toMatch(/^https:\/\//);
    });
  });
});

describe('Stage 1: development of autoimmunity', () => {
  const input = EXAMPLE_PROFILES[0]!.input;

  it('reproduces the published TEDDY upper-GRS point estimate', () => {
    const result = buildScenario(input);
    expect(result.status).toBe('estimated');
    expect(result.simulation?.point).toBeCloseTo(0.11, 10);
    expect(result.horizon).toBe('By age 6 years');
    expect(result.publishedAnchor?.citation.doi).toBe('10.1371/journal.pmed.1002548');
  });

  it('falls back to the broader HLA-only estimate when SNP/GRS is unknown', () => {
    const result = buildScenario({ ...input, geneticScore: 'unknown' });
    expect(result.simulation?.point).toBeCloseTo(0.058, 10);
  });

  it('refuses to extrapolate beyond the published HLA/family/antibody population', () => {
    expect(buildScenario({ ...input, hla: 'other' }).status).toBe('not-estimable');
    expect(buildScenario({ ...input, familyHistory: 'first-degree' }).status).toBe('not-estimable');
    expect(buildScenario({ ...input, autoantibodies: 'unknown' }).status).toBe('not-estimable');
  });
});

describe('Stage 2: progression to clinical T1D', () => {
  const multiple = EXAMPLE_PROFILES[1]!.input;
  const single = EXAMPLE_PROFILES[2]!.input;

  it('reproduces the published 10-year anchors when no modifier applies', () => {
    expect(buildScenario(single).simulation?.point).toBeCloseTo(0.145, 10);
    const unmodified = buildScenario({ ...multiple, hla: 'other', seroconversionAge: '3-or-older', sex: 'male' });
    expect(unmodified.simulation?.point).toBeCloseTo(0.697, 10);
  });

  it('uses only published multiple-autoantibody modifiers and flags the synthesis', () => {
    const result = buildScenario(multiple);
    expect(result.modifiers.map((item) => item.id)).toEqual([
      'pooled-hla-dr3-dr4-hr', 'pooled-young-seroconversion-hr', 'pooled-female-hr',
    ]);
    expect(result.simulation!.point).toBeGreaterThan(0.697);
    expect(result.synthesisWarning).toContain('not publish');
  });

  it('requires antibody information', () => {
    expect(buildScenario({ ...multiple, autoantibodies: 'unknown' }).status).toBe('not-estimable');
  });
});

describe('simulation and missing-information analysis', () => {
  it('is deterministic, bounded, and contains the point estimate', () => {
    const anchor = EVIDENCE_REGISTRY.find((item) => item.id === 'pooled-multiple-ab-10y')!;
    const first = simulate(anchor, []);
    const second = simulate(anchor, []);
    expect(first).toEqual(second);
    expect(first.interval95[0]).toBeLessThan(first.point);
    expect(first.interval95[1]).toBeGreaterThan(first.point);
    expect(first.interval95[0]).toBeGreaterThanOrEqual(0);
    expect(first.interval95[1]).toBeLessThanOrEqual(1);
  });

  it('reports all four requested missing-information comparisons', () => {
    const result = buildScenario(EXAMPLE_PROFILES[1]!.input);
    expect(result.comparisons.map((row) => row.field)).toEqual(['hla', 'geneticScore', 'familyHistory', 'autoantibodies']);
    expect(result.comparisons.find((row) => row.field === 'autoantibodies')?.status).toBe('not-estimable');
  });

  it('never estimates the all-unknown default scenario', () => {
    expect(buildScenario(DEFAULT_INPUT).simulation).toBeNull();
  });
});

describe('Python/web parity contract', () => {
  it.each(parityScenarios)('$id matches the shared expected result', ({ input, expected }) => {
    const result = buildScenario(input as ScenarioInput);
    expect(result.status).toBe(expected.status);
    expect(result.evidenceIds).toEqual(expected.evidenceIds);
    if (expected.point === null) {
      expect(result.simulation).toBeNull();
    } else {
      expect(result.simulation?.point).toBeCloseTo(expected.point, 12);
      const [expectedLow, expectedHigh] = expected.interval95!;
      expect(result.simulation?.interval95[0]).toBeCloseTo(expectedLow!, 12);
      expect(result.simulation?.interval95[1]).toBeCloseTo(expectedHigh!, 12);
    }
  });
});
