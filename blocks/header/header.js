/*
 * Header block
 * Nav fragment (nav.plain.html) has three sections: brand | sections | tools.
 * - sections: ul > li, each li = p > a (trigger) + optional ul (dropdown items).
 * - links may hold two images: the first is the default icon, the second its hover variant.
 * - tools: icon links; a link whose URL ends in #search becomes a search toggle + form;
 *   a link alone in a paragraph becomes the call-to-action button.
 * - optional fourth section (mobile menu only): a list item whose label matches a section
 *   trigger adds its links to the top of that dropdown; other links become text links.
 * - brand may hold a second image, used as the compact mark in the open mobile menu.
 */

import { getBlockContext } from '../../scripts/shared.js';

const DESKTOP = window.matchMedia('(width >= 900px)');
const SEARCH_HASH = '#search';

/** Fetches the nav fragment: local content tree first, then the site root (DA/EDS). */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
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

/** Marks default/hover icon pairs inside a link and keeps hover icons out of the a11y tree. */
function decorateIconPair(link) {
  const imgs = [...link.querySelectorAll(':scope > img, :scope > picture > img')];
  if (!imgs.length) return;
  const wrap = document.createElement('span');
  wrap.className = 'nav-icon';
  imgs.forEach((img, i) => {
    const el = img.closest('picture') || img;
    img.classList.add(i === 0 ? 'nav-icon-default' : 'nav-icon-hover');
    img.loading = 'eager';
    if (i > 0) img.setAttribute('aria-hidden', 'true');
    wrap.append(el);
  });
  link.prepend(wrap);
  // icon-only links: use the default icon's alt text as the accessible name
  if (!link.textContent.trim()) {
    const label = imgs[0].getAttribute('alt') || '';
    if (label) {
      link.setAttribute('aria-label', label);
      link.title = label;
      imgs[0].setAttribute('alt', '');
    }
  }
}

function setExpanded(li, open) {
  li.setAttribute('aria-expanded', String(open));
  li.querySelector(':scope > p > a')?.setAttribute('aria-expanded', String(open));
  li.querySelector(':scope > .nav-drop-toggle')?.setAttribute('aria-expanded', String(open));
}

function closeDropdowns(nav, except) {
  nav.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((li) => {
    if (li !== except) setExpanded(li, false);
  });
}

function setDropdown(nav, li, open) {
  if (open && DESKTOP.matches) closeDropdowns(nav, li);
  setExpanded(li, open);
}

function decorateSections(nav, sections) {
  sections.querySelectorAll(':scope > ul > li, :scope .default-content-wrapper > ul > li').forEach((li) => {
    const trigger = li.querySelector(':scope > p > a, :scope > a');
    const sub = li.querySelector(':scope > ul');
    if (trigger && trigger.parentElement === li) {
      const p = document.createElement('p');
      li.insertBefore(p, trigger);
      p.append(trigger);
    }
    sub?.querySelectorAll('a').forEach(decorateIconPair);
    if (!sub) return;

    li.classList.add('nav-drop', 'nav-dropdown-parent');
    li.setAttribute('aria-expanded', 'false');
    sub.classList.add('nav-dropdown');
    if (trigger) {
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');
    }

    // desktop: open on hover / keyboard focus; the trigger itself still navigates on click
    li.addEventListener('mouseenter', () => { if (DESKTOP.matches) setDropdown(nav, li, true); });
    li.addEventListener('mouseleave', () => { if (DESKTOP.matches) setDropdown(nav, li, false); });
    li.addEventListener('focusin', () => { if (DESKTOP.matches) setDropdown(nav, li, true); });
    li.addEventListener('focusout', (e) => {
      if (DESKTOP.matches && !li.contains(e.relatedTarget)) setDropdown(nav, li, false);
    });

    // mobile: a toggle button expands the item; the label keeps navigating
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-drop-toggle';
    toggle.setAttribute('aria-label', trigger?.textContent.trim() || '');
    toggle.setAttribute('aria-expanded', 'false');
    if (!sub.id) sub.id = `nav-dropdown-${[...li.parentElement.children].indexOf(li)}`;
    toggle.setAttribute('aria-controls', sub.id);
    toggle.addEventListener('click', () => {
      setDropdown(nav, li, li.getAttribute('aria-expanded') !== 'true');
    });
    trigger?.addEventListener('click', (e) => {
      if (DESKTOP.matches) return;
      e.preventDefault();
      setDropdown(nav, li, li.getAttribute('aria-expanded') !== 'true');
    });
    sub.before(toggle);
  });
}

