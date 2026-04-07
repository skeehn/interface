// skeehn — ReasoningStep
// Handles expand/collapse for .sk-reasoning-step elements.
// Exports init(root) for use in docs site dynamic loading.

export function init(root = document) {
  root.querySelectorAll('.sk-reasoning-step').forEach(el => {
    if (el._skInit) return;
    el._skInit = true;

    const header = el.querySelector('.sk-reasoning-step__header');
    if (!header) return;

    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', el.dataset.expanded === 'true' ? 'true' : 'false');

    const toggle = () => {
      const next = el.dataset.expanded !== 'true';
      el.dataset.expanded = next ? 'true' : 'false';
      header.setAttribute('aria-expanded', String(next));
      const chevron = el.querySelector('.sk-reasoning-step__chevron');
      if (chevron) chevron.textContent = next ? '▾' : '▸';
    };

    header.addEventListener('click', toggle);
    header.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });
}

// Auto-init on script load (non-module usage)
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }
}
