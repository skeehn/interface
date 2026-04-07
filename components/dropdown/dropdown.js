document.querySelectorAll('.sk-dropdown').forEach(dropdown => {
  const trigger = dropdown.querySelector('[data-dropdown-trigger]');
  const content = dropdown.querySelector('.sk-dropdown__content');
  const items = [...dropdown.querySelectorAll('.sk-dropdown__item[role="menuitem"]')];

  function open() {
    content.setAttribute('data-open', '');
    trigger.setAttribute('aria-expanded', 'true');
    if (items.length) {
      items[0].setAttribute('tabindex', '0');
      items[0].focus();
    }
  }

  function close() {
    content.removeAttribute('data-open');
    trigger.setAttribute('aria-expanded', 'false');
    items.forEach(item => item.removeAttribute('tabindex'));
    trigger.focus();
  }

  function isOpen() {
    return content.hasAttribute('data-open');
  }

  function selectItem(item) {
    dropdown.dispatchEvent(new CustomEvent('dropdown:select', {
      detail: { value: item.textContent.trim() }
    }));
    close();
  }

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    isOpen() ? close() : open();
  });

  trigger.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen()) open();
    } else if (e.key === 'Escape' && isOpen()) {
      e.preventDefault();
      close();
    }
  });

  content.addEventListener('keydown', e => {
    const focused = items.indexOf(document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (focused + 1) % items.length;
      items.forEach(i => i.setAttribute('tabindex', '-1'));
      items[next].setAttribute('tabindex', '0');
      items[next].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (focused - 1 + items.length) % items.length;
      items.forEach(i => i.setAttribute('tabindex', '-1'));
      items[prev].setAttribute('tabindex', '0');
      items[prev].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items.forEach(i => i.setAttribute('tabindex', '-1'));
      items[0].setAttribute('tabindex', '0');
      items[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items.forEach(i => i.setAttribute('tabindex', '-1'));
      items[items.length - 1].setAttribute('tabindex', '0');
      items[items.length - 1].focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focused >= 0) selectItem(items[focused]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      // Trap focus within dropdown when open
      e.preventDefault();
      close();
    }
  });

  items.forEach(item => {
    item.addEventListener('click', () => selectItem(item));
  });

  // Close when clicking outside
  document.addEventListener('click', e => {
    if (isOpen() && !dropdown.contains(e.target)) close();
  });
});
