document.querySelectorAll('.sk-tabs').forEach(tabs => {
  const triggers = [...tabs.querySelectorAll('.sk-tabs__trigger')];
  const contents = [...tabs.querySelectorAll('.sk-tabs__content')];

  function activate(trigger) {
    const id = trigger.dataset.tab;
    triggers.forEach(t => {
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });
    trigger.setAttribute('aria-selected', 'true');
    trigger.setAttribute('tabindex', '0');
    trigger.focus();
    contents.forEach(c => c.hidden = c.dataset.tab !== id);
    tabs.dispatchEvent(new CustomEvent('tab:change', { detail: { tab: id } }));
  }

  triggers.forEach(t => {
    t.addEventListener('click', () => activate(t));
    t.addEventListener('keydown', e => {
      const idx = triggers.indexOf(t);
      let next;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        next = triggers[(idx + 1) % triggers.length];
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        next = triggers[(idx - 1 + triggers.length) % triggers.length];
      } else if (e.key === 'Home') {
        e.preventDefault();
        next = triggers[0];
      } else if (e.key === 'End') {
        e.preventDefault();
        next = triggers[triggers.length - 1];
      }
      if (next) activate(next);
    });
  });

  // Initialize: activate first tab if none selected
  const active = triggers.find(t => t.getAttribute('aria-selected') === 'true') || triggers[0];
  if (active) activate(active);
});
