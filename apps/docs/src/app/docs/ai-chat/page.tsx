'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type AgentStatus = 'idle' | 'thinking' | 'acting' | 'done';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  tool?: { name: string; input: string; output: string; status: 'running' | 'success' };
}

/* ═══════════════════════════════════════════════════════════════
   PROMPT SUGGESTIONS
   ═══════════════════════════════════════════════════════════════ */

const SUGGESTIONS = [
  { icon: '>', text: 'What is the weather in New Orleans?' },
  { icon: '#', text: 'Show me a code example' },
  { icon: '?', text: 'What components are available?' },
  { icon: '/', text: 'Search the documentation' },
];

/* ═══════════════════════════════════════════════════════════════
   AI CHAT DEMO
   ═══════════════════════════════════════════════════════════════ */

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle');
  const [expandedReasoning, setExpandedReasoning] = useState<Set<string>>(new Set());
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll on new content
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
      };

      const assistantId = `assistant-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput('');
      setIsStreaming(true);
      setAgentStatus('thinking');

      abortRef.current = new AbortController();

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) throw new Error('Failed to fetch');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'reasoning') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, reasoning: parsed.content } : m
                  )
                );
              } else if (parsed.type === 'tool_start') {
                setAgentStatus('acting');
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          tool: {
                            name: parsed.name,
                            input: parsed.input,
                            output: '',
                            status: 'running' as const,
                          },
                        }
                      : m
                  )
                );
              } else if (parsed.type === 'tool_end') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId && m.tool
                      ? {
                          ...m,
                          tool: { ...m.tool, output: parsed.output, status: 'success' as const },
                        }
                      : m
                  )
                );
                setAgentStatus('thinking');
              } else if (parsed.type === 'text') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: m.content + parsed.content } : m
                  )
                );
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content || 'Sorry, something went wrong.' }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        setAgentStatus('idle');
        abortRef.current = null;
        inputRef.current?.focus();
      }
    },
    [isStreaming, messages]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const toggleReasoning = (id: string) => {
    setExpandedReasoning((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTool = (id: string) => {
    setExpandedTools((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isEmpty = messages.length === 0;

  return (
    <div
      className="flex flex-col h-screen"
      style={{
        fontFamily: 'var(--sk-font-mono)',
        /* Break out of the max-w-3xl prose container */
        width: '100vw',
        maxWidth: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        position: 'relative',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: 'hsl(var(--sk-border-color))' }}
      >
        <div>
          <h1
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: 'var(--sk-font-sans)' }}
          >
            AI Chat Demo
          </h1>
          <p
            className="text-xs mt-0.5"
            style={{ color: 'hsl(var(--sk-muted-foreground))' }}
          >
            Full chat interface with streaming, reasoning, and tool calls
          </p>
        </div>
        {/* Agent status */}
        <div className="sk-agent-status" data-status={agentStatus} data-pulse="true">
          <span className="sk-agent-status__indicator" />
          <span className="sk-agent-status__text">
            {agentStatus === 'idle'
              ? 'Ready'
              : agentStatus === 'thinking'
                ? 'Thinking...'
                : agentStatus === 'acting'
                  ? 'Using tool...'
                  : 'Done'}
          </span>
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div
              className="text-center mb-8"
              style={{ color: 'hsl(var(--sk-muted-foreground))' }}
            >
              <div className="text-4xl mb-4" style={{ fontFamily: 'var(--sk-font-mono)' }}>
                {'>>>'}
              </div>
              <div className="text-sm">Ask me anything to see the demo in action</div>
            </div>

            {/* Prompt suggestions */}
            <div className="sk-prompt-suggestions" style={{ maxWidth: '600px', width: '100%' }}>
              <div className="sk-prompt-suggestions__label">Try one of these</div>
              <div className="sk-prompt-suggestions__grid">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    className="sk-prompt-suggestion"
                    onClick={() => sendMessage(s.text)}
                  >
                    <span className="sk-prompt-suggestion__icon">{s.icon}</span>
                    <span className="sk-prompt-suggestion__text">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-1" role="log" aria-live="polite">
            {messages.map((msg) => (
              <div key={msg.id}>
                {/* Chat bubble */}
                <div className="sk-chat-bubble" data-role={msg.role}>
                  {msg.role === 'assistant' && !msg.content && isStreaming && msg.id === messages[messages.length - 1]?.id ? (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '0.6em',
                        height: '1em',
                        background: 'hsl(var(--sk-foreground))',
                        animation: 'sk-blink 1s step-end infinite',
                      }}
                    />
                  ) : (
                    <MessageContent content={msg.content} />
                  )}
                </div>

                {/* Reasoning step */}
                {msg.reasoning && (
                  <div
                    className="sk-reasoning-step"
                    data-status="completed"
                    data-expanded={expandedReasoning.has(msg.id) ? 'true' : 'false'}
                    style={{ maxWidth: '80%', marginBottom: 'var(--sk-space-3)' }}
                  >
                    <button
                      className="sk-reasoning-step__header"
                      onClick={() => toggleReasoning(msg.id)}
                    >
                      <span className="sk-reasoning-step__indicator" />
                      <span className="sk-reasoning-step__title">Reasoning</span>
                      <span className="sk-reasoning-step__chevron">
                        {expandedReasoning.has(msg.id) ? '>' : '>'}
                      </span>
                    </button>
                    {expandedReasoning.has(msg.id) && (
                      <div className="sk-reasoning-step__content">{msg.reasoning}</div>
                    )}
                  </div>
                )}

                {/* Tool card */}
                {msg.tool && (
                  <div
                    className="sk-tool-card"
                    data-status={msg.tool.status}
                    data-expanded={expandedTools.has(msg.id) ? 'true' : 'false'}
                    style={{ maxWidth: '80%', marginBottom: 'var(--sk-space-3)' }}
                  >
                    <div
                      className="sk-tool-card__header"
                      onClick={() => toggleTool(msg.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="sk-tool-card__name">{msg.tool.name}</span>
                      <span className="sk-tool-card__status">
                        {msg.tool.status === 'running' ? 'Running' : 'Success'}
                      </span>
                    </div>
                    {expandedTools.has(msg.id) && (
                      <div className="sk-tool-card__body">
                        <div className="sk-tool-card__input">
                          <div className="sk-tool-card__label">Input</div>
                          <pre className="sk-tool-card__code">{msg.tool.input}</pre>
                        </div>
                        {msg.tool.output && (
                          <div className="sk-tool-card__output">
                            <div className="sk-tool-card__label">Output</div>
                            <pre className="sk-tool-card__code">{msg.tool.output}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Chat Input ── */}
      <div
        className="border-t px-6 py-3"
        style={{ borderColor: 'hsl(var(--sk-border-color))' }}
      >
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="sk-chat-input">
            <div className="sk-chat-input__wrapper">
              <textarea
                ref={inputRef}
                className="sk-chat-input__field"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isStreaming}
                style={{
                  resize: 'none',
                  minHeight: '1.5rem',
                  maxHeight: '8rem',
                  background: 'transparent',
                  color: 'hsl(var(--sk-foreground))',
                  fontFamily: 'var(--sk-font-mono)',
                  fontSize: 'var(--sk-font-size-sm)',
                }}
              />
              <div className="sk-chat-input__actions">
                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  style={{
                    padding: 'var(--sk-space-1) var(--sk-space-3)',
                    border: 'var(--sk-border)',
                    fontFamily: 'var(--sk-font-mono)',
                    fontSize: 'var(--sk-font-size-xs)',
                    cursor: input.trim() && !isStreaming ? 'pointer' : 'default',
                    background:
                      input.trim() && !isStreaming
                        ? 'hsl(var(--sk-foreground))'
                        : 'transparent',
                    color:
                      input.trim() && !isStreaming
                        ? 'hsl(var(--sk-background))'
                        : 'hsl(var(--sk-muted-foreground))',
                    opacity: input.trim() && !isStreaming ? 1 : 0.4,
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MESSAGE CONTENT — simple markdown-like rendering
   ═══════════════════════════════════════════════════════════════ */

function MessageContent({ content }: { content: string }) {
  if (!content) return null;

  // Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const lines = part.split('\n');
          const lang = lines[0].replace('```', '').trim();
          const code = lines.slice(1, -1).join('\n');
          return (
            <pre
              key={i}
              style={{
                background: 'hsl(var(--sk-muted) / 0.3)',
                border: 'var(--sk-border)',
                borderRadius: 'var(--sk-radius)',
                padding: 'var(--sk-space-3)',
                margin: 'var(--sk-space-2) 0',
                overflow: 'auto',
                fontSize: 'var(--sk-font-size-xs)',
              }}
            >
              {lang && (
                <div
                  style={{
                    fontSize: '0.6rem',
                    color: 'hsl(var(--sk-muted-foreground))',
                    marginBottom: 'var(--sk-space-2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {lang}
                </div>
              )}
              <code>{code}</code>
            </pre>
          );
        }

        // Inline formatting
        return (
          <span key={i}>
            {part.split('\n').map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                <InlineLine text={line} />
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
}

function InlineLine({ text }: { text: string }) {
  // Bold
  const parts = text.split(/(\*\*.*?\*\*)/);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} style={{ fontWeight: 700 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        // Inline code
        const codeParts = part.split(/(`[^`]+`)/);
        return codeParts.map((cp, j) => {
          if (cp.startsWith('`') && cp.endsWith('`')) {
            return (
              <code
                key={`${i}-${j}`}
                style={{
                  background: 'hsl(var(--sk-muted) / 0.4)',
                  padding: '0 0.3em',
                  borderRadius: '2px',
                  fontSize: '0.9em',
                }}
              >
                {cp.slice(1, -1)}
              </code>
            );
          }
          // Handle -- as em dash
          return <span key={`${i}-${j}`}>{cp.replace(/--/g, '\u2014')}</span>;
        });
      })}
    </>
  );
}
