// SPDX-License-Identifier: MIT
// Tiny element builders for HTML and SVG, so pages read as a tree of calls.

const SVG_NS = 'http://www.w3.org/2000/svg';

function build(el, attrs, children) {
  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (value == null || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2), value);
    else el.setAttribute(key === 'className' ? 'class' : key, value === true ? '' : value);
  }
  el.append(...children.flat(Infinity).filter((child) => child != null && child !== false));
  return el;
}

export const h = (tag, attrs, ...children) => build(document.createElement(tag), attrs, children);
export const s = (tag, attrs, ...children) => build(document.createElementNS(SVG_NS, tag), attrs, children);

export function setTitle(text) {
  document.title = `${text} · Lontar`;
}
