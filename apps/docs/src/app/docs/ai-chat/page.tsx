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
  { icon: '>', text: 'What is the weather in New Orleans?', sub: 'Tool call demo' },
  { icon: '#', text: 'Show me a code example', sub: 'Syntax highlighting' },
  { icon: '?', text: 'What components are available?', sub: 'Component catalog' },
  { icon: '/', text: 'Search the documentation', sub: 'Semantic search' },
];

/* ═══════════════════════════════════════════════════════════════
   AGENT STATUS DISPLAY
   ═══════════════════════════════════════════════════════════════ */

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; pulse: boolean }> = {
  idle: { label: 'Ready', color: 'bg-neutral-500', pulse: false },
  thinking: { label: 'Thinking...', color: 'bg-amber-400', pulse: true },
  acting: { label: 'Using tool...', color: 'bg-blue-400', pulse: true },
  done: { label: 'Done', color: 'bg-green-400', pulse: false },
};

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
  const statusCfg = STATUS_CONFIG[agentStatus];

  return (
    <div
      className="flex flex-col h-[calc(100vh-3.5rem)]"
      style={{
        fontFamily: 'var(--sk-font-mono)',
        width: '100vw',
        maxWidth: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        position: 'relative',
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-neutral-800 bg-neutral-900/50 shrink-0">
        <div>
          <h1 className="docs-heading text-lg tracking-tight"
            style={{ fontFamily: 'var(--sk-font-sans)' }}>
            AI Chat Demo
          </h1>
          <p className="text-xs mt-0.5 text-neutral-500">
            Streaming, reasoning traces, and tool calls
          </p>
        </div>
        {/* Agent status badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-900">
          <span className="relative flex h-2 w-2">
            {statusCfg.pulse && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusCfg.color}`} />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${statusCfg.color}`} />
          </span>
          <span className="text-[11px] text-neutral-400">{statusCfg.label}</span>
        </div>
      </div>

      {/* ── Messages area ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="text-center mb-10">
              <div className="text-5xl mb-4 text-neutral-700 font-mono font-bold">
                {'>>>'}
              </div>
              <div className="text-sm text-neutral-500">
                Ask me anything to see the demo in action
              </div>
            </div>

            {/* Prompt suggestions grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.text)}
                  className="border border-neutral-800 p-4 text-left hover:bg-neutral-800/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-neutral-600 text-lg font-mono mt-0.5 group-hover:text-neutral-400 transition-colors">
                      {s.icon}
                    </span>
                    <div>
                      <div className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                        {s.text}
                      </div>
                      <div className="text-[11px] text-neutral-600 mt-1">
                        {s.sub}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-1" role="log" aria-live="polite">
            {messages.map((msg) => (
              <div key={msg.id}>
                {/* Chat bubble */}
                <div
                  className={`mb-3 ${
                    msg.role === 'user'
                      ? 'flex justify-end'
                      : 'flex justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 text-sm font-mono ${
                      msg.role === 'user'
                        ? 'bg-white text-black rounded-2xl rounded-br-sm'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-2xl rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'assistant' && !msg.content && isStreaming && msg.id === messages[messages.length - 1]?.id ? (
                      <span className="inline-block w-[2px] h-4 bg-neutral-400 animate-pulse" />
                    ) : (
                      <MessageContent content={msg.content} />
                    )}
                  </div>
                </div>

                {/* Reasoning step */}
                {msg.reasoning && (
                  <div className="max-w-[80%] mb-3">
                    <button
                      onClick={() => toggleReasoning(msg.id)}
                      className="flex items-center gap-2 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                    >
                      <span className={`inline-block transition-transform ${expandedReasoning.has(msg.id) ? 'rotate-90' : ''}`}>
                        &rsaquo;
                      </span>
                      <span className="uppercase tracking-widest">Reasoning</span>
                    </button>
                    {expandedReasoning.has(msg.id) && (
                      <div className="mt-2 pl-4 border-l-2 border-neutral-800 text-xs text-neutral-500 leading-relaxed">
                        {msg.reasoning}
                      </div>
                    )}
                  </div>
                )}

                {/* Tool card */}
                {msg.tool && (
                  <div className="max-w-[80%] mb-3 border border-neutral-800 bg-neutral-900/50 overflow-hidden">
                    <div
                      onClick={() => toggleTool(msg.id)}
                      className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-neutral-800/30 transition-colors"
                    >
                      <span className="text-xs font-mono text-neutral-400">{msg.tool.name}</span>
                      <span className={`text-[10px] uppercase tracking-widest ${
                        msg.tool.status === 'running' ? 'text-amber-400' : 'text-green-400'
                      }`}>
                        {msg.tool.status === 'running' ? 'Running' : 'Success'}
                      </span>
                    </div>
                    {expandedTools.has(msg.id) && (
                      <div className="border-t border-neutral-800">
                        <div className="px-4 py-3">
                          <div className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1.5">Input</div>
                          <pre className="text-xs text-neutral-400 font-mono overflow-auto bg-black/50 p-2 border border-neutral-800">
                            {msg.tool.input}
                          </pre>
                        </div>
                        {msg.tool.output && (
                          <div className="px-4 py-3 border-t border-neutral-800">
                            <div className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1.5">Output</div>
                            <pre className="text-xs text-neutral-400 font-mono overflow-auto bg-black/50 p-2 border border-neutral-800">
                              {msg.tool.output}
                            </pre>
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

      {/* ── Chat Input — pinned to bottom ── */}
      <div className="shrink-0 border-t border-neutral-800 bg-neutral-900/80 backdrop-blur-sm px-6 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 border border-neutral-700 bg-neutral-900 px-4 py-3 focus-within:border-neutral-500 transition-colors">
            <textarea
              ref={inputRef}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isStreaming}
              className="flex-1 bg-transparent text-sm text-neutral-200 placeholder:text-neutral-600 font-mono resize-none outline-none"
              style={{
                minHeight: '1.5rem',
                maxHeight: '8rem',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className={`shrink-0 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                input.trim() && !isStreaming
                  ? 'bg-white text-black border-white hover:bg-neutral-200'
                  : 'bg-transparent text-neutral-600 border-neutral-700 cursor-default'
              }`}
            >
              Send
            </button>
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
              className="my-3 p-3 bg-black/60 border border-neutral-800 overflow-auto text-xs"
            >
              {lang && (
                <div className="text-[10px] text-neutral-600 uppercase tracking-widest mb-2">
                  {lang}
                </div>
              )}
              <code className="text-neutral-300">{code}</code>
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
            <strong key={i} className="font-bold text-white">
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
                className="bg-neutral-800 px-1.5 py-0.5 rounded text-[0.9em] text-neutral-300"
              >
                {cp.slice(1, -1)}
              </code>
            );
          }
          return <span key={`${i}-${j}`}>{cp.replace(/--/g, '\u2014')}</span>;
        });
      })}
    </>
  );
}
