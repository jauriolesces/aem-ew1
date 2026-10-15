/**
 * Columns (app): app-download promo — copy and store badges beside a device image.
 *
 * Content contract (1 row, 2 cells):
 *  - text cell: heading, paragraph, linked badge images (e.g. App Store, Google Play)
 *  - image cell: device mockup image
 * Cells may be authored in either order.
 * @param {Element} block The columns-app block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const picture = cell.querySelector('picture');
      const isImageOnly = picture && !cell.textContent.trim() && !cell.querySelector('a[href]');
      if (isImageOnly) {
        cell.classList.add('columns-app-img-col');
        return;
      }
      cell.classList.add('columns-app-text-col');

      // Group linked badge images into one row
      const badgeLinks = [...cell.querySelectorAll('a[href]')].filter((a) => a.querySelector('picture'));
      if (!badgeLinks.length) return;
      const badges = document.createElement('div');
      badges.className = 'columns-app-badges';
      const firstParent = badgeLinks[0].closest('.columns-app-text-col > *');
      firstParent.before(badges);
      badgeLinks.forEach((link) => {
        const parent = link.closest('.columns-app-text-col > *');
        badges.append(link);
        if (parent && parent !== badges && !parent.textContent.trim() && !parent.querySelector('picture')) {
          parent.remove();
        }
      });
    });
  });
}
