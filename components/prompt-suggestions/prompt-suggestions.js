// skeehn — PromptSuggestions
// Dispatches sk:suggest event when a suggestion is clicked.

export function init(root = document) {
  root.querySelectorAll('.sk-prompt-suggestion').forEach(btn => {
    if (btn._skInit) return;
    btn._skInit = true;
    btn.addEventListener('click', () => {
      btn.dispatchEvent(new CustomEvent('sk:suggest', {
        bubbles: true,
        detail: { value: btn.dataset.prompt || btn.textContent.trim() },
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
