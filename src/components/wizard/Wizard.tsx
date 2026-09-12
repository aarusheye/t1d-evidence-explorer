import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Button, Card } from '@/components/ui/primitives';
import { EXAMPLE_PROFILES } from '@/data/examples';
import { DetailStep, EvidenceMatchStep, QuestionStep } from './steps';

const STEPS = [
  { key: 'question', title: 'Question', Component: QuestionStep },
  { key: 'match', title: 'Evidence match', Component: EvidenceMatchStep },
  { key: 'details', title: 'Study details', Component: DetailStep },
] as const;

export function Wizard() {
  const navigate = useNavigate();
  const input = useAppStore((s) => s.input);
  const setInput = useAppStore((s) => s.setInput);
  const loadProfile = useAppStore((s) => s.loadProfile);
  const compute = useAppStore((s) => s.compute);
  const [step, setStep] = useState(0);

  const isLast = step === STEPS.length - 1;
  const Current = STEPS[step]!.Component;
  const progress = ((step + 1) / STEPS.length) * 100;

  const finish = () => {
    compute();
    navigate('/results');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Example profiles */}
      <div className="no-print mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Load an example profile
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROFILES.map((p) => (
            <button
              key={p.id}
              title={p.description}
              onClick={() => {
                loadProfile(p.input);
                setStep(0);
              }}
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-brand-500 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-400 dark:hover:text-brand-200"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Step {step + 1} of {STEPS.length}: {STEPS[step]!.title}
            </span>
            <span className="text-slate-500 dark:text-slate-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          {/* Step dots */}
          <nav aria-label="Wizard steps" className="mt-4 flex gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setStep(i)}
                aria-current={i === step ? 'step' : undefined}
                className={
                  'flex-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ' +
                  (i === step
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100'
                    : i < step
                      ? 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                      : 'text-slate-400 hover:bg-slate-50 dark:text-slate-500 dark:hover:bg-slate-800')
                }
              >
                {s.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Step body */}
        <div className="min-h-[220px]">
          <Current input={input} setInput={setInput} />
        </div>

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            ← Back
          </Button>
          {isLast ? (
            <Button onClick={finish}>Build evidence scenario →</Button>
          ) : (
            <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>Next →</Button>
          )}
        </div>
      </Card>

      <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
        Unknown information is never replaced with a healthy or average value. The result shows
        whether a published estimate still applies, changes, or becomes unavailable.
      </p>
    </div>
  );
}
