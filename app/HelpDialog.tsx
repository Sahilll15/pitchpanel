'use client';

import type { Ref } from 'react';
import { CRITERIA, JUDGES } from './lib/panel';
import { Icon } from './ui';

export function HelpDialog({ ref }: { ref: Ref<HTMLDialogElement> }) {
  return (
    <dialog
      ref={ref}
      aria-labelledby="help-title"
      className="bg-card text-ink m-auto w-[min(640px,calc(100vw-32px))] rounded-2xl p-0 shadow-2xl backdrop:bg-black/30 backdrop:backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className="max-h-[80dvh] overflow-y-auto p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="help-title" className="text-[20px] font-semibold tracking-tight">
            How the panel scores a pitch
          </h2>
          <form method="dialog">
            <button className="text-ink-soft hover:text-ink grid size-8 place-items-center rounded-lg" aria-label="Close">
              <Icon name="x" />
            </button>
          </form>
        </div>
        <div className="text-ink-soft mt-3 space-y-3 text-[14px] leading-relaxed">
          <p>
            Each of the five judges is a set of typed questions sent to Jev, a model that answers with numbers rather than
            text. The judge&apos;s lens rides along in the state, so the same pitch gets read five different ways.
          </p>
          <p>
            Every judge rates all ten criteria on a four step ladder, from &quot;not there&quot; to &quot;strong&quot;. Criteria in the
            judge&apos;s lens count three times as much. A red flag lowers the score, and the Skeptic punishes it hardest.
          </p>
          <p>
            A judge is <strong className="text-teal-deep">in</strong> at 60 or more with at least a 60% chance of a second
            meeting, a <strong className="text-brand-deep">pass</strong> under 40 or under 35%, and a{' '}
            <strong className="text-amber-deep">maybe</strong> otherwise. Any criterion the panel averages under 50 becomes
            a gap, with advice written for that criterion. All wording on the page comes from templates, not the model.
          </p>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {JUDGES.map((j) => (
            <div key={j.id} className="border-line rounded-lg border px-3 py-2">
              <p className="text-[13.5px] font-semibold">{j.name}</p>
              <p className="text-ink-faint text-[12.5px]">
                Weighs{' '}
                {CRITERIA.filter((c) => (j.weights[c.id] ?? 1) > 1)
                  .map((c) => c.label.toLowerCase())
                  .join(', ')}
              </p>
            </div>
          ))}
        </div>
        <p className="text-ink-faint mt-4 text-[12.5px]">Pitches are saved only in this browser, in local storage.</p>
      </div>
    </dialog>
  );
}
