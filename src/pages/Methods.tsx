import { Card } from '@/components/ui/primitives';
import { EVIDENCE_REGISTRY } from '@/model/evidence';
import { formatPercent } from '@/lib/utils';

export function Methods() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Methods, evidence &amp; limitations</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">This project is an evidence explorer, not a trained prediction model. It deliberately separates two biological transitions.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card><p className="text-xs font-bold uppercase text-brand-700 dark:text-brand-200">Stage 1</p><h2 className="mt-1 font-semibold text-slate-900 dark:text-slate-100">Development of islet autoimmunity</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Outcome: persistent multiple autoantibodies by age 6. Source: prospective TEDDY children followed from birth, restricted to two HLA genotypes and no first-degree family history.</p></Card>
        <Card><p className="text-xs font-bold uppercase text-brand-700 dark:text-brand-200">Stage 2</p><h2 className="mt-1 font-semibold text-slate-900 dark:text-slate-100">Progression to clinical T1D</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Outcome: clinical T1D within 10 years after confirmed antibody seroconversion. Source: pooled prospective pediatric cohorts in Colorado, Finland, and Germany.</p></Card>
      </div>
      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Uncertainty propagation</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">The engine runs 10,000 deterministic Monte Carlo draws. Reported absolute-risk confidence intervals are represented on the logit scale; reported hazard-ratio intervals are represented on the log scale. When compatible modifiers are present, it uses the explicit proportional-hazards approximation:</p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">scenario risk = 1 − (1 − sampled anchor risk) ^ product(sampled hazard ratios)</pre>
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">The displayed interval is the 2.5th–97.5th percentile of those draws. It is an uncertainty interval for this synthesis, not an individual prediction interval. The UI flags combinations that the study authors did not publish or validate.</p>
      </Card>
      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Complete evidence registry</h2>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b"><th className="p-2">ID</th><th className="p-2">Stage</th><th className="p-2">Estimate (95% CI)</th><th className="p-2">Population / citation</th></tr></thead><tbody>{EVIDENCE_REGISTRY.map((item) => <tr key={item.id} className="border-b border-slate-100 align-top dark:border-slate-800"><td className="p-2 font-mono text-xs">{item.id}</td><td className="p-2">{item.stage}</td><td className="p-2">{item.estimateType === 'absolute-risk' ? `${formatPercent(item.point)} (${formatPercent(item.lower95)}–${formatPercent(item.upper95)})` : `${item.point.toFixed(2)} (${item.lower95.toFixed(2)}–${item.upper95.toFixed(2)})`}</td><td className="p-2"><p>{item.population}</p><a href={item.citation.url} target="_blank" rel="noreferrer" className="text-brand-700 underline dark:text-brand-200">{item.citation.authors}, {item.citation.year}</a></td></tr>)}</tbody></table></div>
      </Card>
      <Card className="mt-6 border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/40">
        <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-200">Model card summary</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-amber-900 dark:text-amber-200">
          <li><strong>Intended use:</strong> education, reproducible literature exploration, and portfolio demonstration.</li>
          <li><strong>Prohibited use:</strong> diagnosis, screening decisions, treatment, triage, or representing the output as a person's predicted probability.</li>
          <li><strong>Validation status:</strong> not validated on individual-level data; no discrimination, calibration, subgroup fairness, or clinical-utility claim is made.</li>
          <li><strong>Missing data:</strong> never mean-imputed. The app falls back to a broader published stratum, omits an incompatible modifier with disclosure, or returns “not estimable.”</li>
          <li><strong>Ancestry:</strong> genetic scores were developed mainly in European-ancestry data. TEDDY's US and European sites do not establish validity for every ancestry or geography.</li>
          <li><strong>Reproducibility:</strong> evidence values live in versioned JSON; deterministic simulations, registry validation, scenario tests, and browser-flow tests run in CI.</li>
        </ul>
      </Card>
    </div>
  );
}
