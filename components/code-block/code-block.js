/**
 * skeehn — CodeBlock interactivity
 * Adds copy-to-clipboard, optional line numbers, and optional line highlighting.
 */
(function initCodeBlocks() {
  const blocks = document.querySelectorAll('.sk-code-block');

  blocks.forEach((block) => {
    const code = block.querySelector('code');
    const copyBtn = block.querySelector('.sk-code-block__copy');
    const body = block.querySelector('.sk-code-block__body');

    if (!code || !body) return;

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const text = code.textContent || '';
        const original = copyBtn.textContent || 'Copy';

        try {
          await navigator.clipboard.writeText(text);
          copyBtn.textContent = 'Copied';
          copyBtn.setAttribute('data-copied', 'true');
        } catch {
          const range = document.createRange();
          range.selectNodeContents(code);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
          copyBtn.textContent = 'Select + Copy';
        }

        window.setTimeout(() => {
          copyBtn.removeAttribute('data-copied');
          copyBtn.textContent = original;
        }, 1500);
      });
    }

    if (block.hasAttribute('data-line-numbers') && !body.querySelector('.sk-code-block__lines')) {
      const lines = (code.textContent || '').split('\n').length;
      const lineNums = document.createElement('div');
      lineNums.className = 'sk-code-block__lines';
      lineNums.setAttribute('aria-hidden', 'true');
      lineNums.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
      body.appendChild(lineNums);
    }

    const highlightRaw = block.getAttribute('data-highlight-lines');
    if (highlightRaw && !code.querySelector('.sk-code-block__line')) {
      const lineSet = parseLineSpec(highlightRaw);
      const lines = (code.textContent || '').split('\n');
      const fragments = lines.map((line, i) => {
        const num = i + 1;
        const escaped = line
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;');
        const highlighted = lineSet.has(num) ? ' data-highlight="true"' : '';
        return `<span class="sk-code-block__line"${highlighted}>${escaped}</span>`;
      });
      code.innerHTML = fragments.join('\n');
    }
  });

  function parseLineSpec(spec) {
    const set = new Set();

    spec
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        if (part.includes('-')) {
          const [startRaw, endRaw] = part.split('-');
          const start = Number.parseInt(startRaw, 10);
          const end = Number.parseInt(endRaw, 10);
          if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
            for (let i = start; i <= end; i += 1) set.add(i);
          }
        } else {
          const n = Number.parseInt(part, 10);
          if (Number.isFinite(n)) set.add(n);
        }
      });

    return set;
  }
})();
