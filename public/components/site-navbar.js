const navigationItems = [
  { label: 'Prodotto', href: 'products.html', page: 'products.html' },
  { label: 'Tecnologia', href: 'tecnologia.html', page: 'tecnologia.html' },
  { label: 'Azienda', href: 'azienda.html', page: 'azienda.html' },
];

function currentPage() {
  const page = window.location.pathname.split('/').pop();
  return page || 'index.html';
}

function navigationLink({ label, href, page }) {
  const active = currentPage() === page;
  return `<a class="nav-link${active ? ' is-active' : ''}" href="${href}"${
    active ? ' aria-current="page"' : ''
  }>${label}</a>`;
}

export class SiteNavbar extends HTMLElement {
  connectedCallback() {
    if (this.dataset['rendered'] === 'true') return;

    const contactActive = currentPage() === 'contatti.html';

    this.innerHTML = `
      <a class="skip-main" href="#main">Contenuto principale</a>
      <a class="skip-main" href="#footer">Pi&egrave; di pagina</a>
      <header class="site-header" tabindex="-1" id="header">
        <div class="site-header__shell">
          <div class="site-header__desktop">
            <nav class="site-header__nav site-header__nav--left" aria-label="Navigazione principale desktop">
              ${navigationItems.map(navigationLink).join('')}
            </nav>
            <a class="site-header__brand" href="./" aria-label="Mentorage home">
              <img class="site-header__brand-image" src="assets/mentorage.svg" alt="Mentorage Logo" loading="lazy" />
            </a>
            <div class="site-header__nav site-header__nav--right">
              <a class="nav-link site-header__account-link${contactActive ? ' is-active' : ''}"
                href="contatti.html"${contactActive ? ' aria-current="page"' : ''}>Contatti</a>
            </div>
          </div>
          <div class="site-header__mobile">
            <button class="site-header__menu-toggle" type="button"
              aria-expanded="false" aria-controls="mobile-navigation" aria-label="Apri menu">
              <span class="site-header__menu-icon" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <a class="site-header__brand site-header__brand--mobile" href="./" aria-label="Mentorage home">
              <img class="site-header__brand-image" src="assets/mentorage.svg" alt="Mentorage Logo" loading="lazy" />
            </a>
            <span class="site-header__mobile-balance" aria-hidden="true"></span>
          </div>
          <nav class="site-header__mobile-menu" id="mobile-navigation" aria-label="Navigazione principale mobile" hidden>
            ${navigationItems.map(navigationLink).join('')}
            <a class="nav-link${contactActive ? ' is-active' : ''}"
              href="contatti.html"${contactActive ? ' aria-current="page"' : ''}>Contatti</a>
          </nav>
        </div>
      </header>`;

    this.menuToggle = this.querySelector('.site-header__menu-toggle');
    this.mobileMenu = this.querySelector('.site-header__mobile-menu');
    this.mobileViewport = window.matchMedia('(max-width: 760px)');

    this.handleMenuToggle = () => this.setMenuOpen(this.mobileMenu.hidden);
    this.handleMobileMenuClick = (event) => {
      if (event.target.closest('a')) this.setMenuOpen(false);
    };
    this.handleMenuKeydown = (event) => {
      if (event.key === 'Escape' && !this.mobileMenu.hidden) {
        this.setMenuOpen(false);
        this.menuToggle.focus();
      }
    };
    this.handleViewportChange = (event) => {
      if (!event.matches) this.setMenuOpen(false);
    };

    this.menuToggle.addEventListener('click', this.handleMenuToggle);
    this.mobileMenu.addEventListener('click', this.handleMobileMenuClick);
    this.addEventListener('keydown', this.handleMenuKeydown);
    this.mobileViewport.addEventListener('change', this.handleViewportChange);

    this.dataset['rendered'] = 'true';
  }

  setMenuOpen(open) {
    this.mobileMenu.hidden = !open;
    this.menuToggle.setAttribute('aria-expanded', String(open));
    this.menuToggle.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
    this.querySelector('.site-header')?.classList.toggle('is-menu-open', open);
  }

  disconnectedCallback() {
    this.menuToggle?.removeEventListener('click', this.handleMenuToggle);
    this.mobileMenu?.removeEventListener('click', this.handleMobileMenuClick);
    this.removeEventListener('keydown', this.handleMenuKeydown);
    this.mobileViewport?.removeEventListener('change', this.handleViewportChange);
    delete this.dataset['rendered'];
  }
}

if (!customElements.get('site-navbar')) {
  customElements.define('site-navbar', SiteNavbar);
}
