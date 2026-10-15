/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-video. Base: columns. Source: https://www.frostbank.com/
 * Block structure (blocks/columns-video): 1 row, 2 cells
 *   [h2, paragraph(s), CTA link] | [poster image, video link, then thumbnail image + video link pairs]
 * Source selectors (validated in block-context/columns-video/source.html + live page):
 *   text column: :scope > div:not(.default) / .header-1, p, a.btn
 *   media column: .video-component
 *     main poster: #mainThumbnail img; main video: video#mainVideo source[src]
 *     thumbnails: #thumbnailRow img.thumbnail-preview (video URL in data-src on the live page)
 * Video URLs are only taken from the DOM (source[src], img[data-src]) - never fabricated.
 */
const DEFAULT_ORIGIN = 'https://www.frostbank.com';

function absolute(url, origin) {
  if (!url) return '';
  try {
    return new URL(url, `${origin}/`).href;
  } catch (e) {
    return url;
  }
}

function getOrigin(params) {
  try {
    const u = params && (params.originalURL || params.url);
    if (u) {
      const { origin } = new URL(u);
      if (!/localhost|127\.0\.0\.1/.test(origin)) return origin;
    }
  } catch (e) { /* ignore */ }
  return DEFAULT_ORIGIN;
}

export default function parse(element, { document, params }) {
  const origin = getOrigin(params);
  const videoComponent = element.querySelector('.video-component');
  const columns = [...element.querySelectorAll(':scope > div')];
  const textCol = columns.find((col) => !col.querySelector('.video-component')) || element;

  // ---- Text cell ----
  const textCell = [];
  const headingSrc = textCol.querySelector('.header-1, .header-2, h1, h2, h3');
  if (headingSrc) {
    const h2 = document.createElement('h2');
    h2.innerHTML = headingSrc.innerHTML.trim();
    textCell.push(h2);
  }
  [...textCol.querySelectorAll('p')].forEach((p) => {
    if (p.textContent.trim()) textCell.push(p);
  });
  const cta = textCol.querySelector('a.btn') || [...textCol.querySelectorAll('a[href]')].find((a) => !a.closest('p'));
  if (cta) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = cta.textContent.trim();
    p.append(a);
    textCell.push(p);
  }

  // ---- Media cell ----
  const mediaCell = [];
  // De-duplicate by absolute video URL: the source repeats the main video as a
  // hidden first thumbnail. The block's playlist already includes the main video.
  const seenVideos = new Set();
  const addPair = (img, videoUrl) => {
    if (!img) return;
    if (videoUrl) {
      const key = absolute(videoUrl, origin);
      if (seenVideos.has(key)) return;
      seenVideos.add(key);
    }
    const pic = document.createElement('p');
    const image = document.createElement('img');
    image.src = img.getAttribute('src');
    image.alt = img.getAttribute('alt') || '';
    pic.append(image);
    mediaCell.push(pic);
    if (videoUrl) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = absolute(videoUrl, origin);
      a.textContent = a.href;
      p.append(a);
      mediaCell.push(p);
    }
  };

  if (videoComponent) {
    const mainImg = videoComponent.querySelector('#mainThumbnail img') || videoComponent.querySelector('button img');
    const mainSource = videoComponent.querySelector('video source[src]') || videoComponent.querySelector('video[src]');
    const mainVideoUrl = mainSource ? mainSource.getAttribute('src') : '';
    addPair(mainImg, mainVideoUrl);

    const thumbs = [...videoComponent.querySelectorAll('#thumbnailRow img, img.thumbnail-preview')]
      .filter((img, i, arr) => arr.indexOf(img) === i);
    thumbs.forEach((img) => {
      const url = img.getAttribute('data-src') || img.closest('[data-src]')?.getAttribute('data-src') || '';
      addPair(img, url);
    });
  } else {
    // Fallback: any images in the non-text column
    const mediaCol = columns.find((col) => col !== textCol);
    if (mediaCol) mediaCol.querySelectorAll('img').forEach((img) => addPair(img, ''));
  }

  if (!textCell.length && !mediaCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[textCell, mediaCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-video', cells });
  element.replaceWith(block);
}
