// SPDX-License-Identifier: MIT
// Loads the topic data modules on demand and turns stored arrays into year/value points.

import { TOPICS, indicatorById } from './indicators.js';

const LOADERS = {
  people: () => import('../data/people.js'),
  economy: () => import('../data/economy.js'),
  work: () => import('../data/work.js'),
  health: () => import('../data/health.js'),
  education: () => import('../data/education.js'),
  environment: () => import('../data/environment.js'),
  digital: () => import('../data/digital.js'),
};
const cache = new Map();

export async function loadTopic(topicId) {
  if (!cache.has(topicId)) cache.set(topicId, LOADERS[topicId]().then((module) => module.default));
  return cache.get(topicId);
}

export async function loadAll() {
  const tables = await Promise.all(TOPICS.map((topic) => loadTopic(topic.id)));
  return Object.assign({}, ...tables);
}

export async function loadIndicator(id) {
  return (await loadTopic(indicatorById(id).topic))[id];
}

// Every year from the record's start to its end; a year nobody reported keeps value null (drawn as a gap).
export function pointsOf(record, country) {
  const values = record?.[country] ?? [];
  return values.map((value, i) => ({ year: record.start + i, value }));
}

export const reported = (points) => points.filter((p) => p.value != null);
export const latest = (points) => reported(points).at(-1);
export const earliest = (points) => reported(points)[0];
export function previousOf(points, year) {
  return reported(points).filter((p) => p.year < year).at(-1);
}

// The points between the first and last reported years, gaps kept.
export function trimmed(points) {
  const first = earliest(points);
  const last = latest(points);
  return first ? points.filter((p) => p.year >= first.year && p.year <= last.year) : [];
}
