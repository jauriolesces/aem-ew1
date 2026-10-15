/**
 * Columns (products): a grid of icon + label link tiles beside a promo card.
 *
 * Content contract (1 row, 2 cells):
 *  - tiles cell: a list; each item holds an icon/image and a linked label
 *  - promo cell: heading, paragraph, image and (optionally) one link that
 *    makes the whole card clickable
 */

function decorateTiles(cell) {
  cell.classList.add('columns-products-tiles');
  const list = cell.querySelector('ul, ol');
  if (!list) return;
  list.classList.add('columns-products-list');

  [...list.children].forEach((li) => {
    const link = li.querySelector('a[href]');
    if (!link) return;
    link.classList.remove('button', 'primary', 'secondary');
    link.parentElement.classList.remove('button-container');
    link.classList.add('columns-products-tile');

    // Move the icon/image into the link so the whole tile is clickable.
    const icon = li.querySelector('picture, .icon');
    if (icon && !link.contains(icon)) {
      const iconWrap = document.createElement('span');
      iconWrap.className = 'columns-products-tile-icon';
      iconWrap.append(icon);
      link.prepend(iconWrap);
    }
    const label = document.createElement('span');
    label.className = 'columns-products-tile-label';
    [...link.childNodes]
      .filter((node) => !(node.nodeType === Node.ELEMENT_NODE && node.classList.contains('columns-products-tile-icon')))
      .forEach((node) => label.append(node));
    link.append(label);
    li.replaceChildren(link);
  });
}

function decoratePromo(cell) {
  cell.classList.add('columns-products-promo');
  // Drop paragraphs left empty by authoring (e.g. a promo without an image).
  cell.querySelectorAll(':scope > p').forEach((p) => {
    if (!p.textContent.trim() && !p.querySelector('picture, img, .icon, a')) p.remove();
  });
  const links = cell.querySelectorAll('a[href]');
  if (links.length !== 1) return;
  const [link] = links;
  link.classList.remove('button', 'primary', 'secondary');
  link.classList.add('columns-products-promo-link');
  link.parentElement.classList.remove('button-container');
  cell.classList.add('columns-products-promo-linked');
}

/** @param {Element} block The columns-products block element */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const tilesCell = cells.find((cell) => cell.querySelector('ul, ol')) || cells[0];
    cells.forEach((cell) => {
      if (cell === tilesCell) decorateTiles(cell);
      else decoratePromo(cell);
    });
  });
}
