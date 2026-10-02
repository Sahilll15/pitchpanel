'use client';

import { Fragment, useMemo, useState, type KeyboardEvent } from 'react';
import {
  CRITERIA,
  JUDGES,
  LEVEL_MAX,
  VERDICT_LABEL,
  compare,
  criterion,
  judge,
  normalize,
  summarize,
  type Checks,
  type CriterionId,
  type JudgeId,
  type RawPanel,
  type Summary,
} from './lib/panel';
import { previousOf, versionsOf, type Entry } from './lib/store';
import { Delta, Icon, Ring, VerdictChip, toneFor } from './ui';

const AVATAR: Record<JudgeId, string> = {
  operator: 'bg-lilac-soft text-lilac',
  hawk: 'bg-teal-soft text-teal-deep',
  skeptic: 'bg-brand-soft text-brand-deep',
  nerd: 'bg-amber-soft text-amber-deep',
  numbers: 'bg-ink text-white',
};

export function JudgeAvatar({ id, size = 34 }: { id: JudgeId; size?: number }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-mono text-[11px] font-semibold ${AVATAR[id]}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {judge(id).initials}
    </span>
  );
}

const FULL_DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

const TABS = ['panel', 'heatmap', 'gaps', 'versions', 'pitch'] as const;
type Tab = (typeof TABS)[number];

const CHECK_LABEL: Record<keyof Checks, string> = {
  hasNumbers: 'concrete numbers',
  statesAsk: 'a stated ask',
  namesCompetition: 'named competitors',
  namesCustomer: 'a specific customer',
};

const pct = (v: number) => Math.round(v * 100);

