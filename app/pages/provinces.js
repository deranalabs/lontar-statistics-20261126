// SPDX-License-Identifier: MIT
// Provinces page: tile map shaded by one metric, and a ranking table of all 38 provinces that sorts on any column.

import { h, setTitle } from '../core/dom.js';
import { METRICS, metricById, formatMetric, loadProvinces, rankProvinces } from '../core/provinces.js';
import { fixed } from '../core/format.js';
import { tileMap, bandColors } from '../charts/tile-map.js';

const COLUMNS = ['population', 'density', 'hdi', 'lifeExpectancy', 'grpPerPerson'];
const SHORT = { population: 'People', density: 'Per km²', hdi: 'HDI', lifeExpectancy: 'Life exp.', grpPerPerson: 'US$ a head' };

export function provinceSourceNote(sources) {
  return h('p', { class: 'source' }, 'Figures: Statistics Indonesia (BPS) as tabulated on English Wikipedia (CC BY-SA 4.0), pages ',
    ...['area', 'hdi', 'grp'].flatMap((key, i) => [i ? ', ' : '', `“${sources[key].title}” (revision ${sources[key].revision})`]),
    '. Retrieved 27 November 2026. Output per person is regional output in US$ divided by population.');
}

export async function render(view, route) {
  setTitle('Provinces');
  const { provinces, sources } = await loadProvinces();
  const state = { metric: metricById(route.query.get('metric')) ? route.query.get('metric') : 'population', sort: 'population', down: true, text: '' };
  const mapBox = h('div', { class: 'map-box' });
  const legend = h('p', { class: 'band-legend' });
  const caption = h('p', { class: 'muted' });
  const body = h('tbody');
  const head = h('tr');
  const pick = (iso) => { location.hash = `#/province/${iso}`; };

  function draw() {
    const metric = metricById(state.metric);
    mapBox.replaceChildren(tileMap(provinces, (p) => p[state.metric], { onPick: pick, label: `Indonesian provinces shaded by ${metric.label}` }));
    const top = [...provinces].sort((a, b) => b[state.metric] - a[state.metric]);
    caption.textContent = `Shaded by ${metric.label.toLowerCase()} (${metric.unit}). Highest: ${top[0].name}, ${formatMetric(metric, top[0][state.metric])}. Lowest: ${top.at(-1).name}, ${formatMetric(metric, top.at(-1)[state.metric])}.`;
    legend.replaceChildren(h('span', null, 'lowest fifth'), ...bandColors.map((c) => h('i', { style: `background:${c}` })), h('span', null, 'highest fifth'));

    head.replaceChildren(h('th', { class: 'num' }, '#'), h('th', null, 'Province'), ...COLUMNS.map((id) => {
      const m = metricById(id);
      const on = state.sort === id;
      return h('th', { class: 'num', 'aria-sort': on ? (state.down ? 'descending' : 'ascending') : 'none' },
        h('button', { type: 'button', class: 'th-sort', onclick: () => { state.down = on ? !state.down : true; state.sort = id; draw(); } },
          SHORT[id], on ? (state.down ? ' ▼' : ' ▲') : ''));
    }));
    const order = rankProvinces(provinces, state.sort);
    const words = state.text.toLowerCase().split(/\s+/).filter(Boolean);
    const rows = provinces
      .filter((p) => words.every((w) => `${p.name} ${p.region} ${p.iso}`.toLowerCase().includes(w)))
      .sort((a, b) => (state.down ? b[state.sort] - a[state.sort] : a[state.sort] - b[state.sort]));
    body.replaceChildren(...rows.map((p) => h('tr', null,
      h('td', { class: 'num' }, String(order.get(p.iso))),
      h('td', null, h('a', { href: `#/province/${p.iso}` }, p.name), h('br'), h('small', { class: 'muted' }, p.region)),
      ...COLUMNS.map((id) => h('td', { class: 'num' }, fixed(p[id], metricById(id).digits))))));
    if (!rows.length) body.replaceChildren(h('tr', null, h('td', { colspan: 7 }, `No province matches “${state.text}”.`)));
  }

  view.append(
    h('p', { class: 'eyebrow' }, 'Provinces · all 38'),
    h('h1', null, 'Indonesia by province'),
    h('div', { class: 'filters' },
      h('label', null, 'Shade the map by ',
        h('select', { onchange: (event) => { state.metric = event.target.value; draw(); } },
          METRICS.filter((m) => m.id !== 'grpRp').map((m) => h('option', { value: m.id, selected: m.id === state.metric }, `${m.label} (${m.unit})`)))),
      h('a', { class: 'button ghost', href: '#/province-compare?p=JK,JB,JI' }, 'Compare provinces')),
    h('div', { class: 'province-grid' },
      h('section', { class: 'leaf' }, h('h2', null, 'Tile map'), caption, mapBox, legend,
        h('p', { class: 'source' }, 'Each square is one province, placed roughly where it lies. Select a square to open its page.')),
      h('section', { class: 'leaf' }, h('h2', null, 'Ranking'),
        h('div', { class: 'filters' }, h('input', { type: 'search', placeholder: 'Find a province', 'aria-label': 'Find a province', oninput: (event) => { state.text = event.target.value; draw(); } })),
        h('div', { class: 'year-table-wrap' }, h('table', { class: 'rank-table' }, h('thead', null, head), body)))),
    provinceSourceNote(sources),
  );
  draw();
}
