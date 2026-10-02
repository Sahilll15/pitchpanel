import type { CSSProperties, ReactNode } from 'react';
import { VERDICT_LABEL, type Verdict } from './lib/panel';

export function toneFor(value: number) {
  if (value >= 60) return 'var(--color-teal)';
  if (value >= 40) return 'var(--color-amber)';
  return 'var(--color-brand)';
}

export function Ring({
  value,
  size = 36,
  stroke = 4,
  max = 100,
  color,
  label,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  max?: number;
  color?: string;
  label?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const full = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  const offset = full * (1 - pct);
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label ?? `${Math.round(value)} of ${max}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          className="ring-arc"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color ?? toneFor((value / max) * 100)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={full}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ '--ring-full': full } as CSSProperties}
        />
      </svg>
      {children && <span className="absolute inset-0 grid place-items-center">{children}</span>}
    </span>
  );
}

const VERDICT_STYLE: Record<Verdict, string> = {
  in: 'bg-teal-soft text-teal-deep',
  maybe: 'bg-amber-soft text-amber-deep',
  pass: 'bg-brand-soft text-brand-deep',
};

export function VerdictChip({ verdict, className = '' }: { verdict: Verdict; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${VERDICT_STYLE[verdict]} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {VERDICT_LABEL[verdict]}
    </span>
  );
}

export function Delta({ value, unit = '' }: { value: number; unit?: string }) {
  if (value === 0) return <span className="font-mono text-ink-faint">0{unit}</span>;
  const up = value > 0;
  return (
    <span className={`font-mono ${up ? 'text-up' : 'text-down'}`}>
      {up ? '+' : '-'}
      {Math.abs(value)}
      {unit}
    </span>
  );
}

const PATHS: Record<string, ReactNode> = {
  plus: <path d="M12 5v14M5 12h14" />,
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  layers: <path d="M12 4 3 9l9 5 9-5-9-5Zm-9 10 9 5 9-5" />,
  help: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.4M12 16.8v.1" />
    </>
  ),
  trash: <path d="M5 7h14M10 7V5h4v2m-7 0 1 12h8l1-12" />,
  edit: <path d="M5 19h4L19 9l-4-4L5 15v4Zm8-12 4 4" />,
  alert: <path d="M12 4 3 19h18L12 4Zm0 6v4m0 2.5v.1" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  x: <path d="M7 7l10 10M17 7 7 17" />,
  flag: <path d="M6 20V5m0 0h10l-2 4 2 4H6" />,
  chev: <path d="m9 6 6 6-6 6" />,
  sparkle: <path d="M12 4v4m0 8v4M4 12h4m8 0h4M7 7l2 2m6 6 2 2m0-10-2 2m-6 6-2 2" />,
};

export function Icon({ name, size = 18, className = '' }: { name: keyof typeof PATHS; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="15" fill="var(--color-brand)" />
      <circle cx="32" cy="32" r="17" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="6" />
      <path d="M32 15 A17 17 0 1 1 15.8 37.2" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      <circle cx="32" cy="32" r="5" fill="#fff" />
    </svg>
  );
}
