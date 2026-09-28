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

})();
