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
})();
