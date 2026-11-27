// SPDX-License-Identifier: MIT
// One ranking computation for every page: latest reported value per country, highest first, Indonesia's place in it.

import { HOME } from './indicators.js';
import { pointsOf, latest } from './store.js';

export const ordinal = (n) => {
  const tens = n % 100;
  const suffix = tens >= 11 && tens <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] ?? 'th';
  return `${n}${suffix}`;
};

// group: { code: name }. Returns every member that reports a figure, ranked; the sentence and any list read from this.
export function rankGroup(record, group) {
  const rows = Object.entries(group)
    .map(([code, name]) => ({ code, name, point: latest(pointsOf(record, code)) }))
    .filter((row) => row.point)
    .sort((a, b) => b.point.value - a.point.value)
    .map((row, i) => ({ ...row, rank: i + 1 }));
  return { rows, home: rows.find((row) => row.code === HOME), size: Object.keys(group).length };
}