function buildSearch(link, body) {
  const url = new URL(link.href);
  const label = link.getAttribute('aria-label') || link.title || '';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-tool nav-search-toggle';
  toggle.setAttribute('aria-label', label);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.title = label;
  const icons = link.querySelector('.nav-icon');
  if (icons) toggle.append(icons);

  const dialog = document.createElement('div');
  dialog.className = 'nav-search';
  dialog.hidden = true;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-label', label);

  const form = document.createElement('form');
  form.className = 'nav-search-form';
  form.setAttribute('role', 'search');
  form.action = url.pathname;
  form.method = 'get';

  const inputId = 'nav-search-input';
  const lbl = document.createElement('label');
  lbl.className = 'nav-search-label';
  lbl.htmlFor = inputId;
  lbl.textContent = label;

  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.id = inputId;
  input.placeholder = label;
  input.required = true;
  input.maxLength = 175;
  input.className = 'nav-search-input';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-search-submit';
  submit.setAttribute('aria-label', label);
  const glass = icons?.querySelector('.nav-icon-default')?.cloneNode();
  if (glass) {
    glass.alt = '';
    glass.removeAttribute('aria-hidden');
    submit.append(glass);
  }

  form.append(lbl, input, submit);
  const bar = document.createElement('div');
  bar.className = 'nav-search-bar';
  bar.append(form);
  dialog.append(bar);

  const setOpen = (open) => {
    dialog.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    body.classList.toggle('nav-search-open', open);
    if (open) input.focus();
    else toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(dialog.hidden));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) setOpen(false); });
  dialog.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  // a second, inline copy of the form lives at the top of the mobile menu
  const inline = document.createElement('div');
  inline.className = 'nav-search-inline';
  const inlineForm = form.cloneNode(true);
  const inlineInput = inlineForm.querySelector('input');
  inlineInput.id = `${inputId}-menu`;
  inlineForm.querySelector('label').htmlFor = inlineInput.id;
  inline.append(inlineForm);

  const li = link.closest('li');
  link.replaceWith(toggle);
  return {
    li, dialog, inline, close: () => { if (!dialog.hidden) setOpen(false); },
  };
}

function decorateTools(tools, body) {
  let search = null;
  tools.querySelectorAll('a').forEach((a) => {
    const solo = a.parentElement.tagName === 'P' && a.parentElement.children.length === 1 && !a.querySelector('img');
    if (solo) {
      a.classList.add('nav-cta');
      a.parentElement.classList.add('nav-cta-wrapper');
      return;
    }
    decorateIconPair(a);
    a.classList.add('nav-tool');
    if (a.hash === SEARCH_HASH) search = buildSearch(a, body);
  });
  tools.querySelectorAll(':scope > ul, .default-content-wrapper > ul').forEach((ul) => ul.classList.add('nav-tools-list'));
  return search;
}

function decorateMobileSection(nav, mobile) {
  const triggers = [...nav.querySelectorAll('.nav-drop')];
  const labelOf = (el) => el.textContent.trim().toLowerCase();
  mobile.querySelectorAll(':scope li').forEach((li) => {
    const label = li.querySelector(':scope > p');
    const list = li.querySelector(':scope > ul');
    if (!label || !list) return;
    const target = triggers.find((t) => labelOf(t.querySelector(':scope > p > a') || t) === labelOf(label));
    if (!target) return;
    const dropdown = target.querySelector(':scope > .nav-dropdown');
    [...list.children].reverse().forEach((item) => {
      item.classList.add('nav-mobile-only');
      item.querySelectorAll('a').forEach(decorateIconPair);
      dropdown.prepend(item);
    });
    li.remove();
  });
  mobile.querySelectorAll('ul').forEach((ul) => ul.classList.add('nav-mobile-links'));
}

