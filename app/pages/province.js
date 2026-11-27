// SPDX-License-Identifier: MIT
// One province: its figures, each with its rank among the 38 provinces, its place on the map and its region's neighbours.

import { h, setTitle } from '../core/dom.js';
import { METRICS, formatMetric, loadProvinces, rankProvinces } from '../core/provinces.js';
import { ordinal } from '../core/rank.js';
import { fixed } from '../core/format.js';
import { tileMap } from '../charts/tile-map.js';
import { provinceSourceNote } from './provinces.js';

const HEADLINES = ['population', 'hdi', 'grpPerPerson', 'lifeExpectancy'];

export async function render(view, route) {
  const { provinces, sources } = await loadProvinces();
  const province = provinces.find((p) => p.iso === route.args[0]) ?? provinces[0];
  setTitle(province.name);
  const ranks = Object.fromEntries(METRICS.map((m) => [m.id, rankProvinces(provinces, m.id).get(province.iso)]));
  const total = provinces.length;
  const same = provinces.filter((p) => p.region === province.region && p.iso !== province.iso);
  const share = (province.population / provinces.reduce((sum, p) => sum + p.population, 0)) * 100;

  const tile = (id) => {
    const metric = METRICS.find((m) => m.id === id);
    const [num, ...unit] = formatMetric(metric, province[id]).split(' ');
    return h('div', { class: 'leaf tile' },
      h('span', { class: 'tile-label' }, metric.label),
      h('span', { class: 'tile-value' }, num),
      h('span', { class: 'tile-note' }, unit.join(' ')),
      h('span', { class: 'chip flat' }, `${ordinal(ranks[id])} of ${total}`));
  };

  view.append(
    h('p', { class: 'crumbs' }, h('a', { href: '#/provinces' }, 'Provinces'), ` › ${province.name}`),
    h('div', { class: 'indicator-head' },
      h('div', null, h('p', { class: 'eyebrow' }, `${province.region} · ISO ID-${province.iso} · code ${province.code}`), h('h1', null, province.name)),
      h('a', { class: 'button', href: `#/province-compare?p=${province.iso},${same[0]?.iso ?? 'JK'}` }, 'Compare with another province')),
    h('p', { class: 'what-changed' }, `${province.name} has ${fixed(province.population, 0)} people, ${fixed(share, 1)}% of the 38-province total, on ${fixed(province.area, 0)} km². It ranks ${ordinal(ranks.hdi)} of ${total} on the Human Development Index (${fixed(province.hdi, 3)}) and ${ordinal(ranks.grpPerPerson)} on output per person. It has ${province.regencies} regencies${province.cities ? ` and ${province.cities} cities` : ''}.`),
    h('section', { class: 'tiles four', 'aria-label': 'Headline figures' }, HEADLINES.map(tile)),
    h('div', { class: 'indicator-grid' },
      h('section', { class: 'leaf' }, h('h2', null, 'Every figure and its rank'),
        h('table', null,
          h('thead', null, h('tr', null, h('th', null, 'Figure'), h('th', { class: 'num' }, 'Value'), h('th', { class: 'num' }, 'Rank of 38'))),
          h('tbody', null, METRICS.map((m) => h('tr', null,
            h('td', null, m.label, m.derived ? h('small', { class: 'muted' }, ` (${m.derived})`) : '', h('br'), h('small', { class: 'muted' }, m.unit)),
            h('td', { class: 'num' }, fixed(province[m.id], m.digits)),
            h('td', { class: 'num' }, `${ranks[m.id]}`)))))),
      h('div', null,
        h('section', { class: 'leaf' }, h('h3', null, 'Where it lies'),
          tileMap(provinces, (p) => p.population, { selected: [province.iso], onPick: (iso) => { location.hash = `#/province/${iso}`; }, label: `Map with ${province.name} marked` }),
          h('p', { class: 'source' }, 'Outlined square: this province. Shade: population.')),
        h('section', { class: 'leaf' }, h('h3', null, `Others in ${province.region}`),
          h('ul', { class: 'indicator-list' }, same.map((p) => h('li', null,
            h('a', { href: `#/province/${p.iso}` }, p.name), h('span', { class: 'muted' }, `HDI ${fixed(p.hdi, 3)}`), h('span', null)))),
          !same.length && h('p', { class: 'muted' }, 'No other province in this region.')))),
    provinceSourceNote(sources),
  );
}
