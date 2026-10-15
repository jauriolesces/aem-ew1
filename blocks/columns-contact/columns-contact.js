/**
 * Columns (contact): full-bleed photo beside a heading, copy and two CTAs.
 *
 * Content contract (1 row, 2 cells): [photo] | [heading, paragraph, primary CTA, secondary CTA]
 * Cells may be authored in either order.
 * @param {Element} block The columns-contact block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const picture = cell.querySelector('picture');
      const isImageOnly = picture && !cell.textContent.trim();
      cell.classList.add(isImageOnly ? 'columns-contact-img-col' : 'columns-contact-text-col');
    });
  });
}
