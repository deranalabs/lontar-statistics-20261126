// SPDX-License-Identifier: MIT
// Tile-grid map of Indonesia: one square per province, placed roughly where it lies, shaded by one metric.
// The layout is drawn for Lontar (ISO code: [column, row]); it shows neighbourhood, not borders or area.

import { s } from '../core/dom.js';

const GRID = {
  AC: [0, 0], SU: [0, 1], RI: [1, 1], KR: [2, 1], SB: [0, 2], JA: [1, 2], BB: [2, 2], BE: [0, 3], SS: [1, 3], LA: [1, 4],
  KB: [3, 2], KT: [4, 2], KU: [5, 1], KI: [5, 2], KS: [4, 3],
  BT: [1, 5], JK: [2, 5], JB: [3, 5], JT: [4, 5], YO: [4, 6], JI: [5, 5], BA: [6, 5], NB: [7, 5], NT: [8, 5],
  SA: [8, 0], GO: [8, 1], ST: [7, 2], SR: [6, 2], SN: [6, 3], SG: [7, 3],
  MU: [9, 1], MA: [9, 3],
  PD: [10, 1], PB: [11, 1], PA: [12, 1], PT: [11, 2], PE: [12, 2], PS: [12, 3],
};
export const GRID_COLUMNS = 13;
export const GRID_ROWS = 7;

// Light to dark indigo; a value goes to one of five bands by its rank, so every band holds about the same number of provinces.
const BANDS = ['#efe0b6', '#d3d4e0', '#a6a9cc', '#6e73a8', '#2d3170'];

// rows: provinces with .iso; valueOf(row) is the shaded number; onPick(iso) runs on click or Enter.
export function tileMap(rows, valueOf, { selected = [], onPick, size = 58, label = 'Map of Indonesian provinces' } = {}) {
  const sorted = [...rows].sort((a, b) => valueOf(a) - valueOf(b));
  const band = new Map(sorted.map((row, i) => [row.iso, Math.min(4, Math.floor((i / sorted.length) * 5))]));
  const gap = 4;
  const svg = s('svg', { viewBox: `0 0 ${GRID_COLUMNS * size} ${GRID_ROWS * size}`, class: 'tile-map', role: 'group', 'aria-label': label });
  for (const row of rows) {
    const [c, r] = GRID[row.iso];
    const b = band.get(row.iso);
    const on = selected.includes(row.iso);
    const tile = s('g', {
      class: on ? 'tile-cell on' : 'tile-cell', tabindex: 0, role: 'link', 'aria-label': `${row.name}`,
      onclick: () => onPick?.(row.iso),
      onkeydown: (event) => { if (event.key === 'Enter') onPick?.(row.iso); },
    },
      s('title', null, row.name),
      s('rect', { x: c * size + gap / 2, y: r * size + gap / 2, width: size - gap, height: size - gap, rx: 8, fill: BANDS[b] }),
      s('text', { x: c * size + size / 2, y: r * size + size / 2 + 6, 'text-anchor': 'middle', fill: b >= 3 ? '#fbf2d8' : '#1b1f4f' }, row.iso));
    svg.append(tile);
  }
  return svg;
}

export const bandColors = BANDS;
