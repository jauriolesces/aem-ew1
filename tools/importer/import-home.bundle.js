/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-illustrated.js
  function parse(element, { document: document2 }) {
    const imageWrap = element.querySelector(".hero-image") || element.querySelector(".hero-image-mobile");
    const img = imageWrap ? imageWrap.querySelector("img") : element.querySelector("img");
    const imgLink = img ? img.closest("a") : null;
    const content = element.querySelector(".hero-content") || element;
    const headingSrc = content.querySelector(".header-1, h1, h2");
    const description = content.querySelector("p");
    const cta = content.querySelector("a.btn") || [...content.querySelectorAll("a")].find((a) => !a.querySelector("img"));
    if (!headingSrc && !description && !img) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cell = [];
    if (img) {
      if (!img.hasAttribute("alt")) img.setAttribute("alt", "");
      const p = document2.createElement("p");
      if (imgLink && imgLink.getAttribute("href")) {
        const a = document2.createElement("a");
        a.href = imgLink.getAttribute("href");
        a.append(img);
        p.append(a);
      } else {
        p.append(img);
      }
      cell.push(p);
    }
    if (headingSrc) {
      const h1 = document2.createElement("h1");
      h1.innerHTML = headingSrc.innerHTML.trim();
      cell.push(h1);
    }
    if (description) {
      const p = document2.createElement("p");
      p.innerHTML = description.innerHTML.trim();
      cell.push(p);
    }
    if (cta) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href");
      a.textContent = cta.textContent.trim();
      p.append(a);
      cell.push(p);
    }
    const cells = [[cell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-illustrated", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-video.js
  var DEFAULT_ORIGIN = "https://www.frostbank.com";
  function absolute(url, origin) {
    if (!url) return "";
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
    } catch (e) {
    }
    return DEFAULT_ORIGIN;
  }
  function parse2(element, { document: document2, params }) {
    const origin = getOrigin(params);
    const videoComponent = element.querySelector(".video-component");
    const columns = [...element.querySelectorAll(":scope > div")];
    const textCol = columns.find((col) => !col.querySelector(".video-component")) || element;
    const textCell = [];
    const headingSrc = textCol.querySelector(".header-1, .header-2, h1, h2, h3");
    if (headingSrc) {
      const h2 = document2.createElement("h2");
      h2.innerHTML = headingSrc.innerHTML.trim();
      textCell.push(h2);
    }
    [...textCol.querySelectorAll("p")].forEach((p) => {
      if (p.textContent.trim()) textCell.push(p);
    });
    const cta = textCol.querySelector("a.btn") || [...textCol.querySelectorAll("a[href]")].find((a) => !a.closest("p"));
    if (cta) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href");
      a.textContent = cta.textContent.trim();
      p.append(a);
      textCell.push(p);
    }
    const mediaCell = [];
    const seenVideos = /* @__PURE__ */ new Set();
    const addPair = (img, videoUrl) => {
      if (!img) return;
      if (videoUrl) {
        const key = absolute(videoUrl, origin);
        if (seenVideos.has(key)) return;
        seenVideos.add(key);
      }
      const pic = document2.createElement("p");
      const image = document2.createElement("img");
      image.src = img.getAttribute("src");
      image.alt = img.getAttribute("alt") || "";
      pic.append(image);
      mediaCell.push(pic);
      if (videoUrl) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = absolute(videoUrl, origin);
        a.textContent = a.href;
        p.append(a);
        mediaCell.push(p);
      }
    };
    if (videoComponent) {
      const mainImg = videoComponent.querySelector("#mainThumbnail img") || videoComponent.querySelector("button img");
      const mainSource = videoComponent.querySelector("video source[src]") || videoComponent.querySelector("video[src]");
      const mainVideoUrl = mainSource ? mainSource.getAttribute("src") : "";
      addPair(mainImg, mainVideoUrl);
      const thumbs = [...videoComponent.querySelectorAll("#thumbnailRow img, img.thumbnail-preview")].filter((img, i, arr) => arr.indexOf(img) === i);
      thumbs.forEach((img) => {
        var _a;
        const url = img.getAttribute("data-src") || ((_a = img.closest("[data-src]")) == null ? void 0 : _a.getAttribute("data-src")) || "";
        addPair(img, url);
      });
    } else {
      const mediaCol = columns.find((col) => col !== textCol);
      if (mediaCol) mediaCol.querySelectorAll("img").forEach((img) => addPair(img, ""));
    }
    if (!textCell.length && !mediaCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[textCell, mediaCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse3(element, { document: document2 }) {
    let items = [...element.querySelectorAll(':scope > div[class*="col-"]')];
    if (!items.length) items = [...element.querySelectorAll(":scope > div")];
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img");
      const titleSrc = item.querySelector(".check-card-header, .header-2, .header-3, h2, h3, h4");
      const descSrc = [...item.querySelectorAll("div, p")].find((el) => el !== titleSrc && !el.contains(titleSrc) && !el.querySelector("img, div, p") && el.textContent.trim());
      if (!img && !titleSrc && !descSrc) return;
      const imageCell = [];
      if (img) {
        if (!img.getAttribute("alt")) img.setAttribute("alt", "");
        imageCell.push(img);
      }
      const textCell = [];
      if (titleSrc) {
        const h3 = document2.createElement("h3");
        h3.innerHTML = titleSrc.innerHTML.trim();
        textCell.push(h3);
      }
      if (descSrc) {
        const p = document2.createElement("p");
        p.innerHTML = descSrc.innerHTML.trim();
        textCell.push(p);
      }
      cells.push([imageCell.length ? imageCell : "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/teaser-banner.js
  function parse4(element, { document: document2 }) {
    const icon = element.querySelector("img.banner-icon") || element.querySelector("img");
    const titleSrc = element.querySelector(".banner-title, .header-2, .header-3, h2, h3");
    const descriptions = [...element.querySelectorAll("p")].filter((p) => p !== titleSrc && !p.contains(titleSrc) && p.textContent.trim());
    const cta = element.querySelector("a.btn") || [...element.querySelectorAll("a[href]")].find((a) => !a.querySelector("img"));
    if (!titleSrc && !descriptions.length && !cta) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const iconCell = [];
    if (icon) {
      icon.setAttribute("alt", "");
      iconCell.push(icon);
    }
    const bodyCell = [];
    if (titleSrc) {
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      strong.textContent = titleSrc.textContent.trim();
      p.append(strong);
      bodyCell.push(p);
    }
    descriptions.forEach((d) => {
      const p = document2.createElement("p");
      p.innerHTML = d.innerHTML.trim();
      bodyCell.push(p);
    });
    const ctaCell = [];
    if (cta) {
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href");
      a.textContent = cta.textContent.trim();
      ctaCell.push(a);
    }
    const cells = [[iconCell.length ? iconCell : "", bodyCell.length ? bodyCell : "", ctaCell.length ? ctaCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "teaser-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-products.js
  function parse5(element, { document: document2 }) {
    const tileWrappers = [...element.querySelectorAll('.gutter-16 > div[class*="col-"]')];
    const tileItems = tileWrappers.length ? tileWrappers.map((w) => w.querySelector("a[href]")).filter(Boolean) : [...element.querySelectorAll("a.product-card")];
    const ul = document2.createElement("ul");
    tileItems.forEach((link) => {
      const li = document2.createElement("li");
      const iconSrc = link.querySelector("img.hover-hidden") || link.querySelector("img:not(.hover-show)") || link.querySelector("img");
      if (iconSrc) {
        const img = document2.createElement("img");
        img.src = iconSrc.getAttribute("src");
        img.alt = "";
        li.append(img);
      }
      const a = document2.createElement("a");
      a.href = link.getAttribute("href");
      const label = link.querySelector("strong.cta, .cta, strong, span");
      a.textContent = (label ? label.textContent : link.textContent).trim();
      li.append(a);
      ul.append(li);
    });
    const promoCell = [];
    const promo = element.querySelector("a.big-product-card") || [...element.querySelectorAll(":scope > div")].find((col) => !col.querySelector(".gutter-16"));
    if (promo) {
      const headingSrc = promo.querySelector(".header-2, .header-1, h2, h3");
      if (headingSrc) {
        const h3 = document2.createElement("h3");
        h3.textContent = headingSrc.textContent.trim();
        promoCell.push(h3);
      }
      const textSrc = [...promo.querySelectorAll("div, p")].find((el) => el !== headingSrc && !el.contains(headingSrc) && !(headingSrc == null ? void 0 : headingSrc.contains(el)) && !el.querySelector("img") && el.textContent.trim());
      if (textSrc) {
        const innerP = textSrc.matches("p") ? textSrc : textSrc.querySelector("p");
        const p = document2.createElement("p");
        p.innerHTML = (innerP || textSrc).innerHTML.trim();
        promoCell.push(p);
      }
      const promoImg = promo.querySelector("img");
      if (promoImg) {
        const img = document2.createElement("img");
        img.src = promoImg.getAttribute("src");
        img.alt = promoImg.getAttribute("alt") || "";
        const p = document2.createElement("p");
        p.append(img);
        promoCell.push(p);
      }
      const promoLink = promo.matches("a[href]") ? promo : promo.querySelector("a[href]");
      if (promoLink) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = promoLink.getAttribute("href");
        a.textContent = (promoLink.getAttribute("title") || (headingSrc == null ? void 0 : headingSrc.textContent) || a.href).trim();
        p.append(a);
        promoCell.push(p);
      }
    }
    if (!ul.children.length && !promoCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[ul.children.length ? ul : "", promoCell.length ? promoCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-products", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-community.js
  function parse6(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".full-promotile")];
    if (!items.length) items = [...element.querySelectorAll(":scope > div")];
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img");
      const body = item.querySelector(".promotile-body") || item;
      const titleSrc = body.querySelector(".header-3, .header-2, h2, h3, h4");
      const descSrc = [...body.querySelectorAll(":scope > div, :scope > p")].find((el) => el !== titleSrc && !el.querySelector("a") && el.textContent.trim());
      const linkSrc = item.querySelector("a.promotile-link, a[href]");
      if (!img && !titleSrc && !descSrc) return;
      const imageCell = [];
      if (img) {
        if (!img.hasAttribute("alt")) img.setAttribute("alt", "");
        imageCell.push(img);
      }
      const textCell = [];
      if (titleSrc) {
        const h3 = document2.createElement("h3");
        h3.textContent = titleSrc.textContent.trim();
        textCell.push(h3);
      }
      if (descSrc) {
        const ps = descSrc.matches("p") ? [descSrc] : [...descSrc.querySelectorAll("p")];
        if (ps.length) {
          ps.forEach((src) => {
            const p = document2.createElement("p");
            p.innerHTML = src.innerHTML.replace(/&nbsp;| /g, " ").trim();
            textCell.push(p);
          });
        } else {
          const p = document2.createElement("p");
          p.innerHTML = descSrc.innerHTML.trim();
          textCell.push(p);
        }
      }
      const href = linkSrc ? (linkSrc.getAttribute("href") || "").trim() : "";
      if (href && href !== "#") {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = linkSrc.textContent.trim() || (titleSrc ? titleSrc.textContent.trim() : href);
        p.append(a);
        textCell.push(p);
      }
      cells.push([imageCell.length ? imageCell : "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-community", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-photo.js
  function parse7(element, { document: document2 }) {
    const columns = [...element.querySelectorAll(":scope > div")];
    const photoCol = columns.find((c) => c.querySelector("img")) || element;
    const textCol = columns.find((c) => c !== photoCol && c.querySelector(".header-1, .header-2, h1, h2, a")) || element;
    const photoCell = [];
    const img = photoCol.querySelector("img");
    if (img) {
      if (!img.hasAttribute("alt")) img.setAttribute("alt", "");
      photoCell.push(img);
    }
    const label = photoCol.querySelector(".header-5, .header-4, strong");
    const creditParts = [...photoCol.querySelectorAll("div, p")].filter((el) => el !== label && !el.contains(label) && !el.querySelector("div, p, img") && el.textContent.trim());
    if (label || creditParts.length) {
      const p = document2.createElement("p");
      if (label) {
        const strong = document2.createElement("strong");
        strong.textContent = label.textContent.trim();
        p.append(strong);
      }
      creditParts.forEach((c) => {
        p.append(document2.createTextNode(` ${c.textContent.trim()}`));
      });
      photoCell.push(p);
    }
    const textCell = [];
    const headingSrc = textCol.querySelector(".header-1, .header-2, h1, h2, h3");
    if (headingSrc) {
      const h2 = document2.createElement("h2");
      h2.textContent = headingSrc.textContent.trim();
      textCell.push(h2);
    }
    [...textCol.querySelectorAll(":scope > div, :scope > p")].filter((el) => el !== headingSrc && el.textContent.trim()).forEach((el) => {
      const p = document2.createElement("p");
      p.textContent = el.textContent.replace(/\s+/g, " ").trim();
      textCell.push(p);
    });
    const ctas = [...textCol.querySelectorAll("a[href]")];
    ctas.forEach((cta, i) => {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href");
      a.textContent = cta.textContent.trim();
      const isSecondary = cta.classList.contains("btn-secondary") || i > 0 && !cta.classList.contains("btn-primary");
      const wrap = document2.createElement(isSecondary ? "em" : "strong");
      wrap.append(a);
      p.append(wrap);
      textCell.push(p);
    });
    if (!photoCell.length && !textCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[photoCell.length ? photoCell : "", textCell.length ? textCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-photo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-awards.js
  function parse8(element, { document: document2 }) {
    let slides = [...element.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)")];
    if (!slides.length) slides = [...element.querySelectorAll(":scope > div > div")];
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector("img");
      const headingSrc = slide.querySelector("h1, h2, h3, h4, .header-1, .header-2");
      const paragraphs = [...slide.querySelectorAll("p")].filter((p) => p.textContent.trim());
      if (!img && !headingSrc && !paragraphs.length) return;
      const imageCell = [];
      if (img) {
        if (!img.hasAttribute("alt")) img.setAttribute("alt", "");
        imageCell.push(img);
      }
      const textCell = [];
      if (headingSrc) {
        const h3 = document2.createElement("h3");
        h3.textContent = headingSrc.textContent.trim();
        textCell.push(h3);
      }
      paragraphs.forEach((src) => {
        const p = document2.createElement("p");
        p.innerHTML = src.innerHTML.replace(/\s+/g, " ").trim();
        textCell.push(p);
      });
      cells.push([imageCell.length ? imageCell : "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-awards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-social.js
  var PLATFORMS = [
    { name: "facebook", test: /facebook/i },
    { name: "instagram", test: /instagram/i },
    { name: "linkedin", test: /linkedin/i },
    { name: "tiktok", test: /tiktok/i },
    { name: "x", test: /(^|[^a-z])(x|twitter)([^a-z]|$)|twitter\.com|x\.com/i },
    { name: "youtube", test: /youtube|youtu\.be/i }
  ];
  function platformOf(link) {
    const title = (link.getAttribute("title") || "").trim();
    const href = link.getAttribute("href") || "";
    const iconClass = [...link.querySelectorAll("i")].map((i) => i.className).join(" ");
    const match = PLATFORMS.find((p) => p.test.test(title)) || PLATFORMS.find((p) => p.test.test(href)) || PLATFORMS.find((p) => p.test.test(iconClass));
    return match ? match.name : "";
  }
  function parse9(element, { document: document2 }) {
    const columns = [...element.querySelectorAll(":scope > div")];
    const linksCol = element.querySelector(".socials") || columns.find((c) => c.querySelector("a[href]"));
    const headingCol = columns.find((c) => c !== linksCol && !c.querySelector("a[href]") && c.textContent.trim());
    const headingCell = [];
    if (headingCol) {
      const h2 = document2.createElement("h2");
      h2.textContent = headingCol.textContent.replace(/\s+/g, " ").trim();
      headingCell.push(h2);
    }
    const linksCell = [];
    const links = linksCol ? [...linksCol.querySelectorAll("a[href]")] : [];
    if (links.length) {
      const p = document2.createElement("p");
      links.forEach((link, i) => {
        const name = platformOf(link);
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        const title = (link.getAttribute("title") || "").trim();
        if (title) a.title = title;
        if (name) {
          a.textContent = `:${name}:`;
        } else {
          a.textContent = title || link.textContent.trim() || a.href;
        }
        if (i > 0) p.append(document2.createTextNode(" "));
        p.append(a);
      });
      linksCell.push(p);
    }
    if (!headingCell.length && !linksCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[headingCell.length ? headingCell : "", linksCell.length ? linksCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-social", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-contact.js
  function parse10(element, { document: document2 }) {
    const headingSrc = element.querySelector(".header-1, .header-2, h1, h2");
    const textCol = headingSrc ? [...element.querySelectorAll(":scope > div")].find((c) => c.contains(headingSrc)) || element : element;
    const photoCol = element.querySelector(":scope > .d-md-block") || [...element.querySelectorAll(":scope > div")].find((c) => c !== textCol && c.querySelector("img"));
    const photoCandidates = photoCol ? [...photoCol.querySelectorAll("img")] : [];
    const photo = photoCandidates.find((img) => img.getAttribute("role") !== "presentation") || photoCandidates[0];
    const photoCell = [];
    if (photo) {
      if (!photo.hasAttribute("alt")) photo.setAttribute("alt", "");
      photoCell.push(photo);
    }
    const textCell = [];
    if (headingSrc) {
      const h2 = document2.createElement("h2");
      h2.textContent = headingSrc.textContent.trim();
      textCell.push(h2);
    }
    [...textCol.querySelectorAll("p")].filter((p) => p.textContent.trim()).forEach((src) => {
      const p = document2.createElement("p");
      p.textContent = src.textContent.replace(/\s+/g, " ").trim();
      textCell.push(p);
    });
    [...textCol.querySelectorAll("a[href]")].forEach((cta, i) => {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href");
      a.textContent = cta.textContent.trim();
      const isSecondary = cta.classList.contains("btn-secondary") || i > 0 && !cta.classList.contains("btn-primary");
      const wrap = document2.createElement(isSecondary ? "em" : "strong");
      wrap.append(a);
      p.append(wrap);
      textCell.push(p);
    });
    if (!photoCell.length && !textCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[photoCell.length ? photoCell : "", textCell.length ? textCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-contact", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-app.js
  function parse11(element, { document: document2 }) {
    const columns = [...element.querySelectorAll(":scope > div")];
    const headingSrc = element.querySelector(".header-1, .header-2, h1, h2");
    const textCol = columns.find((c) => headingSrc && c.contains(headingSrc)) || columns.find((c) => c.querySelector("a[href]")) || element;
    const imageCol = columns.find((c) => c !== textCol && c.querySelector("img"));
    const textCell = [];
    if (headingSrc) {
      const h2 = document2.createElement("h2");
      h2.textContent = headingSrc.textContent.trim();
      textCell.push(h2);
    }
    [...textCol.querySelectorAll("p")].filter((p) => p !== headingSrc && p.textContent.trim()).forEach((src) => {
      const p = document2.createElement("p");
      p.textContent = src.textContent.replace(/\s+/g, " ").trim();
      textCell.push(p);
    });
    [...textCol.querySelectorAll("a[href]")].forEach((link) => {
      const badge = link.querySelector("img");
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = link.getAttribute("href");
      if (badge) {
        const img = document2.createElement("img");
        img.src = badge.getAttribute("src");
        img.alt = badge.getAttribute("alt") || "";
        a.append(img);
      } else {
        a.textContent = link.textContent.trim();
      }
      p.append(a);
      textCell.push(p);
    });
    const imageCell = [];
    const deviceImg = imageCol ? imageCol.querySelector("img") : null;
    if (deviceImg) {
      if (!deviceImg.hasAttribute("alt")) deviceImg.setAttribute("alt", "");
      imageCell.push(deviceImg);
    }
    if (!textCell.length && !imageCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[textCell.length ? textCell : "", imageCell.length ? imageCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-app", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/frostbank-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var DEFAULT_ORIGIN2 = "https://www.frostbank.com";
  function getOrigin2(payload) {
    try {
      const url = payload && payload.params && payload.params.originalURL || payload && payload.url;
      if (url) {
        const { origin } = new URL(url);
        if (origin && !/localhost|127\.0\.0\.1/.test(origin)) return origin;
      }
    } catch (e) {
    }
    return DEFAULT_ORIGIN2;
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
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      const origin = getOrigin2(payload);
      const doc = element.ownerDocument || payload && payload.document;
      if (doc) {
        const descMetas = [...doc.querySelectorAll("meta[name]")].filter((m) => (m.getAttribute("name") || "").trim().toLowerCase() === "description");
        descMetas.forEach((m, i) => {
          if (i === 0) {
            m.setAttribute("name", "description");
            m.setAttribute("content", (m.getAttribute("content") || "").trim());
          } else if (m.hasAttribute("property")) {
            m.removeAttribute("name");
          } else {
            m.remove();
          }
        });
      }
      WebImporter.DOMUtils.remove(element, [
        "#menuModal",
        "#searchBar",
        "#third-party-modal",
        // GTM noscript iframe: <iframe src="https://www.googletagmanager.com/ns.html?...">
        'iframe[src*="googletagmanager"]'
      ]);
      const firstBodyDiv = element.ownerDocument.querySelector("body > div:nth-of-type(1)");
      if (firstBodyDiv && !firstBodyDiv.querySelector("main, article") && !firstBodyDiv.textContent.trim()) {
        firstBodyDiv.remove();
      }
      WebImporter.DOMUtils.remove(element, [".tabbed-navigation"]);
      WebImporter.DOMUtils.remove(element, [
        // hero: <div class="hero-image-mobile d-md-none">
        ".hero-wrapper .hero-image-mobile.d-md-none",
        // community: <div id="promo-tile"> > <div class="d-block d-md-none"> (mobile swiper)
        "#promo-tile > .d-block.d-md-none",
        // contact: <div class="row d-md-none flex-nowrap"> (mobile images)
        ".overflow-hidden div.row.d-md-none.flex-nowrap",
        // app download: <div class="d-md-none overflow-hidden position-relative"> (mobile view)
        ".no-bumpers div.d-md-none.overflow-hidden.position-relative",
        // app download: <div class="d-none d-xxl-block h-100"> duplicate phone image (twin of .d-xxl-none)
        ".no-bumpers div.d-none.d-xxl-block"
      ]);
      WebImporter.DOMUtils.remove(element, [".swiper-controls", ".swiper-notification"]);
      element.querySelectorAll("img[src], source[src], track[src], video[src]").forEach((el) => {
        el.setAttribute("src", toAbsolute(el.getAttribute("src"), origin));
      });
      element.querySelectorAll("video[poster]").forEach((el) => {
        el.setAttribute("poster", toAbsolute(el.getAttribute("poster"), origin));
      });
      element.querySelectorAll("img[srcset], source[srcset]").forEach((el) => {
        const srcset = el.getAttribute("srcset").split(",").map((part) => {
          const [u, ...rest] = part.trim().split(/\s+/);
          return [toAbsolute(u, origin), ...rest].join(" ");
        }).join(", ");
        el.setAttribute("srcset", srcset);
      });
      element.querySelectorAll('a[href^="/dam/"]').forEach((a) => {
        a.setAttribute("href", toAbsolute(a.getAttribute("href"), origin));
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "a.skip-main",
        "nav.top-nav",
        "nav#mobile-nav",
        "nav#mobile-nav-menu",
        "footer.aurora-footer",
        "iframe",
        "noscript",
        "script",
        "link"
      ]);
      WebImporter.DOMUtils.remove(element, ["#video-buttons"]);
      element.querySelectorAll('i[class*="fa-"]').forEach((i) => {
        if (!i.textContent.trim() && !i.querySelector("img")) i.remove();
      });
      element.querySelectorAll(".bkgcolor-white-1ee div.section > h1").forEach((h1) => renameTag(h1, "h2"));
      if (!element.querySelector("h1")) {
        let heroHeading = element.querySelector(".hero-content .header-1");
        if (!heroHeading) {
          const firstTable = element.querySelector("table");
          heroHeading = firstTable ? firstTable.querySelector("div.header-1") : null;
        }
        if (heroHeading) renameTag(heroHeading, "h1");
      }
      element.querySelectorAll("div.header-1:not(.row), p.header-1").forEach((el) => renameTag(el, "h2"));
      element.querySelectorAll("div.header-2:not(.row)").forEach((el) => renameTag(el, "h3"));
      [...element.querySelectorAll("h1")].slice(1).forEach((h1) => renameTag(h1, "h2"));
    }
  }

  // tools/importer/transformers/frostbank-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  var TAB_MARKER_ATTR = "data-excat-tab-id";
  var TABS_SECTION_ID = "section-5";
  var TABS = [
    { selector: ".bkgcolor-purple-88b #tab-0", id: "personal", title: "Personal" },
    { selector: ".bkgcolor-purple-88b #tab-1", id: "small-business", title: "Small Business" },
    { selector: ".bkgcolor-purple-88b #tab-2", id: "commercial", title: "Commercial" }
  ];
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        if (section.id === TABS_SECTION_ID) {
          for (let t = TABS.length - 1; t >= 0; t -= 1) {
            const pane = element.querySelector(TABS[t].selector);
            if (!pane) continue;
            const tabHr = doc.createElement("hr");
            tabHr.setAttribute(TAB_MARKER_ATTR, TABS[t].id);
            pane.before(tabHr);
          }
        }
        if (i === 0 && !section.style) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (section.id === TABS_SECTION_ID) {
          for (let t = TABS.length - 1; t >= 0; t -= 1) {
            const tab = TABS[t];
            const tabMarker = element.querySelector(`[${TAB_MARKER_ATTR}="${tab.id}"]`);
            if (!tabMarker) continue;
            const cells = { "tab-id": tab.id, "tab-title": tab.title };
            if (section.style) cells.style = section.style;
            const tabMeta = WebImporter.Blocks.createBlock(doc, { name: "Section Metadata", cells });
            tabMarker.after(tabMeta);
            tabMarker.removeAttribute(TAB_MARKER_ATTR);
          }
        }
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "hero-illustrated": parse,
    "columns-video": parse2,
    "cards-feature": parse3,
    "teaser-banner": parse4,
    "columns-products": parse5,
    "cards-community": parse6,
    "columns-photo": parse7,
    "carousel-awards": parse8,
    "columns-social": parse9,
    "columns-contact": parse10,
    "columns-app": parse11
  };
  var PAGE_TEMPLATE = {
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
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        let elements = [];
        try {
          elements = document2.querySelectorAll(selector);
        } catch (e) {
          console.warn(`Invalid selector for "${blockDef.name}": ${selector}`);
        }
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
