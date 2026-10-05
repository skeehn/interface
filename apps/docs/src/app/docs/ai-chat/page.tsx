'use client';

import { useChat, usePacedText, useStickyScroll } from '@skeehn/react/hooks';
import { messageText } from '@skeehn/react/ai';
import {
  AgentStatus,
  ChatBubble,
  ChatInput,
  CodeBlock,
  Markdown,
  PromptSuggestions,
  StreamingText,
  ThinkingBlock,
  closeOpenFences,
} from '@skeehn/react';

/* ═══════════════════════════════════════════════════════════════
   AI CHAT DEMO — built entirely from @skeehn/react components + hooks.
   This page is the flagship dogfood: useChat streams from /api/chat
   (real Claude with adaptive thinking, or a canned fallback), usePacedText
   smooths the reveal, useStickyScroll keeps it pinned, and the UI is skeehn
   ChatBubble / StreamingText / ThinkingBlock / ChatInput.
   ═══════════════════════════════════════════════════════════════ */

const SUGGESTIONS = [
  { value: 'install', text: 'How do I install a skeehn component?', icon: '▦' },
  { value: 'themes', text: 'What themes are available?', icon: '◑' },
  { value: 'components', text: 'List the AI-native components', icon: '✦' },
  { value: 'dither', text: 'How does the dither engine work?', icon: '░' },
];

export default function AIChatPage() {
  const { messages, input, setInput, append, isLoading } = useChat({ api: '/api/chat' });

  const last = messages[messages.length - 1];
  const streaming = isLoading && last?.role === 'assistant';

  // Smooth, steady-cadence reveal of the in-flight assistant message — decoupled
  // from bursty network chunks. (Hook must be called unconditionally.)
  const paced = usePacedText(streaming && last ? messageText(last) : '', { enabled: streaming });

  // Follow new content while pinned to the bottom; break on manual scroll-up.
  const scrollKey = streaming ? `${messages.length}:${paced.text.length}` : String(messages.length);
  const { ref: scrollRef, atBottom, scrollToBottom } = useStickyScroll<HTMLDivElement>(scrollKey);

  const send = (value: string) => {
    const text = value.trim();
    if (!text || isLoading) return;
    void append(text);
    setInput('');
  };

  const isEmpty = messages.length === 0;

  return (
    <div
      className="flex flex-col h-[calc(100vh-3.5rem)] w-full relative"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-surface/50 shrink-0">
        <div>
          <h1 className="docs-heading text-lg tracking-tight" style={{ fontFamily: 'var(--sk-font-sans)' }}>
            AI Chat Demo
          </h1>
          <p className="text-xs mt-0.5 text-muted-fg">Built entirely from skeehn components + hooks</p>
        </div>
        <AgentStatus status={isLoading ? 'thinking' : 'idle'} />
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="text-5xl mb-8 text-muted-fg font-mono font-bold select-none">▓▒░▒▓</div>
            <PromptSuggestions
              className="max-w-xl w-full"
              label="Ask me anything about skeehn"
              suggestions={SUGGESTIONS}
              onSelect={(v) => send(SUGGESTIONS.find((s) => s.value === v)?.text ?? v)}
            />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-4" role="log" aria-live="polite">
            {messages.map((msg) => {
              const isStreamingMsg = streaming && msg.id === last?.id;
              const reasoning = msg.parts.find((p) => p.type === 'reasoning');
              const reasoningText = reasoning && 'text' in reasoning ? reasoning.text : '';

              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <ChatBubble role="user">{messageText(msg)}</ChatBubble>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex flex-col items-start gap-2 max-w-[85%]">
                  {reasoningText && (
                    <ThinkingBlock
                      className="w-full"
                      state={isStreamingMsg ? 'thinking' : 'done'}
                      label={isStreamingMsg ? 'Thinking…' : 'Thought process'}
                    >
                      <MessageContent content={reasoningText} />
                    </ThinkingBlock>
                  )}
                  <ChatBubble role="assistant" streaming={isStreamingMsg}>
                    {isStreamingMsg ? (
                      <StreamingText caret={paced.isCatchingUp ? 'block' : false}>
                        <MessageContent content={paced.text} />
                      </StreamingText>
                    ) : (
                      <MessageContent content={messageText(msg)} />
                    )}
                  </ChatBubble>
                </div>
              );
            })}
          </div>
        )}

        {/* Jump-to-latest affordance (from useStickyScroll) */}
        {!atBottom && !isEmpty && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider border border-border bg-surface text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            ▼ jump to latest
          </button>
        )}
      </div>

      {/* ── Input ── */}
      <div className="shrink-0 border-t border-border bg-surface/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            value={input}
            onValueChange={setInput}
            onSubmit={send}
            placeholder="Ask about skeehn…"
            disabled={isLoading}
            state={isLoading ? 'streaming' : undefined}
            hint="Enter to send · Shift+Enter for newline"
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MESSAGE CONTENT — streaming-tolerant markdown.
   closeOpenFences() virtually closes an in-progress code fence so a
   half-streamed block renders cleanly instead of flashing. Code blocks
   render via skeehn's CodeBlock; the whole thing is styled by Markdown.
   ═══════════════════════════════════════════════════════════════ */

function MessageContent({ content }: { content: string }) {
  if (!content) return null;
  const safe = closeOpenFences(content);
  const parts = safe.split(/(```[\s\S]*?```)/);

  return (
    <Markdown>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const lines = part.split('\n');
          const lang = lines[0].replace(/```/, '').trim();
          const code = lines.slice(1, -1).join('\n');
          return <CodeBlock key={i} code={code} language={lang || undefined} />;
        }
        return <InlineMarkdown key={i} text={part} />;
      })}
    </Markdown>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  return (
    <span>
      {text.split('\n').map((line, j) => (
        <span key={j}>
          {j > 0 && <br />}
          {line.split(/(\*\*.*?\*\*|`[^`]+`)/).map((seg, k) => {
            if (seg.startsWith('**') && seg.endsWith('**')) {
              return (
                <strong key={k} className="font-bold text-foreground">
                  {seg.slice(2, -2)}
                </strong>
              );
            }
            if (seg.startsWith('`') && seg.endsWith('`')) {
              return (
                <code key={k} className="bg-muted px-1.5 py-0.5 rounded text-[0.9em]">
                  {seg.slice(1, -1)}
                </code>
              );
            }
            return <span key={k}>{seg}</span>;
          })}
        </span>
      ))}
    </span>
  );
}
