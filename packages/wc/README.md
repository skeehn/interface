# @skeehn/wc

Framework-agnostic **Web Components** for [skeehn](https://ui.skeehn.com) — custom elements
that work in Vue, Svelte, Astro, Lit, or plain HTML. Zero dependencies.

They're **light-DOM** custom elements that render skeehn markup + classes, so the global
skeehn CSS styles them (no shadow-DOM style isolation to fight).

## Use

```html
<link rel="stylesheet" href="https://unpkg.com/@skeehn/core/dist/styles.css" />
<script type="module">
  import { defineSkeehnElements } from "@skeehn/wc";
  defineSkeehnElements();
</script>

<skeehn-button variant="solid" size="lg">Send</skeehn-button>
<skeehn-chat-bubble role="assistant">Hello from skeehn</skeehn-chat-bubble>
<skeehn-agent-status status="thinking"></skeehn-agent-status>
<skeehn-typing-indicator></skeehn-typing-indicator>
```

Re-theme everything by setting `data-theme` on a parent (e.g. `<html data-theme="dark">`).

## Elements

| Tag | Attributes |
|---|---|
| `<skeehn-button>` | `variant`, `size`, `disabled` |
| `<skeehn-badge>` | `variant`, `color` |
| `<skeehn-alert>` | `type` |
| `<skeehn-chat-bubble>` | `role` |
| `<skeehn-agent-status>` | `status`, `label` |
| `<skeehn-typing-indicator>` | `variant` |

`defineSkeehnElements()` is idempotent and no-ops during SSR. For React, prefer
[`@skeehn/react`](https://ui.skeehn.com/docs); these elements are for everywhere else.
