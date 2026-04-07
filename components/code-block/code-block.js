/**
 * skeehn — CodeBlock interactivity
 * Copy-to-clipboard and line number generation.
 */
document.querySelectorAll('.sk-code-block').forEach(block => {
  const copyBtn = block.querySelector('.sk-code-block__copy');
  const code = block.querySelector('code');

  if (copyBtn && code) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent || '');
        copyBtn.setAttribute('data-copied', 'true');
        const original = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.removeAttribute('data-copied');
          copyBtn.textContent = original;
        }, 2000);
      } catch {
        const range = document.createRange();
        range.selectNodeContents(code);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  }

  if (block.hasAttribute('data-line-numbers') && code) {
    const lines = (code.textContent || '').split('\n');
    const lineNums = document.createElement('div');
    lineNums.className = 'sk-code-block__lines';
    lineNums.setAttribute('aria-hidden', 'true');
    lineNums.textContent = lines.map((_, i) => i + 1).join('\n');
    block.querySelector('.sk-code-block__body').appendChild(lineNums);
  }
});
