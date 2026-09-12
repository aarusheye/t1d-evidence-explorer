import { Wizard } from '@/components/wizard/Wizard';

export function Predictor() {
  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 pt-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Evidence scenario builder</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Choose the biological question, then test whether the profile matches a prospective evidence population. Everything stays on your device.
        </p>
      </div>
      <Wizard />
    </div>
  );
}
