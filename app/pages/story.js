// SPDX-License-Identifier: MIT
// Story: five one-line findings, each computed from the loaded series when the page opens (nothing is typed in).

import { h, setTitle } from '../core/dom.js';
import { COUNTRIES, HOME, indicatorById } from '../core/indicators.js';
import { loadAll, pointsOf, reported, latest } from '../core/store.js';
import { formatValue } from '../core/format.js';
import { ordinal } from '../core/rank.js';

// kind: 'ratio' compares levels (how many times larger), 'diff' compares rates and shares (points gained).
const CANDIDATES = [
  ['gdp-per-person', 'ratio'], ['internet-users', 'diff'], ['life-expectancy', 'diff'], ['child-mortality', 'ratio'],
  ['electricity-access', 'diff'], ['extreme-poverty', 'diff'], ['coal-electricity', 'diff'], ['secondary-enrolment', 'diff'], ['mobile-subscriptions', 'diff'],
];

// Indonesia's move from its first reported year to its latest, ranked against every ASEAN member that reports the same two spans.
export function findingFor(data, id, kind) {
  const indicator = indicatorById(id);
  const record = data[id];
  const mine = reported(pointsOf(record, HOME));
  if (mine.length < 2) return null;
  const from = mine[0];
  const to = mine.at(-1);
  const moves = Object.keys(COUNTRIES).map((code) => {
    const points = reported(pointsOf(record, code));
    const start = points.find((p) => p.year === from.year);
    const end = latest(points);
    if (!start || !end || end.year === start.year) return null;
    return { code, change: kind === 'ratio' ? end.value / start.value : end.value - start.value };
  }).filter(Boolean);
  const own = moves.find((move) => move.code === HOME);
  if (!own) return null;
  const rose = to.value > from.value;
  // rank 1 = the biggest rise (or the smallest fall) among the members compared
  const place = 1 + moves.filter((move) => move.change > own.change).length;
  const how = kind === 'ratio' ? `${own.change.toFixed(2)} times its ${from.year} level` : `${rose ? '+' : '−'}${Math.abs(to.value - from.value).toFixed(1)} ${indicator.unit.startsWith('%') ? 'points' : indicator.unit}`;
  return {
    id, indicator, headline: how,
    text: `${indicator.name} went from ${formatValue(from.value, indicator.unit)} in ${from.year} to ${formatValue(to.value, indicator.unit)} in ${to.year}, ${rose ? 'a rise' : 'a fall'}. Among ${moves.length} ASEAN members reporting both ends, Indonesia ranks ${ordinal(place)} on that change (1 = the biggest increase).`,
  };
}

export async function render(view) {
  setTitle('Story');
  const data = await loadAll();
  const findings = CANDIDATES.map(([id, kind]) => findingFor(data, id, kind)).filter(Boolean).slice(0, 5);
  view.append(
    h('p', { class: 'eyebrow' }, 'Story · computed when you open this page'),
    h('h1', null, 'Five findings about Indonesia'),
    h('p', { class: 'muted' }, 'Every line below is calculated from the World Bank series on this site. Rank 1 is the biggest increase among ASEAN members, measured from Indonesia’s first reported year.'),
    h('ol', { class: 'story' }, findings.map((finding, i) => h('li', { class: 'leaf' },
      h('span', { class: 'story-n' }, String(i + 1)),
      h('div', null, h('b', { class: 'story-head' }, finding.headline), h('p', null, finding.text),
        h('p', { class: 'source' }, h('a', { href: `#/indicator/${finding.id}` }, 'Series and table'), ' · ', h('a', { href: `#/rankings/${finding.id}` }, 'Rankings'), ' · ', h('a', { href: `#/compare/${finding.id}` }, 'ASEAN lines')))))),
  );
}
