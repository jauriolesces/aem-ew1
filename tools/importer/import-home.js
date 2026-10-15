/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroIllustratedParser from './parsers/hero-illustrated.js';
import columnsVideoParser from './parsers/columns-video.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import teaserBannerParser from './parsers/teaser-banner.js';
import columnsProductsParser from './parsers/columns-products.js';
import cardsCommunityParser from './parsers/cards-community.js';
import columnsPhotoParser from './parsers/columns-photo.js';
import carouselAwardsParser from './parsers/carousel-awards.js';
import columnsSocialParser from './parsers/columns-social.js';
import columnsContactParser from './parsers/columns-contact.js';
import columnsAppParser from './parsers/columns-app.js';

// TRANSFORMER IMPORTS
import frostbankCleanupTransformer from './transformers/frostbank-cleanup.js';
import frostbankSectionsTransformer from './transformers/frostbank-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-illustrated': heroIllustratedParser,
  'columns-video': columnsVideoParser,
  'cards-feature': cardsFeatureParser,
  'teaser-banner': teaserBannerParser,
  'columns-products': columnsProductsParser,
  'cards-community': cardsCommunityParser,
  'columns-photo': columnsPhotoParser,
  'carousel-awards': carouselAwardsParser,
  'columns-social': columnsSocialParser,
  'columns-contact': columnsContactParser,
  'columns-app': columnsAppParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "home",
  "description": "Frost Bank homepage: illustrated hero, story video, feature cards, fraud banner, product tabs, community cards, photo of the day, awards carousel, social, contact and app download bands",
  "urls": [
    "https://www.frostbank.com/"
  ],
  "blocks": [
    {
      "name": "hero-illustrated",
      "instances": [
        "div.hero-wrapper > div.hero-grid"
      ]
    },
    {
      "name": "columns-video",
      "instances": [
        "article.article > div.bkgcolor-white-1ee:has(video) div.section > div.row"
      ]
    },
    {
      "name": "cards-feature",
      "instances": [
        "article.article > div.wrapping-container:not([class*='bkgcolor']) div.section > div.row > div.col-12 > div.row",
        "article.article > div.wrapping-container:nth-of-type(3) div.section > div.row > div.col-12 > div.row"
      ]
    },
    {
      "name": "teaser-banner",
      "instances": [
        "article.article > div.bkgcolor-white-1ee div.section > div.banner"
      ]
    },
    {
      "name": "columns-products",
      "instances": [
        ".bkgcolor-purple-88b .tab-pane > div.row"
      ]
    },
    {
      "name": "cards-community",
      "instances": [
        "#promo-tile > div.d-none.d-md-block > div.row"
      ]
    },
    {
      "name": "columns-photo",
      "instances": [
        "article.article > div.bkgcolor-white-fff div.section > div.row"
      ]
    },
    {
      "name": "carousel-awards",
      "instances": [
        "article.article > div.bkgcolor-white-1ee div.section > div.swiper-container"
      ]
    },
    {
      "name": "columns-social",
      "instances": [
        ".bkgcolor-green-150 div.section > div.row.header-1"
      ]
    },
    {
      "name": "columns-contact",
      "instances": [
        "article.article > div.px-lg-0.overflow-hidden:not(.no-bumpers) div.row.overflow-hidden"
      ]
    },
    {
      "name": "columns-app",
      "instances": [
        ".no-bumpers div.d-none.d-md-block > div.row"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "hero",
      "selector": [
        "article.article > div.hero-wrapper",
        "div.hero-wrapper"
      ],
      "style": null,
      "blocks": [
        "hero-illustrated"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "customer-stories",
      "selector": [
        "article.article > div.bkgcolor-white-1ee:has(video)",
        "article.article > div.bkgcolor-white-1ee:nth-of-type(2)"
      ],
      "style": "grey",
      "blocks": [
        "columns-video"
      ],
      "defaultContent": []
    },
    {
      "id": "section-3",
      "name": "benefits",
      "selector": [
        "article.article > div.wrapping-container:not([class*='bkgcolor'])",
        "article.article > div.wrapping-container:nth-of-type(3)"
      ],
      "style": null,
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "fraud-banner",
      "selector": [
        "article.article > div.bkgcolor-white-1ee:has(.banner)",
        "article.article > div.bkgcolor-white-1ee:nth-of-type(4)"
      ],
      "style": "grey",
      "blocks": [
        "teaser-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "section-5",
      "name": "products",
      "selector": [
        "article.article > div.bkgcolor-purple-88b",
        ".bkgcolor-purple-88b"
      ],
      "style": "purple",
      "blocks": [
        "columns-products"
      ],
      "defaultContent": [
        ".bkgcolor-purple-88b div.section > div.header-1",
        ".bkgcolor-purple-88b div.section > div.text-center.pb-24:not(.header-1)"
      ]
    },
    {
      "id": "section-6",
      "name": "community",
      "selector": [
        "article.article > div.bkgcolor-white-1ee:has(#community)",
        "article.article > div.bkgcolor-white-1ee:nth-of-type(6)"
      ],
      "style": "grey",
      "blocks": [
        "cards-community"
      ],
      "defaultContent": [
        "#community > div.header-1",
        "#community > div.text-center:not(.header-1)"
      ]
    },
    {
      "id": "section-7",
      "name": "photo-of-the-day",
      "selector": [
        "article.article > div.bkgcolor-white-fff",
        ".bkgcolor-white-fff"
      ],
      "style": null,
      "blocks": [
        "columns-photo"
      ],
      "defaultContent": []
    },
    {
      "id": "section-8",
      "name": "awards",
      "selector": [
        "article.article > div.bkgcolor-white-1ee:has(div.section > div.swiper-container)",
        "article.article > div.bkgcolor-white-1ee:nth-of-type(8)"
      ],
      "style": "grey",
      "blocks": [
        "carousel-awards"
      ],
      "defaultContent": [
        "article.article > div.bkgcolor-white-1ee div.section > h1"
      ]
    },
    {
      "id": "section-9",
      "name": "social",
      "selector": [
        "article.article > div.bkgcolor-green-150",
        ".bkgcolor-green-150"
      ],
      "style": "green",
      "blocks": [
        "columns-social"
      ],
      "defaultContent": []
    },
    {
      "id": "section-10",
      "name": "contact",
      "selector": [
        "article.article > div.px-lg-0.overflow-hidden:not(.no-bumpers)"
      ],
      "style": null,
      "blocks": [
        "columns-contact"
      ],
      "defaultContent": []
    },
    {
      "id": "section-11",
      "name": "app-download",
      "selector": [
        "article.article > div.px-lg-0.overflow-hidden.no-bumpers",
        ".no-bumpers"
      ],
      "style": null,
      "blocks": [
        "columns-app"
      ],
      "defaultContent": []
    }
  ]
};

// TRANSFORMER REGISTRY - cleanup first, then sections (only when 2+ sections)
const transformers = [
  frostbankCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [frostbankSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document
 * @param {Object} template
 * @returns {Array} block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Invalid selector for "${blockDef.name}": ${selector}`);
      }
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        // instances[] are alternatives; skip elements already matched by an earlier selector
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform: initial cleanup + section markers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements detached by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform: final cleanup, heading normalization, section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path; root URL maps to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
