import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

/** Initial theme: respect the OS preference on first visit. */
function systemPreference(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

interface ThemeState {
  theme: Theme;
  /** True until the user explicitly picks a theme; lets us keep following the OS. */
  userOverride: boolean;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: systemPreference(),
      userOverride: false,
      toggle: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark', userOverride: true }),
      setTheme: (theme) => set({ theme, userOverride: true }),
    }),
    { name: 't1d-theme' },
  ),
);

/** Applies the current theme to <html> and follows the OS until the user overrides. */
export function useApplyTheme(): void {
  const theme = useTheme((s) => s.theme);
  const userOverride = useTheme((s) => s.userOverride);

  // Reflect the chosen theme onto the document root.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Force a light page for printing / PDF export, then restore the theme.
  useEffect(() => {
    const root = document.documentElement;
    const onBeforePrint = () => root.classList.remove('dark');
    const onAfterPrint = () => root.classList.toggle('dark', useTheme.getState().theme === 'dark');
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, []);

  // Keep following OS changes until the user has explicitly chosen.
  useEffect(() => {
    if (userOverride || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      if (!useTheme.getState().userOverride) {
        useTheme.setState({ theme: e.matches ? 'dark' : 'light' });
      }
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [userOverride]);
}
