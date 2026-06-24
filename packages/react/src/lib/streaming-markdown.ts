/**
 * Streaming-tolerant markdown helpers.
 *
 * When markdown is rendered token-by-token as it streams, an as-yet-unclosed
 * fenced code block (an odd number of ``` fences) makes most parsers emit broken
 * output that flashes until the closing fence arrives. {@link closeOpenFences}
 * virtually closes the trailing fence so the in-progress block renders as a
 * clean, complete code block on every frame.
 *
 * These are pure functions (no React) so they work with any markdown renderer.
 */

const FENCE_LINE = /^ {0,3}(`{3,}|~{3,})/gm;

/**
 * Return `markdown` with any unclosed fenced code block virtually closed, so a
 * partial stream renders as a complete code block instead of flashing broken.
 *
 * ```ts
 * closeOpenFences('text\n```ts\nconst x = 1')
 * // => 'text\n```ts\nconst x = 1\n```'
 * ```
 */
export function closeOpenFences(markdown: string): string {
  const fences = markdown.match(FENCE_LINE);
  if (!fences || fences.length % 2 === 0) return markdown;

  // Unbalanced → the last fence opened a block that hasn't closed yet.
  const open = fences[fences.length - 1].trim();
  const fenceChar = open[0]; // ` or ~
  const fenceLen = open.length;
  const sep = markdown.endsWith('\n') ? '' : '\n';
  return `${markdown}${sep}${fenceChar.repeat(fenceLen)}`;
}

/**
 * `true` when `markdown` currently ends inside an unclosed fenced code block.
 * Useful to render a "streaming code" affordance or defer syntax highlighting
 * until the block closes.
 */
export function hasOpenFence(markdown: string): boolean {
  const fences = markdown.match(FENCE_LINE);
  return !!fences && fences.length % 2 !== 0;
}
