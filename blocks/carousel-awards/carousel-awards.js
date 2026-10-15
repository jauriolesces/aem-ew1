/**
 * Carousel (awards): image + text slides with prev/next arrows and dot indicators.
 * Structure adapted from the AEM Block Collection carousel.
 *
 * Content contract: one row per slide, 2 cells: [image] | [heading, paragraph(s)]
 *
 * Accessible labels are read from the site's placeholders sheet
 * (keys: carousel, carouselSlideControls, previousSlide, nextSlide, showSlide, of),
 * falling back to built-in defaults when the sheet or a key is absent.
 */

const DEFAULT_LABELS = {
  carousel: 'Carousel',
  carouselSlideControls: 'Carousel Slide Controls',
  previousSlide: 'Previous Slide',
  nextSlide: 'Next Slide',
  showSlide: 'Show Slide',
  of: 'of',
};

function toCamel(key) {
  return key.toLowerCase().replace(/[^a-z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

async function fetchLabels() {
  window.placeholders = window.placeholders || {};
  if (!window.placeholders.default) {
    window.placeholders.default = fetch('/placeholders.json')
      .then((resp) => (resp.ok ? resp.json() : {}))
      .then((json) => {
        const labels = {};
        (json.data || []).forEach(({ Key, Text }) => {
          if (Key && Text) labels[toCamel(Key)] = Text;
        });
        return labels;
      })
      .catch(() => ({}));
  }
  const loaded = await window.placeholders.default;
  return { ...DEFAULT_LABELS, ...loaded };
}

function updateActiveSlide(block, slide) {
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  block.querySelectorAll('.carousel-awards-slide').forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) link.setAttribute('tabindex', '-1');
      else link.removeAttribute('tabindex');
    });
  });

  block.querySelectorAll('.carousel-awards-slide-indicator button').forEach((button, idx) => {
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });

  // non-looping (source): arrows are disabled at the first / last slide
  const lastIndex = block.querySelectorAll('.carousel-awards-slide').length - 1;
  block.querySelector('.carousel-awards-prev')?.setAttribute('aria-disabled', slideIndex <= 0);
  block.querySelector('.carousel-awards-next')?.setAttribute('aria-disabled', slideIndex >= lastIndex);
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-awards-slide');
  const realSlideIndex = Math.max(0, Math.min(slideIndex || 0, slides.length - 1));
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-awards-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
}

function bindEvents(block) {
  block.querySelectorAll('.carousel-awards-slide-indicator button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const indicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(indicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.carousel-awards-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.carousel-awards-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slidesWrapper = block.querySelector('.carousel-awards-slides');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(block, entry.target);
    });
  }, { root: slidesWrapper, threshold: 0.5 });
  block.querySelectorAll('.carousel-awards-slide').forEach((slide) => observer.observe(slide));
}

function createSlide(row, slideIndex, id) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.id = `carousel-awards-${id}-slide-${slideIndex}`;
  slide.classList.add('carousel-awards-slide');

  row.querySelectorAll(':scope > div').forEach((column) => {
    const isImage = column.querySelector('picture') && !column.textContent.trim();
    column.classList.add(isImage ? 'carousel-awards-slide-image' : 'carousel-awards-slide-content');
    slide.append(column);
  });

  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading?.id) slide.setAttribute('aria-labelledby', heading.id);

  return slide;
}

function createNavButton(className, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  return button;
}

let carouselId = 0;

/** @param {Element} block The carousel-awards block element */
export default async function decorate(block) {
  carouselId += 1;
  const id = carouselId;
  block.id = `carousel-awards-${id}`;
  const rows = [...block.querySelectorAll(':scope > div')];
  const isSingleSlide = rows.length < 2;

  const labels = await fetchLabels();
  block.setAttribute('role', 'region');
  const { carousel: roleDescription } = labels;
  block.setAttribute('aria-roledescription', roleDescription);

  const container = document.createElement('div');
  container.className = 'carousel-awards-slides-container';
  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'carousel-awards-slides';
  container.append(slidesWrapper);

  let indicators;
  let controls;
  if (!isSingleSlide) {
    controls = document.createElement('div');
    controls.className = 'carousel-awards-controls';
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', labels.carouselSlideControls);
    indicators = document.createElement('ol');
    indicators.className = 'carousel-awards-slide-indicators';
    nav.append(indicators);
    controls.append(
      createNavButton('carousel-awards-prev', labels.previousSlide),
      nav,
      createNavButton('carousel-awards-next', labels.nextSlide),
    );
  }

  rows.forEach((row, idx) => {
    slidesWrapper.append(createSlide(row, idx, id));
    if (indicators) {
      const indicator = document.createElement('li');
      indicator.className = 'carousel-awards-slide-indicator';
      indicator.dataset.targetSlide = idx;
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `${labels.showSlide} ${idx + 1} ${labels.of} ${rows.length}`);
      indicator.append(button);
      indicators.append(indicator);
    }
    row.remove();
  });

  block.replaceChildren(container);
  if (controls) {
    block.append(controls);
    bindEvents(block);
    updateActiveSlide(block, slidesWrapper.firstElementChild);
  }
}
