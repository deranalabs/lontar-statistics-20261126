// SPDX-License-Identifier: MIT
// Topics: the index of every topic, and one topic's page with a chart card per indicator.

import { h, setTitle } from '../core/dom.js';
import { TOPICS, HOME, topicById } from '../core/indicators.js';
import { loadAll, loadTopic, pointsOf, trimmed, latest, earliest, previousOf } from '../core/store.js';
import { formatValue, changeSentence } from '../core/format.js';
import { changeChip, sourceLine, COUNTRY_COLORS } from '../core/widgets.js';
import { mountLineChart } from '../charts/line-chart.js';
import { sparkline } from '../charts/sparkline.js';

function topicPills(current) {
  return h('nav', { class: 'topic-pills', 'aria-label': 'Topics' },
    h('a', { href: '#/topics', 'aria-current': current ? null : 'page' }, 'All topics'),
    TOPICS.map((topic) => h('a', { href: `#/topic/${topic.id}`, 'aria-current': topic.id === current ? 'page' : null }, topic.name)));
}

function renderIndex(view, data) {
  setTitle('Topics');
  view.append(
    h('p', { class: 'eyebrow' }, 'Topics'),
    h('h1', null, `${TOPICS.length} topics, every indicator`),
    topicPills(null),
    h('div', { class: 'topic-index' }, TOPICS.map((topic) => h('section', { class: 'leaf' },
      h('h2', null, h('a', { href: `#/topic/${topic.id}` }, topic.name)),
      h('p', { class: 'muted' }, topic.blurb),
      h('ul', { class: 'indicator-list' }, topic.indicators.map((indicator) => {
        const points = trimmed(pointsOf(data[indicator.id], HOME));
        const last = latest(points);
        return h('li', null,
          h('a', { href: `#/indicator/${indicator.id}` }, indicator.name),
          h('span', { class: 'num' }, formatValue(last.value, indicator.unit), h('small', { class: 'muted' }, ` ${last.year}`)),
          sparkline(points, { width: 96, height: 24, color: COUNTRY_COLORS[HOME] }));
      }))))),
  );
}

function renderTopic(view, topic, data) {
  setTitle(topic.name);
  view.append(
    h('p', { class: 'crumbs' }, h('a', { href: '#/topics' }, 'Topics'), ' › ', topic.name),
    h('h1', null, topic.name),
    h('p', { class: 'muted' }, `${topic.blurb} ${topic.indicators.length} indicators.`),
    topicPills(topic.id),
  );
  const cards = h('div', { class: 'indicator-cards' });
  view.append(cards);
  for (const indicator of topic.indicators) {
    const points = trimmed(pointsOf(data[indicator.id], HOME));
    const last = latest(points);
    const box = h('div', { class: 'chart-box' });
    cards.append(h('section', { class: 'leaf indicator-card' },
      h('h3', null, h('a', { href: `#/indicator/${indicator.id}` }, indicator.name)),
      h('p', null, h('b', null, formatValue(last.value, indicator.unit)), ' in ', String(last.year), '  ', changeChip(indicator, previousOf(points, last.year), last)),
      box,
      h('p', { class: 'muted' }, changeSentence(indicator, earliest(points), last, null)),
      h('p', null, sourceLine(indicator, last.year), ' · ', h('a', { href: `#/indicator/${indicator.id}` }, 'Table, CSV and citation'))));
    mountLineChart(box, { series: [{ id: HOME, label: indicator.name, color: COUNTRY_COLORS[HOME], strong: true, points }], height: 190, label: indicator.name });
  }
}

export async function render(view, route) {
  const topic = route.name === 'topic' ? topicById(route.args[0]) : null;
  if (topic) renderTopic(view, topic, await loadTopic(topic.id));
  else renderIndex(view, await loadAll());
}
