/**
 * Persistent, always-visible disclaimer. Intentionally NOT dismissible —
 * for a health-risk tool the not-a-medical-device notice should remain in view.
 */
export function DisclaimerBanner() {
  return (
    <div
      role="alert"
      className="no-print border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200"
    >
      ⚠️ Evidence scenarios, not personal predictions — <strong>not a medical device</strong>, not
      validated on individual-level data, and not a diagnosis.
    </div>
  );
}
