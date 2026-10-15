/**
 * Hero (illustrated): illustration beside a headline, supporting copy and CTA.
 * Authors may put everything in one cell or split image and text into two cells;
 * the block sorts image-only elements into a media column and the rest into text.
 * @param {Element} block The hero-illustrated block element
 */
export default function decorate(block) {
  const media = document.createElement('div');
  media.className = 'hero-illustrated-media';
  const content = document.createElement('div');
  content.className = 'hero-illustrated-content';

  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    [...cell.children].forEach((el) => {
      const hasPicture = el.matches('picture') || el.querySelector('picture');
      if (hasPicture && !el.textContent.trim()) {
        media.append(el);
      } else {
        content.append(el);
      }
    });
  });

  // A linked illustration with empty alt has no accessible name. When it repeats
  // a link already in the text (e.g. the CTA), keep it mouse-clickable but take it
  // out of the tab order and accessibility tree so it isn't an unnamed duplicate.
  const textHrefs = new Set([...content.querySelectorAll('a[href]')].map((a) => a.href));
  media.querySelectorAll('a[href]').forEach((link) => {
    const named = link.textContent.trim() || link.getAttribute('aria-label')
      || [...link.querySelectorAll('img')].some((img) => img.alt.trim());
    if (named || !textHrefs.has(link.href)) return;
    link.setAttribute('tabindex', '-1');
    link.setAttribute('aria-hidden', 'true');
  });

  const row = document.createElement('div');
  if (media.children.length) {
    row.append(media);
  } else {
    block.classList.add('hero-illustrated-no-media');
  }
  row.append(content);
  block.replaceChildren(row);
}
