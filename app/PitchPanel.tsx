'use client';

import { useMemo, useRef, useState } from 'react';
import { VERDICT_LABEL, summarize, type RawPanel, type Verdict } from './lib/panel';
import { addEntry, removeEntry, sameTitle, useEntries, type Entry } from './lib/store';
import { SAMPLES } from './samples';
import { Composer, type Draft } from './Composer';
import { Report, LoadingReport } from './Report';
import { HelpDialog } from './HelpDialog';
import { Icon, Logo, Ring } from './ui';

type View = { kind: 'auto' } | { kind: 'new' } | { kind: 'entry'; id: string };
type Status = { kind: 'idle' } | { kind: 'loading'; title: string } | { kind: 'error'; message: string };

const MAX_CHARS = 12_000;

export default function PitchPanel() {
  const entries = useEntries();
  const [view, setView] = useState<View>({ kind: 'auto' });
  const [draft, setDraft] = useState<Draft>({ title: '', pitch: '' });
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [listMode, setListMode] = useState<'all' | 'latest'>('all');
  const [filter, setFilter] = useState<Verdict | 'any'>('any');
  const helpRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLElement>(null);

  const scored = useMemo(() => entries.map((e) => ({ entry: e, summary: summarize(e.raw) })), [entries]);

  const active =
    view.kind === 'entry'
      ? entries.find((e) => e.id === view.id)
      : view.kind === 'auto'
        ? entries[0]
        : undefined;

  const visible = scored.filter(({ entry, summary }) => {
    if (filter !== 'any' && summary.verdict !== filter) return false;
    if (listMode === 'latest') {
      return !entries.some((o) => sameTitle(o.title, entry.title) && o.version > entry.version);
    }
    return true;
  });
  const titles = new Set(entries.map((e) => e.title.trim().toLowerCase())).size;

  function startNew(prefill?: Draft) {
    setDraft(prefill ?? { title: '', pitch: '' });
    setStatus({ kind: 'idle' });
    setView({ kind: 'new' });
  }

  async function run() {
    const title = draft.title.trim() || 'Untitled pitch';
    const pitch = draft.pitch.trim();
    setStatus({ kind: 'loading', title });
    try {
      const res = await fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `The panel returned an error (${res.status}).`);
      const entry = addEntry({
        title,
        pitch,
        raw: data.raw as RawPanel,
        inputTokens: data.inputTokens ?? 0,
        cost: data.cost ?? 0,
      });
      setStatus({ kind: 'idle' });
      setView({ kind: 'entry', id: entry.id });
    } catch (err) {
      const message = err instanceof Error && err.message !== 'Failed to fetch' ? err.message : 'Could not reach the server. Check your connection and try again.';
      setStatus({ kind: 'error', message });
    }
  }

  function remove(entry: Entry) {
    if (!window.confirm(`Delete "${entry.title}" version ${entry.version} from this browser?`)) return;
    removeEntry(entry.id);
    setView({ kind: 'auto' });
  }

  const loading = status.kind === 'loading';
  const showComposer = !loading && (view.kind === 'new' || !active);

  return (
    <div className="flex min-h-dvh">
      <Rail
        onNew={() => startNew()}
        onList={() => listRef.current?.focus()}
        onHelp={() => helpRef.current?.showModal()}
        composing={showComposer}
      />

      <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
        <MobileBar onNew={() => startNew()} onHelp={() => helpRef.current?.showModal()} />

        <aside
          ref={listRef}
          tabIndex={-1}
          aria-label="Saved pitches"
          className={`border-line bg-card shrink-0 flex-col border-b ${entries.length === 0 && !loading ? 'hidden lg:flex' : 'flex'} outline-none lg:sticky lg:top-0 lg:h-dvh lg:w-[300px] lg:border-r lg:border-b-0`}
        >
          <div className="px-4 pt-5 pb-3 lg:px-5">
            <div className="hidden items-baseline justify-between lg:flex">
              <h2 className="text-[19px] font-semibold tracking-tight">Pitches</h2>
              <span className="text-ink-faint text-xs">Saved in this browser</span>
            </div>
            <div className="bg-sunk border-line mt-0 grid grid-cols-2 rounded-xl border p-1 text-[13px] lg:mt-4">
              {(['all', 'latest'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setListMode(m)}
                  aria-pressed={listMode === m}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium transition ${
                    listMode === m ? 'bg-card text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {m === 'all' ? 'All runs' : 'Latest'}
                  <span className="bg-line text-ink-soft rounded-md px-1.5 text-[11px] font-semibold">
                    {m === 'all' ? entries.length : titles}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => startNew()}
                className="border-line-strong text-ink hover:border-ink-faint flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[13px] font-medium transition"
              >
                <Icon name="plus" size={15} /> New pitch
              </button>
              <label className="border-line-strong relative flex flex-1 items-center rounded-lg border text-[13px]">
                <span className="sr-only">Filter by verdict</span>
                <Icon name="flag" size={14} className="text-ink-faint pointer-events-none absolute left-2.5" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as Verdict | 'any')}
                  className="w-full appearance-none bg-transparent py-1.5 pr-6 pl-7 font-medium outline-none"
                >
                  <option value="any">Any verdict</option>
                  {(['in', 'maybe', 'pass'] as const).map((v) => (
                    <option key={v} value={v}>
                      {VERDICT_LABEL[v]}
                    </option>
                  ))}
                </select>
                <Icon name="chev" size={13} className="text-ink-faint pointer-events-none absolute right-2 rotate-90" />
              </label>
            </div>
          </div>

          <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-4 lg:flex-1 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:px-5">
            {loading && <PendingCard title={status.title} />}
            {visible.map(({ entry, summary }) => (
              <PitchCard
                key={entry.id}
                entry={entry}
                score={summary.overall}
                verdict={summary.verdict}
                selected={!showComposer && !loading && active?.id === entry.id}
                onSelect={() => {
                  setStatus({ kind: 'idle' });
                  setView({ kind: 'entry', id: entry.id });
                }}
              />
            ))}
            {entries.length === 0 && !loading && <EmptyList onSample={(i) => startNew(SAMPLES[i])} />}
            {entries.length > 0 && visible.length === 0 && (
              <p className="text-ink-faint px-1 py-6 text-center text-[13px]">No pitches match this filter.</p>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {loading ? (
            <LoadingReport title={status.title} />
          ) : showComposer ? (
            <Composer
              draft={draft}
              onChange={setDraft}
              onSubmit={run}
              error={status.kind === 'error' ? status.message : null}
              maxChars={MAX_CHARS}
              existingTitles={[...new Set(entries.map((e) => e.title))]}
              onCancel={entries.length ? () => setView({ kind: 'auto' }) : undefined}
            />
          ) : (
            active && (
              <Report
                key={active.id}
                entry={active}
                all={entries}
                onOpen={(id) => setView({ kind: 'entry', id })}
                onEdit={() => startNew({ title: active.title, pitch: active.pitch })}
                onDelete={() => remove(active)}
              />
            )
          )}
        </main>
      </div>

      <HelpDialog ref={helpRef} />
    </div>
  );
}

function Rail({
  onNew,
  onList,
  onHelp,
  composing,
}: {
  onNew: () => void;
  onList: () => void;
  onHelp: () => void;
  composing: boolean;
}) {
  const item = 'grid size-10 place-items-center rounded-xl transition text-ink-faint hover:bg-sunk hover:text-ink';
  return (
    <nav
      aria-label="Main"
      className="border-line bg-card sticky top-0 hidden h-dvh w-[68px] shrink-0 flex-col items-center gap-2 border-r py-5 lg:flex"
    >
      <span className="mb-4">
        <Logo size={38} />
        <span className="sr-only">PitchPanel</span>
      </span>
      <button type="button" onClick={onNew} className={`${item} ${composing ? 'bg-brand-soft text-brand-deep' : ''}`} title="New pitch">
        <Icon name="plus" />
        <span className="sr-only">New pitch</span>
      </button>
      <button type="button" onClick={onList} className={item} title="Saved pitches">
        <Icon name="grid" />
        <span className="sr-only">Saved pitches</span>
      </button>
      <button type="button" onClick={onHelp} className={item} title="How scoring works">
        <Icon name="layers" />
        <span className="sr-only">How scoring works</span>
      </button>
      <div className="mt-auto">
        <button type="button" onClick={onHelp} className={item} title="Help">
          <Icon name="help" />
          <span className="sr-only">Help</span>
        </button>
      </div>
    </nav>
  );
}

function MobileBar({ onNew, onHelp }: { onNew: () => void; onHelp: () => void }) {
  return (
    <header className="border-line bg-card flex items-center gap-3 border-b px-4 py-3 lg:hidden">
      <Logo size={30} />
      <span className="text-[17px] font-semibold tracking-tight">PitchPanel</span>
      <div className="ml-auto flex gap-1">
        <button type="button" onClick={onHelp} className="text-ink-soft grid size-9 place-items-center rounded-lg" aria-label="How scoring works">
          <Icon name="help" />
        </button>
        <button type="button" onClick={onNew} className="bg-ink grid size-9 place-items-center rounded-lg text-white" aria-label="New pitch">
          <Icon name="plus" />
        </button>
      </div>
    </header>
  );
}

const DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

function PitchCard({
  entry,
  score,
  verdict,
  selected,
  onSelect,
}: {
  entry: Entry;
  score: number;
  verdict: Verdict;
  selected: boolean;
  onSelect: () => void;
}) {
  const tag: Record<Verdict, string> = {
    in: 'bg-teal-soft text-teal-deep',
    maybe: 'bg-amber-soft text-amber-deep',
    pass: 'bg-lilac-soft text-lilac',
  };
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
      className={`rise group w-[230px] shrink-0 rounded-xl border p-3.5 text-left transition lg:w-auto ${
        selected
          ? 'border-ink/70 bg-sunk shadow-[0_1px_0_rgba(0,0,0,0.04)]'
          : 'border-line hover:border-line-strong bg-card hover:shadow-sm'
      }`}
    >
      <p className="text-ink-faint truncate text-[11.5px]">
        Pitch · v{entry.version} · {DATE.format(entry.createdAt)}
      </p>
      <p className="mt-0.5 truncate text-[15px] font-semibold">{entry.title}</p>
      <div className="mt-2.5 flex items-end justify-between">
        <span className={`rounded-md px-2 py-0.5 text-[11.5px] font-medium ${tag[verdict]}`}>
          Panel says {VERDICT_LABEL[verdict].toLowerCase()}
        </span>
        <span className="flex items-center gap-2">
          <span className="text-right leading-none">
            <span className="text-ink-faint block text-[9.5px] font-semibold tracking-wider">SCORE</span>
            <span className="font-mono text-[17px] font-semibold">{score}</span>
          </span>
          <Ring value={score} size={30} stroke={3.5} label={`Panel score ${score}`} />
        </span>
      </div>
    </button>
  );
}

function PendingCard({ title }: { title: string }) {
  return (
    <div className="border-brand/40 bg-brand-soft/40 w-[230px] shrink-0 rounded-xl border border-dashed p-3.5 lg:w-auto" aria-live="polite">
      <p className="text-ink-faint text-[11.5px]">Pitch · in review</p>
      <p className="mt-0.5 truncate text-[15px] font-semibold">{title}</p>
      <div className="mt-2.5 flex items-center gap-2 text-[12px] text-brand-deep">
        <svg className="spinner" width="14" height="14" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
          <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        Panel is reading
      </div>
    </div>
  );
}

function EmptyList({ onSample }: { onSample: (i: number) => void }) {
  return (
    <div className="border-line w-full rounded-xl border border-dashed p-4 text-[13px] lg:mt-1">
      <p className="font-semibold">No pitches yet</p>
      <p className="text-ink-soft mt-1 leading-relaxed">
        Every pitch you run is kept here, in this browser only. Run the same name again to track versions.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {SAMPLES.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => onSample(i)}
            className="border-line-strong hover:border-ink-faint rounded-md border px-2 py-1 text-[12px] font-medium transition"
          >
            {s.title}
          </button>
        ))}
      </div>
    </div>
  );
}
