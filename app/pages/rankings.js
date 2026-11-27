// SPDX-License-Identifier: MIT
// Rankings: where Indonesia stands among ASEAN members or the G20 on one indicator, and on every indicator at once.

import { h, setTitle } from '../core/dom.js';
import { INDICATORS, COUNTRIES, G20, HOME, indicatorById, topicById } from '../core/indicators.js';
import { loadIndicator, loadAll } from '../core/store.js';
import { formatValue } from '../core/format.js';
import { rankGroup, ordinal } from '../core/rank.js';
import { rankedBars } from '../charts/ranked-bars.js';

const GROUPS = { asean: ['ASEAN', COUNTRIES], g20: ['G20', G20] };
const colorOf = (code) => (code === HOME ? '#c2361a' : '#43487a');

export async function render(view, route) {
  const indicator = indicatorById(route.args[0]) ?? indicatorById('gdp-per-person');
  const key = route.query.get('group') === 'g20' ? 'g20' : 'asean';
  const [groupName, group] = GROUPS[key];
  setTitle(`Rankings: ${indicator.name}`);
  const ranking = rankGroup(await loadIndicator(indicator.id), group);
  const where = (id, k) => `#/rankings/${id}?group=${k}`;

  const tableBox = h('section', { class: 'leaf' }, h('h2', null, `Indonesia’s rank on every indicator, among the ${groupName}`), h('p', { class: 'muted' }, 'Loading every series…'));

  view.append(
    h('div', { class: 'indicator-head' },
      h('div', null, h('p', { class: 'eyebrow' }, `Rankings · Indonesia among the ${groupName}`), h('h1', null, indicator.name)),
      h('label', null, 'Indicator ',
        h('select', { onchange: (event) => { location.hash = where(event.target.value, key); } },
          INDICATORS.filter((item) => item.asean).map((item) => h('option', { value: item.id, selected: item.id === indicator.id }, item.name))))),
    h('div', { class: 'toggles', role: 'group', 'aria-label': 'Group' },
      Object.entries(GROUPS).map(([k, [name]]) => h('a', { class: 'button ghost', href: where(indicator.id, k), 'aria-current': k === key ? 'page' : null }, name))),
    h('section', { class: 'leaf' },
      ranking.home
        ? h('p', { class: 'rank-line' }, 'Indonesia ranks ', h('b', null, ordinal(ranking.home.rank)), ` of ${ranking.rows.length} ${groupName} members with data, at ${formatValue(ranking.home.point.value, indicator.unit)} in ${ranking.home.point.year}. Rank 1 is the highest value.`)
        : h('p', { class: 'rank-line' }, 'Indonesia reports no figure for this indicator.'),
      rankedBars(ranking.rows.map((row) => ({ id: row.code, label: row.name, value: row.point.value, year: row.point.year, color: colorOf(row.code) })), indicator.unit, HOME),
      h('p', { class: 'source' }, `All ${ranking.rows.length} members that report ${indicator.name.toLowerCase()} are listed, each at its own latest year. World Bank ${indicator.code}. `, h('a', { href: `#/indicator/${indicator.id}` }, 'Open the indicator'))),
    tableBox,
  );

  const data = await loadAll();
  const rows = INDICATORS.filter((item) => item.asean).map((item) => ({ item, ranking: rankGroup(data[item.id], group) })).filter((row) => row.ranking.home);
  tableBox.replaceChildren(
    h('h2', null, `Indonesia’s rank on ${rows.length} indicators, among the ${groupName}`),
    h('div', { class: 'year-table-wrap' }, h('table', null,
      h('thead', null, h('tr', null, h('th', null, 'Indicator'), h('th', { class: 'hide-phone' }, 'Topic'), h('th', { class: 'num' }, 'Indonesia'), h('th', { class: 'num' }, 'Rank'))),
      h('tbody', null, rows.map(({ item, ranking: r }) => h('tr', null,
        h('td', null, h('a', { href: where(item.id, key) }, item.name)),
        h('td', { class: 'hide-phone' }, topicById(item.topic).name),
        h('td', { class: 'num' }, formatValue(r.home.point.value, item.unit)),
        h('td', { class: 'num' }, `${r.home.rank} of ${r.rows.length}`)))))));
}
