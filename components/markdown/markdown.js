/**
 * skeehn — Lightweight Markdown Renderer
 * Zero-dependency markdown-to-HTML for AI chat content.
 * Supports: headings, bold, italic, code, links, lists, blockquotes, hr, tables.
 */
class SkMarkdown {
  static render(md) {
    if (!md) return '';
    let html = md;

    // Escape HTML
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks (``` ... ```)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const langAttr = lang ? ` data-lang="${lang}"` : '';
      return `<div class="sk-code-block"${langAttr}><div class="sk-code-block__header"><span class="sk-code-block__lang">${lang || 'code'}</span><button class="sk-code-block__copy" aria-label="Copy code">Copy</button></div><div class="sk-code-block__body"><pre><code>${code.trim()}</code></pre></div></div>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="sk-code-inline">$1</code>');

    // Headings
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold + italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Blockquotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');

    // Unordered lists
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Paragraphs (lines that aren't already wrapped)
    html = html.replace(/^(?!<[hluobdp]|<\/|<hr|<div|<pre|<li)(.+)$/gm, '<p>$1</p>');

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
  }

  static init() {
    document.querySelectorAll('[data-markdown]').forEach(el => {
      const raw = el.textContent || '';
      el.innerHTML = SkMarkdown.render(raw);
      el.classList.add('sk-markdown');
      el.removeAttribute('data-markdown');
    });

    // Wire up copy buttons in rendered code blocks
    document.querySelectorAll('.sk-code-block__copy').forEach(btn => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = 'true';
      btn.addEventListener('click', async () => {
        const code = btn.closest('.sk-code-block')?.querySelector('code');
        if (!code) return;
        try {
          await navigator.clipboard.writeText(code.textContent || '');
          btn.setAttribute('data-copied', 'true');
          btn.textContent = 'Copied!';
          setTimeout(() => {
            btn.removeAttribute('data-copied');
            btn.textContent = 'Copy';
          }, 2000);
        } catch {}
      });
    });
  }
}

if (typeof window !== 'undefined') {
  window.SkMarkdown = SkMarkdown;
}
