export class SiteFooter extends HTMLElement {
  connectedCallback() {
    if (this.dataset['rendered'] === 'true') return;

    this.innerHTML = `
      <footer class="products-footer" id="footer">
        <div class="products-footer__inner">
          <div class="products-footer__brandblock">
            <img class="products-footer__logo" src="assets/wita-logo.png" alt="Wita Care" loading="lazy" />
            <p class="products-footer__tag">Soluzioni intelligenti per comprendere ci&ograve; che accade e intervenire quando conta.</p>
          </div>
          <div class="products-footer__content">
            <div class="products-footer__column products-footer__column--main">
              <h2>WITA S.r.l.</h2>
              <p>38123 Trento | Via della Cooperazione, 105</p>
              <p><a href="mailto:info@wita.care">info@wita.care</a></p>
              <p><a href="tel:+3904611610253">+39 0461 1610253</a></p>
              <p>P.IVA 02539330221</p>
            </div>
            <div class="products-footer__column products-footer__column--actions">
              <a class="products-footer__button"
                href="https://maps.google.com/?q=Via+della+Cooperazione+105,+38123+Trento"
                target="_blank" rel="noreferrer">Indicazioni stradali</a>
            </div>
          </div>
        </div>
        <div class="products-footer__legal">
          <p>Copyright &copy; Wita S.r.l. 2026</p>
          <nav aria-label="Link legali">
            <a href="privacy.html">Informativa sulla privacy</a>
          </nav>
        </div>
      </footer>`;

    this.dataset['rendered'] = 'true';
  }
}

if (!customElements.get('site-footer')) {
  customElements.define('site-footer', SiteFooter);
}
