(() => {
  const triggers = Array.from(document.querySelectorAll('[data-products-panel-trigger]'));
  const items = triggers.map((trigger) => trigger.closest('li'));
  const panels = Array.from(document.querySelectorAll('[data-products-panel]'));

  const setActivePanel = (panelId) => {
    panels.forEach((panel) => {
      panel.hidden = panel.getAttribute('data-products-panel') !== panelId;
    });

    items.forEach((item) => {
      if (!item) return;
      const button = item.querySelector('button');
      const isActive = button && button.getAttribute('data-products-panel-trigger') === panelId;
      item.setAttribute('data-active', String(Boolean(isActive)));
    });
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panelId = trigger.getAttribute('data-products-panel-trigger');
      if (!panelId) return;
      setActivePanel(panelId);
    });
  });

  setActivePanel('analytics');

  const installationMedia = document.querySelector('.products-installation__media');
  const installationCard = document.querySelector('.products-installation__card');
  const desktopInstallationLayout = window.matchMedia('(min-width: 1024px)');

  if (installationMedia && installationCard) {
    const syncInstallationMediaHeight = () => {
      installationMedia.style.height = desktopInstallationLayout.matches
        ? `${installationCard.getBoundingClientRect().height}px`
        : '';
    };

    const installationResizeObserver = new ResizeObserver(syncInstallationMediaHeight);
    installationResizeObserver.observe(installationCard);
    desktopInstallationLayout.addEventListener('change', syncInstallationMediaHeight);
    syncInstallationMediaHeight();
  }

  const storyButtons = Array.from(document.querySelectorAll('[data-products-story-toggle]'));
  const storyView = document.querySelector('[data-products-story-view]');
  const storySection = document.querySelector('.products-analytics-story');
  const noteTitlePrimary = document.querySelector('[data-products-story-note-title="primary"]');
  const noteCopyPrimary = document.querySelector('[data-products-story-note-copy="primary"]');
  const noteIconPrimary = document.querySelector('[data-products-story-note-icon="primary"]');
  const noteTitleSecondary = document.querySelector('[data-products-story-note-title="secondary"]');
  const noteCopySecondary = document.querySelector('[data-products-story-note-copy="secondary"]');
  const noteIconSecondary = document.querySelector('[data-products-story-note-icon="secondary"]');
  const storyImage = storyView ? storyView.querySelector('.products-analytics-story__media img') : null;
  const storyAutoplayDelay = 4000;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isStoryVisible = false;
  let storyAutoplayTimer = null;

  const storyContent = {
    structure: {
      primary: {
        title: 'Decisioni piu consapevoli',
        copy: 'Indicatori chiari su alert, tempi di risposta e aree critiche per coordinare meglio le attivita.',
        icon: 'products-analytics-story__note-icon--blue',
      },
      secondary: {
        title: 'Approfondimenti immediati',
        copy: 'Scendi nel dettaglio del singolo ospite per comprendere comportamenti e andamento notturno.',
        icon: 'products-analytics-story__note-icon--green',
      },
      imageSrc: 'assets/mentorage-statistiche-struttura.png',
    },
    guest: {
      primary: {
        title: 'Lettura del comportamento',
        copy: 'Visualizza stati, tempi e cambi di attivita per capire meglio come si muove il singolo ospite.',
        icon: 'products-analytics-story__note-icon--cyan',
      },
      secondary: {
        title: 'Contesto piu utile',
        copy: 'Una sintesi ordinata della notte aiuta operatori e coordinatori a leggere subito cio che conta.',
        icon: 'products-analytics-story__note-icon--violet',
      },
      imageSrc: 'assets/statistiche.png',
    },
  };

  const noteIconVariants = [
    'products-analytics-story__note-icon--blue',
    'products-analytics-story__note-icon--green',
    'products-analytics-story__note-icon--cyan',
    'products-analytics-story__note-icon--violet',
  ];

  const setStoryView = (view) => {
    const content = storyContent[view];
    if (!content || !storyView || !noteTitlePrimary || !noteCopyPrimary || !noteIconPrimary || !noteTitleSecondary || !noteCopySecondary || !noteIconSecondary || !storyImage) {
      return;
    }

    storyView.setAttribute('data-products-story-view', view);

    storyButtons.forEach((button) => {
      const isActive = button.getAttribute('data-products-story-toggle') === view;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    noteTitlePrimary.textContent = content.primary.title;
    noteCopyPrimary.textContent = content.primary.copy;
    noteTitleSecondary.textContent = content.secondary.title;
    noteCopySecondary.textContent = content.secondary.copy;
    storyImage.src = content.imageSrc;

    [noteIconPrimary, noteIconSecondary].forEach((icon) => {
      icon.classList.remove(...noteIconVariants);
    });

    noteIconPrimary.classList.add(content.primary.icon);
    noteIconSecondary.classList.add(content.secondary.icon);
  };

  const stopStoryAutoplay = () => {
    if (storyAutoplayTimer === null) return;
    window.clearInterval(storyAutoplayTimer);
    storyAutoplayTimer = null;
  };

  const startStoryAutoplay = () => {
    stopStoryAutoplay();
    if (!isStoryVisible || document.hidden || prefersReducedMotion.matches) return;

    storyAutoplayTimer = window.setInterval(() => {
      const currentView = storyView && storyView.getAttribute('data-products-story-view');
      setStoryView(currentView === 'structure' ? 'guest' : 'structure');
    }, storyAutoplayDelay);
  };

  storyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.getAttribute('data-products-story-toggle');
      if (!view) return;
      setStoryView(view);
      startStoryAutoplay();
    });
  });

  setStoryView('structure');

  if (storySection) {
    const storyObserver = new IntersectionObserver(
      ([entry]) => {
        isStoryVisible = entry.isIntersecting;
        if (isStoryVisible) {
          startStoryAutoplay();
        } else {
          stopStoryAutoplay();
        }
      },
      { threshold: 0.35 }
    );

    storyObserver.observe(storySection);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopStoryAutoplay();
      } else {
        startStoryAutoplay();
      }
    });

    prefersReducedMotion.addEventListener('change', startStoryAutoplay);
  }
})();