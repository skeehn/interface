# skeehn starter

A minimal [skeehn](https://ui.skeehn.com) + [AI SDK](https://ai-sdk.dev) starter with three
surfaces from one themeable foundation:

- **`/chat`** — streaming chat. `@ai-sdk/react`'s `useChat` → `<ChatConsole>` from
  `@skeehn/react/blocks`. The API route streams via the Vercel AI Gateway.
- **`/voice`** — a voice-agent console (`<VoiceConsole>`), ready to wire to a realtime runtime.
- **`/site`** — a landing page (`<HeroSection>` + cards), proving skeehn builds sites too.

Re-skin everything by changing one attribute — `<html data-theme="dark">` (try `default`,
`terminal`, `brutal`, …), or generate a brand theme at
[ui.skeehn.com/docs/theme-generator](https://ui.skeehn.com/docs/theme-generator).

## Run

```bash
npm install
# Set a key for the AI Gateway (or run on Vercel with OIDC):
echo "AI_GATEWAY_API_KEY=your-key" > .env.local
npm run dev
```

Open http://localhost:3000.

## Deploy

Deploy to Vercel; set `AI_GATEWAY_API_KEY` in the project's environment variables. The chat
route uses a `provider/model` string (`openai/gpt-4o-mini`) — swap it for any model the
gateway supports.

## Stack

| | |
|---|---|
| UI | `@skeehn/react` · `@skeehn/react/blocks` · `@skeehn/core/styles.css` |
| AI | `ai` (v5) · `@ai-sdk/react` · Vercel AI Gateway |
| Framework | Next.js App Router |
