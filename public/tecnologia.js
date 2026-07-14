(() => {
  const detailButtons = Array.from(document.querySelectorAll('[data-technology-detail]'));

  detailButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      const detail = button.closest('.technology-layer')?.querySelector('p');

      button.setAttribute('aria-expanded', String(!isOpen));
      if (detail) detail.hidden = isOpen;
    });
  });

  const video = document.querySelector('.technology-video');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!video || prefersReducedMotion.matches) return;

  const videoObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !document.hidden) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    },
    { threshold: 0.45 }
  );

  videoObserver.observe(video);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      video.pause();
    }
  });
})();