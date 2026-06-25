'use client';

/**
 * @module @skeehn/react/blocks — AgentConsole
 *
 * A run monitor for autonomous agents: a header with a live <AgentStatus> pill,
 * an optional current-task line, and a <Conversation> that surfaces the agent's
 * reasoning and tool calls as they stream. Add `onSend` for a follow-up input.
 */
import * as React from 'react';
import { Conversation } from '../ai/Conversation';
import type { SkeehnPartOverrides, UIMessage } from '../ai/types';
import { AgentStatus, type AgentStatusValue } from '../components/AgentStatus';
import { ChatInput } from '../components/ChatInput';

export interface AgentConsoleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  /** Current agent status. */
  status: AgentStatusValue;
  /** Run transcript (reasoning + tool calls + messages) as AI SDK UIMessage[]. */
  messages: ReadonlyArray<UIMessage>;
  /** Header title. @defaultValue "Agent" */
  title?: string;
  /** Current task / goal line shown under the header. */
  task?: string;
  /** Optional follow-up input; when provided, renders a ChatInput footer. */
  onSend?: (text: string) => void;
  /** Disable the follow-up input (e.g. while the agent is acting). */
  busy?: boolean;
  /** Per-part render overrides, forwarded to <Conversation>. */
  components?: SkeehnPartOverrides;
  /** Transform text/reasoning (e.g. a markdown renderer). */
  renderMarkdown?: (text: string) => React.ReactNode;
}

/** A console for monitoring an agent run: status · task · reasoning/tool stream. */
export const AgentConsole = React.forwardRef<HTMLDivElement, AgentConsoleProps>(function AgentConsole(
  { status, messages, title = 'Agent', task, onSend, busy, components, renderMarkdown, className, ...rest },
  ref,
) {
  const [input, setInput] = React.useState('');
  const submit = React.useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy || !onSend) return;
      onSend(trimmed);
      setInput('');
    },
    [onSend, busy],
  );

  return (
    <div ref={ref} className={`sk-agent-console${className ? ` ${className}` : ''}`} {...rest}>
      <header className="sk-agent-console__header">
        <span className="sk-agent-console__title">{title}</span>
        <AgentStatus status={status} />
      </header>
      {task && <div className="sk-agent-console__task">{task}</div>}

      <div className="sk-agent-console__body">
        <Conversation messages={messages} components={components} renderMarkdown={renderMarkdown} />
      </div>

      {onSend && (
        <footer className="sk-agent-console__footer">
          <ChatInput
            value={input}
            onValueChange={setInput}
            onSubmit={submit}
            placeholder="Steer the agent…"
            disabled={busy}
          />
        </footer>
      )}
    </div>
  );
});
