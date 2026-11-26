// SPDX-License-Identifier: MIT
// Small trend line for cards and tables; missing years break the line.

import { s } from '../core/dom.js';

export function sparkline(points, { width = 120, height = 34, color = 'currentColor' } = {}) {
  const known = points.filter((p) => p.value != null);
  const svg = s('svg', { viewBox: `0 0 ${width} ${height}`, width, height, class: 'spark', 'aria-hidden': 'true' });
  if (known.length < 2) return svg;
  const [x0, x1] = [points[0].year, points.at(-1).year];
  const lo = Math.min(...known.map((p) => p.value));
  const hi = Math.max(...known.map((p) => p.value));
  const X = (year) => 2 + ((year - x0) / (x1 - x0 || 1)) * (width - 4);
  const Y = (v) => height - 3 - ((v - lo) / (hi - lo || 1)) * (height - 6);
  let d = '';
  let pen = false;
  for (const p of points) {
    if (p.value == null) { pen = false; continue; }
    d += `${pen ? 'L' : 'M'}${X(p.year).toFixed(1)},${Y(p.value).toFixed(1)}`;
    pen = true;
  }
  const last = known.at(-1);
  svg.append(s('path', { d, stroke: color, class: 'spark-line' }), s('circle', { cx: X(last.year), cy: Y(last.value), r: 2.6, fill: color }));
  return svg;
}
