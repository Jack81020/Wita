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
            <a class="site-header__brand site-header__brand--mobile" href="./" aria-label="Mentorage home">
              <img class="site-header__brand-image" src="assets/mentorage.svg" alt="Mentorage Logo" loading="lazy" />
            </a>
          </div>
        </div>
      </header>`;

    this.dataset['rendered'] = 'true';
  }
}

if (!customElements.get('site-navbar')) {
  customElements.define('site-navbar', SiteNavbar);
}
