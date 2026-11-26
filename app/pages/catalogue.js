// SPDX-License-Identifier: MIT
// Catalogue: every indicator with its latest value and year, searchable and filterable by topic.

import { h, setTitle } from '../core/dom.js';
import { TOPICS, INDICATORS, HOME, topicById } from '../core/indicators.js';
import { loadAll, pointsOf, latest } from '../core/store.js';
import { formatValue } from '../core/format.js';

export function matches(indicator, query, topicId) {
  if (topicId && indicator.topic !== topicId) return false;
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const text = `${indicator.name} ${indicator.code} ${indicator.definition} ${topicById(indicator.topic).name}`.toLowerCase();
  return words.every((word) => text.includes(word));
}

export async function render(view, route) {
  setTitle('Catalogue');
  const data = await loadAll();
  const state = { query: route.query.get('q') ?? '', topic: route.query.get('topic') ?? '' };
  const count = h('p', { class: 'muted', 'aria-live': 'polite' });
  const body = h('tbody');
  const chips = h('div', { class: 'toggles', role: 'group', 'aria-label': 'Filter by topic' });
  const input = h('input', { type: 'search', value: state.query, placeholder: 'Search by name, code or meaning', 'aria-label': 'Search indicators',
    oninput: (event) => { state.query = event.target.value; draw(); } });

  function draw() {
    chips.replaceChildren(...[{ id: '', name: 'All topics' }, ...TOPICS].map((topic) => h('button', {
      type: 'button', 'aria-pressed': String(state.topic === topic.id), onclick: () => { state.topic = topic.id; draw(); },
    }, topic.name)));
    const rows = INDICATORS.filter((indicator) => matches(indicator, state.query, state.topic));
    count.textContent = `Showing ${rows.length} of ${INDICATORS.length} indicators`;
    body.replaceChildren(...(rows.length ? rows.map((indicator) => {
      const last = latest(pointsOf(data[indicator.id], HOME));
      return h('tr', null,
        h('td', null, h('a', { href: `#/indicator/${indicator.id}` }, indicator.name)),
        h('td', { class: 'hide-phone' }, topicById(indicator.topic).name),
        h('td', { class: 'num' }, formatValue(last.value, indicator.unit)),
        h('td', { class: 'num' }, String(last.year)),
        h('td', { class: 'hide-phone' }, h('code', null, indicator.code)));
    }) : [h('tr', null, h('td', { colspan: 5 }, `No indicator matches “${state.query}”. Try a shorter word.`))]));
  }

  view.append(
    h('p', { class: 'eyebrow' }, 'Catalogue'),
    h('h1', null, 'Every indicator'),
    h('div', { class: 'filters' }, input),
    chips,
    count,
    h('section', { class: 'leaf' }, h('table', null,
      h('thead', null, h('tr', null, h('th', null, 'Indicator'), h('th', { class: 'hide-phone' }, 'Topic'), h('th', { class: 'num' }, 'Latest'), h('th', { class: 'num' }, 'Year'), h('th', { class: 'hide-phone' }, 'Code'))),
      body)),
  );
  draw();
}
