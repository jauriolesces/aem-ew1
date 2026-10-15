/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-products. Base: columns. Source: https://www.frostbank.com/
 * Runs once per tab pane (.tab-pane > div.row - Personal, Small Business, Commercial).
 * Block structure (blocks/columns-products): 1 row, 2 cells
 *   [ul of tiles: icon image + linked label] | [h3, paragraph, image, single whole-card link]
 * Source selectors (validated in block-context/columns-products/source.html + instances/*.html):
 *   tiles: .gutter-16 > div.col-6 (inner wrapper; a.product-card is NOT used as iteration key)
 *     icon: img.hover-hidden (default-state icon; hover-show twin skipped), label: strong.cta
 *   promo: a.big-product-card > .header-2, div.text-center (text or <p>), img
 */
export default function parse(element, { document }) {
  const tileWrappers = [...element.querySelectorAll('.gutter-16 > div[class*="col-"]')];
  const tileItems = tileWrappers.length
    ? tileWrappers.map((w) => w.querySelector('a[href]')).filter(Boolean)
    : [...element.querySelectorAll('a.product-card')];

  // ---- Tiles cell ----
  const ul = document.createElement('ul');
  tileItems.forEach((link) => {
    const li = document.createElement('li');
    const iconSrc = link.querySelector('img.hover-hidden') || link.querySelector('img:not(.hover-show)') || link.querySelector('img');
    if (iconSrc) {
      const img = document.createElement('img');
      img.src = iconSrc.getAttribute('src');
      img.alt = ''; // decorative: label text sits next to it
      li.append(img);
    }
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    const label = link.querySelector('strong.cta, .cta, strong, span');
    a.textContent = (label ? label.textContent : link.textContent).trim();
    li.append(a);
    ul.append(li);
  });

  // ---- Promo cell ----
  const promoCell = [];
  const promo = element.querySelector('a.big-product-card')
    || [...element.querySelectorAll(':scope > div')].find((col) => !col.querySelector('.gutter-16'));
  if (promo) {
    const headingSrc = promo.querySelector('.header-2, .header-1, h2, h3');
    if (headingSrc) {
      const h3 = document.createElement('h3');
      h3.textContent = headingSrc.textContent.trim();
      promoCell.push(h3);
    }
    const textSrc = [...promo.querySelectorAll('div, p')]
      .find((el) => el !== headingSrc && !el.contains(headingSrc) && !headingSrc?.contains(el)
        && !el.querySelector('img') && el.textContent.trim());
    if (textSrc) {
      const innerP = textSrc.matches('p') ? textSrc : textSrc.querySelector('p');
      const p = document.createElement('p');
      p.innerHTML = (innerP || textSrc).innerHTML.trim();
      promoCell.push(p);
    }
    const promoImg = promo.querySelector('img');
    if (promoImg) {
      const img = document.createElement('img');
      img.src = promoImg.getAttribute('src');
      img.alt = promoImg.getAttribute('alt') || '';
      const p = document.createElement('p');
      p.append(img);
      promoCell.push(p);
    }
    const promoLink = promo.matches('a[href]') ? promo : promo.querySelector('a[href]');
    if (promoLink) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = promoLink.getAttribute('href');
      a.textContent = (promoLink.getAttribute('title') || headingSrc?.textContent || a.href).trim();
      p.append(a);
      promoCell.push(p);
    }
  }

  if (!ul.children.length && !promoCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[ul.children.length ? ul : '', promoCell.length ? promoCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-products', cells });
  element.replaceWith(block);
}
