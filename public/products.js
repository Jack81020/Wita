(() => {
  const detailButtons = Array.from(document.querySelectorAll('[data-products-detail]'));

  detailButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      const panelId = button.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;

      if (!isOpen) {
        detailButtons.forEach((otherButton) => {
          const otherPanelId = otherButton.getAttribute('aria-controls');
          const otherPanel = otherPanelId ? document.getElementById(otherPanelId) : null;

          otherButton.setAttribute('aria-expanded', 'false');
          if (otherPanel) otherPanel.hidden = true;
        });
      }

      button.setAttribute('aria-expanded', String(!isOpen));
      if (panel) panel.hidden = isOpen;
    });
  });

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

  const applicationsRoot = document.querySelector('[data-products-applications]');
  const applicationTabList = applicationsRoot?.querySelector('.products-applications__tabs');
  const applicationTabs = Array.from(document.querySelectorAll('[data-products-application-tab]'));
  const applicationPanels = Array.from(document.querySelectorAll('[data-products-application-panel]'));
  const applicationsReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const applicationAutoplayDelay = 5000;
  let applicationIndex = 0;
  let applicationAutoplayTimer = null;
  let isApplicationVisible = false;
  let isApplicationHovered = false;
  let isApplicationFocused = false;

  const setApplicationTab = (applicationId, shouldScroll = true) => {
    applicationPanels.forEach((panel) => {
      panel.hidden = panel.getAttribute('data-products-application-panel') !== applicationId;
    });

    applicationTabs.forEach((tab, index) => {
      const isActive = tab.getAttribute('data-products-application-tab') === applicationId;
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;

      if (isActive) {
        applicationIndex = index;
        if (shouldScroll && applicationTabList) {
          const centeredLeft = tab.offsetLeft - ((applicationTabList.clientWidth - tab.offsetWidth) / 2);
          applicationTabList.scrollTo({
            left: centeredLeft,
            behavior: applicationsReducedMotion.matches ? 'auto' : 'smooth',
          });
        }
      }
    });
  };

  const stopApplicationAutoplay = () => {
    if (applicationAutoplayTimer === null) return;
    window.clearInterval(applicationAutoplayTimer);
    applicationAutoplayTimer = null;
  };

  const startApplicationAutoplay = () => {
    stopApplicationAutoplay();
    if (!applicationsRoot || applicationTabs.length < 2 || !isApplicationVisible || isApplicationHovered
      || isApplicationFocused || document.hidden || applicationsReducedMotion.matches) {
      return;
    }

    applicationAutoplayTimer = window.setInterval(() => {
      const nextIndex = (applicationIndex + 1) % applicationTabs.length;
      const nextId = applicationTabs[nextIndex].getAttribute('data-products-application-tab');
      if (nextId) setApplicationTab(nextId);
    }, applicationAutoplayDelay);
  };

  applicationTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      const applicationId = tab.getAttribute('data-products-application-tab');
      if (applicationId) setApplicationTab(applicationId);
      startApplicationAutoplay();
    });

    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % applicationTabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + applicationTabs.length) % applicationTabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = applicationTabs.length - 1;
      if (nextIndex === index) return;

      event.preventDefault();
      const nextTab = applicationTabs[nextIndex];
      const nextId = nextTab.getAttribute('data-products-application-tab');
      if (nextId) setApplicationTab(nextId);
      nextTab.focus();
    });
  });

  if (applicationsRoot && applicationTabs.length) {
    setApplicationTab(applicationTabs[0].getAttribute('data-products-application-tab'), false);

    const applicationsObserver = new IntersectionObserver(
      ([entry]) => {
        isApplicationVisible = entry.isIntersecting;
        if (isApplicationVisible) startApplicationAutoplay();
        else stopApplicationAutoplay();
      },
      { threshold: 0.4 }
    );

    applicationsObserver.observe(applicationsRoot);

    applicationsRoot.addEventListener('mouseenter', () => {
      isApplicationHovered = true;
      stopApplicationAutoplay();
    });

    applicationsRoot.addEventListener('mouseleave', () => {
      isApplicationHovered = false;
      startApplicationAutoplay();
    });

    applicationsRoot.addEventListener('focusin', () => {
      isApplicationFocused = true;
      stopApplicationAutoplay();
    });

    applicationsRoot.addEventListener('focusout', (event) => {
      if (applicationsRoot.contains(event.relatedTarget)) return;
      isApplicationFocused = false;
      startApplicationAutoplay();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopApplicationAutoplay();
      else startApplicationAutoplay();
    });

    applicationsReducedMotion.addEventListener('change', startApplicationAutoplay);
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
  const storyMobileSource = storyView ? storyView.querySelector('[data-products-story-mobile-source]') : null;
  const storyAutoplayDelay = 4000;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isStoryVisible = false;
  let isStoryHovered = false;
  let storyAutoplayTimer = null;

  const storyContent = {
    structure: {
      primary: {
        title: 'Decisioni più consapevoli',
        copy: 'Indicatori chiari su alert, tempi di risposta e aree critiche per coordinare meglio le attività.',
        icon: 'products-analytics-story__note-icon--blue',
      },
      secondary: {
        title: 'Approfondimenti immediati',
        copy: 'Scendi nel dettaglio del singolo ospite per comprendere comportamenti e andamento notturno.',
        icon: 'products-analytics-story__note-icon--green',
      },
      imageSrc: 'assets/mentorage-statistiche-struttura.png',
      mobileImageSrc: 'assets/mentorage-statistiche-struttura-mobile.png',
    },
    guest: {
      primary: {
        title: 'Lettura del comportamento',
        copy: 'Visualizza stati, tempi e cambi di attività per capire meglio come si muove il singolo ospite.',
        icon: 'products-analytics-story__note-icon--cyan',
      },
      secondary: {
        title: 'Contesto più utile',
        copy: 'Una sintesi ordinata della notte aiuta operatori e coordinatori a leggere subito ciò che conta.',
        icon: 'products-analytics-story__note-icon--violet',
      },
      imageSrc: 'assets/statistiche.png',
      mobileImageSrc: 'assets/statistiche-mobile.png',
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
    if (storyMobileSource) {
      storyMobileSource.srcset = content.mobileImageSrc;
    }

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
    if (!isStoryVisible || isStoryHovered || document.hidden || prefersReducedMotion.matches) return;

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

    storySection.addEventListener('mouseenter', () => {
      isStoryHovered = true;
      stopStoryAutoplay();
    });

    storySection.addEventListener('mouseleave', () => {
      isStoryHovered = false;
      startStoryAutoplay();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopStoryAutoplay();
      } else {
        startStoryAutoplay();
      }
    });

    prefersReducedMotion.addEventListener('change', startStoryAutoplay);
  }

  const counterSections = Array.from(
    document.querySelectorAll('[data-products-impact], [data-products-system-impact]')
  );
  const counterAnimationDuration = 1200;
  const animatedCounterSections = new WeakSet();
  const groupedNumberFormatters = {
    it: new Intl.NumberFormat('it-IT'),
    en: new Intl.NumberFormat('en-US'),
  };

  const renderCounter = (counter, value) => {
    const language = document.documentElement.lang === 'en' ? 'en' : 'it';
    const localizedPrefix = language === 'en' ? counter.getAttribute('data-count-prefix-en') : null;
    const localizedSuffix = language === 'en' ? counter.getAttribute('data-count-suffix-en') : null;
    const prefix = localizedPrefix ?? counter.getAttribute('data-count-prefix') ?? '';
    const suffix = localizedSuffix ?? counter.getAttribute('data-count-suffix') ?? '';
    const formattedValue = counter.getAttribute('data-count-grouped') === 'true'
      ? groupedNumberFormatters[language].format(value)
      : String(value);
    counter.textContent = `${prefix}${formattedValue}${suffix}`;
  };

  const showFinalCounterValues = (counters) => {
    counters.forEach((counter) => {
      const finalValue = Number(counter.getAttribute('data-count-end')) || 0;
      renderCounter(counter, finalValue);
    });
  };

  const animateCounterSection = (section) => {
    const counters = Array.from(
      section.querySelectorAll('[data-products-impact-counter], [data-products-system-counter]')
    );
    if (animatedCounterSections.has(section) || !counters.length) return;
    animatedCounterSections.add(section);

    if (prefersReducedMotion.matches) {
      showFinalCounterValues(counters);
      return;
    }

    const startTime = performance.now();
    const updateCounters = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / counterAnimationDuration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      counters.forEach((counter) => {
        const finalValue = Number(counter.getAttribute('data-count-end')) || 0;
        const nextValue = Math.round(finalValue * easedProgress);
        renderCounter(counter, nextValue);
      });

      if (progress < 1) {
        window.requestAnimationFrame(updateCounters);
      } else {
        showFinalCounterValues(counters);
      }
    };

    window.requestAnimationFrame(updateCounters);
  };

  counterSections.forEach((section) => {
    const counterObserver = new IntersectionObserver(
      ([entry], observer) => {
        if (!entry.isIntersecting) return;
        animateCounterSection(section);
        observer.disconnect();
      },
      { threshold: 0.28 }
    );

    counterObserver.observe(section);
  });

  window.addEventListener('wita:languagechange', () => {
    counterSections.forEach((section) => {
      const counters = Array.from(
        section.querySelectorAll('[data-products-impact-counter], [data-products-system-counter]')
      );
      showFinalCounterValues(counters);
    });
  });
})();
