import { Link } from 'react-router-dom';
import { buttonClassName, Card } from '@/components/ui/primitives';

const FEATURES = [
  {
    title: 'Two biological stages',
    body: 'Separates development of islet autoimmunity from progression after autoantibody seroconversion.',
  },
  {
    title: 'Traceable evidence',
    body: 'Every number carries its cohort, confidence range, citation, horizon, and applicability warning.',
  },
  {
    title: 'Private by design',
    body: 'All computation runs in your browser. No data is sent anywhere.',
  },
];

export function Landing() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-100">
          Reproducible evidence synthesis · educational prototype
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
          T1D Evidence Explorer
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Explore prospective TEDDY and TrialNet-era evidence across two distinct disease stages,
          with uncertainty propagation and explicit population limits.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/predict" className={buttonClassName()}>
            Build a risk scenario →
          </Link>
          <Link to="/methods" className={buttonClassName('secondary')}>
            How it works
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <Card key={f.title}>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{f.body}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-8 border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/40">
        <h3 className="font-semibold text-amber-900 dark:text-amber-200">Important</h3>
        <p className="mt-2 text-sm text-amber-900 dark:text-amber-200">
          Outputs are <strong>evidence-based risk scenarios</strong>, not personal predictions. The
          app has not been validated on individual-level data, is not a medical device, and must not
          be used to make medical decisions. See{' '}
          <Link to="/methods" className="underline">
            Methods &amp; Limitations
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
