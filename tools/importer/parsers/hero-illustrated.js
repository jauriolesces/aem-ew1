/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-illustrated. Base: hero. Source: https://www.frostbank.com/
 * Block structure (blocks/hero-illustrated): 1 column, 1 content row holding
 * [linked illustration image, h1, paragraph, CTA link].
 * Source selectors (validated in block-context/hero-illustrated/source.html):
 *   .hero-image a > img (desktop; mobile .hero-image-mobile twin removed by cleanup transformer)
 *   .hero-content .header-1, .hero-content p, .hero-content a.btn
 */
export default function parse(element, { document }) {
  const imageWrap = element.querySelector('.hero-image') || element.querySelector('.hero-image-mobile');
  const img = imageWrap ? imageWrap.querySelector('img') : element.querySelector('img');
  const imgLink = img ? img.closest('a') : null;

  const content = element.querySelector('.hero-content') || element;
  const headingSrc = content.querySelector('.header-1, h1, h2');
  const description = content.querySelector('p');
  const cta = content.querySelector('a.btn') || [...content.querySelectorAll('a')].find((a) => !a.querySelector('img'));

  if (!headingSrc && !description && !img) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cell = [];

  if (img) {
    if (!img.hasAttribute('alt')) img.setAttribute('alt', '');
    const p = document.createElement('p');
    if (imgLink && imgLink.getAttribute('href')) {
      const a = document.createElement('a');
      a.href = imgLink.getAttribute('href');
      a.append(img);
      p.append(a);
    } else {
      p.append(img);
    }
    cell.push(p);
  }

  if (headingSrc) {
    // Page's only h1 (heading normalization happens after parsing, so emit it here)
    const h1 = document.createElement('h1');
    h1.innerHTML = headingSrc.innerHTML.trim();
    cell.push(h1);
  }

  if (description) {
    const p = document.createElement('p');
    p.innerHTML = description.innerHTML.trim();
    cell.push(p);
  }

  if (cta) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = cta.textContent.trim();
    p.append(a);
    cell.push(p);
  }

  const cells = [[cell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-illustrated', cells });
  element.replaceWith(block);
}
