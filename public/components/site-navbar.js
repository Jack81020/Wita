import { getLanguage, onLanguageChange, setLanguage, translate } from "./site-i18n.js";

const navigationItems = [
  { key: "product", label: "Prodotto", href: "products.html", page: "products.html" },
  { key: "technology", label: "Tecnologia", href: "tecnologia.html", page: "tecnologia.html" },
  { key: "company", label: "Azienda", href: "azienda.html", page: "azienda.html" }
];

function currentPage() {
  const page = window.location.pathname.split("/").pop();
  return page || "index.html";
}

function navigationLink({ key, label, href, page }) {
  const active = currentPage() === page;
  return '<a class="nav-link' + (active ? " is-active" : "") + '" data-nav-key="' + key +
    '" href="' + href + '"' + (active ? ' aria-current="page"' : "") + ">" +
    translate(label) + "</a>";
}

function languageSwitcher(variant) {
  const language = getLanguage();
  return '<div class="site-header__language site-header__language--' + variant +
    '" data-language-switcher role="group" aria-label="' + translate("Seleziona lingua") + '">' +
    '<button type="button" data-language="it" aria-label="' + translate("Seleziona italiano") +
    '" aria-pressed="' + String(language === "it") + '" class="' + (language === "it" ? "is-active" : "") + '">IT</button>' +
    '<button type="button" data-language="en" aria-label="' + translate("Seleziona inglese") +
    '" aria-pressed="' + String(language === "en") + '" class="' + (language === "en" ? "is-active" : "") + '">EN</button>' +
    "</div>";
}

const labels = {
  product: "Prodotto",
  technology: "Tecnologia",
  company: "Azienda",
  contact: "Contatti",
  main: "Contenuto principale",
  footer: "Piè di pagina"
};

