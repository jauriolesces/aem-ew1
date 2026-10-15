/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-community. Base: cards. Source: https://www.frostbank.com/
 * Block structure (blocks/cards-community): one row per card, 2 cells: [photo] | [h3, paragraph]
 * Source selectors (validated in block-context/cards-community/source.html):
 *   items: :scope > div.col-4 > .full-promotile (mobile swiper twin removed by cleanup transformer)
 *   photo: img; title: .header-3; description: .promotile-body > div.pb-16 (text or <p>)
 *   link: a.promotile-link - empty href on source, so it is only emitted when a real href exists.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.full-promotile')];
  if (!items.length) items = [...element.querySelectorAll(':scope > div')];

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector('img');
    const body = item.querySelector('.promotile-body') || item;
    const titleSrc = body.querySelector('.header-3, .header-2, h2, h3, h4');
    const descSrc = [...body.querySelectorAll(':scope > div, :scope > p')]
      .find((el) => el !== titleSrc && !el.querySelector('a') && el.textContent.trim());
    const linkSrc = item.querySelector('a.promotile-link, a[href]');

    if (!img && !titleSrc && !descSrc) return;

    const imageCell = [];
    if (img) {
      if (!img.hasAttribute('alt')) img.setAttribute('alt', '');
      imageCell.push(img);
    }

    const textCell = [];
    if (titleSrc) {
      const h3 = document.createElement('h3');
      h3.textContent = titleSrc.textContent.trim();
      textCell.push(h3);
    }
    if (descSrc) {
      const ps = descSrc.matches('p') ? [descSrc] : [...descSrc.querySelectorAll('p')];
      if (ps.length) {
        ps.forEach((src) => {
          const p = document.createElement('p');
          p.innerHTML = src.innerHTML.replace(/&nbsp;| /g, ' ').trim();
          textCell.push(p);
        });
      } else {
        const p = document.createElement('p');
        p.innerHTML = descSrc.innerHTML.trim();
        textCell.push(p);
      }
    }
    const href = linkSrc ? (linkSrc.getAttribute('href') || '').trim() : '';
    if (href && href !== '#') {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = linkSrc.textContent.trim() || (titleSrc ? titleSrc.textContent.trim() : href);
      p.append(a);
      textCell.push(p);
    }

    cells.push([imageCell.length ? imageCell : '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-community', cells });
  element.replaceWith(block);
}
