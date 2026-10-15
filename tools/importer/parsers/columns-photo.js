/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-photo. Base: columns. Source: https://www.frostbank.com/
 * Block structure (blocks/columns-photo): 1 row, 2 cells
 *   [photo, caption paragraph (<strong>label</strong> credit)] | [h2, paragraph, <strong>primary CTA</strong>, <em>secondary CTA</em>]
 * Source selectors (validated in block-context/columns-photo/source.html):
 *   photo column: :scope > div with img; caption: .header-5 (label) + following .cta (credit)
 *   text column: .header-1 heading, div.pb-16 copy, a.btn-primary, a.btn-secondary
 */
export default function parse(element, { document }) {
  const columns = [...element.querySelectorAll(':scope > div')];
  const photoCol = columns.find((c) => c.querySelector('img')) || element;
  const textCol = columns.find((c) => c !== photoCol && c.querySelector('.header-1, .header-2, h1, h2, a')) || element;

  // ---- Photo cell ----
  const photoCell = [];
  const img = photoCol.querySelector('img');
  if (img) {
    if (!img.hasAttribute('alt')) img.setAttribute('alt', '');
    photoCell.push(img);
  }
  const label = photoCol.querySelector('.header-5, .header-4, strong');
  const creditParts = [...photoCol.querySelectorAll('div, p')]
    .filter((el) => el !== label && !el.contains(label) && !el.querySelector('div, p, img') && el.textContent.trim());
  if (label || creditParts.length) {
    const p = document.createElement('p');
    if (label) {
      const strong = document.createElement('strong');
      strong.textContent = label.textContent.trim();
      p.append(strong);
    }
    creditParts.forEach((c) => {
      p.append(document.createTextNode(` ${c.textContent.trim()}`));
    });
    photoCell.push(p);
  }

  // ---- Text cell ----
  const textCell = [];
  const headingSrc = textCol.querySelector('.header-1, .header-2, h1, h2, h3');
  if (headingSrc) {
    const h2 = document.createElement('h2');
    h2.textContent = headingSrc.textContent.trim();
    textCell.push(h2);
  }
  [...textCol.querySelectorAll(':scope > div, :scope > p')]
    .filter((el) => el !== headingSrc && el.textContent.trim())
    .forEach((el) => {
      const p = document.createElement('p');
      p.textContent = el.textContent.replace(/\s+/g, ' ').trim();
      textCell.push(p);
    });
  const ctas = [...textCol.querySelectorAll('a[href]')];
  ctas.forEach((cta, i) => {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = cta.textContent.trim();
    // primary -> <strong>, secondary -> <em> (EDS button conventions)
    const isSecondary = cta.classList.contains('btn-secondary') || (i > 0 && !cta.classList.contains('btn-primary'));
    const wrap = document.createElement(isSecondary ? 'em' : 'strong');
    wrap.append(a);
    p.append(wrap);
    textCell.push(p);
  });

  if (!photoCell.length && !textCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[photoCell.length ? photoCell : '', textCell.length ? textCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-photo', cells });
  element.replaceWith(block);
}
