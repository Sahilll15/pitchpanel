// Pure panel definitions and scoring. No imports, so `node --test --experimental-strip-types` can load it.

export type CriterionId =
  | 'problem'
  | 'insight'
  | 'differentiation'
  | 'market'
  | 'timing'
  | 'team'
  | 'execution'
  | 'model'
  | 'traction'
  | 'defensibility';

export type JudgeId = 'operator' | 'hawk' | 'skeptic' | 'nerd' | 'numbers';

export type Criterion = {
  id: CriterionId;
  label: string;
  short: string;
  question: string;
  levels: string[];
  advice: { severe: string; weak: string };
};

export type Judge = {
  id: JudgeId;
  name: string;
  initials: string;
  lens: string;
  focus: string;
  temperament: string;
  weights: Partial<Record<CriterionId, number>>;
  redFlagPenalty: number;
  lines: { in: string; maybe: string; pass: string };
};

export const CRITERIA: Criterion[] = [
  {
    id: 'problem',
    label: 'Problem clarity',
    short: 'Problem',
    question: 'How clearly does the pitch describe who has the problem and how much it hurts?',
    levels: [
      'the problem is vague or not stated at all',
      'a problem is named but who has it and how badly is unclear',
      'a specific customer and a painful problem are clearly described',
      'the problem is sharp, urgent and backed by evidence that customers feel it',
    ],
    advice: {
      severe: 'Open with one sentence naming the exact customer and the moment the problem costs them time or money.',
      weak: 'Add one piece of proof the pain is real: a quote, a cost figure, or how people work around it today.',
    },
  },
  {
    id: 'insight',
    label: 'Unique insight',
    short: 'Insight',
    question: 'How non-obvious and earned is the core insight behind this startup?',
    levels: [
      'no insight beyond the obvious',
      'a reasonable but common take that many founders would share',
      'a non-obvious insight about the customer, market or technology',
      'a sharp, earned insight that most people would miss',
    ],
    advice: {
      severe: 'State what you believe that most people in this market get wrong, and how you learned it.',
      weak: 'Make the insight specific. Swap the general trend for the one detail you saw up close.',
    },
  },
  {
    id: 'differentiation',
    label: 'Differentiation',
    short: 'Diff.',
    question: 'How clearly does the product stand apart from the alternatives customers use today?',
    levels: [
      'indistinguishable from existing options',
      'small improvements over the alternatives',
      'clearly different from alternatives in ways customers care about',
      'a step change that makes the alternatives look outdated',
    ],
    advice: {
      severe: 'Name the two closest alternatives and say in one line why a customer would switch.',
      weak: 'Lead with the one difference customers notice in the first week, not the full feature list.',
    },
  },
  {
    id: 'market',
    label: 'Market size',
    short: 'Market',
    question: 'How large and well identified is the market this startup can reach?',
    levels: [
      'the market is tiny or not identified',
      'a niche market with unclear room to grow',
      'a large, clearly identified market',
      'a very large market with a credible path into adjacent markets',
    ],
    advice: {
      severe: 'Give a bottom-up market estimate: number of target customers times what each would pay per year.',
      weak: 'Show where you go after the first segment so the ceiling looks higher than the beachhead.',
    },
  },
  {
    id: 'timing',
    label: 'Timing',
    short: 'Timing',
    question: 'How convincingly does the pitch explain why now is the moment for this?',
    levels: [
      'no reason given for why this should happen now',
      'timing is plausible but not argued',
      'a clear reason why now is the right moment',
      'a strong, specific shift that makes now the obvious moment',
    ],
    advice: {
      severe: 'Add a "why now" line: the regulation, cost drop, or behavior shift that makes this possible this year.',
      weak: 'Put a date or number on the shift you cite so the timing argument feels concrete.',
    },
  },
  {
    id: 'team',
    label: 'Team fit',
    short: 'Team',
    question: 'How well suited is the founding team to this specific problem?',
    levels: [
      'nothing is said about who is building this',
      'the team is mentioned but its fit for this problem is unclear',
      'the team has relevant experience for this problem',
      'the team has rare, directly relevant experience and an unfair edge',
    ],
    advice: {
      severe: 'Say who the founders are and the one past experience that makes them the right people for this.',
      weak: 'Connect the team history to the problem directly. Skip titles and show what you have shipped or sold.',
    },
  },
  {
    id: 'execution',
    label: 'Execution plan',
    short: 'Execution',
    question: 'How concrete and credible is the plan for building, selling and reaching the next milestone?',
    levels: [
      'no plan for how this gets built or sold',
      'a loose plan with major gaps',
      'a concrete plan for building and landing the first customers',
      'a detailed, credible plan with clear milestones and owners',
    ],
    advice: {
      severe: 'Lay out the next 12 months as three milestones, each with a number you will hit.',
      weak: 'Explain how you get the next 10 customers. A named channel beats a list of options.',
    },
  },
  {
    id: 'model',
    label: 'Business model',
    short: 'Model',
    question: 'How clear and attractive is the way this startup makes money?',
    levels: [
      'no explanation of how this makes money',
      'a revenue idea that is vague or unproven',
      'a clear pricing and revenue model',
      'a clear model with strong unit economics or obvious margins',
    ],
    advice: {
      severe: 'State who pays, how much, and how often. One line of pricing is enough to start.',
      weak: 'Add one unit economics number, such as gross margin, payback period, or revenue per customer.',
    },
  },
  {
    id: 'traction',
    label: 'Traction evidence',
    short: 'Traction',
    question: 'How strong is the evidence that customers actually want this?',
    levels: [
      'no evidence that anyone wants this',
      'anecdotal interest such as conversations, a waitlist or a pilot promise',
      'real usage or paying customers with some numbers',
      'strong, specific numbers showing growth or retention',
    ],
    advice: {
      severe: 'Show any signal of demand, even small: signed letters of intent, a waitlist count, or a paid pilot.',
      weak: 'Turn traction into a trend. Two data points with dates beat one large number.',
    },
  },
  {
    id: 'defensibility',
    label: 'Defensibility',
    short: 'Moat',
    question: 'How hard would it be for a well funded competitor to copy this?',
    levels: [
      'easily copied by anyone',
      'some head start but little protection',
      'a meaningful moat such as proprietary data, network effects or switching costs',
      'a strong moat that compounds as the company grows',
    ],
    advice: {
      severe: 'Explain what gets harder to copy every month you operate: data, integrations, or network effects.',
      weak: 'Name the incumbent most likely to copy you and why they will not or cannot.',
    },
  },
];

