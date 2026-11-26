// SPDX-License-Identifier: MIT
// Indicator page: chart with year hover and range, every year in a table, definition, source, CSV and citation.

import { h, setTitle } from '../core/dom.js';
import { HOME, INDICATORS, indicatorById, topicById } from '../core/indicators.js';
import { loadIndicator, pointsOf, trimmed, latest, earliest, previousOf, reported } from '../core/store.js';
import { formatValue, headlineParts, changeSentence, describeChange } from '../core/format.js';
import { changeChip, COUNTRY_COLORS } from '../core/widgets.js';
import { mountLineChart } from '../charts/line-chart.js';
import { RETRIEVED } from '../data/retrieval.js';

export function toCsv(indicator, points) {
  const rows = points.map((p) => `${p.year},${indicator.code},${HOME},${p.value ?? ''}`);
  return ['year,indicator_code,country,value', ...rows].join('\n') + '\n';
}

export function citationOf(indicator, record) {
  return `World Bank (${record.updated.slice(0, 4)}). ${indicator.name}, Indonesia [${indicator.code}]. World Development Indicators, last updated ${record.updated}. Retrieved ${RETRIEVED} through Lontar. Licence: CC BY 4.0.`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = h('textarea', { class: 'offscreen' });
    area.value = text;
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

function yearTable(indicator, points) {
  return h('table', null,
    h('thead', null, h('tr', null, h('th', null, 'Year'), h('th', { class: 'num' }, 'Value'), h('th', { class: 'num' }, 'Change'))),
    h('tbody', null, [...points].reverse().map((p) => {
      if (p.value == null) return h('tr', { class: 'gap' }, h('td', null, String(p.year)), h('td', { class: 'num' }, 'not reported'), h('td', { class: 'num' }, '—'));
      const before = previousOf(points, p.year);
      const change = before ? describeChange(indicator, before, p) : null;
      return h('tr', null, h('td', null, String(p.year)), h('td', { class: 'num' }, formatValue(p.value, indicator.unit)),
        h('td', { class: 'num' }, h('span', { class: `chip ${change?.tone ?? 'flat'}` }, change ? `${change.arrow} ${change.text}` : 'first year')));
    })));
}

export async function render(view, route) {
  const indicator = indicatorById(route.args[0]) ?? INDICATORS[0];
  const topic = topicById(indicator.topic);
  const record = await loadIndicator(indicator.id);
  const points = trimmed(pointsOf(record, HOME));
  const last = latest(points);
  const years = points.map((p) => p.year);
  setTitle(indicator.name);

  const range = { from: years[0], to: years.at(-1) };
  const chartBox = h('div', { class: 'chart-box' });
  const readout = h('p', { class: 'readout' });
  const sentence = h('p', { class: 'what-changed' });
  const yearSelect = (key, labelText) => h('label', null, `${labelText} `,
    h('select', { 'aria-label': `${labelText} year`, onchange: (event) => { range[key] = Number(event.target.value); draw(); } },
      years.map((year) => h('option', { value: year, selected: year === range[key] }, String(year)))));
  const fromSelect = yearSelect('from', 'From');
  const toSelect = yearSelect('to', 'To');

  function showReadout(year) {
    const point = points.find((p) => p.year === (year ?? range.to));
    const shown = point?.value != null ? point : latest(points.filter((p) => p.year <= range.to));
    readout.replaceChildren(year == null ? 'Latest in range: ' : 'Pointer on ', h('b', null, String(point?.year ?? shown.year)), ': ',
      point?.value != null ? formatValue(point.value, indicator.unit) : 'not reported (shown as a gap)');
  }
  function draw() {
    if (range.from > range.to) [range.from, range.to] = [range.to, range.from];
    fromSelect.querySelector('select').value = range.from;
    toSelect.querySelector('select').value = range.to;
    const inRange = points.filter((p) => p.year >= range.from && p.year <= range.to);
    const end = latest(inRange);
    sentence.textContent = changeSentence(indicator, earliest(inRange), end, end && previousOf(inRange, end.year));
    mountLineChart(chartBox, { series: [{ id: HOME, label: indicator.name, color: COUNTRY_COLORS[HOME], strong: true, points: inRange }], height: 262, label: indicator.name, onHover: showReadout });
    showReadout(null);
  }

  const citation = citationOf(indicator, record);
  const copyButton = h('button', { type: 'button', class: 'ghost', onclick: async () => {
    const ok = await copyText(citation);
    copyButton.textContent = ok ? 'Citation copied ✓' : 'Copy failed: select the text below';
    setTimeout(() => { copyButton.textContent = 'Copy citation'; }, 2500);
  } }, 'Copy citation');
  const csvButton = h('button', { type: 'button', onclick: () => {
    const link = h('a', { href: URL.createObjectURL(new Blob([toCsv(indicator, points)], { type: 'text/csv' })), download: `lontar-${indicator.code}-IDN.csv` });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  } }, '⇩ Download CSV');
  const { num, note } = headlineParts(last.value, indicator.unit);
  const gaps = points.length - reported(points).length;

  view.append(
    h('p', { class: 'crumbs' }, h('a', { href: '#/topics' }, 'Topics'), ' › ', h('a', { href: `#/topic/${topic.id}` }, topic.name), ' › ', indicator.name),
    h('div', { class: 'indicator-head' },
      h('div', null, h('p', { class: 'eyebrow' }, `${topic.name} · ${indicator.code}`), h('h1', null, indicator.name), h('p', { class: 'muted' }, `Unit: ${indicator.unit}`)),
      h('div', { class: 'big-figure' },
        h('div', { class: 'tile-value' }, num), h('div', { class: 'tile-note' }, `${note} · ${last.year}`),
        changeChip(indicator, previousOf(points, last.year), last))),
    h('div', { class: 'indicator-grid' },
      h('div', null,
        h('section', { class: 'leaf' },
          h('div', { class: 'controls' }, h('strong', null, 'Years shown'), fromSelect, toSelect,
            h('button', { type: 'button', class: 'ghost', onclick: () => { range.from = years[0]; range.to = years.at(-1); draw(); } }, 'All years')),
          chartBox, readout, sentence,
          h('div', { class: 'actions' }, csvButton, copyButton,
            indicator.asean ? h('a', { class: 'button ghost', href: `#/compare/${indicator.id}` }, 'Compare with ASEAN') : null)),
        h('div', { class: 'facts' },
          h('section', { class: 'leaf' }, h('h3', null, 'What it measures'), h('p', null, indicator.definition),
            gaps ? h('p', { class: 'muted' }, `${gaps} of ${points.length} years are not reported and show as gaps, never as zero.`) : null),
          h('section', { class: 'leaf' }, h('h3', null, 'Source'),
            h('p', null, `World Bank, World Development Indicators, series ${indicator.code}. Original producer: ${record.org}`),
            h('p', { class: 'muted' }, `Last updated ${record.updated}; retrieved ${RETRIEVED}. Licence CC BY 4.0.`))),
        h('p', { class: 'citation' }, h('b', null, 'Cite as: '), citation)),
      h('section', { class: 'leaf' }, h('h3', null, `Every year, ${years[0]}–${years.at(-1)}`),
        h('div', { class: 'year-table-wrap' }, yearTable(indicator, points)))),
  );
  draw();
}
