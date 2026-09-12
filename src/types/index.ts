/** Domain contract for the evidence explorer. No individual prediction is produced. */
export type ResearchQuestion = 'autoimmunity' | 'progression';

export type HlaGenotype =
  | 'dr3-dr4-dq8'
  | 'dr4-dq8-homozygous'
  | 'other'
  | 'unknown';

export type GeneticScore = 'teddy-high' | 'teddy-not-high' | 'unknown';
export type FamilyHistory = 'none' | 'first-degree' | 'unknown';
export type AutoantibodyStatus = 'negative' | 'single' | 'multiple' | 'unknown';
export type SeroconversionAge = 'under-3' | '3-or-older' | 'unknown';
export type Sex = 'female' | 'male' | 'unknown';

export interface ScenarioInput {
  question: ResearchQuestion;
  hla: HlaGenotype;
  geneticScore: GeneticScore;
  familyHistory: FamilyHistory;
  autoantibodies: AutoantibodyStatus;
  seroconversionAge: SeroconversionAge;
  sex: Sex;
}

export interface Citation {
  title: string;
  authors: string;
  year: number;
  journal: string;
  doi: string;
  url: string;
}

export interface EvidenceEstimate {
  id: string;
  stage: ResearchQuestion;
  label: string;
  estimateType: 'absolute-risk' | 'hazard-ratio';
  point: number;
  lower95: number;
  upper95: number;
  contrast: string;
  horizon: string;
  population: string;
  sampleSize: string;
  applicabilityWarning: string;
  citation: Citation;
}

export interface SimulationSummary {
  point: number;
  interval95: [number, number];
  draws: number;
  seed: number;
}

export interface InformationComparison {
  field: 'hla' | 'geneticScore' | 'familyHistory' | 'autoantibodies';
  label: string;
  status: 'estimated' | 'not-estimable' | 'unchanged';
  estimate: number | null;
  interval95: [number, number] | null;
  change: number | null;
  note: string;
}

export interface ScenarioResult {
  question: ResearchQuestion;
  title: string;
  outcome: string;
  horizon: string;
  status: 'estimated' | 'not-estimable';
  simulation: SimulationSummary | null;
  publishedAnchor: EvidenceEstimate | null;
  modifiers: EvidenceEstimate[];
  evidenceIds: string[];
  populationMatch: string[];
  applicabilityWarnings: string[];
  comparisons: InformationComparison[];
  synthesisWarning: string | null;
  disclaimer: string;
}
