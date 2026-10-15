/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: frostbank.com section breaks + Section Metadata.
 *
 * - Inserts <hr> before every non-first section from payload.template.sections (beforeTransform,
 *   while section elements still exist), then appends Section Metadata for styled sections
 *   (afterTransform, anchored to marker <hr>s because parsers may replace section elements).
 * - Products section (purple): after the default-content section (heading + intro), emits one
 *   additional section per tab panel with Section Metadata { tab-id, tab-title, style }, which the
 *   project's tabs code reads as data-tab-id / data-tab-title (blocks/dynamic/index.js, blocks/tabs/tabs.js).
 *
 * Tab panel selectors verified in migration-work/cleaned.html:
 *   .bkgcolor-purple-88b #tab-0 (Personal), #tab-1 (Small Business), #tab-2 (Commercial)
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';
const TAB_MARKER_ATTR = 'data-excat-tab-id';

const TABS_SECTION_ID = 'section-5';
const TABS = [
  { selector: '.bkgcolor-purple-88b #tab-0', id: 'personal', title: 'Personal' },
  { selector: '.bkgcolor-purple-88b #tab-1', id: 'small-business', title: 'Small Business' },
  { selector: '.bkgcolor-purple-88b #tab-2', id: 'commercial', title: 'Commercial' },
];

// section.selector is an array of candidate selectors - first match wins.
function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) { /* unsupported selector - try next */ }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  const doc = element.ownerDocument || document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue;

      // Tab panels of the products section: one extra section break per panel (insert before the
      // .tab-pane so the parser target `.tab-pane > div.row` is untouched).
      if (section.id === TABS_SECTION_ID) {
        for (let t = TABS.length - 1; t >= 0; t -= 1) {
          const pane = element.querySelector(TABS[t].selector);
          if (!pane) continue;
          const tabHr = doc.createElement('hr');
          tabHr.setAttribute(TAB_MARKER_ATTR, TABS[t].id);
          pane.before(tabHr);
        }
      }

      if (i === 0 && !section.style) continue; // first section: no break, no metadata
      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];

      if (section.id === TABS_SECTION_ID) {
        for (let t = TABS.length - 1; t >= 0; t -= 1) {
          const tab = TABS[t];
          const tabMarker = element.querySelector(`[${TAB_MARKER_ATTR}="${tab.id}"]`);
          if (!tabMarker) continue;
          const cells = { 'tab-id': tab.id, 'tab-title': tab.title };
          if (section.style) cells.style = section.style;
          const tabMeta = WebImporter.Blocks.createBlock(doc, { name: 'Section Metadata', cells });
          tabMarker.after(tabMeta);
          tabMarker.removeAttribute(TAB_MARKER_ATTR);
        }
      }

      if (!section.style) continue;
      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove();
      }
    }
  }
}
