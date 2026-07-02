import { AfterViewInit, Component, ElementRef, OnDestroy, inject } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly cleanupFns: Array<() => void> = [];

  ngAfterViewInit(): void {
    this.setupHeroVideo();
    this.setupStickyHeader();
    this.setupTempElevationTabs();
    this.setupMemberStoryVideos();
    this.setupLeaderCards();
    this.setupInteractiveProductDrawer();
  }

  ngOnDestroy(): void {
    this.cleanupFns.forEach((cleanup) => cleanup());
    document.body.classList.remove('header-scrolled', 'wita-product-drawer-open');
  }

  private setupHeroVideo(): void {
    const root: HTMLElement = this.host.nativeElement;
    const video = root.querySelector<HTMLVideoElement>('.Pod5Hero_container__NsAaG video');
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');

    const attemptPlay = () => {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        void playPromise.catch(() => {});
      }
    };

    const onLoadedData = () => attemptPlay();
    const onCanPlay = () => attemptPlay();
    const onVisibilityChange = () => {
      if (!document.hidden) {
        attemptPlay();
      }
    };

    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('canplay', onCanPlay);
    document.addEventListener('visibilitychange', onVisibilityChange);

    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      video.load();
    }

    this.cleanupFns.push(() => {
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('canplay', onCanPlay);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    });
  }

  private setupTempElevationTabs(): void {
    const root: HTMLElement = this.host.nativeElement;
    const section = root.querySelector<HTMLElement>('.TempElevationSound_container__uBfdh');
    if (!section) return;

    const config = [
      { buttonId: 'jump-to-temperature', panelId: 'temp-elevation-sound-temperature' },
      { buttonId: 'jump-to-elevation', panelId: 'temp-elevation-sound-elevation' },
      { buttonId: 'jump-to-sound', panelId: 'temp-elevation-sound-sound' },
    ];

    const texts = Array.from(section.querySelectorAll<HTMLElement>('.TempElevationSound_text__E585b'));
    const items = Array.from(section.querySelectorAll<HTMLElement>('nav li'));

    const setActive = (activeIndex: number) => {
      config.forEach((item, index) => {
        const button = root.querySelector<HTMLElement>(`#${item.buttonId}`);
        const panel = root.querySelector<HTMLElement>(`#${item.panelId}`);
        const isActive = index === activeIndex;

        button?.setAttribute('aria-current', String(isActive));

        if (panel) {
          panel.dataset['active'] = String(isActive);
          panel.hidden = !isActive;
        }

        if (texts[index]) {
          texts[index].dataset['active'] = String(isActive);
          texts[index].hidden = !isActive;
        }

        if (items[index]) {
          items[index].dataset['active'] = String(isActive);
        }
      });
    };

    config.forEach((item, index) => {
      const button = root.querySelector<HTMLElement>(`#${item.buttonId}`);
      if (!button) return;

      const onClick = () => setActive(index);
      button.addEventListener('click', onClick);
      this.cleanupFns.push(() => button.removeEventListener('click', onClick));
    });

    setActive(0);
  }

  private setupMemberStoryVideos(): void {
    const root: HTMLElement = this.host.nativeElement;
    const storyBoxes = Array.from(root.querySelectorAll<HTMLElement>('.MemberStories_column__j4nXr'));

    storyBoxes.forEach((column) => {
      const preview = column.querySelector<HTMLElement>('.MemberStories_box__zqEfw');
      const playButton = column.querySelector<HTMLElement>('.MemberStories_video_start_button__udgxG');
      const videoWrapper = column.querySelector<HTMLElement>('.MemberStories_video_wrapper__n1YKa');
      const video = videoWrapper?.querySelector<HTMLVideoElement>('video');

      if (!preview || !playButton || !videoWrapper || !video) return;

      const onPlayClick = (event: Event) => {
        event.preventDefault();
        preview.style.display = 'none';
        videoWrapper.style.display = 'block';
        video.style.display = 'block';
        void video.play().catch(() => {});
      };

      const onEnded = () => {
        video.pause();
        video.currentTime = 0;
        video.style.display = 'none';
        videoWrapper.style.display = '';
        preview.style.display = '';
      };

      playButton.addEventListener('click', onPlayClick);
      video.addEventListener('ended', onEnded);

      this.cleanupFns.push(() => {
        playButton.removeEventListener('click', onPlayClick);
        video.removeEventListener('ended', onEnded);
      });
    });
  }

  private setupLeaderCards(): void {
    const root: HTMLElement = this.host.nativeElement;
    const cards = Array.from(root.querySelectorAll<HTMLElement>('.IndustryLeaders_image_card_container__zA7i_'));

    cards.forEach((card) => {
      const front = card.querySelector<HTMLElement>('.IndustryLeaders_card_front__7_lWz');
      const back = card.querySelector<HTMLElement>('.IndustryLeaders_card_back__CAcvI');
      const buttons = Array.from(card.querySelectorAll<HTMLElement>('.IndustryLeaders_flip_button__ldFk1'));

      if (!front || !back || buttons.length === 0) return;

      const setFlipped = (flipped: boolean) => {
        front.classList.toggle('hidden!', flipped);
        back.classList.toggle('hidden!', !flipped);
      };

      buttons.forEach((button) => {
        const onClick = () => {
          const shouldFlipToBack = back.classList.contains('hidden!');
          setFlipped(shouldFlipToBack);
        };

        button.addEventListener('click', onClick);
        this.cleanupFns.push(() => button.removeEventListener('click', onClick));
      });

      setFlipped(false);
    });
  }

  private setupStickyHeader(): void {
    const header = document.getElementById('header');
    if (!header) return;

    const threshold = 24;
    let ticking = false;

    const sync = () => {
      document.body.classList.toggle('header-scrolled', window.scrollY > threshold);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener('scroll', onScroll, { passive: true });
    this.cleanupFns.push(() => window.removeEventListener('scroll', onScroll));
  }

  private setupInteractiveProductDrawer(): void {
    const root: HTMLElement = this.host.nativeElement;
    const drawer = root.querySelector<HTMLElement>('[data-product-drawer]');
    const buttons = Array.from(root.querySelectorAll<HTMLElement>('.wita-pinging-dot[data-product]'));
    if (!drawer || buttons.length === 0) return;

    const image = drawer.querySelector<HTMLImageElement>('[data-product-image]');
    const eyebrow = drawer.querySelector<HTMLElement>('[data-product-eyebrow]');
    const title = drawer.querySelector<HTMLElement>('[data-product-title]');
    const description = drawer.querySelector<HTMLElement>('[data-product-description]');
    const closeTriggers = Array.from(drawer.querySelectorAll<HTMLElement>('[data-product-drawer-close]'));

    const products: Record<string, { eyebrow: string; title: string; description: string; image: string }> = {
      hub: {
        eyebrow: 'Hardware',
        title: 'Sensore intelligente',
        description:
          'Rileva lâ€™attivitÃ  nella stanza in tempo reale, in modo anonimo, continuo e non invasivo. Installato a parete o a soffitto, osserva lâ€™ambiente senza richiedere dispositivi indossabili, ricariche o interventi da parte dellâ€™ospite, trasformando ciÃ² che accade nella stanza in informazioni utili per lâ€™assistenza.',
        image: 'assets/hub-card.png',
      },
      'pillow-cover': {
        eyebrow: 'Accessorio',
        title: 'Portale desktop',
        description:
          'Offre una vista completa della struttura per monitorare stanze, eventi e prioritÃ  operative con immediatezza.',
        image: 'assets/pillow-cover-card.png',
      },
      blanket: {
        eyebrow: 'Accessorio',
        title: 'Web app mobile',
        description:
          'Rende notifiche e informazioni sempre accessibili, cosÃ¬ il personale puÃ² restare aggiornato anche in movimento. Gli operatori possono ricevere alert, controllare lo stato delle stanze e intervenire con maggiore tempestivitÃ , direttamente dal proprio smartphone, senza dover tornare ogni volta a una postazione fissa.',
        image: 'assets/blanket-card.png',
      },
    };

    let activeProduct: string | null = null;

    const renderProduct = (productId: string) => {
      const product = products[productId];
      if (!product) return;

      activeProduct = productId;
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('wita-product-drawer-open');

      buttons.forEach((button) => {
        const isActive = button.dataset['product'] === productId;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-expanded', String(isActive));
      });

      if (eyebrow) eyebrow.textContent = product.eyebrow;
      if (title) title.textContent = product.title;
      if (description) description.textContent = product.description;
      if (image) {
        image.src = product.image;
        image.alt = product.title;
      }
    };

    const closeDrawer = () => {
      activeProduct = null;
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('wita-product-drawer-open');

      buttons.forEach((button) => {
        button.classList.remove('is-active');
        button.setAttribute('aria-expanded', 'false');
      });
    };

    buttons.forEach((button) => {
      button.setAttribute('aria-expanded', 'false');

      const onClick = () => {
        const productId = button.dataset['product'];
        if (!productId) return;

        if (activeProduct === productId) {
          closeDrawer();
          return;
        }

        renderProduct(productId);
      };

      button.addEventListener('click', onClick);
      this.cleanupFns.push(() => button.removeEventListener('click', onClick));
    });

    closeTriggers.forEach((trigger) => {
      trigger.addEventListener('click', closeDrawer);
      this.cleanupFns.push(() => trigger.removeEventListener('click', closeDrawer));
    });

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', onKeydown);
    this.cleanupFns.push(() => document.removeEventListener('keydown', onKeydown));
  }
}
