/**
 * @module @skeehn/react/ai
 *
 * AI SDK v5 drop-in layer. Render `@ai-sdk/react` `useChat().messages` with
 * skeehn components — zero hard dependency on `ai` (structural types only).
 *
 * ```tsx
 * import { useChat } from '@ai-sdk/react';
 * import { Conversation } from '@skeehn/react/ai';
 * import '@skeehn/core/engine.css';
 *
 * export function Chat() {
 *   const { messages } = useChat();
 *   return <Conversation messages={messages} />;
 * }
 * ```
 */
export { Conversation } from './Conversation';
export type { ConversationProps } from './Conversation';

export { Message } from './Message';
export type { MessageProps } from './Message';

export { renderPart, renderParts, messageText } from './renderParts';

export { ScrollToBottomButton } from '../components/ScrollToBottom';
export type { ScrollToBottomButtonProps } from '../components/ScrollToBottom';

export { ToolApproval, ToolApprovalProvider, useToolApproval } from '../components/ToolApproval';
export type { ToolApprovalProps } from '../components/ToolApproval';

export type {
  UIMessage,
  UIMessagePart,
  UIMessageRole,
  UIPartState,
  ToolPartState,
  TextUIPart,
  ReasoningUIPart,
  SourceUrlUIPart,
  SourceDocumentUIPart,
  FileUIPart,
  StepStartUIPart,
  ToolUIPart,
  DynamicToolUIPart,
  DataUIPart,
  PartContext,
  SkeehnPartOverrides,
  RenderPartsOptions,
} from './types';