export class SiteNavbar extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered === "true") return;

    this.setAttribute("data-i18n-ignore", "");
    const contactActive = currentPage() === "contatti.html";

    this.innerHTML =
      '<a class="skip-main" data-nav-key="main" href="#main">' + translate(labels.main) + "</a>" +
      '<a class="skip-main" data-nav-key="footer" href="#footer">' + translate(labels.footer) + "</a>" +
      '<header class="site-header" tabindex="-1" id="header">' +
        '<div class="site-header__shell">' +
          '<div class="site-header__desktop">' +
            '<nav class="site-header__nav site-header__nav--left" data-nav-label="desktop" aria-label="' +
              translate("Navigazione principale desktop") + '">' +
              navigationItems.map(navigationLink).join("") +
            "</nav>" +
            '<a class="site-header__brand" href="./" aria-label="Mentorage home">' +
              '<img class="site-header__brand-image" src="assets/mentorage.svg" alt="Mentorage Logo" loading="lazy" />' +
            "</a>" +
            '<div class="site-header__nav site-header__nav--right">' +
              '<a class="nav-link site-header__account-link' + (contactActive ? " is-active" : "") +
                '" data-nav-key="contact" href="contatti.html"' +
                (contactActive ? ' aria-current="page"' : "") + ">" + translate(labels.contact) + "</a>" +
              languageSwitcher("desktop") +
            "</div>" +
          "</div>" +
          '<div class="site-header__mobile">' +
            '<button class="site-header__menu-toggle" type="button" aria-expanded="false" ' +
              'aria-controls="mobile-navigation" aria-label="' + translate("Apri menu") + '">' +
              '<span class="site-header__menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>' +
            "</button>" +
            '<a class="site-header__brand site-header__brand--mobile" href="./" aria-label="Mentorage home">' +
              '<img class="site-header__brand-image" src="assets/mentorage.svg" alt="Mentorage Logo" loading="lazy" />' +
            "</a>" +
            languageSwitcher("mobile") +
          "</div>" +
          '<nav class="site-header__mobile-menu" id="mobile-navigation" data-nav-label="mobile" aria-label="' +
            translate("Navigazione principale mobile") + '" hidden>' +
            navigationItems.map(navigationLink).join("") +
            '<a class="nav-link' + (contactActive ? " is-active" : "") +
              '" data-nav-key="contact" href="contatti.html"' +
              (contactActive ? ' aria-current="page"' : "") + ">" + translate(labels.contact) + "</a>" +
          "</nav>" +
        "</div>" +
      "</header>";

    this.menuToggle = this.querySelector(".site-header__menu-toggle");
    this.mobileMenu = this.querySelector(".site-header__mobile-menu");
    this.mobileViewport = window.matchMedia("(max-width: 760px)");

    this.handleMenuToggle = () => this.setMenuOpen(this.mobileMenu.hidden);
    this.handleMobileMenuClick = (event) => {
      if (event.target.closest("a")) this.setMenuOpen(false);
    };
    this.handleMenuKeydown = (event) => {
      if (event.key === "Escape" && !this.mobileMenu.hidden) {
        this.setMenuOpen(false);
        this.menuToggle.focus();
      }
    };
    this.handleViewportChange = (event) => {
      if (!event.matches) this.setMenuOpen(false);
    };
    this.handleLanguageClick = (event) => {
      const button = event.target.closest("[data-language]");
      if (!button || !this.contains(button)) return;
      setLanguage(button.dataset.language);
    };

    this.menuToggle.addEventListener("click", this.handleMenuToggle);
    this.mobileMenu.addEventListener("click", this.handleMobileMenuClick);
    this.addEventListener("click", this.handleLanguageClick);
    this.addEventListener("keydown", this.handleMenuKeydown);
    this.mobileViewport.addEventListener("change", this.handleViewportChange);
    this.removeLanguageListener = onLanguageChange((language) => this.syncLanguage(language));

    this.syncLanguage(getLanguage());
    this.dataset.rendered = "true";
  }

  syncLanguage(language) {
    this.querySelectorAll("[data-nav-key]").forEach((link) => {
      const source = labels[link.dataset.navKey];
      if (source) link.textContent = translate(source, language);
    });

    this.querySelector('[data-nav-label="desktop"]')?.setAttribute(
      "aria-label",
      translate("Navigazione principale desktop", language)
    );
    this.querySelector('[data-nav-label="mobile"]')?.setAttribute(
      "aria-label",
      translate("Navigazione principale mobile", language)
    );

    this.querySelectorAll("[data-language-switcher]").forEach((switcher) => {
      switcher.setAttribute("aria-label", translate("Seleziona lingua", language));
    });

    this.querySelectorAll("[data-language]").forEach((button) => {
      const isActive = button.dataset.language === language;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      button.setAttribute(
        "aria-label",
        translate(button.dataset.language === "it" ? "Seleziona italiano" : "Seleziona inglese", language)
      );
    });

    this.syncMenuLabel();
  }

  syncMenuLabel() {
    const open = this.menuToggle?.getAttribute("aria-expanded") === "true";
    this.menuToggle?.setAttribute("aria-label", translate(open ? "Chiudi menu" : "Apri menu"));
  }

  setMenuOpen(open) {
    this.mobileMenu.hidden = !open;
    this.menuToggle.setAttribute("aria-expanded", String(open));
    this.querySelector(".site-header")?.classList.toggle("is-menu-open", open);
    this.syncMenuLabel();
  }

  disconnectedCallback() {
    this.menuToggle?.removeEventListener("click", this.handleMenuToggle);
    this.mobileMenu?.removeEventListener("click", this.handleMobileMenuClick);
    this.removeEventListener("click", this.handleLanguageClick);
    this.removeEventListener("keydown", this.handleMenuKeydown);
    this.mobileViewport?.removeEventListener("change", this.handleViewportChange);
    this.removeLanguageListener?.();
    delete this.dataset.rendered;
  }
}

if (!customElements.get("site-navbar")) {
  customElements.define("site-navbar", SiteNavbar);
}