document.querySelectorAll('.sk-dialog').forEach(dialog => {
  let triggerElement = null;

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function getFocusable() {
    return [...dialog.querySelectorAll(FOCUSABLE)];
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function openDialog(trigger) {
    triggerElement = trigger || document.activeElement;
    dialog.showModal();
    const focusable = getFocusable();
    if (focusable.length) focusable[0].focus();
    dialog.dispatchEvent(new CustomEvent('dialog:open'));
  }

  function closeDialog() {
    dialog.close();
    if (triggerElement && triggerElement.focus) {
      triggerElement.focus();
      triggerElement = null;
    }
  }

  // Close button
  const closeBtn = dialog.querySelector('.sk-dialog__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeDialog);
  }

  // Focus trap
  dialog.addEventListener('keydown', trapFocus);

  // Backdrop click to close
  dialog.addEventListener('click', e => {
    if (e.target === dialog) closeDialog();
  });

  // Fire custom event on native close
  dialog.addEventListener('close', () => {
    dialog.dispatchEvent(new CustomEvent('dialog:close'));
    if (triggerElement && triggerElement.focus) {
      triggerElement.focus();
      triggerElement = null;
    }
  });

  // Wire up any external triggers that reference this dialog
  const id = dialog.id;
  if (id) {
    document.querySelectorAll(`[data-dialog-trigger="${id}"]`).forEach(trigger => {
      trigger.addEventListener('click', () => openDialog(trigger));
    });
  }
});
