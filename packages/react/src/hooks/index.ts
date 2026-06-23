/**
 * @module @skeehn/react/hooks
 *
 * AI streaming hooks for building chat interfaces and streaming text displays.
 *
 * - {@link useChat} — Provider-agnostic multi-turn chat with SSE streaming
 * - {@link useCompletion} — Single-turn text completion with streaming
 * - {@link useAsciiStream} — Consume a ReadableStream with dither-fade reveal
 * - {@link usePacedText} — Smooth, steady-cadence reveal of streaming text
 * - {@link useStickyScroll} — Sticky-scroll + "jump to latest" for chat containers
 *
 * @example
 * ```ts
 * import { useChat, usePacedText, useStickyScroll } from '@skeehn/react/hooks';
 * ```
 */

export { useChat } from './useChat';
export type {
  Message,
  ToolInvocation,
  UseChatOptions,
  UseChatReturn,
} from './useChat';

export { useCompletion } from './useCompletion';
export type {
  UseCompletionOptions,
  UseCompletionReturn,
} from './useCompletion';

export { useAsciiStream } from './useAsciiStream';
export type {
  StreamToken,
  UseAsciiStreamOptions,
  UseAsciiStreamReturn,
} from './useAsciiStream';

export { usePacedText } from './usePacedText';
export type { UsePacedTextOptions, UsePacedTextReturn } from './usePacedText';

export { useStickyScroll } from './useStickyScroll';
export type { UseStickyScrollOptions, UseStickyScrollReturn } from './useStickyScroll';
