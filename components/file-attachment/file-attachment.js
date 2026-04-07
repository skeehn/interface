// skeehn — FileAttachment
// Remove button dispatches sk:attachment:remove event.

export function init(root = document) {
  root.querySelectorAll('.sk-file-attachment__remove').forEach(btn => {
    if (btn._skInit) return;
    btn._skInit = true;
    btn.addEventListener('click', () => {
      const pill = btn.closest('.sk-file-attachment');
      btn.dispatchEvent(new CustomEvent('sk:attachment:remove', {
        bubbles: true,
        detail: { name: btn.dataset.name || pill?.querySelector('.sk-file-attachment__name')?.textContent?.trim() },
      }));
    });
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }
}
