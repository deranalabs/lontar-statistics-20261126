// SPDX-License-Identifier: MIT
// Number, unit and change wording shared by every page.

const LEVEL_UNITS = new Set(['people', 'US$', 'international $', 'passengers', '20-foot units']);
const SCALES = [[1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million']];
const compact = new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 });

const fixed = (value, digits) => value.toLocaleString('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const digitsFor = (value) => (Math.abs(value) >= 1000 ? 0 : Math.abs(value) >= 1 ? 1 : 2);

export function splitNumber(value) {
  for (const [size, word] of SCALES) {
    if (Math.abs(value) >= size) return { num: fixed(value / size, Math.abs(value / size) >= 100 ? 1 : 2), scale: word };
  }
  return { num: fixed(value, digitsFor(value)), scale: '' };
}

export function formatNumber(value) {
  if (value == null) return '—';
  const { num, scale } = splitNumber(value);
  return scale ? `${num} ${scale}` : num;
}

export function formatValue(value, unit) {
  if (value == null) return 'no data';
  const n = formatNumber(value);
  if (unit.startsWith('%')) return `${n}%`;
  if (unit === 'US$') return `US$ ${n}`;
  if (unit === 'international $') return `Int$ ${n}`;
  return `${n} ${unit}`;
}

export const formatAxis = (value) => compact.format(value);

// The big figure and the small words under it, for headline tiles.
export function headlineParts(value, unit) {
  const { num, scale } = splitNumber(value);
  if (unit.startsWith('%')) return { num: `${num}%`, note: unit.slice(1).trim() };
  return { num, note: `${scale} ${unit}`.trim() };
}

export const unitLabel = (unit) => (unit.startsWith('%') ? unit : unit === 'people' ? 'people' : unit);

// Change between two points: percent for levels, points for shares, units for everything else.
export function describeChange(indicator, from, to) {
  const diff = to.value - from.value;
  const sign = diff > 0 ? '+' : diff < 0 ? '−' : '±';
  let text;
  if (LEVEL_UNITS.has(indicator.unit)) text = from.value === 0 ? 'n/a' : `${sign}${fixed(Math.abs((diff / from.value) * 100), 1)}%`;
  else if (indicator.unit.startsWith('%')) text = `${sign}${fixed(Math.abs(diff), Math.abs(diff) < 1 ? 2 : 1)} pts`;
  else text = `${sign}${formatNumber(Math.abs(diff))} ${indicator.unit}`;
  const tone = indicator.better === 0 || diff === 0 ? 'flat' : Math.sign(diff) === indicator.better ? 'better' : 'worse';
  const arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '■';
  return { text, tone, arrow, diff };
}

// One plain sentence about the whole span between two points of a series.
export function changeSentence(indicator, first, last, previous) {
  if (!first || !last || first.year === last.year) {
    return last ? `${indicator.name} has one reported year in this range: ${formatValue(last.value, indicator.unit)} in ${last.year}.` : `No figure is reported for ${indicator.name} in this range.`;
  }
  const span = describeChange(indicator, first, last);
  const verb = span.diff > 0 ? 'rose' : span.diff < 0 ? 'fell' : 'held';
  const verdict = span.tone === 'better' ? ' That is an improvement.' : span.tone === 'worse' ? ' That is a move in the wrong direction.' : '';
  let sentence = `${indicator.name} ${verb} from ${formatValue(first.value, indicator.unit)} in ${first.year} to ${formatValue(last.value, indicator.unit)} in ${last.year} (${span.text}).${verdict}`;
  if (previous) sentence += ` The latest step, from ${previous.year}, is ${describeChange(indicator, previous, last).text}.`;
  return sentence;
}
