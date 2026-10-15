/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-app. Base: columns. Source: https://www.frostbank.com/
 * Block structure (blocks/columns-app): 1 row, 2 cells
 *   [h2, paragraph, linked badge images] | [device image]
 * Source selectors (validated in block-context/columns-app/source.html):
 *   text column: :scope > div containing .header-1 - heading p.header-1, copy p, badges a[href] > img
 *   image column: other :scope > div - first img (.d-xxl-block twin removed by cleanup transformer,
 *   and only one image is taken here in case it is still present)
 */
export default function parse(element, { document }) {
  const columns = [...element.querySelectorAll(':scope > div')];
  const headingSrc = element.querySelector('.header-1, .header-2, h1, h2');
  const textCol = columns.find((c) => headingSrc && c.contains(headingSrc))
    || columns.find((c) => c.querySelector('a[href]')) || element;
  const imageCol = columns.find((c) => c !== textCol && c.querySelector('img'));

  // ---- Text cell ----
  const textCell = [];
  if (headingSrc) {
    const h2 = document.createElement('h2');
    h2.textContent = headingSrc.textContent.trim();
    textCell.push(h2);
  }
  [...textCol.querySelectorAll('p')]
    .filter((p) => p !== headingSrc && p.textContent.trim())
    .forEach((src) => {
      const p = document.createElement('p');
      p.textContent = src.textContent.replace(/\s+/g, ' ').trim();
      textCell.push(p);
    });
  [...textCol.querySelectorAll('a[href]')].forEach((link) => {
    const badge = link.querySelector('img');
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    if (badge) {
      const img = document.createElement('img');
      img.src = badge.getAttribute('src');
      img.alt = badge.getAttribute('alt') || '';
      a.append(img);
    } else {
      a.textContent = link.textContent.trim();
    }
    p.append(a);
    textCell.push(p);
  });

  // ---- Image cell ----
  const imageCell = [];
  const deviceImg = imageCol ? imageCol.querySelector('img') : null;
  if (deviceImg) {
    if (!deviceImg.hasAttribute('alt')) deviceImg.setAttribute('alt', '');
    imageCell.push(deviceImg);
  }

  if (!textCell.length && !imageCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[textCell.length ? textCell : '', imageCell.length ? imageCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-app', cells });
  element.replaceWith(block);
}
