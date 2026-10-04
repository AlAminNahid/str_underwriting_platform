import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Attempt, Rating } from "@/types/training";

const W = 640;
const X0 = 24;
const X1 = 616;

const MARKER: Record<Rating, string> = {
  best: "fill-success",
  medium: "fill-warning",
  low: "fill-danger",
};

export function BandChart({ attempt }: { attempt: Attempt }) {
  const {
    referenceMid: ref,
    midForecast: mine,
    bestThreshold: best,
    mediumThreshold: medium,
  } = attempt;
  if (ref === null || mine === null) return null;

  const lo = ref * 0.5;
  const hi = ref * 1.5;
  const x = (v: number) =>
    X0 + ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * (X1 - X0);
  const mx = x(mine);
  const anchor = mx < 110 ? "start" : mx > 530 ? "end" : "middle";
  const pinned = mine < lo ? " ←" : mine > hi ? " →" : "";
  const ticks: [number, string][] = [
    [1 - medium, `−${Math.round(medium * 100)}%`],
    [1 - best, `−${Math.round(best * 100)}%`],
    [1 + best, `+${Math.round(best * 100)}%`],
    [1 + medium, `+${Math.round(medium * 100)}%`],
  ];
  const zoneLabel = (v: number, text: string, cls: string) => (
    <text
      x={x(v)}
      y={46}
      textAnchor="middle"
      className={cn("text-[10px] font-semibold tracking-wide", cls)}
    >
      {text}
    </text>
  );

  return (
    <svg
      viewBox={`0 0 ${W} 128`}
      className="h-auto w-full"
      role="img"
      aria-label={`Your forecast ${formatCurrency(mine)} compared with the analyst's ${formatCurrency(ref)}`}
      data-testid="band-chart"
    >
      <text
        x={x(ref)}
        y={14}
        textAnchor="middle"
        className="fill-foreground/80 text-xs font-medium"
      >
        Analyst {formatCurrency(ref)}
      </text>
      <rect
        x={X0}
        y={26}
        width={X1 - X0}
        height={32}
        rx={4}
        className="fill-danger-soft"
      />
      <rect
        x={x(ref * (1 - medium))}
        y={26}
        width={x(ref * (1 + medium)) - x(ref * (1 - medium))}
        height={32}
        className="fill-warning-soft"
      />
      <rect
        x={x(ref * (1 - best))}
        y={26}
        width={x(ref * (1 + best)) - x(ref * (1 - best))}
        height={32}
        className="fill-success-soft"
      />
      {zoneLabel(ref * 0.62, "LOW", "fill-danger")}
      {zoneLabel(ref * 1.38, "LOW", "fill-danger")}
      {zoneLabel(ref * (1 - (best + medium) / 2), "MED", "fill-warning")}
      {zoneLabel(ref * (1 + (best + medium) / 2), "MED", "fill-warning")}
      <line
        x1={x(ref)}
        x2={x(ref)}
        y1={20}
        y2={64}
        className="stroke-foreground"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      {ticks.map(([f, label]) => (
        <g key={label}>
          <line
            x1={x(ref * f)}
            x2={x(ref * f)}
            y1={58}
            y2={64}
            className="stroke-border"
          />
          <text
            x={x(ref * f)}
            y={78}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px]"
          >
            {label}
          </text>
        </g>
      ))}
      <circle
        cx={mx}
        cy={42}
        r={8}
        className={cn(MARKER[attempt.score.rating], "stroke-card")}
        strokeWidth={3}
      />
      <line
        x1={mx}
        x2={mx}
        y1={52}
        y2={98}
        className="stroke-foreground"
        strokeWidth={1}
      />
      <text
        x={mx}
        y={116}
        textAnchor={anchor}
        className="fill-foreground text-[12.5px] font-semibold"
      >
        Your forecast {formatCurrency(mine)}
        {pinned}
      </text>
    </svg>
  );
}
