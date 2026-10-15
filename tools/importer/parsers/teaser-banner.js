/* eslint-disable */
/* global WebImporter */
/**
 * Parser for teaser-banner. Base: teaser (custom block, no library convention).
 * Source: https://www.frostbank.com/
 * Block structure (blocks/teaser-banner): 1 row, 3 cells
 *   [icon image] | [bold title paragraph, description paragraph] | [CTA link]
 * Source selectors (validated in block-context/teaser-banner/source.html):
 *   icon: img.banner-icon; title: p.banner-title; description: other p; CTA: a.btn
 */
export default function parse(element, { document }) {
  const icon = element.querySelector('img.banner-icon') || element.querySelector('img');
  const titleSrc = element.querySelector('.banner-title, .header-2, .header-3, h2, h3');
  const descriptions = [...element.querySelectorAll('p')]
    .filter((p) => p !== titleSrc && !p.contains(titleSrc) && p.textContent.trim());
  const cta = element.querySelector('a.btn') || [...element.querySelectorAll('a[href]')].find((a) => !a.querySelector('img'));

  if (!titleSrc && !descriptions.length && !cta) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const iconCell = [];
  if (icon) {
    // Decorative shield icon beside the text
    icon.setAttribute('alt', '');
    iconCell.push(icon);
  }

  const bodyCell = [];
  if (titleSrc) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = titleSrc.textContent.trim();
    p.append(strong);
    bodyCell.push(p);
  }
  descriptions.forEach((d) => {
    const p = document.createElement('p');
    p.innerHTML = d.innerHTML.trim();
    bodyCell.push(p);
  });

  const ctaCell = [];
  if (cta) {
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = cta.textContent.trim();
    ctaCell.push(a);
  }

  const cells = [[iconCell.length ? iconCell : '', bodyCell.length ? bodyCell : '', ctaCell.length ? ctaCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'teaser-banner', cells });
  element.replaceWith(block);
}
