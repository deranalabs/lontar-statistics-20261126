// SPDX-License-Identifier: MIT
// The province layer: loads the 38 province rows, names their metrics and ranks them.

import { fixed } from './format.js';

export const METRICS = [
  { id: 'population', label: 'Population', unit: 'people', digits: 0, source: 'area' },
  { id: 'area', label: 'Land area', unit: 'km²', digits: 0, source: 'area' },
  { id: 'density', label: 'Density', unit: 'people per km²', digits: 0, source: 'area' },
  { id: 'hdi', label: 'Human Development Index', unit: 'index, 0 to 1', digits: 3, source: 'hdi' },
  { id: 'lifeExpectancy', label: 'Life expectancy', unit: 'years', digits: 1, source: 'hdi' },
  { id: 'meanSchooling', label: 'Mean years of schooling', unit: 'years', digits: 1, source: 'hdi' },
  { id: 'expectedSchooling', label: 'Expected years of schooling', unit: 'years', digits: 1, source: 'hdi' },
  { id: 'expenditure', label: 'Spending per person', unit: 'thousand Rp a year', digits: 0, source: 'hdi' },
  { id: 'grpRp', label: 'Regional output (GRP)', unit: 'Rp billion', digits: 0, source: 'grp' },
  { id: 'grpUsd', label: 'Regional output (GRP)', unit: 'US$ billion', digits: 1, source: 'grp' },
  { id: 'grpPerPerson', label: 'Output per person', unit: 'US$', digits: 0, source: 'grp', derived: 'GRP in US$ divided by population' },
];
export const metricById = (id) => METRICS.find((m) => m.id === id);
export const formatMetric = (metric, value) => `${fixed(value, metric.digits)} ${metric.unit}`;

let cache;
export async function loadProvinces() {
  cache ??= import('../data/provinces.js').then(({ KEYS, SOURCES, default: rows }) => {
    const provinces = rows.map((row) => {
      const p = Object.fromEntries(KEYS.map((key, i) => [key, row[i]]));
      p.grpPerPerson = Math.round((p.grpUsd * 1e9) / p.population);
      return p;
    });
    return { provinces, sources: SOURCES };
  });
  return cache;
}

// Ranks 1..n, highest first, for one metric. Ties share the better rank.
export function rankProvinces(provinces, metricId) {
  const sorted = [...provinces].sort((a, b) => b[metricId] - a[metricId]);
  return new Map(sorted.map((p) => [p.iso, 1 + sorted.findIndex((q) => q[metricId] === p[metricId])]));
}
