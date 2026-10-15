/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: frostbank.com site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html (frostbank.com homepage).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const DEFAULT_ORIGIN = 'https://www.frostbank.com';

function getOrigin(payload) {
  try {
    const url = (payload && payload.params && payload.params.originalURL) || (payload && payload.url);
    if (url) {
      const { origin } = new URL(url);
      // localhost proxies (import UI) -> fall back to the real site
      if (origin && !/localhost|127\.0\.0\.1/.test(origin)) return origin;
    }
  } catch (e) { /* ignore */ }
  return DEFAULT_ORIGIN;
}

function toAbsolute(value, origin) {
  if (!value || /^(data:|blob:|https?:|\/\/|#|mailto:|tel:)/i.test(value)) return value;
  try {
    return new URL(value, `${origin}/`).href;
  } catch (e) {
    return value;
  }
}

function renameTag(el, tagName) {
  const doc = el.ownerDocument;
  const replacement = doc.createElement(tagName);
  [...el.attributes].forEach((attr) => replacement.setAttribute(attr.name, attr.value));
  while (el.firstChild) replacement.append(el.firstChild);
  el.replaceWith(replacement);
  return replacement;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    const origin = getOrigin(payload);

    // De-duplicate description meta tags. Source head has:
    // <meta name="description" content="...">
    // <meta property="og:description" name="description" content="..."> (also name="description")
    // createMetadata joins every meta[name="description"] with ", ", so keep only the first
    // (name compared case/whitespace-insensitively); drop the name attr on the rest, keep og:* property.
    const doc = element.ownerDocument || (payload && payload.document);
    if (doc) {
      const descMetas = [...doc.querySelectorAll('meta[name]')]
        .filter((m) => (m.getAttribute('name') || '').trim().toLowerCase() === 'description');
      descMetas.forEach((m, i) => {
        if (i === 0) {
          m.setAttribute('name', 'description');
          m.setAttribute('content', (m.getAttribute('content') || '').trim());
        } else if (m.hasAttribute('property')) {
          m.removeAttribute('name');
        } else {
          m.remove();
        }
      });
    }

    // Overlays / modals that block or pollute parsing:
    // <div class="modal" id="menuModal"> (mobile nav menu modal, body-level)
    // <div class="modal fade search-modal" id="searchBar"> (site search, inside main)
    // <div id="third-party-modal" class="modal offsite fade"> (third-party-site warning, inside main)
    WebImporter.DOMUtils.remove(element, [
      '#menuModal',
      '#searchBar',
      '#third-party-modal',
      // GTM noscript iframe: <iframe src="https://www.googletagmanager.com/ns.html?...">
      'iframe[src*="googletagmanager"]',
    ]);

    // body > div:nth-of-type(1): empty GTM/noscript wrapper (<div></div> before nav)
    const firstBodyDiv = element.ownerDocument.querySelector('body > div:nth-of-type(1)');
    if (firstBodyDiv && !firstBodyDiv.querySelector('main, article') && !firstBodyDiv.textContent.trim()) {
      firstBodyDiv.remove();
    }

    // Tab switcher UI in products section: <div class="... tabbed-navigation ..."> (tabs become sections)
    WebImporter.DOMUtils.remove(element, ['.tabbed-navigation']);

    // Duplicate mobile-only twins of desktop content (desktop versions are mapped by parsers):
    WebImporter.DOMUtils.remove(element, [
      // hero: <div class="hero-image-mobile d-md-none">
      '.hero-wrapper .hero-image-mobile.d-md-none',
      // community: <div id="promo-tile"> > <div class="d-block d-md-none"> (mobile swiper)
      '#promo-tile > .d-block.d-md-none',
      // contact: <div class="row d-md-none flex-nowrap"> (mobile images)
      '.overflow-hidden div.row.d-md-none.flex-nowrap',
      // app download: <div class="d-md-none overflow-hidden position-relative"> (mobile view)
      '.no-bumpers div.d-md-none.overflow-hidden.position-relative',
      // app download: <div class="d-none d-xxl-block h-100"> duplicate phone image (twin of .d-xxl-none)
      '.no-bumpers div.d-none.d-xxl-block',
    ]);

    // Carousel chrome: <div class="swiper-controls mt-24">, <span class="swiper-notification">
    WebImporter.DOMUtils.remove(element, ['.swiper-controls', '.swiper-notification']);

    // Resolve relative media URLs (/dam/...) to absolute frostbank.com URLs
    element.querySelectorAll('img[src], source[src], track[src], video[src]').forEach((el) => {
      el.setAttribute('src', toAbsolute(el.getAttribute('src'), origin));
    });
    element.querySelectorAll('video[poster]').forEach((el) => {
      el.setAttribute('poster', toAbsolute(el.getAttribute('poster'), origin));
    });
    element.querySelectorAll('img[srcset], source[srcset]').forEach((el) => {
      const srcset = el.getAttribute('srcset')
        .split(',')
        .map((part) => {
          const [u, ...rest] = part.trim().split(/\s+/);
          return [toAbsolute(u, origin), ...rest].join(' ');
        })
        .join(', ');
      el.setAttribute('srcset', srcset);
    });
    // DAM asset links (e.g. /dam/Videos/*.mp4, /dam/jcr:.../*.pdf) must stay resolvable
    element.querySelectorAll('a[href^="/dam/"]').forEach((a) => {
      a.setAttribute('href', toAbsolute(a.getAttribute('href'), origin));
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome:
    // <a class="skip-main">, <nav class="top-nav d-none d-lg-block">, <nav id="mobile-nav">,
    // <footer class="aurora-footer pt-40">
    WebImporter.DOMUtils.remove(element, [
      'a.skip-main',
      'nav.top-nav',
      'nav#mobile-nav',
      'nav#mobile-nav-menu',
      'footer.aurora-footer',
      'iframe',
      'noscript',
      'script',
      'link',
    ]);

    // Video player controls left over after parsing: <button id="video-buttons">
    WebImporter.DOMUtils.remove(element, ['#video-buttons']);

    // Empty Font Awesome icon elements (<i class="fa-solid fa-play play-icon">, <i class="far fa-chevron-right">)
    element.querySelectorAll('i[class*="fa-"]').forEach((i) => {
      if (!i.textContent.trim() && !i.querySelector('img')) i.remove();
    });

    // ---- Heading normalization ----
    // Awards section has the page's only source h1:
    // <div class="wrapping-container ... bkgcolor-white-1ee"> ... <div class="section"> > <h1 class="text-center ...">
    // It becomes h2; the hero heading (div.header-1 in .hero-content) becomes the single h1.
    element.querySelectorAll('.bkgcolor-white-1ee div.section > h1').forEach((h1) => renameTag(h1, 'h2'));

    if (!element.querySelector('h1')) {
      // <div class="hero-content"> > <div class="content-inner"> > <div class="header-1 mt-24 pb-8">
      // (fallback: hero block table produced by the hero parser, which is the first table on the page)
      let heroHeading = element.querySelector('.hero-content .header-1');
      if (!heroHeading) {
        const firstTable = element.querySelector('table');
        heroHeading = firstTable ? firstTable.querySelector('div.header-1') : null;
      }
      if (heroHeading) renameTag(heroHeading, 'h1');
    }

    // Remaining div/p.header-1 headings in default content -> h2 (skip the social row container
    // <div class="row header-1 py-64">), div.header-2 -> h3
    element.querySelectorAll('div.header-1:not(.row), p.header-1').forEach((el) => renameTag(el, 'h2'));
    element.querySelectorAll('div.header-2:not(.row)').forEach((el) => renameTag(el, 'h3'));

    // Safety: guarantee a single h1 (demote any additional h1 to h2)
    [...element.querySelectorAll('h1')].slice(1).forEach((h1) => renameTag(h1, 'h2'));
  }
}
