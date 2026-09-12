import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button, Card } from './ui/primitives';

/**
 * Mandatory consent gate. Blocks access to inputs/results until the user
 * explicitly acknowledges that this is not medical advice.
 */
export function ConsentGate({ children }: { children: React.ReactNode }) {
  const consented = useAppStore((s) => s.consented);
  const giveConsent = useAppStore((s) => s.giveConsent);
  const [checked, setChecked] = useState(false);

  if (consented) return <>{children}</>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Before you continue</h1>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            <strong>T1D Evidence Explorer</strong> is an educational prototype that maps a scenario
            to published prospective cohort estimates. It does not calculate a validated personal probability.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>It is <strong>not</strong> a medical device and is <strong>not</strong> FDA/CE cleared.</li>
            <li>It is <strong>not validated on individual-level data</strong> and does not diagnose Type 1 Diabetes.</li>
            <li>
              All computation runs locally in your browser. <strong>Your data never leaves your
              device.</strong>
            </li>
            <li>Results must never be used to make medical decisions.</li>
          </ul>
        </div>

        <label className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 rounded border-slate-400 accent-brand-600 dark:border-slate-600"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>
            I understand this tool is for education only, is not medical advice, and is not a
            diagnosis.
          </span>
        </label>

        <div className="mt-6">
          <Button disabled={!checked} onClick={giveConsent}>
            I understand — continue
          </Button>
        </div>
      </Card>
    </div>
  );
}
