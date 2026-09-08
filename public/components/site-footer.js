import { getLanguage, onLanguageChange, translate } from "./site-i18n.js";

export class SiteFooter extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered === "true") return;

    this.setAttribute("data-i18n-ignore", "");
    this.render(getLanguage());
    this.removeLanguageListener = onLanguageChange((language) => this.render(language));
    this.dataset.rendered = "true";
  }

  render(language) {
    this.innerHTML =
      '<footer class="products-footer" id="footer">' +
        '<div class="products-footer__inner">' +
          '<div class="products-footer__brandblock">' +
            '<img class="products-footer__brand-image" src="assets/wita-care-footer-logo.png" alt="Wita Care">' +
            '<p class="products-footer__tag">' +
              translate("Capire prima, assistere meglio.", language) +
            "</p>" +
          "</div>" +
          '<div class="products-footer__content">' +
            '<div class="products-footer__column products-footer__column--main">' +
              "<h2>" + translate("Parliamo della tua struttura.", language) + "</h2>" +
              "<p>" + translate("Scopri come Mentorage™ può integrarsi nei tuoi ambienti e nei flussi di lavoro del personale.", language) + "</p>" +
            "</div>" +
            '<div class="products-footer__column products-footer__column--actions">' +
              '<a class="products-footer__button" href="contatti.html#richiedi-demo">' +
                translate("Richiedi una demo", language) + "</a>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="products-footer__legal">' +
          "<p>Copyright &copy; Wita S.r.l. 2026</p>" +
          '<nav aria-label="' + translate("Link legali", language) + '">' +
            '<a href="privacy.html">' + translate("Informativa sulla privacy", language) + "</a>" +
          "</nav>" +
        "</div>" +
      "</footer>";
  }

  disconnectedCallback() {
    this.removeLanguageListener?.();
    delete this.dataset.rendered;
  }
}

if (!customElements.get("site-footer")) {
  customElements.define("site-footer", SiteFooter);
}
