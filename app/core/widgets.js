// SPDX-License-Identifier: MIT
// Small pieces several pages share: change chips, source lines and country colours.

import { h } from './dom.js';
import { describeChange } from './format.js';

export const COUNTRY_COLORS = {
  IDN: '#c2361a', MYS: '#1b1f4f', PHL: '#1d7373', THA: '#9a6200', VNM: '#7a3b7a', SGP: '#4a6a9a',
  KHM: '#5b6b1a', LAO: '#8a4b2a', MMR: '#b0466a', BRN: '#555a66', TLS: '#22703a',
};

export function changeChip(indicator, from, to, suffix = `on ${from?.year}`) {
  if (!from || !to) return h('span', { class: 'chip flat' }, 'single reported year');
  const change = describeChange(indicator, from, to);
  return h('span', { class: `chip ${change.tone}`, title: change.tone === 'better' ? 'improving' : change.tone === 'worse' ? 'worsening' : 'change' },
    change.arrow, ` ${change.text} ${suffix}`);
}

export const sourceLine = (indicator, year, withCode = true) =>
  h('span', { class: 'source', title: `World Bank WDI ${indicator.code}` }, withCode ? `${year} · World Bank ${indicator.code}` : `${year} · World Bank`);
