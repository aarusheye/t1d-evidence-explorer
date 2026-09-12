import type { SimulationSummary } from '@/types';
import { formatPercent } from '@/lib/utils';

const SIZE = 280;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 110;

function scale(p: number): number { return Math.sqrt(Math.min(1, Math.max(0, p))); }
function pointOnArc(value: number, radius = R) {
  const angle = Math.PI * (1 - value);
  return { x: CX + radius * Math.cos(angle), y: CY - radius * Math.sin(angle) };
}
function arcPath(from: number, to: number) {
  const start = pointOnArc(from);
  const end = pointOnArc(to);
  return `M ${start.x} ${start.y} A ${R} ${R} 0 ${Math.abs(to - from) > 0.5 ? 1 : 0} 1 ${end.x} ${end.y}`;
}

export function RiskGauge({ simulation }: { simulation: SimulationSummary }) {
  const [low, high] = simulation.interval95;
  const needle = pointOnArc(scale(simulation.point), R - 6);
  return (
    <figure className="flex flex-col items-center">
      <svg width={SIZE} height={CY + 24} viewBox={`0 0 ${SIZE} ${CY + 24}`} role="img" aria-label={`Evidence-based scenario ${formatPercent(simulation.point)}; simulation interval ${formatPercent(low)} to ${formatPercent(high)}.`}>
        <path d={arcPath(0, 1)} fill="none" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth={16} strokeLinecap="round" />
        <path d={arcPath(scale(low), scale(high))} fill="none" stroke="#0072B2" strokeOpacity={0.35} strokeWidth={16} strokeLinecap="round" />
        <line x1={CX} y1={CY} x2={needle.x} y2={needle.y} stroke="#0072B2" strokeWidth={4} strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={7} fill="#0072B2" />
        <text x={CX - R} y={CY + 18} textAnchor="middle" className="fill-slate-400 text-[10px]">0%</text>
        <text x={CX + R} y={CY + 18} textAnchor="middle" className="fill-slate-400 text-[10px]">100%</text>
      </svg>
      <figcaption className="text-center">
        <div className="text-4xl font-extrabold tabular-nums text-[#0072B2]">{formatPercent(simulation.point)}</div>
        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Monte Carlo interval {formatPercent(low)}–{formatPercent(high)}</div>
        <div className="mt-1 text-xs text-slate-400">{simulation.draws.toLocaleString()} deterministic draws · seed {simulation.seed}</div>
      </figcaption>
    </figure>
  );
}
