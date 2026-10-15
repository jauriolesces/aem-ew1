import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards (feature): borderless value-prop items — illustration, heading, short text.
 *
 * Content contract: one row per item, 2 cells: [illustration] | [heading, paragraph]
 * A single-cell row is also accepted (image is detected by content).
 * @param {Element} block The cards-feature block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const image = document.createElement('div');
    image.className = 'cards-feature-image';
    const body = document.createElement('div');
    body.className = 'cards-feature-body';

    [...row.children].forEach((cell) => {
      [...cell.children].forEach((el) => {
        const isImage = (el.matches('picture') || el.querySelector('picture')) && !el.textContent.trim();
        (isImage && !image.children.length ? image : body).append(el);
      });
    });

    if (image.children.length) li.append(image);
    if (body.children.length) li.append(body);
    ul.append(li);
  });

  ul.querySelectorAll('.cards-feature-image picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]));
  });

  block.replaceChildren(ul);
}
