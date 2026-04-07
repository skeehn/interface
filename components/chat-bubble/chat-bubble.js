/**
 * skeehn — ChatBubble Interactivity
 * Handles retry, regenerate, copy actions on chat messages.
 */
document.querySelectorAll('.sk-chat-bubble').forEach(bubble => {
  const actions = bubble.querySelector('.sk-chat-bubble__actions');
  if (!actions) return;

  // Copy message text
  const copyBtn = actions.querySelector('[data-action="copy"]');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const content = bubble.querySelector('.sk-chat-bubble__content, p');
      if (!content) return;
      try {
        await navigator.clipboard.writeText(content.textContent || '');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      } catch {}
    });
  }

  // Retry / regenerate
  const retryBtn = actions.querySelector('[data-action="retry"]');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      bubble.dispatchEvent(new CustomEvent('chat:retry', {
        bubbles: true,
        detail: { messageId: bubble.dataset.messageId }
      }));
    });
  }

  // Edit message
  const editBtn = actions.querySelector('[data-action="edit"]');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      bubble.dispatchEvent(new CustomEvent('chat:edit', {
        bubbles: true,
        detail: { messageId: bubble.dataset.messageId }
      }));
    });
  }
});
