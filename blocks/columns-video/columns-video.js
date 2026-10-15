/**
 * Columns (video): text column beside a video player with a thumbnail playlist.
 *
 * Content contract (1 row, 2 cells):
 *  - text cell: heading, paragraph(s), CTA link
 *  - media cell: a poster image followed by its video link, then any number of
 *    thumbnail images, each followed by (or wrapping) a link to its video.
 *    The first image/link pair is what the player shows initially. Repeated
 *    video links (e.g. the main video listed again as thumbnail 1) are merged.
 */

import { getMetadata } from '../../scripts/aem.js';

/**
 * Control labels. Defaults are English; localize per page with metadata
 * `video-play-label` / `video-pause-label`.
 */
function getLabels() {
  return {
    play: getMetadata('video-play-label') || 'Play video',
    pause: getMetadata('video-pause-label') || 'Pause video',
  };
}

function findLink(picture) {
  const wrapping = picture.closest('a[href]');
  if (wrapping) return wrapping;
  // Look forward through sibling elements until the next picture for a link.
  let el = picture.closest('.columns-video-media > *') || picture;
  while (el) {
    const link = el.matches('a[href]') ? el : el.querySelector('a[href]');
    if (link && !link.querySelector('picture')) return link;
    el = el.nextElementSibling;
    if (el && el.querySelector('picture')) break;
  }
  return null;
}

function collectItems(cell) {
  return [...cell.querySelectorAll('picture')].map((picture) => {
    const link = findLink(picture);
    const img = picture.querySelector('img');
    return {
      picture,
      src: link ? link.href : '',
      label: img?.alt || link?.title || '',
    };
  }).filter((item) => item.src);
}

function playVideo(player, item) {
  const video = document.createElement('video');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'metadata';
  const poster = item.picture.querySelector('img');
  if (poster) video.poster = poster.currentSrc || poster.src;
  video.src = item.src;
  if (item.label) video.setAttribute('aria-label', item.label);

  // Visible play/pause toggle over the player (as on the source)
  const labels = getLabels();
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'columns-video-toggle';
  const sync = () => {
    toggle.dataset.state = video.paused ? 'paused' : 'playing';
    toggle.setAttribute('aria-label', video.paused ? labels.play : labels.pause);
  };
  toggle.addEventListener('click', () => {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  });
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  sync();

  player.replaceChildren(video, toggle);
  video.play().catch(() => {});
}

function showPoster(player, item) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'columns-video-play';
  if (item.label) button.setAttribute('aria-label', item.label);
  button.append(item.picture.cloneNode(true));
  button.addEventListener('click', () => playVideo(player, item));
  player.replaceChildren(button);
}

function buildPlayer(cell) {
  const items = collectItems(cell);
  if (!items.length) return;

  const [main] = items;
  const player = document.createElement('div');
  player.className = 'columns-video-player';
  showPoster(player, main);

  const wrapper = document.createElement('div');
  wrapper.className = 'columns-video-gallery';
  wrapper.append(player);

  // Playlist = every distinct video, including the one shown first. Authors may
  // or may not repeat the main video as the first thumbnail; both work, and the
  // main video stays reachable after another one has been played.
  const seen = new Set();
  const playlist = items.filter((item) => {
    if (seen.has(item.src)) return false;
    seen.add(item.src);
    return true;
  });
  const rest = playlist.length > 1 ? playlist : [];

  if (rest.length) {
    const list = document.createElement('ul');
    list.className = 'columns-video-thumbnails';
    const setCurrent = (src) => {
      list.querySelectorAll('button').forEach((btn) => {
        if (btn.dataset.src === src) btn.setAttribute('aria-current', 'true');
        else btn.removeAttribute('aria-current');
      });
    };
    rest.forEach((item) => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.src = item.src;
      if (item.label) button.setAttribute('aria-label', item.label);
      button.append(item.picture);
      button.addEventListener('click', () => {
        setCurrent(item.src);
        playVideo(player, item);
      });
      li.append(button);
      list.append(li);
    });
    setCurrent(main.src);
    wrapper.append(list);
  }

  cell.replaceChildren(wrapper);
}

/** @param {Element} block The columns-video block element */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cells = [...row.children];
  const mediaCell = cells.find((cell) => cell.querySelector('picture'));

  cells.forEach((cell) => {
    cell.classList.add(cell === mediaCell ? 'columns-video-media' : 'columns-video-text');
  });

  if (mediaCell) buildPlayer(mediaCell);
}
