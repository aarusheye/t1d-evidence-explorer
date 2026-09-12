import type { ScenarioInput } from '@/types';

export interface ExampleProfile { id: string; name: string; description: string; input: ScenarioInput }

export const DEFAULT_INPUT: ScenarioInput = {
  question: 'autoimmunity', hla: 'unknown', geneticScore: 'unknown', familyHistory: 'unknown',
  autoantibodies: 'unknown', seroconversionAge: 'unknown', sex: 'unknown',
};

export const EXAMPLE_PROFILES: ExampleProfile[] = [
  {
    id: 'teddy-upper-grs', name: 'TEDDY-matched Stage 1',
    description: 'High-risk HLA, no family history, antibody-negative, merged GRS >14.4.',
    input: { question: 'autoimmunity', hla: 'dr3-dr4-dq8', geneticScore: 'teddy-high', familyHistory: 'none', autoantibodies: 'negative', seroconversionAge: 'unknown', sex: 'male' },
  },
  {
    id: 'multiple-ab', name: 'Multiple-antibody Stage 2',
    description: 'Multiple antibodies, DR3/DR4-DQ8, seroconversion before age 3, female.',
    input: { question: 'progression', hla: 'dr3-dr4-dq8', geneticScore: 'unknown', familyHistory: 'unknown', autoantibodies: 'multiple', seroconversionAge: 'under-3', sex: 'female' },
  },
  {
    id: 'single-ab', name: 'Single-antibody Stage 2',
    description: 'Published 10-year single-autoantibody cohort anchor.',
    input: { question: 'progression', hla: 'unknown', geneticScore: 'unknown', familyHistory: 'first-degree', autoantibodies: 'single', seroconversionAge: '3-or-older', sex: 'male' },
  },
];
