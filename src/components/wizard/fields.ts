import type { AutoantibodyStatus, FamilyHistory, GeneticScore, HlaGenotype, SeroconversionAge, Sex } from '@/types';

export const HLA_OPTIONS: Array<{ value: HlaGenotype; label: string }> = [
  { value: 'unknown', label: "Not available / I don't know" },
  { value: 'dr3-dr4-dq8', label: 'HLA DR3/DR4-DQ8' },
  { value: 'dr4-dq8-homozygous', label: 'HLA DR4-DQ8/DR4-DQ8' },
  { value: 'other', label: 'Another HLA genotype' },
];

export const GRS_OPTIONS: Array<{ value: GeneticScore; label: string }> = [
  { value: 'unknown', label: 'Not calculated with the published 41-variant score' },
  { value: 'teddy-high', label: 'TEDDY merged GRS >14.4' },
  { value: 'teddy-not-high', label: 'TEDDY merged GRS ≤14.4' },
];

export const FAMILY_OPTIONS: Array<{ value: FamilyHistory; label: string }> = [
  { value: 'unknown', label: "Not available / I don't know" },
  { value: 'none', label: 'No first-degree relative with T1D' },
  { value: 'first-degree', label: 'At least one parent or sibling with T1D' },
];

export const ANTIBODY_OPTIONS: Array<{ value: AutoantibodyStatus; label: string }> = [
  { value: 'unknown', label: 'Not tested / status unknown' },
  { value: 'negative', label: 'Confirmed negative' },
  { value: 'single', label: 'One persistent confirmed autoantibody' },
  { value: 'multiple', label: 'Two or more persistent confirmed autoantibodies' },
];

export const SEROCONVERSION_OPTIONS: Array<{ value: SeroconversionAge; label: string }> = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'under-3', label: 'Before age 3 years' },
  { value: '3-or-older', label: 'Age 3 years or older' },
];

export const SEX_OPTIONS: Array<{ value: Sex; label: string }> = [
  { value: 'unknown', label: 'Unknown / not recorded' },
  { value: 'female', label: 'Female (study category)' },
  { value: 'male', label: 'Male (study category)' },
];
