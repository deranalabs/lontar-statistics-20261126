// SPDX-License-Identifier: MIT
// Hash router: picks the page for the current address, loads it with import() and marks the active link.

const PAGES = {
  '': () => import('../pages/overview.js'),
  topics: () => import('../pages/topics.js'),
  topic: () => import('../pages/topics.js'),
  indicator: () => import('../pages/indicator.js'),
  compare: () => import('../pages/compare.js'),
  catalogue: () => import('../pages/catalogue.js'),
  sources: () => import('../pages/sources.js'),
};

export function parseRoute(hash) {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const [name = '', ...args] = path.split('/').filter(Boolean);
  return { name: name in PAGES ? name : '', args: args.map(decodeURIComponent), query: new URLSearchParams(query) };
}

function markNav(name) {
  for (const link of document.querySelectorAll('#nav a')) {
    const active = link.dataset.route.split(' ').includes(name);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

let renderCount = 0;
async function render() {
  const route = parseRoute(location.hash);
  const ticket = ++renderCount;
  markNav(route.name);
  const view = document.getElementById('view');
  view.setAttribute('aria-busy', 'true');
  try {
    const page = await PAGES[route.name]();
    if (ticket !== renderCount) return; // a newer address won
    view.replaceChildren();
    await page.render(view, route);
    if (!route.query.has('keep')) window.scrollTo(0, 0);
  } catch (error) {
    view.replaceChildren(Object.assign(document.createElement('p'), { className: 'error', textContent: `This page could not be shown: ${error.message}` }));
    console.error(error);
  } finally {
    view.removeAttribute('aria-busy');
  }
}

window.addEventListener('hashchange', render);
render();
