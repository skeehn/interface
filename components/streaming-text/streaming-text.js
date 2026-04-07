/**
 * skeehn — StreamingText Engine
 * Real streaming text with character-by-character reveal, cursor, and dither effects.
 */
class SkStreamingText {
  constructor(el, options = {}) {
    this.el = el;
    this.speed = parseInt(el.dataset.speed || options.speed || '30');
    this.effect = el.dataset.effect || options.effect || 'typewriter';
    this.cursor = el.dataset.cursor !== 'false';
    this.queue = [];
    this.isStreaming = false;
    this.abortController = null;
  }

  async stream(text) {
    this.isStreaming = true;
    this.abortController = new AbortController();
    this.el.setAttribute('data-streaming', '');
    if (this.cursor) this.el.setAttribute('data-cursor', 'true');
    this.el.textContent = '';

    const chars = [...text];
    for (let i = 0; i < chars.length; i++) {
      if (this.abortController.signal.aborted) break;

      const span = document.createElement('span');
      span.textContent = chars[i];

      if (this.effect === 'fade') {
        span.style.opacity = '0';
        span.style.display = 'inline-block';
        span.style.animation = `sk-fade-in 0.3s ease forwards`;
        span.style.animationDelay = '0ms';
      } else if (this.effect === 'wave') {
        span.style.display = 'inline-block';
        span.style.animation = `sk-wave 1.5s ease-in-out infinite`;
        span.style.animationDelay = `${(i % 10) * 0.1}s`;
      }

      this.el.appendChild(span);
      await this._delay(this.speed);
    }

    this.el.removeAttribute('data-streaming');
    if (this.cursor) this.el.removeAttribute('data-cursor');
    this.isStreaming = false;
  }

  async streamTokens(tokenIterator) {
    this.isStreaming = true;
    this.abortController = new AbortController();
    this.el.setAttribute('data-streaming', '');
    if (this.cursor) this.el.setAttribute('data-cursor', 'true');
    this.el.textContent = '';

    for await (const token of tokenIterator) {
      if (this.abortController.signal.aborted) break;
      const span = document.createElement('span');
      span.textContent = token;
      if (this.effect === 'fade') {
        span.style.opacity = '0';
        span.style.display = 'inline';
        span.style.animation = `sk-fade-in 0.3s ease forwards`;
      }
      this.el.appendChild(span);
    }

    this.el.removeAttribute('data-streaming');
    if (this.cursor) this.el.removeAttribute('data-cursor');
    this.isStreaming = false;
  }

  appendChunk(text) {
    const span = document.createElement('span');
    span.textContent = text;
    if (this.effect === 'fade') {
      span.style.opacity = '0';
      span.style.display = 'inline';
      span.style.animation = `sk-fade-in 0.3s ease forwards`;
    }
    this.el.appendChild(span);
  }

  stop() {
    if (this.abortController) this.abortController.abort();
    this.el.removeAttribute('data-streaming');
    this.el.removeAttribute('data-cursor');
    this.isStreaming = false;
  }

  clear() {
    this.stop();
    this.el.textContent = '';
  }

  _delay(ms) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, ms);
      this.abortController.signal.addEventListener('abort', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }
}

if (typeof window !== 'undefined') {
  window.SkStreamingText = SkStreamingText;
}
