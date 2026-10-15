/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-contact. Base: columns. Source: https://www.frostbank.com/
 * Block structure (blocks/columns-contact): 1 row, 2 cells
 *   [photo] | [h2, paragraph, primary CTA (strong), secondary CTA (em)]
 * Source selectors (validated in block-context/columns-contact/source.html + live page):
 *   photo: .d-md-block img (first one; the second is a mirrored role="presentation" duplicate)
 *   text column: div containing .header-1 - heading .header-1, p, a.btn-primary / a.btn-secondary
 *   the text column's own <img> (white.png background swatch) is decorative chrome and skipped.
 *   Mobile twin row (.row.d-md-none.flex-nowrap) is removed by the cleanup transformer.
 */
export default function parse(element, { document }) {
  const headingSrc = element.querySelector('.header-1, .header-2, h1, h2');
  const textCol = headingSrc
    ? [...element.querySelectorAll(':scope > div')].find((c) => c.contains(headingSrc)) || element
    : element;

  // ---- Photo ----
  const photoCol = element.querySelector(':scope > .d-md-block')
    || [...element.querySelectorAll(':scope > div')].find((c) => c !== textCol && c.querySelector('img'));
  const photoCandidates = photoCol ? [...photoCol.querySelectorAll('img')] : [];
  const photo = photoCandidates.find((img) => img.getAttribute('role') !== 'presentation') || photoCandidates[0];

  const photoCell = [];
  if (photo) {
    if (!photo.hasAttribute('alt')) photo.setAttribute('alt', '');
    photoCell.push(photo);
  }

  // ---- Text ----
  const textCell = [];
  if (headingSrc) {
    const h2 = document.createElement('h2');
    h2.textContent = headingSrc.textContent.trim();
    textCell.push(h2);
  }
  [...textCol.querySelectorAll('p')].filter((p) => p.textContent.trim()).forEach((src) => {
    const p = document.createElement('p');
    p.textContent = src.textContent.replace(/\s+/g, ' ').trim();
    textCell.push(p);
  });
  [...textCol.querySelectorAll('a[href]')].forEach((cta, i) => {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = cta.textContent.trim();
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
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-contact', cells });
  element.replaceWith(block);
}
