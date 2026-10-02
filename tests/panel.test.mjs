import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CRITERIA, JUDGES, compare, findGaps, scoreJudge, summarize, verdictFor } from '../app/lib/panel.ts';

const flat = (level) => Object.fromEntries(CRITERIA.map((c) => [c.id, level]));

const panel = (level, extra = {}) => ({
  judges: JUDGES.map((j) => ({ id: j.id, scores: flat(level), secondMeeting: 0.8, redFlag: 0, ...extra })),
  checks: { hasNumbers: 1, statesAsk: 1, namesCompetition: 1, namesCustomer: 1 },
});

test('verdict thresholds', () => {
  assert.equal(verdictFor(75, 0.9), 'in');
  assert.equal(verdictFor(75, 0.5), 'maybe');
  assert.equal(verdictFor(55, 0.9), 'maybe');
  assert.equal(verdictFor(39, 0.9), 'pass');
  assert.equal(verdictFor(80, 0.2), 'pass');
});

test('judge score is the weighted mean scaled to 100', () => {
  const r = scoreJudge({ id: 'operator', scores: flat(3), secondMeeting: 0.9, redFlag: 0 });
  assert.equal(r.score, 100);
  assert.equal(r.verdict, 'in');

  const half = scoreJudge({ id: 'operator', scores: flat(1.5), secondMeeting: 0.9, redFlag: 0 });
  assert.equal(half.score, 50);
});

test('lens criteria weigh more than the rest', () => {
  const scores = { ...flat(0), team: 3, execution: 3 };
  const operator = scoreJudge({ id: 'operator', scores, secondMeeting: 0.5, redFlag: 0 });
  const hawk = scoreJudge({ id: 'hawk', scores, secondMeeting: 0.5, redFlag: 0 });
  assert.ok(operator.score > hawk.score);
  assert.equal(operator.top === 'team' || operator.top === 'execution', true);
});

test('red flags cost the skeptic the most', () => {
  const skeptic = scoreJudge({ id: 'skeptic', scores: flat(3), secondMeeting: 0.9, redFlag: 1 });
  const nerd = scoreJudge({ id: 'nerd', scores: flat(3), secondMeeting: 0.9, redFlag: 1 });
  assert.equal(skeptic.score, 82);
  assert.equal(nerd.score, 92);
});

test('a red flag answer under an even chance costs nothing', () => {
  const r = scoreJudge({ id: 'skeptic', scores: flat(3), secondMeeting: 0.9, redFlag: 0.45 });
  assert.equal(r.score, 100);
  const s = summarize(panel(2, { redFlag: 0.6 }));
  assert.equal(s.redFlags, 0);
});

test('out of range scores are clamped', () => {
  const r = scoreJudge({ id: 'nerd', scores: flat(9), secondMeeting: 2, redFlag: -1 });
  assert.equal(r.score, 100);
  assert.equal(r.secondMeeting, 1);
  assert.equal(r.redFlag, 0);
});

test('verdict line is templated from the lens criteria', () => {
  const r = scoreJudge({ id: 'numbers', scores: { ...flat(2), traction: 0.2 }, secondMeeting: 0.1, redFlag: 0 });
  assert.equal(r.verdict, 'pass');
  assert.equal(r.low, 'traction');
  assert.match(r.line, /^I did not see enough evidence\. Traction evidence is missing/);
});

test('summarize averages judges and picks panel verdict', () => {
  const strong = summarize(panel(2.7));
  assert.equal(strong.overall, 90);
  assert.equal(strong.verdict, 'in');
  assert.equal(strong.secondMeetings, 5);
  assert.equal(strong.gaps.length, 0);

  const weak = summarize(panel(0.3, { secondMeeting: 0.1 }));
  assert.equal(weak.verdict, 'pass');
  assert.equal(weak.gaps.length, 3);
  assert.equal(weak.gaps[0].severity, 'severe');
});

test('gaps are the weakest criteria under the threshold, lowest first', () => {
  const criteria = Object.fromEntries(CRITERIA.map((c) => [c.id, 0.8]));
  criteria.market = 0.4;
  criteria.traction = 0.1;
  const gaps = findGaps(criteria);
  assert.deepEqual(gaps.map((g) => g.id), ['traction', 'market']);
  assert.equal(gaps[0].severity, 'severe');
  assert.equal(gaps[0].caresMost, 'numbers');
  assert.equal(gaps[1].caresMost, 'hawk');
});

test('compare reports per criterion deltas in points', () => {
  const before = summarize(panel(1.5));
  const after = summarize(panel(2.1));
  const d = compare(after, before);
  assert.equal(d.overall, 20);
  assert.equal(d.criteria.team, 20);
});

test('summarize fails loudly when a judge is missing', () => {
  const p = panel(2);
  p.judges.pop();
  assert.throws(() => summarize(p), /missing judge/);
});
