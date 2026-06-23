'use client';
import { useState, useRef, useEffect } from 'react';

type Role = 'user' | 'assistant';
interface Message {
  id: number;
  role: Role;
  content: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: 'assistant',
    content: "Laissez les bons temps rouler! 🎭 I'm your Mardi Gras AI guide. Ask me anything about New Orleans — from parade routes to the best beignets.",
  },
];

const PROMPTS = [
  { icon: '◈', text: "What's the history of Mardi Gras?" },
  { icon: '▦', text: 'Plan a Mardi Gras party menu' },
  { icon: '░', text: 'Best parade routes in New Orleans' },
  { icon: '▒', text: 'Teach me a classic NOLA cocktail' },
];

const PAST_CONVOS = [
  'King Cake traditions',
  'Mardi Gras music history',
  'Zydeco vs Cajun music',
];

const RESPONSES: Record<string, string> = {
  history: "Mardi Gras traces its roots to medieval European celebrations. French explorers brought it to North America in 1699 when Pierre Le Moyne d'Iberville camped near present-day New Orleans on Fat Tuesday. By the 1700s, the French colonial capital was celebrating with masked balls and street parties. The modern parade tradition began in 1857 with the Mystick Krewe of Comus.",
  party: "For an authentic Mardi Gras spread: King Cake is essential (purple, gold, and green sugar), Jambalaya with andouille sausage, Red beans and rice (traditional Monday dish), Crawfish étouffée, Beignets dusted with powdered sugar, and Bananas Foster for dessert. Drinks: Hurricanes, Sazeracs, and Milk Punch.",
  parade: "The main parade routes run along St. Charles Avenue and Canal Street. Key krewes: Endymion (Saturday before Mardi Gras), Bacchus (Sunday), Zulu and Rex (Mardi Gras day). Get to the route 2 hours early for a good spot. The Garden District section of St. Charles is beloved for the live oak canopy.",
  cocktail: "The Sazerac — New Orleans' own cocktail (officially since 2008): 2oz rye whiskey, ¼oz absinthe (rinse the glass), 1 sugar cube, 2-3 dashes Peychaud's bitters. Muddle sugar with bitters, add ice and rye, stir, strain into the absinthe-rinsed glass, garnish with a lemon peel. Never shake a Sazerac.",
};

function getResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes('history') || q.includes('origin')) return RESPONSES.history;
  if (q.includes('party') || q.includes('menu') || q.includes('food') || q.includes('king cake')) return RESPONSES.party;
  if (q.includes('parade') || q.includes('route') || q.includes('krewe')) return RESPONSES.parade;
  if (q.includes('cocktail') || q.includes('drink') || q.includes('sazerac') || q.includes('nola')) return RESPONSES.cocktail;
  return `Great question about "${input}"! In true New Orleans spirit, every aspect of Mardi Gras has a story. The celebration runs from January 6th (Epiphany/Twelfth Night) through Fat Tuesday — the day before Ash Wednesday. During this season, over 70 krewes hold parades and balls across the city. Is there a specific aspect you'd like to explore?`;
}

