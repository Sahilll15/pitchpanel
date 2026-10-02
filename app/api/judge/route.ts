import { NextResponse } from 'next/server';
import { CRITERIA, JUDGES, summarize, type CriterionId, type Judge, type RawJudge, type RawPanel } from '../../lib/panel';
import { askJev } from '../../server/jev';
import { check, tooMany } from '../../server/ratelimit';

const PRICE_PER_INPUT_TOKEN = 0.042 / 1_000_000;
const MIN_CHARS = 20;
const MAX_CHARS = 12_000;

type ScoreQ = { type: 'score'; instructions: string; criteria: string[] };
type BoolQ = { type: 'boolean'; instructions: string; criteria?: { true: string; false: string } };

async function askJudge(pitch: string, def: Judge) {
  const scoreQs = Object.fromEntries(
    CRITERIA.map((c) => [
      c.id,
      {
        type: 'score',
        instructions: `Judging only through the investor's lens in the state: ${c.question}`,
        criteria: c.levels,
      } satisfies ScoreQ,
    ]),
  ) as Record<CriterionId, ScoreQ>;

  const { answers, inputTokens } = await askJev(
    {
      pitch,
      investor: { name: def.name, lens: def.lens, background: def.focus, temperament: def.temperament },
    },
    {
      ...scoreQs,
      secondMeeting: {
        type: 'boolean',
        instructions: 'Based on this pitch alone, would this investor take a second meeting with the founders?',
      } satisfies BoolQ,
      redFlag: {
        type: 'boolean',
        instructions: 'Does the pitch contain a red flag that would make this investor end the conversation?',
        criteria: {
          true: 'a serious problem such as an implausible claim, a fatal dependency, a legal risk, or a contradiction',
          false: 'nothing that would end the conversation on its own',
        },
      } satisfies BoolQ,
    },
  );

  const raw: RawJudge = {
    id: def.id,
    scores: Object.fromEntries(CRITERIA.map((c) => [c.id, answers[c.id].score])) as Record<CriterionId, number>,
    secondMeeting: answers.secondMeeting.probability,
    redFlag: answers.redFlag.probability,
  };
  return { raw, inputTokens };
}

async function askChecks(pitch: string) {
  const { answers, inputTokens } = await askJev(
    { pitch },
    {
      hasNumbers: {
        type: 'boolean',
        instructions: 'Does the pitch include concrete numbers such as revenue, users, growth, prices or costs?',
      },
      statesAsk: {
        type: 'boolean',
        instructions: 'Does the pitch say what the founders are asking for, such as an amount being raised?',
      },
      namesCompetition: {
        type: 'boolean',
        instructions: 'Does the pitch name competitors or the alternatives customers use today?',
      },
      namesCustomer: {
        type: 'boolean',
        instructions: 'Does the pitch name a specific target customer rather than "everyone" or "businesses"?',
      },
    },
  );
  return {
    checks: {
      hasNumbers: answers.hasNumbers.probability,
      statesAsk: answers.statesAsk.probability,
      namesCompetition: answers.namesCompetition.probability,
      namesCustomer: answers.namesCustomer.probability,
    },
    inputTokens,
  };
}

export async function POST(req: Request) {
  let body: { pitch?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Send a JSON body with a "pitch" field.' }, { status: 400 });
  }

  const pitch = typeof body.pitch === 'string' ? body.pitch.trim() : '';
  if (pitch.length < MIN_CHARS) {
    return NextResponse.json(
      { error: 'Paste a pitch first. Even a one-liner works, as long as it says what you do and for whom.' },
      { status: 400 },
    );
  }
  if (pitch.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `Pitches are capped at ${MAX_CHARS.toLocaleString('en-US')} characters. Trim it and try again.` },
      { status: 413 },
    );
  }

  const gate = check(req, 'analyze');
  if (!gate.ok) return tooMany(gate.retryAfter);

  try {
    const [checks, ...judged] = await Promise.all([askChecks(pitch), ...JUDGES.map((j) => askJudge(pitch, j))]);
    const raw: RawPanel = { judges: judged.map((j) => j.raw), checks: checks.checks };
    const inputTokens = checks.inputTokens + judged.reduce((sum, j) => sum + j.inputTokens, 0);

    return NextResponse.json({
      raw,
      summary: summarize(raw),
      inputTokens,
      cost: inputTokens * PRICE_PER_INPUT_TOKEN,
    });
  } catch (err) {
    console.error('panel failed', err);
    return NextResponse.json({ error: 'The panel could not be reached. Try again in a minute.' }, { status: 502 });
  }
}
