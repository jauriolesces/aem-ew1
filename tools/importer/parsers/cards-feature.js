/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base: cards. Source: https://www.frostbank.com/
 * Block structure (blocks/cards-feature): one row per card, 2 cells: [illustration] | [h3, paragraph]
 * Source selectors (validated in block-context/cards-feature/source.html):
 *   items: :scope > div[class*="col-"] (4 x div.col-12.col-sm-6.col-lg-3)
 *   image: img; title: .check-card-header; description: .text-center (non-image, non-header)
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > div[class*="col-"]')];
  if (!items.length) items = [...element.querySelectorAll(':scope > div')];

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector('img');
    const titleSrc = item.querySelector('.check-card-header, .header-2, .header-3, h2, h3, h4');
    const descSrc = [...item.querySelectorAll('div, p')].find((el) => el !== titleSrc
      && !el.contains(titleSrc) && !el.querySelector('img, div, p') && el.textContent.trim());

    if (!img && !titleSrc && !descSrc) return;

    const imageCell = [];
    if (img) {
      // Decorative illustrations (no alt in source)
      if (!img.getAttribute('alt')) img.setAttribute('alt', '');
      imageCell.push(img);
    }

    const textCell = [];
    if (titleSrc) {
      const h3 = document.createElement('h3');
      h3.innerHTML = titleSrc.innerHTML.trim();
      textCell.push(h3);
    }
    if (descSrc) {
      const p = document.createElement('p');
      p.innerHTML = descSrc.innerHTML.trim();
      textCell.push(p);
    }

    cells.push([imageCell.length ? imageCell : '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