export const JUDGES: Judge[] = [
  {
    id: 'operator',
    name: 'The Operator',
    initials: 'OP',
    lens: 'execution and team',
    focus: 'Former founder and COO. Cares whether this team can actually build, sell and hire. Ignores grand market claims.',
    temperament: 'practical, impatient with vague plans',
    weights: { team: 3, execution: 3, traction: 1.5 },
    redFlagPenalty: 8,
    lines: {
      in: 'This team looks like it can ship. {top} carried it for me.',
      maybe: 'I like parts of this, but I need to see more on {low} before I commit time.',
      pass: 'I cannot see how this gets built and sold yet. {low} is the gap.',
    },
  },
  {
    id: 'hawk',
    name: 'The Market Hawk',
    initials: 'MH',
    lens: 'market size and timing',
    focus: 'Growth investor who only backs very large markets at the right moment. Asks how big this gets and why now.',
    temperament: 'big picture, dismissive of niche ideas',
    weights: { market: 3, timing: 3, differentiation: 1 },
    redFlagPenalty: 8,
    lines: {
      in: 'The market is there and the moment is right. {top} sold me.',
      maybe: 'There may be a big outcome here, but {low} is not convincing yet.',
      pass: 'I do not see a large enough prize. {low} needs real work.',
    },
  },
  {
    id: 'skeptic',
    name: 'The Skeptic',
    initials: 'SK',
    lens: 'risks, defensibility and red flags',
    focus: 'Diligence partner who looks for what will kill the company: easy copycats, platform risk, unproven claims, missing facts.',
    temperament: 'cautious, assumes the worst until shown otherwise',
    weights: { defensibility: 3, differentiation: 2, traction: 1.5 },
    redFlagPenalty: 18,
    lines: {
      in: 'I looked for the reason to say no and did not find one. {top} holds up.',
      maybe: 'Nothing fatal, but {low} is where this could break.',
      pass: 'Too much risk for me. {low} is the first thing I would attack.',
    },
  },
  {
    id: 'nerd',
    name: 'The Product Nerd',
    initials: 'PN',
    lens: 'problem clarity, insight and differentiation',
    focus: 'Product-minded angel who wants a sharp problem, a real insight, and a product that is clearly different.',
    temperament: 'curious, allergic to buzzwords',
    weights: { problem: 3, insight: 3, differentiation: 3 },
    redFlagPenalty: 8,
    lines: {
      in: 'There is a real insight here. {top} is the part I keep thinking about.',
      maybe: 'Interesting, but {low} feels thin. Sharpen that and I lean in.',
      pass: 'I could not find the insight. {low} reads like every other pitch.',
    },
  },
  {
    id: 'numbers',
    name: 'The Numbers Person',
    initials: 'NP',
    lens: 'business model and traction evidence',
    focus: 'Analyst turned investor who trusts only numbers: revenue, retention, pricing, unit economics.',
    temperament: 'precise, unmoved by stories without data',
    weights: { model: 3, traction: 3, market: 1 },
    redFlagPenalty: 8,
    lines: {
      in: 'The numbers back the story. {top} is what got me there.',
      maybe: 'The story is fine, but {low} needs real numbers before I go further.',
      pass: 'I did not see enough evidence. {low} is missing the data I need.',
    },
  },
];

