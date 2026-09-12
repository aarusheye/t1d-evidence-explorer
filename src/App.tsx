import { NavLink, Route, Routes } from 'react-router-dom';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { ConsentGate } from './components/ConsentGate';
import { ThemeToggle } from './components/ThemeToggle';
import { useApplyTheme } from './store/useTheme';
import { Landing } from './pages/Landing';
import { Predictor } from './pages/Predictor';
import { Results } from './pages/Results';
import { Methods } from './pages/Methods';
import { cn } from './lib/utils';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/predict', label: 'Assess' },
  { to: '/results', label: 'Results' },
  { to: '/methods', label: 'Methods' },
];

function Header() {
  return (
    <header className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm text-white">
            T1D
          </span>
          Evidence Explorer
        </NavLink>
        <div className="flex items-center gap-1">
          <nav className="flex gap-1" aria-label="Primary">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="no-print border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-5xl px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        T1D Evidence Explorer · Evidence scenarios, not personal predictions · Not a medical device · All data stays in your
        browser.
      </div>
    </footer>
  );
}

export default function App() {
  useApplyTheme();
  return (
    <div className="flex min-h-full flex-col">
      <DisclaimerBanner />
      <Header />
      <main className="flex-1">
        <ConsentGate>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/predict" element={<Predictor />} />
            <Route path="/results" element={<Results />} />
            <Route path="/methods" element={<Methods />} />
          </Routes>
        </ConsentGate>
      </main>
      <Footer />
    </div>
  );
}
