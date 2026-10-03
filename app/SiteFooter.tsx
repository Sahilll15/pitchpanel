import { REPO_URL, TOOLS } from './site';

const link = 'text-brand-deep font-medium underline-offset-4 hover:underline';

export function SiteFooter() {
  return (
    <footer className="border-line text-ink-soft mx-auto mt-12 max-w-[920px] border-t pt-6 text-[13px] leading-relaxed">
      <div className="grid gap-8 md:grid-cols-[1fr_1.3fr]">
        <div className="space-y-2.5">
          <p>
            Your pitch is sent to the Jev model from TypeSafe to be scored. The server does not save it. Saved pitches and reports stay in
            this browser&apos;s local storage, and the server only keeps a short-lived request count per IP address to rate limit the free
            panels.
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <span>
              Built by{' '}
              <a href="https://sahilchalke.com" className={link}>
                Sahil Chalke
              </a>
            </span>
            <a href={REPO_URL} className={link}>
              Source code on GitHub
            </a>
          </p>
        </div>
        <nav aria-labelledby="more-tools">
          <h2 id="more-tools" className="text-ink-soft text-[12px] font-semibold tracking-wide uppercase">
            More tools
          </h2>
          <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <li key={t.url}>
                <a href={t.url} className={link}>
                  {t.name}
                </a>
                <span className="text-ink-faint">, {t.blurb}</span>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
