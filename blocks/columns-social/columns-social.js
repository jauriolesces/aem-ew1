/**
 * Columns (social): heading beside a row of social icon links.
 *
 * Content contract (1 row, 2 cells):
 *  - heading cell: a heading
 *  - links cell: paragraph(s) of links, each containing an icon (e.g. :facebook:)
 * Icon-only links get an accessible name from the link title or the icon name.
 */

function iconName(link) {
  const icon = link.querySelector('.icon');
  if (!icon) return '';
  const cls = [...icon.classList].find((c) => c.startsWith('icon-'));
  if (!cls) return '';
  const name = cls.substring(5).replace(/-/g, ' ');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** @param {Element} block The columns-social block element */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const linksCell = cells.find((cell) => cell.querySelector('a[href]')) || cells[cells.length - 1];

    cells.forEach((cell) => {
      cell.classList.add(cell === linksCell ? 'columns-social-links' : 'columns-social-heading');
    });

    if (!linksCell) return;
    const list = document.createElement('ul');
    linksCell.querySelectorAll('a[href]').forEach((link) => {
      link.classList.remove('button', 'primary', 'secondary');
      if (!link.textContent.trim() && !link.getAttribute('aria-label')) {
        const label = (link.title && link.title.trim()) || iconName(link);
        if (label) link.setAttribute('aria-label', label);
      }
      const li = document.createElement('li');
      li.append(link);
      list.append(li);
    });
    if (list.children.length) linksCell.replaceChildren(list);
  });
}
