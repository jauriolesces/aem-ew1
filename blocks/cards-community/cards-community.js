import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards (community): story cards — photo on top, heading and description below.
 *
 * Content contract: one row per card, 2 cells: [photo] | [heading, paragraph]
 * If a card contains exactly one link, the whole card becomes clickable.
 * @param {Element} block The cards-community block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const image = document.createElement('div');
    image.className = 'cards-community-image';
    const body = document.createElement('div');
    body.className = 'cards-community-body';

    [...row.children].forEach((cell) => {
      [...cell.children].forEach((el) => {
        const isImage = (el.matches('picture') || el.querySelector('picture')) && !el.textContent.trim();
        (isImage && !image.children.length ? image : body).append(el);
      });
    });

    if (image.children.length) li.append(image);
    li.append(body);

    const links = li.querySelectorAll('a[href]');
    if (links.length === 1) {
      const [link] = links;
      link.classList.remove('button', 'primary', 'secondary');
      link.parentElement.classList.remove('button-container');
      link.classList.add('cards-community-link');
      li.classList.add('cards-community-linked');
    }

    ul.append(li);
  });

  ul.querySelectorAll('.cards-community-image picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(ul);
}
