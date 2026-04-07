document.querySelectorAll('.sk-toggle__input').forEach(input => {
  // Ensure role="switch" is set
  input.setAttribute('role', 'switch');

  // Sync aria-checked with checked state
  function syncState() {
    input.setAttribute('aria-checked', String(input.checked));
  }

  // Initialize aria-checked
  syncState();

  // Update on change and dispatch custom event
  input.addEventListener('change', () => {
    syncState();
    input.closest('.sk-toggle').dispatchEvent(
      new CustomEvent('toggle:change', { detail: { checked: input.checked } })
    );
  });
});