export function Report({
  entry,
  all,
  onOpen,
  onEdit,
  onDelete,
}: {
  entry: Entry;
  all: Entry[];
  onOpen: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [tab, setTab] = useState<Tab>('panel');
  const summary = useMemo(() => summarize(entry.raw), [entry]);
  const prev = previousOf(all, entry);
  const prevSummary = useMemo(() => (prev ? summarize(prev.raw) : null), [prev]);
  const delta = prevSummary ? compare(summary, prevSummary) : null;
  const versions = versionsOf(all, entry.title);

  const missing = (Object.keys(CHECK_LABEL) as (keyof Checks)[]).filter((k) => entry.raw.checks[k] < 0.5);
  const counts = { in: 0, maybe: 0, pass: 0 };
  summary.judges.forEach((j) => counts[j.verdict]++);

  const tabLabel: Record<Tab, string> = {
    panel: 'Panel',
    heatmap: 'Heatmap',
    gaps: `Biggest gaps${summary.gaps.length ? ` (${summary.gaps.length})` : ''}`,
    versions: `Versions (${versions.length})`,
    pitch: 'Pitch text',
  };

  function onTabKey(e: KeyboardEvent) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = TABS.indexOf(tab);
    const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
    setTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  }

  return (
    <article className="rise mx-auto max-w-[1080px]">
      <nav className="text-ink-faint flex items-center gap-1.5 text-[12.5px]" aria-label="Breadcrumb">
        <span>Pitches</span>
        <Icon name="chev" size={12} />
        <span className="max-w-[40vw] truncate">{entry.title}</span>
        <Icon name="chev" size={12} />
        <span className="text-ink-soft">Version {entry.version}</span>
      </nav>

      <header className="mt-3 flex flex-wrap items-center gap-3.5">
        <span className="bg-brand grid size-12 shrink-0 place-items-center rounded-xl text-[20px] font-semibold text-white">
          {entry.title.trim().charAt(0).toUpperCase() || 'P'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-ink-faint text-[12.5px]">
            Pitch report · v{entry.version} · {FULL_DATE.format(entry.createdAt)}
          </p>
          <h1 className="truncate text-[26px] leading-tight font-semibold tracking-tight sm:text-[30px]">{entry.title}</h1>
        </div>
        <div className="flex basis-full gap-2 sm:basis-auto">
          <button
            type="button"
            onClick={onEdit}
            className="bg-ink hover:bg-ink/90 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-white transition"
          >
            <Icon name="edit" size={15} /> Edit as v{versions.at(-1)!.version + 1}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="border-line-strong text-ink-soft hover:text-down hover:border-down/40 grid size-9 place-items-center rounded-lg border transition"
            aria-label={`Delete version ${entry.version}`}
            title="Delete this version"
          >
            <Icon name="trash" size={16} />
          </button>
        </div>
      </header>

      <div className="no-scrollbar -mx-4 mt-5 flex gap-2.5 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 xl:grid-cols-4">
        <Tile label="Panel score" ring={<Ring value={summary.overall} size={40} stroke={4.5} />}>
          <span className="font-mono text-[22px] font-semibold">{summary.overall}</span>
          {delta && (
            <span className="ml-2 text-[12.5px]">
              <Delta value={delta.overall} /> <span className="text-ink-faint">vs v{prev!.version}</span>
            </span>
          )}
        </Tile>
        <Tile
          label="Second meetings"
          ring={<Ring value={summary.secondMeetings} max={5} size={40} stroke={4.5} color="var(--color-teal)" />}
        >
          <span className="font-mono text-[22px] font-semibold">{summary.secondMeetings}</span>
          <span className="text-ink-faint ml-1 text-[13px]">of 5 judges</span>
        </Tile>
        <Tile
          label="Panel verdict"
          ring={<Ring value={counts.in} max={5} size={40} stroke={4.5} color="var(--color-brand)" />}
        >
          <VerdictChip verdict={summary.verdict} className="mr-2 align-[2px]" />
          <span className="text-ink-soft text-[12px] whitespace-nowrap">
            {counts.in} in, {counts.maybe} maybe, {counts.pass} pass
          </span>
        </Tile>
        <Tile
          label="Strongest criterion"
          ring={<Ring value={pct(summary.criteria[summary.strongest])} size={40} stroke={4.5} />}
        >
          <span className="text-[15px] font-semibold">{criterion(summary.strongest).label}</span>
          <span className="text-ink-faint ml-1.5 font-mono text-[13px]">{pct(summary.criteria[summary.strongest])}</span>
        </Tile>
      </div>

      {missing.length > 0 ? (
        <p className="bg-amber-soft text-amber-deep mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-[13px]">
          <Icon name="alert" size={16} className="mt-px shrink-0" />
          <span>
            <strong className="font-semibold">Missing from the pitch:</strong> {listJoin(missing.map((k) => CHECK_LABEL[k]))}.
            Investors look for these first.
          </span>
        </p>
      ) : (
        <p className="bg-teal-soft text-teal-deep mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-[13px]">
          <Icon name="check" size={16} className="mt-px shrink-0" />
          <span>The pitch covers the basics: numbers, an ask, competitors and a named customer.</span>
        </p>
      )}
      {summary.redFlags > 0 && (
        <p className="bg-brand-soft text-brand-deep mt-2 flex items-start gap-2 rounded-lg px-3 py-2 text-[13px]">
          <Icon name="flag" size={16} className="mt-px shrink-0" />
          <span>
            {summary.redFlags === 1 ? 'One judge' : `${summary.redFlags} judges`} spotted a red flag that could end the
            conversation. Check the Skeptic first.
          </span>
        </p>
      )}

      <div className="border-line bg-card mt-5 rounded-2xl border">
        <div role="tablist" aria-label="Report sections" onKeyDown={onTabKey} className="no-scrollbar border-line flex gap-1 overflow-x-auto border-b px-3 sm:px-4">
          {TABS.map((t) => (
            <button
              key={t}
              id={`tab-${t}`}
              role="tab"
              type="button"
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              tabIndex={tab === t ? 0 : -1}
              onClick={() => setTab(t)}
              className={`relative shrink-0 px-3 py-3 text-[13.5px] font-medium whitespace-nowrap transition ${
                tab === t ? 'text-ink' : 'text-ink-faint hover:text-ink-soft'
              }`}
            >
              {tabLabel[t]}
              <span
                className={`bg-ink absolute inset-x-2 -bottom-px h-[2px] rounded-full transition-transform duration-300 ${
                  tab === t ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="p-3 sm:p-5" key={tab}>
          {tab === 'panel' && <PanelTab summary={summary} />}
          {tab === 'heatmap' && <HeatmapTab summary={summary} raw={entry.raw} delta={delta?.criteria ?? null} prevVersion={prev?.version} />}
          {tab === 'gaps' && <GapsTab summary={summary} raw={entry.raw} />}
          {tab === 'versions' && <VersionsTab versions={versions} currentId={entry.id} onOpen={onOpen} />}
          {tab === 'pitch' && <PitchTab entry={entry} />}
        </div>
      </div>
    </article>
  );
}

function listJoin(items: string[]) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

function Tile({ label, ring, children }: { label: string; ring: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-line bg-card flex min-w-[220px] items-center gap-3 rounded-xl border px-3.5 py-3 sm:min-w-0">
      {ring}
      <div className="min-w-0">
        <p className="text-ink-faint text-[12px]">{label}</p>
        <div className="mt-0.5 leading-tight">{children}</div>
      </div>
    </div>
  );
}

function PanelTab({ summary }: { summary: Summary }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {summary.judges.map((r, i) => {
        const def = judge(r.id);
        const lens = CRITERIA.filter((c) => (def.weights[c.id] ?? 1) > 1);
        return (
          <section
            key={r.id}
            className="rise border-line flex flex-col rounded-xl border p-4"
            style={{ animationDelay: `${i * 60}ms` }}
            aria-label={`${def.name}: ${VERDICT_LABEL[r.verdict]}, score ${r.score}`}
          >
            <div className="flex items-start gap-3">
              <JudgeAvatar id={r.id} />
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold">{def.name}</h3>
                <p className="text-ink-faint text-[12px]">Lens: {def.lens}</p>
              </div>
              <Ring value={r.score} size={54} stroke={5}>
                <span className="font-mono text-[15px] font-semibold">{r.score}</span>
              </Ring>
            </div>
            <div className="mt-3">
              <VerdictChip verdict={r.verdict} />
            </div>
            <p className="text-ink mt-2 text-[14px] leading-relaxed">{r.line}</p>
            <div className="mt-auto space-y-2 pt-4">
              <Meter label="Second meeting" value={r.secondMeeting} color="var(--color-teal)" />
              <Meter label="Red flag" value={r.redFlag} color="var(--color-brand)" />
            </div>
            <p className="text-ink-faint border-line mt-3 border-t pt-2.5 text-[12px]">
              Weighs most: {lens.map((c) => c.label).join(', ')}
            </p>
          </section>
        );
      })}
    </div>
  );
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[12px]">
        <span className="text-ink-soft">{label}</span>
        <span className="font-mono font-medium">{pct(value)}%</span>
      </div>
      <div className="bg-line mt-1 h-1.5 overflow-hidden rounded-full">
        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct(value)}%`, background: color }} />
      </div>
    </div>
  );
}

function heat(v: number) {
  const amount = Math.round(Math.abs(v - 0.5) * 2 * 42 + 6);
  const color = v >= 0.5 ? 'var(--color-teal)' : 'var(--color-brand)';
  return `color-mix(in oklab, ${color} ${amount}%, white)`;
}

function HeatmapTab({
  summary,
  raw,
  delta,
  prevVersion,
}: {
  summary: Summary;
  raw: RawPanel;
  delta: Record<CriterionId, number> | null;
  prevVersion?: number;
}) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div>
      <div className="text-ink-faint mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm" style={{ background: heat(0.05) }} /> weak
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm" style={{ background: heat(0.5) }} /> middling
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm" style={{ background: heat(0.95) }} /> strong
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-ink size-1.5 rounded-full" /> in that judge&apos;s lens
        </span>
      </div>
      <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-[13.5px]">
          <thead>
            <tr className="text-ink-faint text-[12px]">
              <th scope="col" className="border-line border-b py-2 pr-3 text-left font-medium">
                Criterion (0 to 100)
              </th>
              {JUDGES.map((j) => (
                <th key={j.id} scope="col" className="border-line border-b px-1 py-2 text-center font-medium" title={j.name}>
                  <span className="hidden xl:inline">{j.name.replace('The ', '')}</span>
                  <span className="font-mono xl:hidden">{j.initials}</span>
                </th>
              ))}
              <th scope="col" className="border-line border-b px-2 py-2 text-right font-medium">
                Avg
              </th>
              {delta && (
                <th scope="col" className="border-line border-b py-2 pl-2 text-right font-medium">
                  vs v{prevVersion}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((c) => {
              const avg = summary.criteria[c.id];
              const isOpen = open === c.id;
              const level = c.levels[Math.round(avg * LEVEL_MAX)];
              return (
                <Fragment key={c.id}>
                  <tr>
                    <th scope="row" className="border-line border-b py-1.5 pr-3 text-left font-normal">
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : c.id)}
                        aria-expanded={isOpen}
                        className="hover:text-ink flex items-center gap-1.5 text-left"
                      >
                        <Icon name="chev" size={12} className={`text-ink-faint transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                        {c.label}
                      </button>
                    </th>
                    {JUDGES.map((j) => {
                      const v = normalize(ladder(raw, j.id, c.id));
                      const lens = (j.weights[c.id] ?? 1) > 1;
                      return (
                        <td key={j.id} className="border-line border-b px-1 py-1.5">
                          <span
                            className="relative mx-auto grid h-8 max-w-[72px] place-items-center rounded-md font-mono text-[13px] font-medium"
                            style={{ background: heat(v) }}
                          >
                            {pct(v)}
                            {lens && <span className="bg-ink absolute top-1 right-1 size-1.5 rounded-full" aria-label="lens criterion" />}
                          </span>
                        </td>
                      );
                    })}
                    <td className="border-line border-b px-2 py-1.5 text-right font-mono font-semibold">{pct(avg)}</td>
                    {delta && (
                      <td className="border-line border-b py-1.5 pl-2 text-right text-[13px]">
                        <Delta value={delta[c.id]} />
                      </td>
                    )}
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={JUDGES.length + (delta ? 3 : 2)} className="border-line bg-sunk border-b px-3 py-2.5 text-[13px]">
                        <span className="text-ink-faint">Panel read: </span>
                        {level.charAt(0).toUpperCase() + level.slice(1)}.
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ladder = (raw: RawPanel, jid: JudgeId, cid: CriterionId) => raw.judges.find((j) => j.id === jid)?.scores[cid] ?? 0;

function GapsTab({ summary, raw }: { summary: Summary; raw: RawPanel }) {
  if (summary.gaps.length === 0) {
    const weakest = [...CRITERIA].sort((a, b) => summary.criteria[a.id] - summary.criteria[b.id])[0];
    return (
      <div className="grid place-items-center px-4 py-10 text-center">
        <span className="bg-teal-soft text-teal-deep grid size-11 place-items-center rounded-full">
          <Icon name="check" />
        </span>
        <p className="mt-3 text-[15px] font-semibold">No criterion is below 50</p>
        <p className="text-ink-soft mt-1 max-w-[46ch] text-[13.5px]">
          The weakest spot is {weakest.label.toLowerCase()} at {pct(summary.criteria[weakest.id])}. {weakest.advice.weak}
        </p>
      </div>
    );
  }
  return (
    <ol className="grid gap-3">
      {summary.gaps.map((g, i) => {
        const c = criterion(g.id);
        const who = judge(g.caresMost);
        return (
          <li key={g.id} className="rise border-line flex flex-col gap-3 rounded-xl border p-4 sm:flex-row" style={{ animationDelay: `${i * 70}ms` }}>
            <Ring value={pct(g.value)} size={58} stroke={5}>
              <span className="font-mono text-[15px] font-semibold">{pct(g.value)}</span>
            </Ring>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${
                    g.severity === 'severe' ? 'bg-brand-soft text-brand-deep' : 'bg-amber-soft text-amber-deep'
                  }`}
                >
                  {g.severity === 'severe' ? 'Big gap' : 'Gap'}
                </span>
                <h3 className="text-[15.5px] font-semibold">{c.label}</h3>
              </div>
              <p className="mt-1.5 text-[14px] leading-relaxed">{g.advice}</p>
              <p className="text-ink-faint mt-2 text-[12.5px]">
                {who.name} weighs this most. Closing it moves their score the furthest.
              </p>
            </div>
            <div className="flex shrink-0 items-end gap-1.5 sm:w-[150px]" aria-label="Score by judge">
              {JUDGES.map((j) => {
                const v = normalize(ladder(raw, j.id, g.id));
                return (
                  <div key={j.id} className="flex flex-1 flex-col items-center gap-1">
                    <div className="bg-line relative h-14 w-full overflow-hidden rounded-md">
                      <div className="absolute inset-x-0 bottom-0 rounded-md" style={{ height: `${Math.max(4, pct(v))}%`, background: toneFor(pct(v)) }} />
                    </div>
                    <span className="text-ink-faint font-mono text-[10px]">{j.initials}</span>
                  </div>
                );
              })}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function VersionsTab({ versions, currentId, onOpen }: { versions: Entry[]; currentId: string; onOpen: (id: string) => void }) {
  const rows = versions.map((v) => ({ entry: v, summary: summarize(v.raw) }));
  if (rows.length < 2) {
    return (
      <div className="grid place-items-center px-4 py-10 text-center">
        <span className="bg-lilac-soft text-lilac grid size-11 place-items-center rounded-full">
          <Icon name="layers" />
        </span>
        <p className="mt-3 text-[15px] font-semibold">Only one version so far</p>
        <p className="text-ink-soft mt-1 max-w-[46ch] text-[13.5px]">
          Use Edit to change the pitch and run it again under the same name. Each run lands here so you can see what moved.
        </p>
      </div>
    );
  }
  const max = 100;
  return (
    <div>
      <div className="flex h-36 items-end gap-2 px-1" aria-label="Panel score by version">
        {rows.map(({ entry, summary }) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onOpen(entry.id)}
            className="group flex h-full max-w-[64px] flex-1 flex-col items-center justify-end gap-1.5"
            aria-label={`Version ${entry.version}, score ${summary.overall}`}
          >
            <span className="font-mono text-[12px] font-semibold">{summary.overall}</span>
            <span
              className={`w-full rounded-t-md transition group-hover:opacity-80 ${entry.id === currentId ? 'ring-ink ring-2 ring-offset-2' : ''}`}
              style={{ height: `${Math.max(4, (summary.overall / max) * 100)}%`, background: toneFor(summary.overall) }}
            />
            <span className="text-ink-faint font-mono text-[11px]">v{entry.version}</span>
          </button>
        ))}
      </div>
      <div className="-mx-3 mt-5 overflow-x-auto px-3 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[520px] text-[13.5px]">
          <thead>
            <tr className="text-ink-faint border-line border-b text-left text-[12px]">
              <th className="py-2 font-medium">Version</th>
              <th className="py-2 font-medium">Run</th>
              <th className="py-2 text-right font-medium">Score</th>
              <th className="py-2 text-right font-medium">Change</th>
              <th className="py-2 pl-4 font-medium">Verdict</th>
              <th className="py-2 font-medium">
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ entry, summary }, i) => (
              <tr key={entry.id} className={`border-line border-b ${entry.id === currentId ? 'bg-sunk' : ''}`}>
                <td className="py-2.5 font-mono font-semibold">v{entry.version}</td>
                <td className="text-ink-soft py-2.5">{FULL_DATE.format(entry.createdAt)}</td>
                <td className="py-2.5 text-right font-mono font-semibold">{summary.overall}</td>
                <td className="py-2.5 text-right">{i > 0 ? <Delta value={summary.overall - rows[i - 1].summary.overall} /> : <span className="text-ink-faint">first</span>}</td>
                <td className="py-2.5 pl-4">
                  <VerdictChip verdict={summary.verdict} />
                </td>
                <td className="py-2.5 text-right">
                  {entry.id !== currentId && (
                    <button type="button" onClick={() => onOpen(entry.id)} className="text-brand-deep text-[13px] font-semibold hover:underline">
                      Open
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PitchTab({ entry }: { entry: Entry }) {
  return (
    <div>
      <p className="bg-sunk border-line max-h-[460px] overflow-y-auto rounded-xl border p-4 text-[14.5px] leading-relaxed whitespace-pre-wrap">
        {entry.pitch}
      </p>
      <p className="text-ink-faint mt-3 text-[12.5px]">
        {entry.pitch.length.toLocaleString('en-US')} characters. Jev read {entry.inputTokens.toLocaleString('en-US')} input
        tokens across six calls, about ${entry.cost.toFixed(5)}.
      </p>
    </div>
  );
}

export function LoadingReport({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-[1080px]" aria-busy="true" aria-live="polite">
      <p className="text-ink-faint text-[12.5px]">Pitches · {title}</p>
      <div className="mt-3 flex items-center gap-3.5">
        <span className="skeleton size-12 rounded-xl" />
        <div>
          <p className="text-ink-faint text-[12.5px]">Convening the panel</p>
          <h1 className="text-[26px] leading-tight font-semibold tracking-tight sm:text-[30px]">{title}</h1>
        </div>
      </div>
      <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-line bg-card flex items-center gap-3 rounded-xl border px-3.5 py-3">
            <span className="skeleton size-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <span className="skeleton block h-2.5 w-20 rounded" />
              <span className="skeleton block h-4 w-14 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="border-line bg-card mt-5 grid gap-3 rounded-2xl border p-3 sm:p-5 md:grid-cols-2 xl:grid-cols-3">
        {JUDGES.map((j, i) => (
          <div key={j.id} className="rise border-line rounded-xl border p-4" style={{ animationDelay: `${i * 90}ms` }}>
            <div className="flex items-center gap-3">
              <JudgeAvatar id={j.id} />
              <div className="flex-1">
                <p className="text-[15px] font-semibold">{j.name}</p>
                <p className="text-ink-faint text-[12px]">Reading for {j.lens}</p>
              </div>
              <span className="skeleton size-[54px] rounded-full" />
            </div>
            <span className="skeleton mt-4 block h-3 w-full rounded" />
            <span className="skeleton mt-2 block h-3 w-3/4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
