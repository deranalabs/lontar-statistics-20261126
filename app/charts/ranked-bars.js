// SPDX-License-Identifier: MIT
// Ranked horizontal bars: one row per country, largest value first, each value with its own year.

import { h } from '../core/dom.js';
import { formatValue } from '../core/format.js';

// rows: [{ id, label, value, year, color }]
export function rankedBars(rows, unit, highlight) {
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const max = Math.max(...sorted.map((row) => Math.abs(row.value))) || 1;
  return h('ol', { class: 'bars' }, sorted.map((row, i) =>
    h('li', { class: row.id === highlight ? 'bar-row home' : 'bar-row' },
      h('span', { class: 'bar-rank' }, String(i + 1)),
      h('span', { class: 'bar-name' }, row.label),
      h('span', { class: 'bar-track' },
        h('span', { class: row.value < 0 ? 'bar-fill negative' : 'bar-fill', style: `width:${((Math.abs(row.value) / max) * 100).toFixed(1)}%;background:${row.color}` })),
      h('span', { class: 'bar-value' }, formatValue(row.value, unit), h('small', null, ` ${row.year}`)))));
}
