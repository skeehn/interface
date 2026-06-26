/**
 * @skeehn/wc — framework-agnostic Web Components for skeehn.
 *
 * Light-DOM custom elements that render skeehn markup + classes, so the global
 * skeehn CSS styles them. Works in Vue, Svelte, Astro, Lit, or plain HTML — zero
 * dependencies. (Light DOM, not shadow DOM, so `@skeehn/core/styles.css` applies.)
 *
 * ```html
 * <link rel="stylesheet" href="https://unpkg.com/@skeehn/core/dist/styles.css" />
 * <script type="module">
 *   import { defineSkeehnElements } from '@skeehn/wc';
 *   defineSkeehnElements();
 * </script>
 * <skeehn-button variant="solid">Send</skeehn-button>
 * <skeehn-chat-bubble role="assistant">Hello from skeehn</skeehn-chat-bubble>
 * ```
 */

function attr(el: HTMLElement, name: string, fallback = ""): string {
  return el.getAttribute(name) ?? fallback;
}

interface ElDef {
  /** Attributes that trigger a re-render. */
  attrs: string[];
  /** Returns the inner HTML for the element. `content` is the author's slotted markup. */
  render: (el: HTMLElement, content: string) => string;
}

const DEFS: Record<string, ElDef> = {
  "skeehn-button": {
    attrs: ["variant", "size", "disabled"],
    render: (el, c) =>
      `<button class="sk-btn" data-variant="${attr(el, "variant", "solid")}" data-size="${attr(el, "size", "base")}"${el.hasAttribute("disabled") ? " disabled" : ""}>${c}</button>`,
  },
  "skeehn-badge": {
    attrs: ["variant", "color"],
    render: (el, c) =>
      `<span class="sk-badge" data-variant="${attr(el, "variant", "solid")}"${el.hasAttribute("color") ? ` data-color="${attr(el, "color")}"` : ""}>${c}</span>`,
  },
  "skeehn-alert": {
    attrs: ["type"],
    render: (el, c) => `<div class="sk-alert" data-type="${attr(el, "type", "info")}" role="alert">${c}</div>`,
  },
  "skeehn-chat-bubble": {
    attrs: ["role"],
    render: (el, c) =>
      `<div class="sk-chat-bubble" data-role="${attr(el, "role", "assistant")}"><div class="sk-chat-bubble__content">${c}</div></div>`,
  },
  "skeehn-agent-status": {
    attrs: ["status", "label"],
    render: (el) => {
      const s = attr(el, "status", "idle");
      return `<div class="sk-agent-status" data-status="${s}"><span class="sk-agent-status__dot"></span><span class="sk-agent-status__label">${attr(el, "label", s)}</span></div>`;
    },
  },
  "skeehn-typing-indicator": {
    attrs: ["variant"],
    render: (el) =>
      `<div class="sk-typing-indicator"${el.hasAttribute("variant") ? ` data-variant="${attr(el, "variant")}"` : ""}><span class="sk-typing-indicator__dots"><span class="sk-typing-indicator__dot"></span><span class="sk-typing-indicator__dot"></span><span class="sk-typing-indicator__dot"></span></span></div>`,
  },
};

function makeClass(def: ElDef): CustomElementConstructor {
  return class extends HTMLElement {
    static get observedAttributes() {
      return def.attrs;
    }
    private _content: string | null = null;

    connectedCallback() {
      // Capture the author's slotted markup once, before we replace it.
      if (this._content === null) this._content = this.innerHTML.trim();
      // `display: contents` makes the wrapper transparent to layout.
      this.style.display = "contents";
      this._render();
    }

    attributeChangedCallback() {
      if (this._content !== null) this._render();
    }

    private _render() {
      this.innerHTML = def.render(this as unknown as HTMLElement, this._content ?? "");
    }
  };
}

/** The custom-element tag names skeehn registers. */
export const SKEEHN_ELEMENTS: readonly string[] = Object.keys(DEFS);

/**
 * Register all skeehn custom elements. Idempotent and safe to call repeatedly;
 * no-ops in non-DOM environments (SSR).
 */
export function defineSkeehnElements(): void {
  if (typeof customElements === "undefined") return;
  for (const [tag, def] of Object.entries(DEFS)) {
    if (!customElements.get(tag)) customElements.define(tag, makeClass(def));
  }
}
