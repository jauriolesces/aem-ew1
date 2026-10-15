/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-social. Base: columns. Source: https://www.frostbank.com/
 * Block structure (blocks/columns-social): 1 row, 2 cells
 *   [h2 heading] | [paragraph of icon links: <a href>:{platform}:</a> -> <span class="icon icon-{platform}">]
 * Source selectors (validated in block-context/columns-social/source.html):
 *   heading: first :scope > div without links (text node "Don't be a stranger")
 *   links: .socials a[href] (platform derived from a[title] or href; <i class="fa-brands"> is
 *   removed after parsing, so icons are emitted as EDS icon spans here)
 */
const PLATFORMS = [
  { name: 'facebook', test: /facebook/i },
  { name: 'instagram', test: /instagram/i },
  { name: 'linkedin', test: /linkedin/i },
  { name: 'tiktok', test: /tiktok/i },
  { name: 'x', test: /(^|[^a-z])(x|twitter)([^a-z]|$)|twitter\.com|x\.com/i },
  { name: 'youtube', test: /youtube|youtu\.be/i },
];

function platformOf(link) {
  const title = (link.getAttribute('title') || '').trim();
  const href = link.getAttribute('href') || '';
  const iconClass = [...link.querySelectorAll('i')].map((i) => i.className).join(' ');
  const match = PLATFORMS.find((p) => p.test.test(title))
    || PLATFORMS.find((p) => p.test.test(href))
    || PLATFORMS.find((p) => p.test.test(iconClass));
  return match ? match.name : '';
}

export default function parse(element, { document }) {
  const columns = [...element.querySelectorAll(':scope > div')];
  const linksCol = element.querySelector('.socials') || columns.find((c) => c.querySelector('a[href]'));
  const headingCol = columns.find((c) => c !== linksCol && !c.querySelector('a[href]') && c.textContent.trim());

  const headingCell = [];
  if (headingCol) {
    const h2 = document.createElement('h2');
    h2.textContent = headingCol.textContent.replace(/\s+/g, ' ').trim();
    headingCell.push(h2);
  }

  const linksCell = [];
  const links = linksCol ? [...linksCol.querySelectorAll('a[href]')] : [];
  if (links.length) {
    const p = document.createElement('p');
    links.forEach((link, i) => {
      const name = platformOf(link);
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      const title = (link.getAttribute('title') || '').trim();
      if (title) a.title = title;
      if (name) {
        // html2md drops text-less anchors (an empty <span class="icon">), so emit the EDS icon
        // token as link text; it renders as <span class="icon icon-{name}"> inside the link.
        a.textContent = `:${name}:`;
      } else {
        a.textContent = title || link.textContent.trim() || a.href;
      }
      if (i > 0) p.append(document.createTextNode(' '));
      p.append(a);
    });
    linksCell.push(p);
  }

  if (!headingCell.length && !linksCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[headingCell.length ? headingCell : '', linksCell.length ? linksCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-social', cells });
  element.replaceWith(block);
}
