# PitchPanel

Paste a startup pitch and a panel of five investor archetypes scores it: The Operator, The Market Hawk, The Skeptic, The Product Nerd and The Numbers Person. Each judge is a set of typed questions sent to TypeSafe's Jev with that judge's lens in the state. Every judge rates ten criteria on a four step ladder (score questions) and answers two booleans: would they take a second meeting, and is there a red flag. A sixth call checks the basics, like whether the pitch has numbers or a stated ask. Jev only returns numbers. The app turns them into judge scores, in / maybe / pass verdicts, a criteria by judge heatmap and templated advice for the weakest criteria. Past pitches stay in your browser, and running the same name again saves a new version you can compare.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the keys
npm run dev                  # http://localhost:3000
npm test                     # scoring unit tests
```

## Config

| Variable | Purpose | Default |
| --- | --- | --- |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key, tried first | none |
| `TYPESAFE_API_KEY` | Direct TypeSafe API key, used as fallback | none |
| `RATE_LIMIT_ANALYZE` | Panels per IP per window | `5` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `3600000` |

The API is `POST /api/judge` with `{ "pitch": "..." }`. Pitches must be 20 to 12,000 characters.
