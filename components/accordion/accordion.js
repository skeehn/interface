document.querySelectorAll('.sk-accordion').forEach(accordion => {
  const triggers = [...accordion.querySelectorAll('[data-accordion-trigger]')];

  function toggle(trigger) {
    const item = trigger.closest('.sk-accordion__item');
    const content = item.querySelector('.sk-accordion__content');
    const isOpen = item.hasAttribute('data-open');

    if (isOpen) {
      // Collapse: animate max-height to 0, then hide
      content.style.maxHeight = content.scrollHeight + 'px';
      requestAnimationFrame(() => {
        content.style.maxHeight = '0px';
      });
      content.addEventListener('transitionend', function handler() {
        content.removeEventListener('transitionend', handler);
        content.hidden = true;
        content.style.maxHeight = '';
      });
      item.removeAttribute('data-open');
      trigger.setAttribute('aria-expanded', 'false');
    } else {
      // Expand: show then animate max-height from 0
      content.hidden = false;
      content.style.maxHeight = '0px';
      requestAnimationFrame(() => {
        content.style.maxHeight = content.scrollHeight + 'px';
      });
      content.addEventListener('transitionend', function handler() {
        content.removeEventListener('transitionend', handler);
        content.style.maxHeight = '';
      });
      item.setAttribute('data-open', '');
      trigger.setAttribute('aria-expanded', 'true');
    }

    item.dispatchEvent(new CustomEvent('accordion:toggle', { detail: { open: !isOpen } }));
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => toggle(trigger));

    trigger.addEventListener('keydown', e => {
      const idx = triggers.indexOf(trigger);
      let next;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(trigger);
        return;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        next = triggers[(idx + 1) % triggers.length];
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        next = triggers[(idx - 1 + triggers.length) % triggers.length];
      } else if (e.key === 'Home') {
        e.preventDefault();
        next = triggers[0];
      } else if (e.key === 'End') {
        e.preventDefault();
        next = triggers[triggers.length - 1];
      }

      if (next) next.focus();
    });
  });

  // Apply transition style to all content panels
  accordion.querySelectorAll('.sk-accordion__content').forEach(content => {
    content.style.overflow = 'hidden';
    content.style.transition = 'max-height 0.2s ease';
  });
});
