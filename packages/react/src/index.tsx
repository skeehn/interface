// @skeehn/react — thin React wrappers for skeehn custom elements
// CSS is still imported separately from the engine + component CSS files

import React from 'react';

export interface ChatBubbleProps {
  role: 'user' | 'assistant' | 'tool' | 'system';
  children: React.ReactNode;
  streaming?: boolean;
  className?: string;
}

export function ChatBubble({ role, children, streaming, className, ...props }: ChatBubbleProps) {
  return (
    <div
      className={`sk-chat-bubble${className ? ` ${className}` : ''}`}
      data-role={role}
      data-streaming={streaming ? 'true' : undefined}
      {...props}
    >
      <div className="sk-chat-bubble__content">{children}</div>
    </div>
  );
}

export interface AgentStatusProps {
  status: 'idle' | 'thinking' | 'acting' | 'done' | 'error';
  label?: string;
}

export function AgentStatus({ status, label }: AgentStatusProps) {
  const defaultLabels: Record<AgentStatusProps['status'], string> = {
    idle: 'idle',
    thinking: 'thinking',
    acting: 'acting',
    done: 'done',
    error: 'error',
  };
  return (
    <div className="sk-agent-status" data-status={status}>
      <span className="sk-agent-status__dot" />
      <span className="sk-agent-status__label">{label ?? defaultLabels[status]}</span>
    </div>
  );
}

export interface ReasoningStepProps {
  status: 'pending' | 'active' | 'completed' | 'error';
  title: string;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
}

export function ReasoningStep({ status, title, children, defaultExpanded }: ReasoningStepProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded ?? false);
  const icon =
    status === 'completed' ? '✓' :
    status === 'error'     ? '✗' :
    status === 'active'    ? '▸' : '○';
  return (
    <div
      className="sk-reasoning-step"
      data-status={status}
      data-expanded={expanded ? 'true' : 'false'}
    >
      <button
        className="sk-reasoning-step__header"
        aria-expanded={expanded}
        onClick={() => setExpanded(e => !e)}
      >
        <span className="sk-reasoning-step__indicator">{icon}</span>
        <span className="sk-reasoning-step__title">{title}</span>
        <span className="sk-reasoning-step__chevron">{expanded ? '▾' : '▸'}</span>
      </button>
      {expanded && children && (
        <div className="sk-reasoning-step__content">{children}</div>
      )}
    </div>
  );
}

// Convenience alias
export { ChatBubble as Message };
