// SPDX-License-Identifier: MIT
// Province compare: up to four provinces side by side, every figure with a bar scaled to the largest province shown.

import { h, setTitle } from '../core/dom.js';
import { METRICS, loadProvinces, rankProvinces } from '../core/provinces.js';
import { fixed } from '../core/format.js';
import { provinceSourceNote } from './provinces.js';

const MAX = 4;
const COLORS = ['#c2361a', '#1b1f4f', '#1d7373', '#9a6200'];

export async function render(view, route) {
  setTitle('Compare provinces');
  const { provinces, sources } = await loadProvinces();
  const known = new Set(provinces.map((p) => p.iso));
  const picked = (route.query.get('p') ?? 'JK,JB,JI').split(',').filter((iso) => known.has(iso)).slice(0, MAX);
  const go = (list) => { location.hash = `#/province-compare?p=${list.join(',')}&keep=1`; };
  const chosen = picked.map((iso) => provinces.find((p) => p.iso === iso));
  const ranks = Object.fromEntries(METRICS.map((m) => [m.id, rankProvinces(provinces, m.id)]));

  const chips = h('div', { class: 'toggles', role: 'group', 'aria-label': 'Provinces compared' },
    chosen.map((p, i) => h('button', { type: 'button', style: `--c:${COLORS[i]}`, 'aria-pressed': 'true', title: `Remove ${p.name}`, onclick: () => picked.length > 1 && go(picked.filter((iso) => iso !== p.iso)) }, `${p.name} ✕`)));
  const add = h('select', { 'aria-label': 'Add a province', onchange: (event) => { if (event.target.value) go([...picked, event.target.value]); } },
    h('option', { value: '' }, picked.length >= MAX ? `Up to ${MAX} provinces` : 'Add a province…'),
    picked.length < MAX && [...provinces].sort((a, b) => a.name.localeCompare(b.name)).filter((p) => !picked.includes(p.iso)).map((p) => h('option', { value: p.iso }, p.name)));

  view.append(
    h('p', { class: 'crumbs' }, h('a', { href: '#/provinces' }, 'Provinces'), ' › Compare'),
    h('h1', null, 'Compare provinces'),
    h('div', { class: 'filters' }, add),
    chips,
    h('section', { class: 'leaf' }, h('table', { class: 'compare-table' },
      h('thead', null, h('tr', null, h('th', null, 'Figure'), chosen.map((p, i) => h('th', { style: `border-top:4px solid ${COLORS[i]}` }, h('a', { href: `#/province/${p.iso}` }, p.name))))),
      h('tbody', null, METRICS.map((m) => {
        const top = Math.max(...chosen.map((p) => p[m.id]));
        return h('tr', null,
          h('td', null, m.label, h('br'), h('small', { class: 'muted' }, m.unit)),
          chosen.map((p, i) => h('td', null,
            h('b', null, fixed(p[m.id], m.digits)), h('small', { class: 'muted' }, ` · ${ranks[m.id].get(p.iso)} of 38`),
            h('span', { class: 'bar-track' }, h('span', { class: 'bar-fill', style: `width:${((p[m.id] / top) * 100).toFixed(1)}%;background:${COLORS[i]}` })))));
      })))),
    provinceSourceNote(sources),
  );
}
