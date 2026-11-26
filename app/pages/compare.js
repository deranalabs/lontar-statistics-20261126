// SPDX-License-Identifier: MIT
// Compare page: Indonesia against its ASEAN neighbours for one indicator, ranked bars and lines, country toggles.

import { h, setTitle } from '../core/dom.js';
import { INDICATORS, COUNTRIES, HOME, indicatorById } from '../core/indicators.js';
import { loadIndicator, pointsOf, trimmed, latest } from '../core/store.js';
import { formatValue } from '../core/format.js';
import { COUNTRY_COLORS } from '../core/widgets.js';
import { mountLineChart } from '../charts/line-chart.js';
import { rankedBars } from '../charts/ranked-bars.js';

const COMPARABLE = INDICATORS.filter((indicator) => indicator.asean);
const DEFAULT_SHOWN = ['IDN', 'MYS', 'PHL', 'THA', 'VNM', 'KHM'];
const shown = new Set(DEFAULT_SHOWN);

export function ordinal(n) {
  const tens = n % 100;
  const suffix = tens >= 11 && tens <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

export async function render(view, route) {
  const indicator = indicatorById(route.args[0])?.asean ? indicatorById(route.args[0]) : indicatorById('life-expectancy');
  const record = await loadIndicator(indicator.id);
  setTitle(`Compare ASEAN: ${indicator.name}`);
  const countries = Object.keys(COUNTRIES).filter((code) => latest(pointsOf(record, code)));
  const latestOf = Object.fromEntries(countries.map((code) => [code, latest(pointsOf(record, code))]));

  const barsBox = h('div');
  const linesBox = h('div', { class: 'chart-box' });
  const readout = h('p', { class: 'readout' });
  const rankLine = h('p', { class: 'rank-line' });
  const toggles = h('div', { class: 'toggles', role: 'group', 'aria-label': 'Countries shown' });
  const legend = h('p', { class: 'legend' });

  const sortedAll = [...countries].sort((a, b) => latestOf[b].value - latestOf[a].value);
  const homeRank = sortedAll.indexOf(HOME) + 1;
  rankLine.replaceChildren(homeRank
    ? h('span', null, 'Indonesia ranks ', h('b', null, ordinal(homeRank)), ` of ${countries.length} ASEAN members with data, at ${formatValue(latestOf[HOME].value, indicator.unit)} in ${latestOf[HOME].year}.`)
    : 'Indonesia reports no figure for this indicator.');

  function draw() {
    const picked = countries.filter((code) => shown.has(code));
    legend.replaceChildren(...picked.map((code) => h('span', { style: `--c:${COUNTRY_COLORS[code]}` }, COUNTRIES[code])));
    barsBox.replaceChildren(rankedBars(picked.map((code) => ({ id: code, label: COUNTRIES[code], value: latestOf[code].value, year: latestOf[code].year, color: COUNTRY_COLORS[code] })), indicator.unit, HOME));
    toggles.replaceChildren(...countries.map((code) => h('button', {
      type: 'button', style: `--c:${COUNTRY_COLORS[code]}`, 'aria-pressed': String(shown.has(code)),
      onclick: () => { if (shown.has(code) && shown.size > 1) shown.delete(code); else shown.add(code); draw(); },
    }, COUNTRIES[code])));
    const series = picked.map((code) => ({ id: code, label: COUNTRIES[code], color: COUNTRY_COLORS[code], strong: code === HOME, points: trimmed(pointsOf(record, code)) }))
      .filter((line) => line.points.length);
    const years = series.flatMap((line) => line.points.map((p) => p.year));
    const [x0, x1] = [Math.min(...years), Math.max(...years)];
    for (const line of series) line.points = Array.from({ length: x1 - x0 + 1 }, (_, i) => line.points.find((p) => p.year === x0 + i) ?? { year: x0 + i, value: null });
    const showReadout = (year) => {
      const y = year ?? x1;
      readout.replaceChildren(h('b', null, String(y)), ': ', series.map((line, i) => {
        const point = line.points.find((p) => p.year === y);
        return `${i ? ' · ' : ''}${line.label} ${point?.value != null ? formatValue(point.value, indicator.unit) : 'n/a'}`;
      }).join(''));
    };
    mountLineChart(linesBox, { series, height: 280, label: `${indicator.name} in ASEAN`, onHover: showReadout });
    showReadout(null);
  }

  view.append(
    h('div', { class: 'indicator-head' },
      h('div', null, h('p', { class: 'eyebrow' }, 'Compare ASEAN · Indonesia and its neighbours'), h('h1', null, indicator.name)),
      h('label', null, 'Indicator ',
        h('select', { onchange: (event) => { location.hash = `#/compare/${event.target.value}`; } },
          COMPARABLE.map((item) => h('option', { value: item.id, selected: item.id === indicator.id }, item.name))))),
    toggles,
    h('div', { class: 'compare-grid' },
      h('section', { class: 'leaf' }, h('h3', null, 'Latest reported value, ranked'), rankLine, barsBox,
        h('p', { class: 'source' }, `Each bar uses that country's latest year. World Bank ${indicator.code}, unit: ${indicator.unit}.`)),
      h('section', { class: 'leaf' }, h('h3', null, 'Every year since 2000'),
        legend, linesBox, readout,
        h('p', null, h('a', { href: `#/indicator/${indicator.id}` }, `Indonesia's full series, definition and CSV`)))),
  );
  draw();
}
