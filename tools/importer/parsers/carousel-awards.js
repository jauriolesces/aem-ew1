/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-awards. Base: carousel. Source: https://www.frostbank.com/
 * Block structure (blocks/carousel-awards): one row per slide, 2 cells: [image] | [h3, paragraph(s)]
 * Source selectors (validated in block-context/carousel-awards/source.html):
 *   slides: .swiper-wrapper > .swiper-slide (swiper loop clones .swiper-slide-duplicate skipped)
 *   image: img; heading: h2 (emitted as h3 - section heading is the h2); copy: p (keeps sup + links)
 *   carousel chrome (.swiper-controls, .swiper-notification) removed by cleanup transformer.
 */
export default function parse(element, { document }) {
  let slides = [...element.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)')];
  if (!slides.length) slides = [...element.querySelectorAll(':scope > div > div')];

  const cells = [];
  slides.forEach((slide) => {
    const img = slide.querySelector('img');
    const headingSrc = slide.querySelector('h1, h2, h3, h4, .header-1, .header-2');
    const paragraphs = [...slide.querySelectorAll('p')].filter((p) => p.textContent.trim());

    if (!img && !headingSrc && !paragraphs.length) return;

    const imageCell = [];
    if (img) {
      if (!img.hasAttribute('alt')) img.setAttribute('alt', '');
      imageCell.push(img);
    }

    const textCell = [];
    if (headingSrc) {
      const h3 = document.createElement('h3');
      h3.textContent = headingSrc.textContent.trim();
      textCell.push(h3);
    }
    paragraphs.forEach((src) => {
      const p = document.createElement('p');
      p.innerHTML = src.innerHTML.replace(/\s+/g, ' ').trim();
      textCell.push(p);
    });

    cells.push([imageCell.length ? imageCell : '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-awards', cells });
  element.replaceWith(block);
}
