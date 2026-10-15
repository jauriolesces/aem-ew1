/**
 * Teaser (banner): horizontal callout bar — icon, title + description, CTA.
 *
 * Content contract (1 row, 3 cells): [icon image] | [bold title, description] | [CTA link]
 * Cells are classified by content, so a missing icon or CTA cell is tolerated.
 * @param {Element} block The teaser-banner block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const text = cell.textContent.trim();
      const hasMedia = cell.querySelector('picture, .icon');
      const links = cell.querySelectorAll('a[href]');
      const linkText = [...links].map((a) => a.textContent.trim()).join('');

      if (hasMedia && !text) {
        cell.classList.add('teaser-banner-icon');
      } else if (links.length && text === linkText) {
        cell.classList.add('teaser-banner-action');
      } else {
        cell.classList.add('teaser-banner-body');
      }
    });
  });
}
