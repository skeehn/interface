import Anthropic from '@anthropic-ai/sdk';

// The Anthropic SDK needs the Node.js runtime (not Edge).
export const runtime = 'nodejs';

// Model is env-configurable; defaults to Sonnet 4.6 — fast + cost-appropriate
// for a public docs demo. Adaptive thinking powers the live ThinkingBlock.
const MODEL = process.env.CHAT_MODEL ?? 'claude-sonnet-4-6';

const SYSTEM = `You are the skeehn assistant — a friendly, concise guide to skeehn, an
ASCII-native AI component library for React. skeehn ships 32 components (14 core, 15 AI,
3 bundles), 7 themes, a dither rendering engine, streaming hooks (useChat, usePacedText,
useAsciiStream), an MCP server, and a shadcn-compatible registry. Developers install via
\`npx shadcn add <url>\` or the \`npx skeehn add <name>\` CLI, and \`@skeehn/react\` on npm.
Answer in a few short paragraphs. Use markdown, and fenced code blocks for code. If you
are unsure of a specific detail, say so briefly rather than inventing it.`;

const encoder = new TextEncoder();
const sse = (obj: unknown) => encoder.encode(`data: ${JSON.stringify(obj)}\n\n`);
const DONE = encoder.encode('data: [DONE]\n\n');

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(req: Request) {
  const { messages = [] } = (await req.json()) as { messages?: ChatMessage[] };
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (apiKey) {
          await streamClaude(controller, apiKey, messages);
        } else {
          // No key (contributors / CI): fall back to a canned, still-streaming reply.
          await streamCanned(controller, messages);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        controller.enqueue(sse({ type: 'text', text: `\n\n_[chat error: ${message}]_` }));
      } finally {
        controller.enqueue(DONE);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// ─── Real Claude (adaptive thinking → reasoning + text deltas) ──────────────
async function streamClaude(
  controller: ReadableStreamDefaultController<Uint8Array>,
  apiKey: string,
  messages: ChatMessage[],
) {
  const client = new Anthropic({ apiKey });

  const claude = client.messages.stream({
    model: MODEL,
    max_tokens: 16384,
    system: SYSTEM,
    // Adaptive thinking: Claude decides depth and streams reasoning blocks that
    // drive the live ThinkingBlock in the demo. (budget_tokens is deprecated on 4.6.)
    thinking: { type: 'adaptive' },
    messages: messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: String(m.content ?? '') })),
  });

  for await (const event of claude) {
    if (event.type !== 'content_block_delta') continue;
    if (event.delta.type === 'thinking_delta') {
      controller.enqueue(sse({ type: 'reasoning', text: event.delta.thinking }));
    } else if (event.delta.type === 'text_delta') {
      controller.enqueue(sse({ type: 'text', text: event.delta.text }));
    }
  }
}

// ─── Canned fallback (keyword-matched, streamed word-by-word) ───────────────
const RESPONSES: Record<string, { reasoning: string; text: string }> = {
  install: {
    reasoning: 'User is asking how to install skeehn. Surfacing both install paths.',
    text: "Install a component two ways:\n\n```bash\n# shadcn registry (humans + agents)\nnpx shadcn@latest add https://ui.skeehn.com/r/chat-bubble.json\n\n# or the skeehn CLI\nnpx skeehn add chat-bubble\n```\n\nFor the typed React layer: `npm install @skeehn/react @skeehn/core`, then `import '@skeehn/core/styles.css'` once and import components from `@skeehn/react`.",
  },
  theme: {
    reasoning: 'User asked about themes. skeehn ships 7.',
    text: 'skeehn ships **7 themes** — `default`, `dark`, `terminal`, `brutal`, `print`, `grain`, and `mardi-gras`. Set one with `data-theme="terminal"` on a wrapping element (or `<html>`), or scaffold with `npx skeehn init --theme terminal`.',
  },
  component: {
    reasoning: 'Listing the component catalog by category.',
    text: 'There are **32 components**: 14 core (Button, Card, Input, Dialog, Tabs…), 15 AI-native (ChatBubble, StreamingText, ThinkingBlock, ToolCard, ReasoningStep, CitationCard…), and 3 bundles (Layout, Dataviz, Motion). All are CSS-first with `--sk-*` tokens and the dither engine.',
  },
};

function pickCanned(message: string) {
  const q = message.toLowerCase();
  if (q.includes('install') || q.includes('add') || q.includes('setup') || q.includes('start'))
    return RESPONSES.install;
  if (q.includes('theme') || q.includes('dark') || q.includes('color')) return RESPONSES.theme;
  if (q.includes('component') || q.includes('what') || q.includes('list')) return RESPONSES.component;
  return {
    reasoning: 'No live model key configured; returning a canned demo reply.',
    text: "This is the **offline demo reply** — set `ANTHROPIC_API_KEY` to stream real Claude here. Meanwhile, try asking about *install*, *themes*, or *components* to see the dithered streaming UI in action.",
  };
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function streamCanned(
  controller: ReadableStreamDefaultController<Uint8Array>,
  messages: ChatMessage[],
) {
  const last = messages[messages.length - 1]?.content ?? '';
  const { reasoning, text } = pickCanned(last);

  // Stream the reasoning first (drives the ThinkingBlock), then the answer.
  for (const chunk of reasoning.match(/\S+\s*/g) ?? []) {
    controller.enqueue(sse({ type: 'reasoning', text: chunk }));
    await delay(18);
  }
  await delay(250);
  for (const chunk of text.match(/\S+\s*|\s+/g) ?? []) {
    controller.enqueue(sse({ type: 'text', text: chunk }));
    await delay(22);
  }
}
