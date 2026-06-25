/**
 * @module @skeehn/react/ai — types
 *
 * Structural, dependency-free mirrors of the AI SDK v5 `UIMessage` shape.
 *
 * These are intentionally *structural*: a real `UIMessage` from `@ai-sdk/react`
 * is assignable to {@link UIMessage} here, so you can pass `useChat().messages`
 * straight into `<Conversation>` / `<Message>` — but `@skeehn/react` never
 * imports from `ai`, so the zero-dependency core stays intact. `ai` /
 * `@ai-sdk/react` are optional peers; you only need them if you use the SDK.
 */
import type { ReactNode } from 'react';

/** Streaming lifecycle for text/reasoning parts. */
export type UIPartState = 'streaming' | 'done';

/** Tool-call lifecycle (AI SDK v5). */
export type ToolPartState =
  | 'input-streaming'
  | 'input-available'
  | 'output-available'
  | 'output-error';

export interface TextUIPart {
  type: 'text';
  text: string;
  state?: UIPartState;
}

export interface ReasoningUIPart {
  type: 'reasoning';
  text: string;
  state?: UIPartState;
}

export interface SourceUrlUIPart {
  type: 'source-url';
  sourceId?: string;
  url: string;
  title?: string;
}

export interface SourceDocumentUIPart {
  type: 'source-document';
  sourceId?: string;
  mediaType?: string;
  title: string;
  filename?: string;
}

export interface FileUIPart {
  type: 'file';
  mediaType: string;
  url: string;
  filename?: string;
}

export interface StepStartUIPart {
  type: 'step-start';
}

/** A typed tool part: `type` is `tool-${toolName}` (AI SDK v5). */
export interface ToolUIPart {
  type: `tool-${string}`;
  toolCallId?: string;
  state?: ToolPartState;
  input?: unknown;
  output?: unknown;
  errorText?: string;
}

/** A tool whose name isn't known at compile time (`type: 'dynamic-tool'`). */
export interface DynamicToolUIPart {
  type: 'dynamic-tool';
  toolName: string;
  toolCallId?: string;
  state?: ToolPartState;
  input?: unknown;
  output?: unknown;
  errorText?: string;
}

/** Custom typed data parts (`type: 'data-${name}'`). */
export interface DataUIPart {
  type: `data-${string}`;
  id?: string;
  data?: unknown;
}

/**
 * Any UI message part. A real `@ai-sdk/react` part is assignable to this union.
 */
export type UIMessagePart =
  | TextUIPart
  | ReasoningUIPart
  | SourceUrlUIPart
  | SourceDocumentUIPart
  | FileUIPart
  | StepStartUIPart
  | ToolUIPart
  | DynamicToolUIPart
  | DataUIPart;

export type UIMessageRole = 'system' | 'user' | 'assistant';

/** A structural `UIMessage` — a real `@ai-sdk/react` message is assignable. */
export interface UIMessage {
  id?: string;
  role: UIMessageRole;
  parts: ReadonlyArray<UIMessagePart>;
  metadata?: unknown;
}

/** Context handed to every part renderer. */
export interface PartContext {
  /** Role of the owning message. */
  role: UIMessageRole;
  /** Index of the part within the message. */
  index: number;
}

/**
 * Per-type render overrides. Return a node to replace skeehn's default for a
 * part type, or `undefined` to fall back to the default. `data-*` parts have no
 * default — provide a renderer via {@link RenderPartsOptions.renderData}.
 */
export interface SkeehnPartOverrides {
  text?: (part: TextUIPart, ctx: PartContext) => ReactNode;
  reasoning?: (part: ReasoningUIPart, ctx: PartContext) => ReactNode;
  tool?: (part: ToolUIPart | DynamicToolUIPart, ctx: PartContext) => ReactNode;
  source?: (part: SourceUrlUIPart | SourceDocumentUIPart, ctx: PartContext) => ReactNode;
  file?: (part: FileUIPart, ctx: PartContext) => ReactNode;
}

export interface RenderPartsOptions {
  /** Role of the owning message (drives bubble styling). */
  role: UIMessageRole;
  /** Per-type render overrides. */
  components?: SkeehnPartOverrides;
  /**
   * Transform a text/reasoning string before it renders — e.g. plug in a
   * markdown renderer (react-markdown, streamdown). Defaults to plain text.
   */
  renderMarkdown?: (text: string) => ReactNode;
  /** Render a custom `data-*` part. */
  renderData?: (part: DataUIPart, ctx: PartContext) => ReactNode;
}
