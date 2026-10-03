import { CRITERIA, GAP_THRESHOLD, JUDGES } from './lib/panel';

export function Method() {
  const sample = CRITERIA[0];
  return (
    <section className="border-line bg-card mt-8 rounded-2xl border p-5 sm:p-6" aria-labelledby="method-heading">
      <h2 id="method-heading" className="text-[19px] font-semibold tracking-tight">
        How the panel scores a pitch
      </h2>
      <p className="text-ink-soft mt-2 max-w-[70ch] text-[14px] leading-relaxed">
        Each judge is a set of typed questions sent to Jev, a model that answers with numbers rather than text. The judge&apos;s lens
        rides along with the pitch, so the same text gets read five different ways. All wording on the report comes from templates,
        not the model.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-[14px] font-semibold">Ten criteria</h3>
          <ol className="text-ink-soft mt-2 space-y-1.5 text-[13.5px] leading-snug">
            {CRITERIA.map((c) => (
              <li key={c.id}>
                <span className="text-ink font-semibold">{c.label}.</span> {c.question}
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-5 text-[13.5px] leading-relaxed">
          <div>
            <h3 className="text-[14px] font-semibold">A four step ladder</h3>
            <p className="text-ink-soft mt-1.5">
              Every judge rates all ten on four steps. For {sample.label.toLowerCase()} the ladder runs from &quot;{sample.levels[0]}&quot;
              to &quot;{sample.levels[sample.levels.length - 1]}&quot;.
            </p>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold">Each judge weighs their lens</h3>
            <p className="text-ink-soft mt-1.5">Criteria outside a judge&apos;s lens count once. The lens counts more.</p>
            <ul className="text-ink-soft mt-1.5 space-y-1">
              {JUDGES.map((j) => (
                <li key={j.id}>
                  <span className="text-ink font-semibold">{j.name}</span> counts{' '}
                  {CRITERIA.filter((c) => (j.weights[c.id] ?? 1) > 1)
                    .map((c) => `${c.label.toLowerCase()} ${j.weights[c.id]}x`)
                    .join(', ')}
                  . A red flag costs up to {j.redFlagPenalty} points.
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold">In, maybe or pass</h3>
            <p className="text-ink-soft mt-1.5">
              A judge is <strong className="text-teal-deep">in</strong> at 60 or more with at least a 60% chance of a second meeting, a{' '}
              <strong className="text-brand-deep">pass</strong> under 40 or under a 35% chance, and a{' '}
              <strong className="text-amber-deep">maybe</strong> otherwise. The panel is in when three judges are in and a pass when three
              pass. Any criterion the panel averages under {Math.round(GAP_THRESHOLD * 100)} becomes a gap, with advice written for that
              criterion.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
