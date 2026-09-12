import { Card, Field, Select } from '@/components/ui/primitives';
import type { ScenarioInput } from '@/types';
import { ANTIBODY_OPTIONS, FAMILY_OPTIONS, GRS_OPTIONS, HLA_OPTIONS, SEROCONVERSION_OPTIONS, SEX_OPTIONS } from './fields';

interface StepProps { input: ScenarioInput; setInput: (patch: Partial<ScenarioInput>) => void }

export function QuestionStep({ input, setInput }: StepProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <button type="button" onClick={() => setInput({ question: 'autoimmunity' })} className={`rounded-2xl border p-5 text-left ${input.question === 'autoimmunity' ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
        <strong className="text-slate-900 dark:text-slate-100">Stage 1 · Autoimmunity</strong>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Development of persistent multiple islet autoantibodies in an antibody-negative child.</p>
        <p className="mt-3 text-xs font-medium text-brand-700 dark:text-brand-200">Horizon: by age 6</p>
      </button>
      <button type="button" onClick={() => setInput({ question: 'progression' })} className={`rounded-2xl border p-5 text-left ${input.question === 'progression' ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
        <strong className="text-slate-900 dark:text-slate-100">Stage 2 · Progression</strong>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Progression from persistent islet autoantibodies to clinical type 1 diabetes.</p>
        <p className="mt-3 text-xs font-medium text-brand-700 dark:text-brand-200">Horizon: 10 years after seroconversion</p>
      </button>
    </div>
  );
}

export function EvidenceMatchStep({ input, setInput }: StepProps) {
  return (
    <div className="space-y-5">
      <Field label="Islet autoantibody status" htmlFor="autoantibodies" hint="The source studies required persistent, laboratory-confirmed results. A one-time result may not match.">
        <Select id="autoantibodies" value={input.autoantibodies} onChange={(e) => setInput({ autoantibodies: e.target.value as ScenarioInput['autoantibodies'] })}>
          {ANTIBODY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </Field>
      <Field label="HLA genotype" htmlFor="hla" hint="Exact genotype categories are used; broad 'high-risk' labels are not treated as equivalent.">
        <Select id="hla" value={input.hla} onChange={(e) => setInput({ hla: e.target.value as ScenarioInput['hla'] })}>
          {HLA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </Field>
      <Field label="First-degree family history" htmlFor="family" hint="TEDDY's Stage 1 estimate used children without an affected parent or sibling.">
        <Select id="family" value={input.familyHistory} onChange={(e) => setInput({ familyHistory: e.target.value as ScenarioInput['familyHistory'] })}>
          {FAMILY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </Field>
    </div>
  );
}

export function DetailStep({ input, setInput }: StepProps) {
  if (input.question === 'autoimmunity') {
    return (
      <div className="space-y-5">
        <Field label="TEDDY merged 41-variant genetic risk score" htmlFor="grs" hint="Do not substitute six SNPs, a polygenic score from another publication, or a consumer DNA report.">
          <Select id="grs" value={input.geneticScore} onChange={(e) => setInput({ geneticScore: e.target.value as ScenarioInput['geneticScore'] })}>
            {GRS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Card className="bg-slate-50 p-4 dark:bg-slate-800/60">
          <p className="text-sm text-slate-700 dark:text-slate-300">If the SNP score is unavailable, the explorer falls back to TEDDY's HLA-only cohort estimate. It never invents missing alleles.</p>
        </Card>
      </div>
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Age at first confirmed seroconversion" htmlFor="seroconversion" hint="This is not current age.">
        <Select id="seroconversion" value={input.seroconversionAge} onChange={(e) => setInput({ seroconversionAge: e.target.value as ScenarioInput['seroconversionAge'] })}>
          {SEROCONVERSION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </Field>
      <Field label="Sex variable recorded by the cohort" htmlFor="sex">
        <Select id="sex" value={input.sex} onChange={(e) => setInput({ sex: e.target.value as ScenarioInput['sex'] })}>
          {SEX_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </Field>
      <Card className="sm:col-span-2 bg-slate-50 p-4 dark:bg-slate-800/60">
        <p className="text-sm text-slate-700 dark:text-slate-300"><strong>SNP handling:</strong> TrialNet reported a 30-SNP GRS association, but this explorer does not mix it numerically with a different cohort's absolute-risk anchor. The evidence and resulting gap remain visible on the results page.</p>
      </Card>
    </div>
  );
}
