// SPDX-License-Identifier: MIT
// Overview page: headline figures, the long GDP trend, one card per topic and the catalogue search.

import { h, setTitle } from '../core/dom.js';
import { TOPICS, INDICATORS, COUNTRIES, HOME, indicatorById } from '../core/indicators.js';
import { loadAll, pointsOf, latest, earliest, previousOf, trimmed } from '../core/store.js';
import { headlineParts } from '../core/format.js';
import { changeChip, sourceLine } from '../core/widgets.js';
import { mountLineChart } from '../charts/line-chart.js';
import { sparkline } from '../charts/sparkline.js';
import { tileMap } from '../charts/tile-map.js';
import { loadProvinces } from '../core/provinces.js';
import { CHECKS } from '../data/retrieval.js';

const HEADLINES = [
  ['population', 'Population'], ['gdp-growth', 'Real growth'], ['gdp-per-person', 'GDP per person'], ['inflation', 'Inflation'],
  ['unemployment', 'Unemployment'], ['poverty', 'Poverty rate'], ['life-expectancy', 'Life expectancy'], ['internet-users', 'Internet users'],
];

function headlineTile(indicator, label, points) {
  const last = latest(points);
  const { num, note } = headlineParts(last.value, indicator.unit);
  return h('a', { class: 'leaf tile', href: `#/indicator/${indicator.id}` },
    h('span', { class: 'tile-label' }, label),
    h('span', { class: 'tile-value' }, num),
    h('span', { class: 'tile-note' }, note),
    changeChip(indicator, previousOf(points, last.year), last, ''),
    sourceLine(indicator, last.year, false));
}

function topicCard(topic, data) {
  const lead = indicatorById(topic.lead);
  const points = trimmed(pointsOf(data[lead.id], HOME));
  const last = latest(points);
  return h('a', { class: 'leaf topic-card', href: `#/topic/${topic.id}` },
    h('h3', null, topic.name, h('small', { class: 'muted' }, ` · ${topic.indicators.length}`)),
    h('span', { class: 'lead-value' }, headlineParts(last.value, lead.unit).num, ' ', h('small', null, headlineParts(last.value, lead.unit).note)),
    h('span', { class: 'muted', title: lead.name }, `${lead.name}, ${last.year}`),
    sparkline(points, { width: 130, height: 26 }));
}

function searchForm() {
  const input = h('input', { type: 'search', name: 'q', placeholder: `Search ${INDICATORS.length} indicators, e.g. poverty`, 'aria-label': 'Search indicators' });
  return h('form', {
    class: 'search', role: 'search',
    onsubmit: (event) => { event.preventDefault(); location.hash = `#/catalogue?q=${encodeURIComponent(input.value.trim())}`; },
  }, input, h('button', { type: 'submit' }, 'Search'));
}

export async function render(view) {
  setTitle('Indonesia in figures');
  const [data, { provinces }] = await Promise.all([loadAll(), loadProvinces()]);
  // A publisher is the last bracketed acronym of each producer line the World Bank names (ILO, IMF, WHO ...), plus BPS for the provinces.
  const producers = new Set(['BPS', ...Object.values(data).flatMap((record) => record.org.split('; ').map((item) => item.match(/\(([^()]+)\)\s*$/)?.[1]).filter(Boolean))]).size;
  const biggest = [...provinces].sort((a, b) => b.population - a.population);
  const figures = Object.values(data).flatMap((record) => Object.values(record).filter(Array.isArray)).flat().filter((v) => v != null).length;
  const newest = Math.max(...Object.values(data).map((record) => latest(pointsOf(record, HOME))?.year ?? 0));
  const search = searchForm();

  const gdp = indicatorById('gdp-per-person');
  const ppp = indicatorById('gdp-per-person-ppp');
  const trendSeries = [
    { id: ppp.id, label: 'Purchasing power (Int$)', color: '#1d7373', points: trimmed(pointsOf(data[ppp.id], HOME)) },
    { id: gdp.id, label: 'Current US$', color: '#c2361a', strong: true, points: trimmed(pointsOf(data[gdp.id], HOME)) },
  ];
  const readout = h('p', { class: 'readout' });
  const showReadout = (year) => {
    const y = year ?? latest(trendSeries[1].points).year;
    readout.replaceChildren(h('b', null, String(y)), ' · ', ...trendSeries.flatMap((line, i) => {
      const point = line.points.find((p) => p.year === y);
      return [i ? '  ·  ' : '', `${line.id === gdp.id ? 'US$' : 'Int$'} ${point?.value != null ? Math.round(point.value).toLocaleString('en-GB') : 'no data'}`];
    }));
  };
  const chartBox = h('div', { class: 'chart-box' });
  const first = earliest(trendSeries[1].points);
  const last = latest(trendSeries[1].points);

  view.append(
    h('section', { class: 'hero' },
      h('div', null,
        h('p', { class: 'eyebrow' }, 'Republic of Indonesia · official statistics'),
        h('h1', null, 'Indonesia in figures'),
        h('p', { class: 'counts' },
          h('span', null, h('b', null, String(INDICATORS.length)), ' indicators'),
          h('span', null, h('b', null, String(provinces.length)), ' provinces'),
          h('span', null, h('b', null, String(producers)), ' publishers'),
          h('span', null, h('b', null, CHECKS.toLocaleString('en-GB')), ' cross-checks'),
          h('span', null, h('b', null, figures.toLocaleString('en-GB')), ' figures'),
          h('span', null, h('b', null, `2000–${newest}`)))),
      search),
    h('div', { class: 'overview-grid' },
      h('section', { class: 'tiles', 'aria-label': 'Headline figures' },
        HEADLINES.map(([id, label]) => headlineTile(indicatorById(id), label, pointsOf(data[id], HOME)))),
      h('section', { class: 'leaf provinces-card' },
        h('h2', null, `${provinces.length} provinces by population`),
        tileMap(provinces, (p) => p.population, { onPick: (iso) => { location.hash = `#/province/${iso}`; }, label: 'Indonesian provinces by population' }),
        h('p', { class: 'source' }, `Most people: ${biggest[0].name}, ${(biggest[0].population / 1e6).toFixed(1)} million. Fewest: ${biggest.at(-1).name}, ${(biggest.at(-1).population / 1e6).toFixed(2)} million. `, h('a', { href: '#/provinces' }, 'All provinces, ranked'))),
      h('section', { class: 'leaf trend' },
        h('h2', null, `GDP per person, ${first.year}–${last.year}`),
        h('p', { class: 'legend' }, trendSeries.map((line) => h('span', { style: `--c:${line.color}` }, line.label))),
        chartBox,
        readout,
        h('p', { class: 'source' }, `World Bank ${gdp.code} and ${ppp.code}, current prices. `, h('a', { href: `#/indicator/${gdp.id}` }, 'Open the indicator')))),
    h('div', { class: 'section-head' }, h('h2', null, `${TOPICS.length} topics`), h('a', { href: '#/topics' }, 'All topics and indicators')),
    h('section', { class: 'topic-cards' }, TOPICS.map((topic) => topicCard(topic, data))),
  );
  mountLineChart(chartBox, { series: trendSeries, height: 196, label: 'GDP per person in Indonesia', onHover: showReadout });
  showReadout(null);
}