// Max index of each criteria ladder; Jev returns a float between 0 and this.
export const LEVEL_MAX = 3;

export type RawJudge = {
  id: JudgeId;
  scores: Record<CriterionId, number>;
  secondMeeting: number;
  redFlag: number;
};

export type Checks = {
  hasNumbers: number;
  statesAsk: number;
  namesCompetition: number;
  namesCustomer: number;
};

export type RawPanel = { judges: RawJudge[]; checks: Checks };

export type Verdict = 'in' | 'maybe' | 'pass';

export type JudgeResult = {
  id: JudgeId;
  score: number;
  verdict: Verdict;
  secondMeeting: number;
  redFlag: number;
  top: CriterionId;
  low: CriterionId;
  line: string;
};

export type Gap = {
  id: CriterionId;
  value: number;
  severity: 'severe' | 'weak';
  advice: string;
  caresMost: JudgeId;
};

export type Summary = {
  overall: number;
  verdict: Verdict;
  judges: JudgeResult[];
  criteria: Record<CriterionId, number>;
  gaps: Gap[];
  secondMeetings: number;
  redFlags: number;
  strongest: CriterionId;
};

export const clamp01 = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));

export const normalize = (score: number) => clamp01(score / LEVEL_MAX);

export const criterion = (id: CriterionId) => CRITERIA.find((c) => c.id === id)!;
export const judge = (id: JudgeId) => JUDGES.find((j) => j.id === id)!;

export function verdictFor(score: number, secondMeeting: number): Verdict {
  if (score >= 60 && secondMeeting >= 0.6) return 'in';
  if (score < 40 || secondMeeting < 0.35) return 'pass';
  return 'maybe';
}

