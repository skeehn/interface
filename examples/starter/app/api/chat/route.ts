import { streamText, convertToModelMessages, type UIMessage } from "ai";

// Fluid Compute: allow longer streaming responses.
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    // Vercel AI Gateway "provider/model" string — set AI_GATEWAY_API_KEY
    // (or run on Vercel with OIDC). Swap for any model the gateway supports.
    model: "openai/gpt-4o-mini",
    system: "You are a concise, friendly assistant in a skeehn demo. Keep answers short.",
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
