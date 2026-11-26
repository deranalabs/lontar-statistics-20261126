// SPDX-License-Identifier: MIT
// Line chart in plain SVG: gaps for missing years, nice axis ticks and a year guide that follows the pointer.

import { s } from '../core/dom.js';
import { formatAxis } from '../core/format.js';

const PAD = { l: 60, r: 18, t: 18, b: 36 };

export function niceTicks(min, max, count = 4) {
  if (min === max) [min, max] = [min - 1, max + 1];
  const rough = (max - min) / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((x) => x >= rough);
  const ticks = [];
  for (let v = Math.floor(min / step) * step; v <= Math.ceil(max / step) * step + step / 2; v += step) ticks.push(+v.toPrecision(12));
  return ticks;
}

function pathOf(points, X, Y) {
  let d = '';
  let pen = false;
  for (const p of points) {
    if (p.value == null) { pen = false; continue; }
    d += `${pen ? 'L' : 'M'}${X(p.year).toFixed(1)},${Y(p.value).toFixed(1)}`;
    pen = true;
  }
  return d;
}

// series: [{ id, label, color, points: [{ year, value }] }]. Builds at the container's own width so text stays full size.
export function mountLineChart(container, { series, height = 300, label, onHover }) {
  const width = Math.max(300, Math.round(container.clientWidth || 720));
  const years = series.flatMap((x) => x.points.map((p) => p.year));
  const values = series.flatMap((x) => x.points.filter((p) => p.value != null).map((p) => p.value));
  const x0 = Math.min(...years);
  const x1 = Math.max(...years);
  let lo = Math.min(...values);
  const hi = Math.max(...values);
  if (lo > 0 && lo < hi * 0.35) lo = 0; // start at zero when it costs little room
  const ticks = niceTicks(lo, hi);
  const [yMin, yMax] = [ticks[0], ticks.at(-1)];
  const plotW = width - PAD.l - PAD.r;
  const X = (year) => PAD.l + (x1 === x0 ? 0.5 : (year - x0) / (x1 - x0)) * plotW;
  const Y = (v) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * (height - PAD.t - PAD.b);

  const svg = s('svg', { viewBox: `0 0 ${width} ${height}`, width, height, class: 'chart', role: 'img', 'aria-label': label });
  for (const t of ticks) {
    svg.append(
      s('line', { x1: PAD.l, x2: width - PAD.r, y1: Y(t), y2: Y(t), class: t === 0 ? 'axis zero' : 'axis' }),
      s('text', { x: PAD.l - 8, y: Y(t) + 5, 'text-anchor': 'end', class: 'tick' }, formatAxis(t)),
    );
  }
  const span = x1 - x0;
  const yearStep = span <= 8 ? 1 : span <= 14 ? 2 : width < 500 ? 10 : 5;
  for (let year = Math.ceil(x0 / yearStep) * yearStep; year <= x1; year += yearStep) {
    svg.append(s('text', { x: X(year), y: height - 10, 'text-anchor': 'middle', class: 'tick' }, String(year)));
  }
  for (const line of series) {
    svg.append(s('path', { d: pathOf(line.points, X, Y), stroke: line.color, class: line.strong ? 'series strong' : 'series' }));
    if (series.length === 1) {
      for (const p of line.points) if (p.value != null) svg.append(s('circle', { cx: X(p.year), cy: Y(p.value), r: 3.2, fill: line.color, class: 'dot' }));
    }
  }

  const guide = s('line', { y1: PAD.t, y2: height - PAD.b, class: 'guide', visibility: 'hidden' });
  const yearTag = s('text', { y: PAD.t + 4, 'text-anchor': 'middle', class: 'guide-year', visibility: 'hidden' });
  const marks = series.map((line) => s('circle', { r: 6, fill: line.color, class: 'mark', visibility: 'hidden' }));
  const overlay = s('rect', { x: PAD.l, y: PAD.t, width: plotW, height: height - PAD.t - PAD.b, fill: 'transparent', class: 'hover-zone' });
  svg.append(guide, ...marks, yearTag, overlay);

  function showYear(year) {
    const hidden = year == null;
    for (const el of [guide, yearTag]) el.setAttribute('visibility', hidden ? 'hidden' : 'visible');
    if (!hidden) {
      for (const el of [guide]) el.setAttribute('x1', X(year)), el.setAttribute('x2', X(year));
      yearTag.setAttribute('x', Math.min(Math.max(X(year), PAD.l + 20), width - PAD.r - 20));
      yearTag.textContent = String(year);
    }
    series.forEach((line, i) => {
      const point = line.points.find((p) => p.year === year);
      const visible = !hidden && point?.value != null;
      marks[i].setAttribute('visibility', visible ? 'visible' : 'hidden');
      if (visible) marks[i].setAttribute('cx', X(year)), marks[i].setAttribute('cy', Y(point.value));
    });
    onHover?.(year);
  }
  const yearAt = (event) => {
    const box = svg.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * width;
    return Math.min(x1, Math.max(x0, Math.round(x0 + ((x - PAD.l) / plotW) * (x1 - x0))));
  };
  overlay.addEventListener('pointermove', (event) => showYear(yearAt(event)));
  overlay.addEventListener('pointerdown', (event) => showYear(yearAt(event)));
  overlay.addEventListener('pointerleave', () => showYear(null));

  container.replaceChildren(svg);
  return { showYear };
}
