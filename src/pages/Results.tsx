import { Link, Navigate } from 'react-router-dom';
import { Badge, Button, buttonClassName, Card } from '@/components/ui/primitives';
import { RiskGauge } from '@/components/RiskGauge';
import { useAppStore } from '@/store/useAppStore';
import { formatPercent } from '@/lib/utils';
import type { EvidenceEstimate } from '@/types';

function EvidenceCard({ evidence }: { evidence: EvidenceEstimate }) {
  const value = evidence.estimateType === 'absolute-risk'
    ? `${formatPercent(evidence.point)} (${formatPercent(evidence.lower95)}–${formatPercent(evidence.upper95)})`
    : `${evidence.point.toFixed(2)} (${evidence.lower95.toFixed(2)}–${evidence.upper95.toFixed(2)})`;
  return (
    <article className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{evidence.label}</h3>
        <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{evidence.estimateType}</Badge>
      </div>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-xs font-semibold uppercase text-slate-500">Estimate (95% CI)</dt><dd className="mt-1 text-slate-800 dark:text-slate-200">{value}</dd></div>
        <div><dt className="text-xs font-semibold uppercase text-slate-500">Contrast / horizon</dt><dd className="mt-1 text-slate-800 dark:text-slate-200">{evidence.contrast} · {evidence.horizon}</dd></div>
        <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase text-slate-500">Population</dt><dd className="mt-1 text-slate-800 dark:text-slate-200">{evidence.population} ({evidence.sampleSize})</dd></div>
        <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-300">Applicability warning</dt><dd className="mt-1 text-amber-900 dark:text-amber-200">{evidence.applicabilityWarning}</dd></div>
      </dl>
      <a className="mt-3 inline-block text-sm font-medium text-brand-700 underline dark:text-brand-200" href={evidence.citation.url} target="_blank" rel="noreferrer">
        {evidence.citation.authors} ({evidence.citation.year}), {evidence.citation.journal} · DOI {evidence.citation.doi}
      </a>
    </article>
  );
}

export function Results() {
  const result = useAppStore((state) => state.result);
  if (!result) return <Navigate to="/predict" replace />;
  const evidence = result.publishedAnchor ? [result.publishedAnchor, ...result.modifiers] : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-200">Evidence-based risk scenario</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{result.title}</h1>
        </div>
        <div className="flex gap-2"><Link to="/predict" className={buttonClassName('secondary')}>Edit inputs</Link><Button onClick={() => window.print()}>Export PDF</Button></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex min-h-80 flex-col items-center justify-center">
          {result.simulation ? <RiskGauge simulation={result.simulation} /> : (
            <div className="text-center"><Badge className="bg-amber-100 text-amber-900">Not estimable</Badge><p className="mt-4 max-w-sm text-sm text-slate-700 dark:text-slate-300">The inputs do not match a population and endpoint for which this registry has a prospective estimate.</p></div>
          )}
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Endpoint and population match</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div><dt className="font-semibold text-slate-500">Outcome</dt><dd className="text-slate-800 dark:text-slate-200">{result.outcome}</dd></div>
            <div><dt className="font-semibold text-slate-500">Fixed horizon</dt><dd className="text-slate-800 dark:text-slate-200">{result.horizon}</dd></div>
            <div><dt className="font-semibold text-slate-500">Match assessment</dt><dd><ul className="mt-1 list-disc space-y-1 pl-5 text-slate-800 dark:text-slate-200">{result.populationMatch.map((item) => <li key={item}>{item}</li>)}</ul></dd></div>
          </dl>
          {result.synthesisWarning && <p className="mt-4 rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-blue-900 dark:bg-blue-950/40 dark:text-blue-200">{result.synthesisWarning}</p>}
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">What changes when information is unavailable?</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Leave-one-information-out comparisons expose dependency on HLA, SNP/GRS, family history, and antibody status. “Unchanged” does not mean the field is biologically irrelevant.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead><tr className="border-b border-slate-200 dark:border-slate-700"><th className="p-3">Scenario</th><th className="p-3">Result</th><th className="p-3">Change</th><th className="p-3">Interpretation</th></tr></thead>
            <tbody>{result.comparisons.map((row) => (
              <tr key={row.field} className="border-b border-slate-100 align-top dark:border-slate-800">
                <th className="p-3 font-medium">{row.label}</th>
                <td className="p-3">{row.estimate === null ? 'Not estimable' : formatPercent(row.estimate)}</td>
                <td className="p-3">{row.change === null ? '—' : `${row.change >= 0 ? '+' : ''}${formatPercent(row.change)}`}</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">{row.note}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Evidence ledger for this scenario</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Every numerical input includes its reported confidence range, source population, citation, and applicability warning.</p>
        <div className="mt-4 space-y-4">{evidence.length ? evidence.map((item) => <EvidenceCard key={item.id} evidence={item} />) : <p className="text-sm text-slate-500">No estimate was applied because the evidence population did not match.</p>}</div>
      </Card>

      <Card className="mt-6 border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/40">
        <h2 className="font-semibold text-amber-900 dark:text-amber-200">Transportability and use limitations</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-amber-900 dark:text-amber-200">{result.applicabilityWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
        <p className="mt-4 border-t border-amber-200 pt-4 text-xs font-medium dark:border-amber-700">{result.disclaimer}</p>
      </Card>
    </div>
  );
}
