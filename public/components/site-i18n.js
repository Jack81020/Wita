import globalEntries from "./i18n/global.js";
import homeEntries from "./i18n/home.js";
import pageEntries from "./i18n/pages.js";
import privacyEntries from "./i18n/privacy.js";

const STORAGE_KEY = "wita-language";
const SUPPORTED_LANGUAGES = new Set(["it", "en"]);
const TRANSLATABLE_ATTRIBUTES = ["placeholder", "aria-label", "title", "alt"];

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

const englishByItalian = new Map(
  [...globalEntries, ...homeEntries, ...pageEntries, ...privacyEntries]
    .map(([italian, english]) => [normalize(italian), english])
);

const originalTextNodes = new WeakMap();
const originalAttributes = new WeakMap();
let originalTitle = null;
let originalDescription = null;

function readStoredLanguage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGUAGES.has(stored) ? stored : "it";
  } catch {
    return "it";
  }
}

let currentLanguage = readStoredLanguage();

export function getLanguage() {
  return currentLanguage;
}

export function translate(value, language = currentLanguage) {
  if (language !== "en") return value;
  return englishByItalian.get(normalize(value)) || value;
}

function isIgnored(element) {
  return Boolean(element && element.closest("script, style, [data-i18n-ignore]"));
}

function translateTextNode(node) {
  const parent = node.parentElement;
  if (!parent || isIgnored(parent)) return;

  if (!originalTextNodes.has(node)) {
    originalTextNodes.set(node, node.nodeValue || "");
  }

  const source = originalTextNodes.get(node) || "";
  const core = normalize(source);
  if (!core) return;

  const leading = (source.match(/^\s*/) || [""])[0];
  const trailing = (source.match(/\s*$/) || [""])[0];
  const translated = currentLanguage === "en"
    ? (englishByItalian.get(core) || core)
    : core;
  const nextValue = leading + translated + trailing;

  if (node.nodeValue !== nextValue) {
    node.nodeValue = nextValue;
  }
}

function translateElementAttributes(element) {
  if (isIgnored(element)) return;

  let sources = originalAttributes.get(element);
  if (!sources) {
    sources = new Map();
    originalAttributes.set(element, sources);
  }

  TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
    if (!element.hasAttribute(attribute)) return;
    if (!sources.has(attribute)) {
      sources.set(attribute, element.getAttribute(attribute) || "");
    }

    const source = sources.get(attribute) || "";
    const nextValue = currentLanguage === "en" ? translate(source, "en") : source;
    if (element.getAttribute(attribute) !== nextValue) {
      element.setAttribute(attribute, nextValue);
    }
  });
}

function translateTree(root) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root);
    return;
  }

  if (!(root instanceof Document) && !(root instanceof DocumentFragment) && !(root instanceof Element)) {
    return;
  }

  if (root instanceof Element) {
    translateElementAttributes(root);
  }

  const ownerDocument = root instanceof Document ? root : root.ownerDocument;
  if (!ownerDocument) return;

  const textWalker = ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (textWalker.nextNode()) {
    translateTextNode(textWalker.currentNode);
  }

  if ("querySelectorAll" in root) {
    const selector = TRANSLATABLE_ATTRIBUTES.map((attribute) => "[" + attribute + "]").join(",");
    root.querySelectorAll(selector).forEach(translateElementAttributes);
  }
}

function translateDocumentMetadata() {
  if (originalTitle === null) {
    originalTitle = document.title;
  }

  const titleTranslations = {
    "Wita": "Wita Care | Mentorage",
    "Prodotto | Portale Mentorage": "Product | Mentorage Portal",
    "Tecnologia | Portale Mentorage": "Technology | Mentorage Portal",
    "Azienda | Wita Care": "Company | Wita Care",
    "Contatti | Portale Mentorage": "Contact | Mentorage Portal",
    "Informativa sulla privacy | Wita S.r.l.": "Privacy Policy | Wita S.r.l."
  };

  document.title = currentLanguage === "en"
    ? (titleTranslations[originalTitle] || originalTitle)
    : originalTitle;

  const description = document.querySelector('meta[name="description"]');
  if (!description) return;

  if (originalDescription === null) {
    originalDescription = description.getAttribute("content") || "";
  }

  description.setAttribute(
    "content",
    currentLanguage === "en" ? translate(originalDescription, "en") : originalDescription
  );
}

export function applyLanguage(root = document) {
  document.documentElement.lang = currentLanguage;
  translateTree(root);
  translateDocumentMetadata();
}

export function setLanguage(language) {
  if (!SUPPORTED_LANGUAGES.has(language) || language === currentLanguage) return;

  currentLanguage = language;
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Keep the current-page selection if browser storage is unavailable.
  }

  applyLanguage(document);
  window.dispatchEvent(new CustomEvent("wita:languagechange", {
    detail: { language }
  }));
}

export function onLanguageChange(listener) {
  const handler = (event) => listener(event.detail.language);
  window.addEventListener("wita:languagechange", handler);
  return () => window.removeEventListener("wita:languagechange", handler);
}

function initialize() {
  applyLanguage(document);

  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.type === "characterData") {
        translateTextNode(record.target);
        return;
      }

      record.addedNodes.forEach((node) => translateTree(node));
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true });
} else {
  initialize();
}