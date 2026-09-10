import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnDestroy, inject } from '@angular/core';

export const HERO_STEP_TIMELINE = [
  { startSeconds: 16, endSeconds: 26 },
  { startSeconds: 26, endSeconds: 30 },
  { startSeconds: 30, endSeconds: 40 },
] as const;

export function getHeroStepIndex(currentTime: number): number {
  return HERO_STEP_TIMELINE.findIndex(
    ({ startSeconds, endSeconds }) => currentTime >= startSeconds && currentTime < endSeconds,
  );
}

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly cleanupFns: Array<() => void> = [];

  ngAfterViewInit(): void {
    this.setupHeroVideo();
    this.setupPriorityCarousel();
    this.setupMemberStoryVideos();
    this.setupLeaderCards();
    this.setupInteractiveProductDrawer();
  }

  ngOnDestroy(): void {
    this.cleanupFns.forEach((cleanup) => cleanup());
    document.body.classList.remove('wita-product-drawer-open');
  }

  private setupPriorityCarousel(): void {
    const root: HTMLElement = this.host.nativeElement;
    const carousel = root.querySelector<HTMLElement>('[data-priority-carousel]');
    const previousButton = root.querySelector<HTMLButtonElement>('[data-priority-prev]');
    const nextButton = root.querySelector<HTMLButtonElement>('[data-priority-next]');

    if (!carousel || !previousButton || !nextButton) return;

    const getScrollStep = () => {
      const card = carousel.querySelector<HTMLElement>('[data-card="true"]');
      const track = card?.parentElement;
      const gap = track ? Number.parseFloat(window.getComputedStyle(track).columnGap || '0') : 0;

      return (card?.getBoundingClientRect().width || carousel.clientWidth * 0.8) + gap;
    };

    const updateControls = () => {
      const maximumScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
      previousButton.disabled = carousel.scrollLeft <= 2;
      nextButton.disabled = carousel.scrollLeft >= maximumScroll - 2;
    };

    const scrollByCard = (direction: -1 | 1) => {
      carousel.scrollBy({
        left: direction * getScrollStep(),
        behavior: 'smooth',
      });
    };

    const onPrevious = () => scrollByCard(-1);
    const onNext = () => scrollByCard(1);
    const onScroll = () => updateControls();
    const onResize = () => updateControls();

    previousButton.addEventListener('click', onPrevious);
    nextButton.addEventListener('click', onNext);
    carousel.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    updateControls();

    this.cleanupFns.push(() => {
      previousButton.removeEventListener('click', onPrevious);
      nextButton.removeEventListener('click', onNext);
      carousel.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    });
  }

  private setupHeroVideo(): void {
    const root: HTMLElement = this.host.nativeElement;
    const video = root.querySelector<HTMLVideoElement>('.Pod5Hero_container__NsAaG video');
    if (!video) return;

    const heroSteps = Array.from(root.querySelectorAll<HTMLElement>('.wita-hero-steps li'));
    let activeStepIndex = -1;

    const syncHeroSteps = () => {
      const nextStepIndex = getHeroStepIndex(video.currentTime);
      if (activeStepIndex === nextStepIndex) return;

      activeStepIndex = nextStepIndex;
      heroSteps.forEach((step, index) => {
        const isActive = index === activeStepIndex;
        step.classList.toggle('is-active', isActive);

        if (isActive) {
          step.setAttribute('aria-current', 'step');
        } else {
          step.removeAttribute('aria-current');
        }
      });
    };

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
        void playPromise.catch(() => { });
      }
    };

    const onLoadedData = () => attemptPlay();
    const onCanPlay = () => attemptPlay();
    const onTimeUpdate = () => syncHeroSteps();
    const onVisibilityChange = () => {
      if (!document.hidden) {
        attemptPlay();
      }
    };

    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('seeking', onTimeUpdate);
    video.addEventListener('loadedmetadata', onTimeUpdate);
    document.addEventListener('visibilitychange', onVisibilityChange);

    syncHeroSteps();

    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      video.load();
    }

    this.cleanupFns.push(() => {
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('seeking', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onTimeUpdate);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    });
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
        void video.play().catch(() => { });
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

  private setupInteractiveProductDrawer(): void {
    const root: HTMLElement = this.host.nativeElement;
    const drawer = root.querySelector<HTMLElement>('[data-product-drawer]');
    const buttons = Array.from(root.querySelectorAll<HTMLElement>('.wita-pinging-dot[data-product]'));
    if (!drawer || buttons.length === 0) return;

    const image = drawer.querySelector<HTMLImageElement>('[data-product-image]');
    const title = drawer.querySelector<HTMLElement>('[data-product-title]');
    const description = drawer.querySelector<HTMLElement>('[data-product-description]');
    const closeTriggers = Array.from(drawer.querySelectorAll<HTMLElement>('[data-product-drawer-close]'));
    const prevButton = drawer.querySelector<HTMLButtonElement>('[data-product-prev]');
    const nextButton = drawer.querySelector<HTMLButtonElement>('[data-product-next]');
    const productOrder = buttons
      .map((button) => button.dataset['product'])
      .filter((productId): productId is string => Boolean(productId));

    const products: Record<string, { title: string; description: string; image: string }> = {
      hub: {
        title: 'Sensore Intelligente',
        description:
          "Rileva l'attività nella stanza in tempo reale, in modo anonimo, continuo e non invasivo.<br>Installato a parete o a soffitto, osserva l'ambiente senza richiedere dispositivi indossabili, ricariche o interventi da parte dell'ospite, trasformando ciò che accade nella stanza in informazioni utili per l'assistenza.",
        image: 'assets/mentorage.png',
      },
      'pillow-cover': {
        title: 'Portale Desktop',
        description:
          "Offre una vista completa della struttura per monitorare stanze, eventi e priorità operative con immediatezza. <br> Permette di consultare statistiche sull’andamento degli ospiti e della struttura, aiutando coordinatori e responsabili a valorizzare meglio i dati, individuare trend ricorrenti e supportare decisioni organizzative più consapevoli.",
        image: 'assets/pc.png',
      },
      blanket: {
        title: 'App Mobile',
        description:
          'Rende notifiche e informazioni sempre accessibili, così il personale può restare aggiornato anche in movimento.<br>Gli operatori possono ricevere alert, controllare lo stato delle stanze e intervenire con maggiore tempestività, direttamente dal proprio smartphone, senza dover tornare ogni volta a una postazione fissa.',
        image: 'assets/smartphone.png',
      },
    };

    let activeProduct: string | null = null;
    let activeIndex = -1;

    const syncNavigationState = () => {
      const hasActiveProduct = activeIndex >= 0;
      const hasPrev = hasActiveProduct && activeIndex > 0;
      const hasNext = hasActiveProduct && activeIndex < productOrder.length - 1;

      if (prevButton) {
        prevButton.disabled = !hasPrev;
        prevButton.setAttribute('aria-disabled', String(!hasPrev));
      }

      if (nextButton) {
        nextButton.disabled = !hasNext;
        nextButton.setAttribute('aria-disabled', String(!hasNext));
      }
    };

    const renderProduct = (productId: string) => {
      const product = products[productId];
      const productIndex = productOrder.indexOf(productId);
      if (!product || productIndex === -1) return;

      activeProduct = productId;
      activeIndex = productIndex;
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('wita-product-drawer-open');
      drawer.classList.remove('is-product-refreshing');
      void drawer.offsetWidth;
      drawer.classList.add('is-product-refreshing');

      buttons.forEach((button) => {
        const isActive = button.dataset['product'] === productId;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-expanded', String(isActive));
      });

      if (title) title.textContent = product.title;
      if (description) description.innerHTML = product.description;
      if (image) {
        image.src = product.image;
        image.alt = product.title;
      }

      syncNavigationState();
    };

    const closeDrawer = () => {
      activeProduct = null;
      activeIndex = -1;
      drawer.classList.remove('is-open');
      drawer.classList.remove('is-product-refreshing');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('wita-product-drawer-open');

      buttons.forEach((button) => {
        button.classList.remove('is-active');
        button.setAttribute('aria-expanded', 'false');
      });

      syncNavigationState();
    };

    const navigateProduct = (direction: -1 | 1) => {
      if (activeIndex < 0) return;

      const nextIndex = activeIndex + direction;
      if (nextIndex < 0 || nextIndex >= productOrder.length) return;

      renderProduct(productOrder[nextIndex]);
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

    if (prevButton) {
      const onPrev = () => navigateProduct(-1);
      prevButton.addEventListener('click', onPrev);
      this.cleanupFns.push(() => prevButton.removeEventListener('click', onPrev));
    }

    if (nextButton) {
      const onNext = () => navigateProduct(1);
      nextButton.addEventListener('click', onNext);
      this.cleanupFns.push(() => nextButton.removeEventListener('click', onNext));
    }

    closeTriggers.forEach((trigger) => {
      trigger.addEventListener('click', closeDrawer);
      this.cleanupFns.push(() => trigger.removeEventListener('click', closeDrawer));
    });

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeDrawer();
        return;
      }

      if (!drawer.classList.contains('is-open')) return;

      if (event.key === 'ArrowLeft') {
        navigateProduct(-1);
      }

      if (event.key === 'ArrowRight') {
        navigateProduct(1);
      }
    };

    document.addEventListener('keydown', onKeydown);
    this.cleanupFns.push(() => document.removeEventListener('keydown', onKeydown));

    syncNavigationState();
  }
}
