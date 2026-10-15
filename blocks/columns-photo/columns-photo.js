/**
 * Columns (photo): a captioned photo beside a heading, copy and CTAs.
 *
 * Content contract (1 row, 2 cells):
 *  - photo cell: image, then optional caption paragraph(s)
 *  - text cell: heading, paragraph, primary CTA (bold link), secondary CTA (italic link)
 * Cells may be authored in either order.
 */

function buildFigure(cell) {
  const picture = cell.querySelector('picture');
  const figure = document.createElement('figure');
  figure.className = 'columns-photo-figure';
  const pictureBlock = [...cell.children].find((el) => el.contains(picture)) || picture;

  const captionNodes = [...cell.children].filter((el) => el !== pictureBlock && el.textContent.trim());
  figure.append(picture);
  if (captionNodes.length) {
    const caption = document.createElement('figcaption');
    caption.append(...captionNodes);
    figure.append(caption);
  }
  cell.replaceChildren(figure);
}

/** @param {Element} block The columns-photo block element */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const photoCell = cells.find((cell) => cell.querySelector('picture') && !cell.querySelector('h1, h2, h3, h4, h5, h6'));
    cells.forEach((cell) => {
      if (cell === photoCell) {
        cell.classList.add('columns-photo-img-col');
        buildFigure(cell);
      } else {
        cell.classList.add('columns-photo-text-col');
      }
    });
  });
}
