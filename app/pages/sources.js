// SPDX-License-Identifier: MIT
// Sources and method: where each figure comes from, licence, how changes are computed and the gaps we know of.

import { h, setTitle } from '../core/dom.js';
import { INDICATORS, COUNTRIES, HOME, topicById } from '../core/indicators.js';
import { loadAll, pointsOf, trimmed, reported } from '../core/store.js';
import { RETRIEVED, API } from '../data/retrieval.js';

export async function render(view) {
  setTitle('Sources and method');
  const data = await loadAll();
  const coverage = INDICATORS.map((indicator) => {
    const points = trimmed(pointsOf(data[indicator.id], HOME));
    return { indicator, record: data[indicator.id], points, known: reported(points).length };
  });
  const gappy = coverage.filter((row) => row.known < row.points.length);

  view.append(
    h('p', { class: 'eyebrow' }, 'Sources and method'),
    h('h1', null, 'Where every figure comes from'),
    h('div', { class: 'sources-grid' },
      h('section', { class: 'leaf' }, h('h3', null, 'Source'),
        h('p', null, `All ${INDICATORS.length} indicators come from the World Bank's World Development Indicators, read from its public API (${API}). The World Bank compiles them from national statistics offices, including BPS-Statistics Indonesia, and from UN and ILO agencies; each indicator names its original producer below.`)),
      h('section', { class: 'leaf' }, h('h3', null, 'Retrieval and licence'),
        h('p', null, `Retrieved ${RETRIEVED} for ${Object.keys(COUNTRIES).length} ASEAN members, years 2000 onward. The data are licensed CC BY 4.0 by the World Bank; Lontar shows them unchanged apart from rounding to six significant figures, and the site's code is MIT licensed.`)),
      h('section', { class: 'leaf' }, h('h3', null, 'How changes are computed'),
        h('ul', null,
          h('li', null, 'Counts and money (people, US$, passengers) change in percent of the earlier value.'),
          h('li', null, 'Shares and rates in % change in percentage points (pts).'),
          h('li', null, 'Other measures change in their own unit, such as years or births per woman.'),
          h('li', null, 'A change compares the latest reported year with the reported year before it; green marks an improvement, vermilion a step back.')))),
    h('section', { class: 'leaf prose' }, h('h2', null, 'Known gaps'),
      h('p', null, `A year with no figure is drawn as a break in the line and listed as "not reported" in tables; it is never shown as zero or filled in. ${gappy.length} of ${INDICATORS.length} Indonesian series have such gaps:`),
      h('p', { class: 'muted' }, gappy.map((row) => `${row.indicator.name} (${row.known} of ${row.points.length} years)`).join('; ') + '.'),
      h('p', null, 'Survey-based series such as poverty, inequality, stunting and literacy are measured in some years only. Modelled ILO and UN estimates can be revised when new censuses arrive, and neighbour values use each country’s own latest year.')),
    h('div', { class: 'section-head' }, h('h2', null, 'Every indicator and its producer')),
    h('section', { class: 'leaf' }, h('table', null,
      h('thead', null, h('tr', null, h('th', null, 'Indicator'), h('th', null, 'Code'), h('th', { class: 'hide-phone' }, 'Original producer'), h('th', { class: 'num' }, 'Years'), h('th', { class: 'num hide-phone' }, 'Updated'))),
      h('tbody', null, coverage.map(({ indicator, record, points, known }) => h('tr', null,
        h('td', null, h('a', { href: `#/indicator/${indicator.id}` }, indicator.name), h('br'), h('small', { class: 'muted' }, topicById(indicator.topic).name)),
        h('td', null, h('code', null, indicator.code)),
        h('td', { class: 'hide-phone' }, record.org),
        h('td', { class: 'num' }, `${known} (${points[0].year}–${points.at(-1).year})`),
        h('td', { class: 'num hide-phone' }, record.updated)))))),
  );
}
