/*
 * Footer block
 * Footer fragment (footer.plain.html) is a list of flat sections, classified by content:
 * - legal: a section holding only a list of text links
 * - social: a section holding only a list of image-only links
 * - disclosures: a section of paragraphs with long-form text
 * - every other section is a column of the link band (in authored order)
 */

const LONG_TEXT = 120;

/** Fetches the footer fragment: local content tree first, then the site root (DA/EDS). */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const main = document.createElement('div');
  main.innerHTML = await resp.text();
  // resolve relative image paths against the fragment URL, not the page URL
  const base = new URL(resp.url, window.location.href);
  main.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
  });
  return main;
}

function onlyList(section) {
  const kids = [...section.children];
  return kids.length === 1 && /^(UL|OL)$/.test(kids[0].tagName) ? kids[0] : null;
}

function classify(section) {
  const list = onlyList(section);
  if (list) {
    const links = [...list.querySelectorAll('a')];
    if (links.length && links.every((a) => a.querySelector('img') && !a.textContent.trim())) return 'social';
    if (links.length && links.every((a) => !a.querySelector('img'))) return 'legal';
  }
  const paras = [...section.querySelectorAll(':scope > p')];
  if (paras.length && paras.length === section.children.length
    && paras.some((p) => p.textContent.trim().length > LONG_TEXT)) return 'disclosures';
  return 'column';
}

function decorateColumn(section) {
  const col = document.createElement('div');
  col.className = 'footer-column';
  while (section.firstChild) col.append(section.firstChild);
  [...col.children].forEach((el) => {
    const strong = el.tagName === 'P' && el.children.length === 1 && el.firstElementChild.tagName === 'STRONG'
      && el.textContent.trim() === el.firstElementChild.textContent.trim();
    if (strong) el.classList.add('footer-heading');
    if (el.tagName === 'P' && el.querySelector('a[href^="tel:"]')) el.classList.add('footer-call');
    if (el.tagName === 'P' && el.children.length === 1 && el.firstElementChild.tagName === 'IMG') {
      el.classList.add('footer-promo-image');
    }
    if (el.tagName === 'P' && el.querySelector(':scope > a > img')) el.classList.add('footer-logo');
  });
  // a plain value paragraph that follows a heading (e.g. routing number)
  col.querySelectorAll('.footer-heading + p:not([class])').forEach((p) => p.classList.add('footer-value'));
  col.querySelectorAll('img').forEach((img) => { img.loading = 'lazy'; });
  return col;
}

function decorateSocial(list) {
  list.classList.add('footer-social');
  list.querySelectorAll('a').forEach((a) => {
    const img = a.querySelector('img');
    const label = img.getAttribute('alt') || '';
    a.setAttribute('aria-label', label);
    a.title = label;
    const icon = document.createElement('span');
    icon.className = 'footer-social-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.style.setProperty('--footer-icon', `url("${img.src}")`);
    img.replaceWith(icon);
  });
  return list;
}

/** @param {Element} block The footer block element */
export default async function decorate(block) {
  let sections;
  if (block.textContent.trim() === '') {
    const fragment = await fetchFooter();
    if (!fragment) return;
    sections = [...fragment.children];
  } else {
    sections = [...block.children];
  }
  block.textContent = '';

  const links = document.createElement('div');
  links.className = 'footer-links';
  const disclosures = document.createElement('div');
  disclosures.className = 'footer-disclosures';
  const legal = document.createElement('div');
  legal.className = 'footer-legal';

  sections.forEach((section) => {
    const kind = classify(section);
    if (kind === 'column') links.append(decorateColumn(section));
    if (kind === 'disclosures') {
      while (section.firstChild) disclosures.append(section.firstChild);
      disclosures.querySelectorAll('img').forEach((img) => { img.loading = 'lazy'; });
    }
    if (kind === 'legal') {
      const list = onlyList(section);
      list.classList.add('footer-legal-links');
      legal.append(list);
    }
    if (kind === 'social') legal.append(decorateSocial(onlyList(section)));
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'footer-inner';
  [links, disclosures, legal].forEach((band) => { if (band.children.length) wrapper.append(band); });
  block.append(wrapper);
}
