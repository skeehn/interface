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
    content: 'Laissez les bons temps rouler! 🎭 I\'m your Mardi Gras AI guide. Ask me anything about New Orleans — from parade routes to the best beignets.',
  },
];

const PROMPTS = [
  { icon: '◈', text: 'What\'s the history of Mardi Gras?' },
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
  history: 'Mardi Gras traces its roots to medieval European celebrations. French explorers brought it to North America in 1699 when Pierre Le Moyne d\'Iberville camped near present-day New Orleans on Fat Tuesday. By the 1700s, the French colonial capital was celebrating with masked balls and street parties. The modern parade tradition began in 1857 with the Mystick Krewe of Comus.',
  party: 'For an authentic Mardi Gras spread: King Cake is essential (purple, gold, and green sugar), Jambalaya with andouille sausage, Red beans and rice (traditional Monday dish), Crawfish étouffée, Beignets dusted with powdered sugar, and Bananas Foster for dessert. Drinks: Hurricanes, Sazeracs, and Milk Punch.',
  parade: 'The main parade routes run along St. Charles Avenue and Canal Street. Key krewes: Endymion (Saturday before Mardi Gras), Bacchus (Sunday), Zulu and Rex (Mardi Gras day). Get to the route 2 hours early for a good spot. The Garden District section of St. Charles is beloved for the live oak canopy.',
  cocktail: 'The Sazerac — New Orleans\' own cocktail (officially since 2008): 2oz rye whiskey, ¼oz absinthe (rinse the glass), 1 sugar cube, 2-3 dashes Peychaud\'s bitters. Muddle sugar with bitters, add ice and rye, stir, strain into the absinthe-rinsed glass, garnish with a lemon peel. Never shake a Sazerac.',
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
  const threadRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  let idRef = useRef(2);

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

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: '44px 1fr',
      height: '100dvh',
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sk-space-4)',
        padding: '0 var(--sk-space-6)',
        borderBottom: '1px solid hsl(var(--sk-border-color))',
        background: 'hsl(var(--sk-surface))',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: 'var(--sk-font-mono)',
          fontWeight: 500,
          letterSpacing: '0.1em',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sk-space-2)',
          color: 'hsl(var(--sk-primary))',
        }}>
          <span style={{ fontSize: '1.1rem' }}>▦</span>
          MARDI GRAS AI
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Agent status */}
        <div
          className="sk-agent-status"
          data-status={isThinking ? 'thinking' : 'idle'}
        >
          <span className="sk-agent-status__dot" />
          <span className="sk-agent-status__label">
            {isThinking ? 'thinking' : 'ready'}
          </span>
        </div>

        {/* Badge */}
        <span className="sk-badge" style={{ fontFamily: 'var(--sk-font-mono)' }}>
          powered by skeehn
        </span>
      </header>

      {/* ── Body: sidebar + main ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: 0 }}>

        {/* ── Sidebar ── */}
        <aside style={{
          borderRight: '1px solid hsl(var(--sk-border-color))',
          padding: 'var(--sk-space-4) 0',
          display: 'flex',
          flexDirection: 'column',
          background: 'hsl(var(--sk-surface))',
          overflow: 'hidden',
        }}>
          {/* New chat */}
          <div style={{ padding: '0 var(--sk-space-3)', marginBottom: 'var(--sk-space-4)' }}>
            <button
              className="sk-btn"
              data-variant="dither"
              data-size="sm"
              style={{ width: '100%' }}
              onClick={() => { setMessages(INITIAL_MESSAGES); setShowSuggestions(true); setInput(''); }}
            >
              + New chat
            </button>
          </div>

          {/* History label */}
          <div style={{
            fontFamily: 'var(--sk-font-mono)',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'hsl(var(--sk-muted-foreground))',
            padding: '0 var(--sk-space-4)',
            marginBottom: 'var(--sk-space-2)',
          }}>
            Recent
          </div>

          {/* Past convos */}
          {PAST_CONVOS.map(c => (
            <button key={c} style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '6px var(--sk-space-4)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--sk-font-sans)',
              fontSize: 'var(--sk-font-size-xs)',
              color: 'hsl(var(--sk-muted-foreground))',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              borderLeft: '2px solid transparent',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--sk-foreground))'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--sk-muted-foreground))'; }}
            >
              {c}
            </button>
          ))}

          {/* Decorative dither mark at bottom */}
          <div style={{ marginTop: 'auto', padding: 'var(--sk-space-4)', opacity: 0.15 }}>
            <div style={{
              fontFamily: 'var(--sk-font-mono)',
              fontSize: '2rem',
              lineHeight: 1,
              color: 'hsl(var(--sk-primary))',
              textAlign: 'center',
            }}>▦</div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

          {/* Thread */}
          <div
            ref={threadRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 'var(--sk-space-6) var(--sk-space-8)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sk-space-4)',
            }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                className="sk-chat-bubble"
                data-role={msg.role}
              >
                <div className="sk-chat-bubble__content">{msg.content}</div>
              </div>
            ))}

            {/* Prompt suggestions — shown only for the initial state */}
            {showSuggestions && !isThinking && (
              <div className="sk-prompt-suggestions">
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
            )}

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

          {/* Input footer */}
          <div style={{
            padding: 'var(--sk-space-4) var(--sk-space-6)',
            borderTop: '1px solid hsl(var(--sk-border-color))',
            background: 'hsl(var(--sk-surface))',
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
            <div style={{
              textAlign: 'center',
              marginTop: 'var(--sk-space-2)',
              fontFamily: 'var(--sk-font-mono)',
              fontSize: '10px',
              color: 'hsl(var(--sk-muted-foreground))',
              opacity: 0.6,
            }}>
              Enter to send · Shift+Enter for newline
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