export function scoreJudge(raw: RawJudge): JudgeResult {
  const def = judge(raw.id);
  let total = 0;
  let weightSum = 0;
  for (const c of CRITERIA) {
    const w = def.weights[c.id] ?? 1;
    total += normalize(raw.scores[c.id]) * w;
    weightSum += w;
  }
  const base = (total / weightSum) * 100;
  // Below an even chance the red flag answer is noise, so the penalty only ramps in above 0.5.
  const flag = Math.max(0, clamp01(raw.redFlag) - 0.5) * 2;
  const score = Math.round(Math.max(0, base - flag * def.redFlagPenalty));

  // Top and low are picked among the criteria this judge weighs most, so the line stays in character.
  const lens = CRITERIA.filter((c) => (def.weights[c.id] ?? 1) > 1);
  const byValue = [...lens].sort((a, b) => raw.scores[b.id] - raw.scores[a.id]);
  const top = byValue[0].id;
  const low = byValue[byValue.length - 1].id;

  const verdict = verdictFor(score, clamp01(raw.secondMeeting));
  const line = def.lines[verdict]
    .replace('{top}', criterion(top).label.toLowerCase())
    .replace('{low}', criterion(low).label.toLowerCase())
    .replace(/(^|\. )([a-z])/g, (_, p: string, ch: string) => p + ch.toUpperCase());

  return {
    id: raw.id,
    score,
    verdict,
    secondMeeting: clamp01(raw.secondMeeting),
    redFlag: clamp01(raw.redFlag),
    top,
    low,
    line,
  };
}

export const GAP_THRESHOLD = 0.5;
export const RED_FLAG_COUNT = 0.65;
export const SEVERE_THRESHOLD = 0.25;

export function findGaps(criteria: Record<CriterionId, number>, limit = 3): Gap[] {
  return CRITERIA.map((c) => ({ c, value: criteria[c.id] }))
    .filter(({ value }) => value < GAP_THRESHOLD)
    .sort((a, b) => a.value - b.value)
    .slice(0, limit)
    .map(({ c, value }) => {
      const severity = value < SEVERE_THRESHOLD ? ('severe' as const) : ('weak' as const);
      const caresMost = [...JUDGES].sort((a, b) => (b.weights[c.id] ?? 1) - (a.weights[c.id] ?? 1))[0].id;
      return { id: c.id, value, severity, advice: c.advice[severity], caresMost };
    });
}

export function summarize(raw: RawPanel): Summary {
  const judges = JUDGES.map((def) => {
    const r = raw.judges.find((j) => j.id === def.id);
    if (!r) throw new Error(`missing judge ${def.id}`);
    return scoreJudge(r);
  });

  const criteria = Object.fromEntries(
    CRITERIA.map((c) => [
      c.id,
      raw.judges.reduce((sum, j) => sum + normalize(j.scores[c.id]), 0) / raw.judges.length,
    ]),
  ) as Record<CriterionId, number>;

  const overall = Math.round(judges.reduce((sum, j) => sum + j.score, 0) / judges.length);
  const ins = judges.filter((j) => j.verdict === 'in').length;
  const passes = judges.filter((j) => j.verdict === 'pass').length;
  const verdict: Verdict = ins >= 3 ? 'in' : passes >= 3 ? 'pass' : 'maybe';
  const strongest = [...CRITERIA].sort((a, b) => criteria[b.id] - criteria[a.id])[0].id;

  return {
    overall,
    verdict,
    judges,
    criteria,
    gaps: findGaps(criteria),
    secondMeetings: judges.filter((j) => j.secondMeeting >= 0.5).length,
    redFlags: judges.filter((j) => j.redFlag >= RED_FLAG_COUNT).length,
    strongest,
  };
}

export type Delta = { overall: number; criteria: Record<CriterionId, number> };

export function compare(current: Summary, previous: Summary): Delta {
  return {
    overall: current.overall - previous.overall,
    criteria: Object.fromEntries(
      CRITERIA.map((c) => [c.id, Math.round((current.criteria[c.id] - previous.criteria[c.id]) * 100)]),
    ) as Record<CriterionId, number>,
  };
}

export const VERDICT_LABEL: Record<Verdict, string> = { in: 'In', maybe: 'Maybe', pass: 'Pass' };
