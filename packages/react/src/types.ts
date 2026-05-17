/**
 * skeehn shared component types
 * -----------------------------
 * Single source of truth for the data-state convention every component
 * follows. Don't re-invent in individual components.
 *
 * Convention:
 * - A `state` prop accepts one of these literals
 * - The component emits `data-state={state}` on its root element
 * - ARIA mirrors the state for assistive tech:
 *     loading  → aria-busy=true
 *     disabled → aria-disabled=true
 *     error    → aria-invalid=true (for form-shaped components)
 *
 * CSS hooks then live entirely in component CSS via [data-state="..."]
 * selectors, so component logic doesn't need to know what each state
 * looks like.
 */

export type SkState =
  | 'idle'
  | 'loading'
  | 'disabled'
  | 'error'
  | 'success'
  | 'streaming';

/**
 * Returns the canonical attrs for a given state. Spread onto the root
 * element of any component:
 *
 *   <div className="sk-card" {...skStateAttrs(state)}>
 */
export function skStateAttrs(state?: SkState): {
  'data-state'?: SkState;
  'aria-busy'?: true;
  'aria-disabled'?: true;
  'aria-invalid'?: true;
} {
  if (!state || state === 'idle') return {};
  const out: ReturnType<typeof skStateAttrs> = { 'data-state': state };
  if (state === 'loading' || state === 'streaming') out['aria-busy'] = true;
  if (state === 'disabled') out['aria-disabled'] = true;
  if (state === 'error') out['aria-invalid'] = true;
  return out;
}