export default function MardiGrasChat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const idRef = useRef(2);

  // Apply the Mardi Gras theme to the document while this demo route is mounted,
  // restoring the visitor's previous theme on unmount. (folded in from the
  // standalone examples/mardi-gras app during Milestone 1A de-clutter.)
  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'mardi-gras');
    return () => {
      if (prev) document.documentElement.setAttribute('data-theme', prev);
      else document.documentElement.removeAttribute('data-theme');
    };
  }, []);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;
    setShowSuggestions(false);
    const userMsg: Message = { id: idRef.current++, role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsThinking(true);
    setTimeout(() => {
      const response = getResponse(trimmed);
      setIsThinking(false);
      setMessages(prev => [...prev, { id: idRef.current++, role: 'assistant', content: response }]);
    }, 1800 + Math.random() * 800);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  const isEmptyState = showSuggestions && messages.length === 1;

  return (
    <div data-theme="mardi-gras" style={{
      display: 'grid',
      gridTemplateRows: '56px 1fr',
      height: '100dvh',
      overflow: 'hidden',
      background: 'hsl(var(--sk-background))',
      fontFamily: 'var(--sk-font-sans)',
    }}>

      {/* ── Header 56px ── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sk-space-4)',
        padding: '0 var(--sk-space-6)',
        borderBottom: '1px solid hsl(var(--sk-border-color))',
        background: 'hsl(var(--sk-surface))',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden',
      }}>
        {/* Scanline texture overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'var(--sk-dither-scanlines)',
          opacity: 0.12,
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Logo */}
        <div style={{
          fontFamily: 'var(--sk-font-mono)',
          fontWeight: 700,
          letterSpacing: '0.12em',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sk-space-3)',
          color: 'hsl(var(--sk-primary))',
          position: 'relative',
          zIndex: 1,
          fontSize: '13px',
          textTransform: 'uppercase',
        }}>
          <span style={{
            fontSize: '1.25rem',
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            border: '1.5px solid hsl(var(--sk-primary) / 0.5)',
            color: 'hsl(var(--sk-primary))',
          }}>▦</span>
          Mardi Gras AI
        </div>

        {/* Powered by badge — subtle, next to logo */}
        <span
          className="sk-badge"
          style={{
            fontFamily: 'var(--sk-font-mono)',
            fontSize: '9px',
            letterSpacing: '0.08em',
            opacity: 0.7,
            position: 'relative',
            zIndex: 1,
          }}
        >
          POWERED BY SKEEHN
        </span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Agent status */}
        <div
          className="sk-agent-status"
          data-status={isThinking ? 'thinking' : 'idle'}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <span className="sk-agent-status__dot" />
          <span className="sk-agent-status__label">
            {isThinking ? 'thinking' : 'ready'}
          </span>
        </div>

        {/* Version badge */}
        <span
          className="sk-badge"
          style={{
            fontFamily: 'var(--sk-font-mono)',
            fontSize: '9px',
            letterSpacing: '0.06em',
            position: 'relative',
            zIndex: 1,
          }}
        >
          v0.4
        </span>
      </header>

      {/* ── Body: sidebar + main ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 0 }}>

        {/* ── Sidebar ── */}
        <aside style={{
          borderRight: '1px solid hsl(var(--sk-border-color))',
          display: 'flex',
          flexDirection: 'column',
          background: 'hsl(var(--sk-surface))',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* New Chat button */}
          <div style={{
            padding: 'var(--sk-space-4) var(--sk-space-3)',
            borderBottom: '1px solid hsl(var(--sk-border-color) / 0.5)',
          }}>
            <button
              className="sk-btn"
              data-variant="dither"
              data-size="sm"
              style={{ width: '100%' }}
              onClick={() => {
                setMessages(INITIAL_MESSAGES);
                setShowSuggestions(true);
                setInput('');
                setActiveConvo(null);
                if (textareaRef.current) textareaRef.current.style.height = 'auto';
              }}
            >
              + New Chat
            </button>
          </div>

          {/* Recent section */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--sk-space-4) 0 0',
          }}>
            {/* Section label */}
            <div style={{
              fontFamily: 'var(--sk-font-mono)',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'hsl(var(--sk-muted-foreground))',
              padding: '0 var(--sk-space-4)',
              marginBottom: 'var(--sk-space-2)',
              opacity: 0.7,
            }}>
              Recent
            </div>

            {/* Divider */}
            <div style={{
              height: '1px',
              background: 'hsl(var(--sk-border-color) / 0.4)',
              margin: '0 var(--sk-space-3) var(--sk-space-2)',
            }} />

            {/* Past conversations */}
            {PAST_CONVOS.map(c => {
              const isActive = activeConvo === c;
              return (
                <button
                  key={c}
                  onClick={() => setActiveConvo(isActive ? null : c)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--sk-space-2)',
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px var(--sk-space-4)',
                    background: isActive ? 'hsl(var(--sk-primary) / 0.08)' : 'none',
                    border: 'none',
                    borderLeft: isActive
                      ? '2px solid hsl(var(--sk-primary))'
                      : '2px solid transparent',
                    cursor: 'pointer',
                    fontFamily: 'var(--sk-font-sans)',
                    fontSize: '12px',
                    lineHeight: '1.3',
                    color: isActive
                      ? 'hsl(var(--sk-foreground))'
                      : 'hsl(var(--sk-muted-foreground))',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'color 120ms ease, background 120ms ease, border-color 120ms ease',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--sk-foreground))';
                      (e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--sk-primary) / 0.04)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--sk-muted-foreground))';
                      (e.currentTarget as HTMLButtonElement).style.background = 'none';
                    }
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--sk-font-mono)',
                    fontSize: '8px',
                    opacity: 0.5,
                    flexShrink: 0,
                  }}>▸</span>
                  {c}
                </button>
              );
            })}
          </div>

          {/* Bottom dither mark */}
          <div style={{
            padding: 'var(--sk-space-5) var(--sk-space-3)',
            borderTop: '1px solid hsl(var(--sk-border-color) / 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--sk-space-1)',
          }}>
            <div style={{
              fontFamily: 'var(--sk-font-mono)',
              fontSize: '1.5rem',
              lineHeight: 1,
              color: 'hsl(var(--sk-primary))',
              opacity: 0.28,
              letterSpacing: '0.05em',
              userSelect: 'none',
            }}>
              ▓░
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
          background: 'hsl(var(--sk-background))',
        }}>

          {/* Thread / Hero area */}
          <div
            ref={threadRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              ...(isEmptyState
                ? {
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--sk-space-12) var(--sk-space-8)',
                  }
                : {
                    padding: 'var(--sk-space-8) var(--sk-space-8)',
                    gap: 'var(--sk-space-5)',
                  }),
            }}
          >
            {isEmptyState ? (
              /* ── Empty State Hero ── */
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                maxWidth: '560px',
                width: '100%',
              }}>
                {/* ASCII dither mark */}
                <div style={{
                  fontFamily: 'var(--sk-font-mono)',
                  fontSize: '3.5rem',
                  lineHeight: 1,
                  color: 'hsl(var(--sk-primary))',
                  letterSpacing: '0.15em',
                  marginBottom: 'var(--sk-space-6)',
                  userSelect: 'none',
                  opacity: 0.9,
                }}>
                  ▓▒░▒▓
                </div>

                {/* Heading */}
                <h1 style={{
                  fontFamily: 'var(--sk-font-sans)',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
                  lineHeight: 1.2,
                  color: 'hsl(var(--sk-foreground))',
                  margin: '0 0 var(--sk-space-3)',
                  letterSpacing: '-0.01em',
                }}>
                  Laissez les bons temps rouler
                </h1>

                {/* Subtitle */}
                <p style={{
                  fontFamily: 'var(--sk-font-sans)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: 'hsl(var(--sk-muted-foreground))',
                  margin: '0 0 var(--sk-space-8)',
                  maxWidth: '400px',
                }}>
                  Your guide to New Orleans culture, cuisine, and Mardi Gras tradition.
                </p>

                {/* Prompt suggestions */}
                <div
                  className="sk-prompt-suggestions"
                  data-variant="chips"
                  style={{ width: '100%' }}
                >
                  <div className="sk-prompt-suggestions__label">Try asking</div>
                  <div className="sk-prompt-suggestions__grid">
                    {PROMPTS.map(p => (
                      <button
                        key={p.text}
                        className="sk-prompt-suggestion"
                        onClick={() => sendMessage(p.text)}
                      >
                        <span className="sk-prompt-suggestion__icon">{p.icon}</span>
                        <span className="sk-prompt-suggestion__text">{p.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ── Chat Thread ── */
              <div style={{
                width: '100%',
                maxWidth: '720px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sk-space-5)',
              }}>
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className="sk-chat-bubble"
                    data-role={msg.role}
                  >
                    <div className="sk-chat-bubble__content">{msg.content}</div>
                  </div>
                ))}

                {/* Thinking block */}
                {isThinking && (
                  <div
                    className="sk-thinking-block"
                    data-state="thinking"
                    data-expanded="true"
                  >
                    <button className="sk-thinking-block__header" aria-expanded="true">
                      <span className="sk-thinking-block__dot" />
                      <span className="sk-thinking-block__label">Thinking…</span>
                      <span className="sk-thinking-block__chevron">▸</span>
                    </button>
                    <div className="sk-thinking-block__content">
                      Searching my knowledge of New Orleans culture and Mardi Gras traditions…
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Input footer ── */}
          <div style={{
            borderTop: '1px solid hsl(var(--sk-border-color))',
            background: 'hsl(var(--sk-surface))',
            padding: 'var(--sk-space-4) var(--sk-space-8) var(--sk-space-5)',
          }}>
            <div style={{
              maxWidth: '720px',
              margin: '0 auto',
            }}>
              <div className="sk-chat-input__wrapper">
                <textarea
                  ref={textareaRef}
                  className="sk-chat-input__field"
                  placeholder="Ask about Mardi Gras…"
                  rows={1}
                  value={input}
                  disabled={isThinking}
                  onChange={e => {
                    setInput(e.target.value);
                    autoResize(e.target);
                  }}
                  onKeyDown={handleKeyDown}
                />
                <div className="sk-chat-input__actions">
                  <button
                    className="sk-chat-input__send sk-btn"
                    data-variant="dither"
                    data-size="sm"
                    disabled={isThinking || !input.trim()}
                    onClick={() => sendMessage(input)}
                  >
                    ↑
                  </button>
                </div>
              </div>

              {/* Hint */}
              <div style={{
                textAlign: 'center',
                marginTop: 'var(--sk-space-2)',
                fontFamily: 'var(--sk-font-mono)',
                fontSize: '10px',
                color: 'hsl(var(--sk-muted-foreground))',
                opacity: 0.5,
                letterSpacing: '0.04em',
              }}>
                Enter to send · Shift+Enter for newline
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
