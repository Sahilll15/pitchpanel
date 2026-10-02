'use client';

import { JUDGES } from './lib/panel';
import { SAMPLES } from './samples';
import { Icon } from './ui';
import { JudgeAvatar } from './Report';

export type Draft = { title: string; pitch: string };

const MIN_CHARS = 20;

export function Composer({
  draft,
  onChange,
  onSubmit,
  error,
  maxChars,
  existingTitles,
  onCancel,
}: {
  draft: Draft;
  onChange: (d: Draft) => void;
  onSubmit: () => void;
  error: string | null;
  maxChars: number;
  existingTitles: string[];
  onCancel?: () => void;
}) {
  const length = draft.pitch.trim().length;
  const tooLong = draft.pitch.length > maxChars;
  const ready = length >= MIN_CHARS && !tooLong;
  const isVersion = existingTitles.some((t) => t.trim().toLowerCase() === draft.title.trim().toLowerCase() && draft.title.trim());

  return (
    <div className="rise mx-auto max-w-[920px]">
      <nav className="text-ink-faint flex items-center gap-1.5 text-[12.5px]" aria-label="Breadcrumb">
        <span>Pitches</span>
        <Icon name="chev" size={12} />
        <span className="text-ink-soft">New pitch</span>
      </nav>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] leading-tight font-semibold tracking-tight sm:text-[30px]">Put your pitch in front of the panel</h1>
          <p className="text-ink-soft mt-1.5 max-w-[60ch] text-[14.5px] leading-relaxed">
            Paste a one-liner, an elevator pitch or the text of your deck. Five investor archetypes score it on ten
            criteria and tell you who would take the second meeting.
          </p>
        </div>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-ink-soft hover:text-ink text-[13px] font-medium">
            Back to latest report
          </button>
        )}
      </div>

      <form
        className="border-line bg-card mt-6 rounded-2xl border p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onSubmit();
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-ink-faint mr-1 flex items-center gap-1.5 text-[12.5px] font-medium">
            <Icon name="sparkle" size={14} /> Try a sample
          </span>
          {SAMPLES.map((s) => (
            <button
              key={s.title}
              type="button"
              onClick={() => onChange({ title: s.title, pitch: s.pitch })}
              className="border-line-strong hover:border-brand hover:text-brand-deep rounded-lg border px-2.5 py-1 text-[12.5px] font-medium transition"
            >
              {s.label}
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="text-[13px] font-semibold">Startup name</span>
          <input
            value={draft.title}
            onChange={(e) => onChange({ ...draft, title: e.target.value.slice(0, 60) })}
            list="pitch-titles"
            placeholder="Acme Robotics"
            className="border-line-strong focus:border-brand mt-1.5 w-full rounded-lg border px-3 py-2 text-[15px] outline-none transition placeholder:text-ink-faint/70"
          />
          <datalist id="pitch-titles">
            {existingTitles.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <span className="text-ink-faint mt-1 block text-[12px]">
            {isVersion
              ? 'This name already exists, so the run is saved as a new version and compared with the last one.'
              : 'Reuse the same name later to save a new version and see what moved.'}
          </span>
        </label>

        <label className="mt-4 block">
          <span className="flex items-baseline justify-between">
            <span className="text-[13px] font-semibold">Pitch</span>
            <span className={`font-mono text-[11.5px] ${tooLong ? 'text-down' : 'text-ink-faint'}`}>
              {draft.pitch.length.toLocaleString('en-US')} / {maxChars.toLocaleString('en-US')}
            </span>
          </span>
          <textarea
            value={draft.pitch}
            onChange={(e) => onChange({ ...draft, pitch: e.target.value })}
            rows={11}
            placeholder="We help ... who struggle with ... Today they ... We are different because ... So far we have ..."
            className="border-line-strong focus:border-brand mt-1.5 w-full resize-y rounded-lg border px-3 py-2.5 text-[14.5px] leading-relaxed outline-none transition placeholder:text-ink-faint/70"
          />
        </label>

        {error && (
          <div role="alert" className="border-down/30 bg-brand-soft/60 text-ink mt-3 flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-[13.5px]">
            <Icon name="alert" size={17} className="text-down mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">The panel did not convene</p>
              <p className="text-ink-soft mt-0.5">{error}</p>
            </div>
            {ready && (
              <button type="button" onClick={onSubmit} className="text-brand-deep shrink-0 font-semibold hover:underline">
                Try again
              </button>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-ink-faint text-[12.5px]">
            {tooLong
              ? 'That is over the limit. Trim it down first.'
              : length < MIN_CHARS
                ? 'Write at least a sentence about what you do and for whom.'
                : 'Six scoring calls run in parallel. Takes a few seconds.'}
          </p>
          <button
            type="submit"
            disabled={!ready}
            className="bg-ink hover:bg-ink/90 disabled:bg-line-strong inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-white transition disabled:cursor-not-allowed"
          >
            Convene the panel <Icon name="arrow" size={16} />
          </button>
        </div>
      </form>

      <section className="mt-8" aria-labelledby="panel-heading">
        <h2 id="panel-heading" className="text-[13px] font-semibold tracking-wide text-ink-soft uppercase">
          Who is on the panel
        </h2>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {JUDGES.map((j, i) => (
            <div key={j.id} className="rise border-line bg-card rounded-xl border p-3.5" style={{ animationDelay: `${i * 50}ms` }}>
              <JudgeAvatar id={j.id} />
              <p className="mt-2.5 text-[14px] font-semibold">{j.name}</p>
              <p className="text-ink-soft mt-0.5 text-[12.5px] leading-snug">Judges {j.lens}.</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