function toggleMenu(nav, body, force) {
  const open = force ?? nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', String(open));
  const button = nav.querySelector('.nav-hamburger button');
  button?.setAttribute('aria-expanded', String(open));
  button?.setAttribute('aria-label', button.dataset[open ? 'closeLabel' : 'openLabel'] || '');
  body.classList.toggle('nav-menu-open', open && !DESKTOP.matches);
  if (!open) closeDropdowns(nav);
}

/** @param {Element} block The header block element */
export default async function decorate(block) {
  const { body, eventRoot } = getBlockContext(block);

  if (block.textContent.trim() === '') {
    const fragment = await fetchNav();
    if (!fragment) return;
    block.textContent = '';
    const nav = document.createElement('nav');
    while (fragment.firstElementChild) nav.append(fragment.firstElementChild);
    block.append(nav);
  }

  const nav = block.querySelector('nav');
  if (!nav) return;
  nav.id = nav.id || 'nav';
  if (!nav.getAttribute('aria-label')) nav.setAttribute('aria-label', 'Main');
  nav.setAttribute('aria-expanded', 'false');

  const [brand, sections, tools, mobile] = [...nav.children];
  brand?.classList.add('nav-brand');
  sections?.classList.add('nav-sections');
  tools?.classList.add('nav-tools');
  mobile?.classList.add('nav-mobile');
  [...nav.children].slice(4).forEach((extra) => {
    while (extra.firstElementChild) mobile?.append(extra.firstElementChild);
    extra.remove();
  });

  const [logo, compact] = [...(brand?.querySelectorAll('img') || [])];
  if (logo) {
    logo.loading = 'eager';
    logo.width = 127;
    logo.height = 42;
    logo.classList.add('nav-brand-logo');
  }
  if (compact) {
    compact.classList.add('nav-brand-compact');
    compact.width = 32;
    compact.height = 33;
  }

  if (sections) decorateSections(nav, sections);
  if (mobile) decorateMobileSection(nav, mobile);
  const search = tools ? decorateTools(tools, body) : null;
  if (search) nav.insertBefore(search.inline, sections || null);

  // hamburger (mobile); labels come from the brand logo alt for context-free authoring
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  const hButton = document.createElement('button');
  hButton.type = 'button';
  hButton.setAttribute('aria-controls', nav.id);
  hButton.setAttribute('aria-expanded', 'false');
  hButton.dataset.openLabel = block.dataset.openLabel || 'Open navigation';
  hButton.dataset.closeLabel = block.dataset.closeLabel || 'Close navigation';
  hButton.setAttribute('aria-label', hButton.dataset.openLabel);
  hButton.innerHTML = '<span class="nav-hamburger-icon"></span>';
  hButton.addEventListener('click', () => toggleMenu(nav, body));
  hamburger.append(hButton);
  nav.prepend(hamburger);

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  wrapper.append(nav);
  block.append(wrapper);
  if (search) block.append(search.dialog);

  eventRoot.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (nav.querySelector('.nav-drop[aria-expanded="true"]')) closeDropdowns(nav);
    else if (!DESKTOP.matches && nav.getAttribute('aria-expanded') === 'true') toggleMenu(nav, body, false);
  });
  eventRoot.addEventListener('click', (e) => {
    if (DESKTOP.matches && !nav.contains(e.target)) closeDropdowns(nav);
  });

  // crossing breakpoints: reset mobile menu state and any open panels
  DESKTOP.addEventListener('change', () => {
    toggleMenu(nav, body, false);
    search?.close();
  });
}
