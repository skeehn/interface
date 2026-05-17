/**
 * @module @skeehn/react/hooks
 *
 * AI streaming hooks for building chat interfaces and streaming text displays.
 *
 * - {@link useChat} — Provider-agnostic multi-turn chat with SSE streaming
 * - {@link useCompletion} — Single-turn text completion with streaming
 * - {@link useAsciiStream} — Consume a ReadableStream with dither-fade reveal
 *
 * @example
 * ```ts
 * import { useChat, useCompletion, useAsciiStream } from '@skeehn/react/hooks';
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

export { useReveal } from './useReveal';
export type { UseRevealOptions } from './useReveal';
