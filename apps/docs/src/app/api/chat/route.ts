const RESPONSES: Record<string, { text: string; reasoning?: string; tool?: { name: string; input: string; output: string } }> = {
  weather: {
    text: 'The current weather in New Orleans is 78F with partly cloudy skies. Humidity is at 72%, which is typical for the Gulf Coast. There is a 20% chance of afternoon thunderstorms.',
    reasoning: 'User asked about weather. Checking live weather data for the specified location.',
    tool: {
      name: 'get_weather',
      input: '{ "location": "New Orleans, LA" }',
      output: '{ "temp": 78, "condition": "Partly Cloudy", "humidity": "72%", "rain_chance": "20%" }',
    },
  },
  search: {
    text: 'Based on my search, skeehn is an ASCII/dither-first component library for building AI interfaces. It provides pre-built components like chat bubbles, streaming text, reasoning steps, and tool cards -- all styled with a distinctive dithered aesthetic.',
    reasoning: 'Searching documentation to provide an accurate description of the skeehn library.',
    tool: {
      name: 'search_docs',
      input: '{ "query": "what is skeehn" }',
      output: '{ "results": [{ "title": "Introduction", "snippet": "ASCII/dither component library for AI interfaces" }] }',
    },
  },
  code: {
    text: "Here is a basic example of using the ChatBubble component:\n\n```tsx\nimport '@skeehn/core/chat-bubble.css';\n\nfunction Chat() {\n  return (\n    <div role=\"log\">\n      <div className=\"sk-chat-bubble\" data-role=\"user\">\n        Hello, how are you?\n      </div>\n      <div className=\"sk-chat-bubble\" data-role=\"assistant\">\n        I'm doing great! How can I help?\n      </div>\n    </div>\n  );\n}\n```\n\nThe `data-role` attribute controls alignment and styling. User messages appear on the right with a solid background, while assistant messages use the dither pattern overlay.",
    reasoning: 'Generating a code example with the ChatBubble component from the skeehn library.',
  },
  help: {
    text: 'I can help you with several things:\n\n- **Weather** -- Ask about weather in any city\n- **Search** -- Search the skeehn documentation\n- **Code** -- Get code examples and component usage\n- **Components** -- Learn about available UI components\n\nTry asking "What is the weather in New Orleans?" or "Show me a code example."',
    reasoning: 'User needs guidance. Presenting available capabilities.',
  },
  components: {
    text: 'skeehn ships with 30+ components organized into categories:\n\n**Core UI:** Button, Card, Badge, Input, Toggle, Tabs, Accordion\n**AI Chat:** ChatBubble, ChatInput, StreamingText, ThinkingBlock\n**Agent:** ReasoningStep, ToolCard, AgentStatus, PromptSuggestions\n**Data:** Table, DataViz, Progress, CodeBlock\n**Layout:** Dialog, Dropdown, Tooltip, Terminal Panel\n\nEach component uses CSS-only architecture with `data-*` attributes for state management. No JavaScript runtime required for basic usage.',
    reasoning: 'Listing available components from the skeehn component library.',
  },
};

function getResponse(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('weather') || lower.includes('temperature') || lower.includes('forecast'))
    return RESPONSES.weather;
  if (lower.includes('search') || lower.includes('what is') || lower.includes('find'))
    return RESPONSES.search;
  if (lower.includes('code') || lower.includes('example') || lower.includes('how to') || lower.includes('show me'))
    return RESPONSES.code;
  if (lower.includes('component') || lower.includes('ui') || lower.includes('library'))
    return RESPONSES.components;
  if (lower.includes('help') || lower.includes('what can'))
    return RESPONSES.help;

  // Default response
  return {
    text: `That is an interesting question! As a demo assistant, I can help with weather lookups, documentation searches, code examples, and component overviews. Try asking about one of those topics to see the full streaming experience with reasoning steps and tool calls.`,
    reasoning: 'Processing user query and determining the best response path.',
  };
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1]?.content ?? '';
  const response = getResponse(lastMessage);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send reasoning step
      if (response.reasoning) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'reasoning', content: response.reasoning })}\n\n`)
        );
        await delay(300);
      }

      // Send tool call
      if (response.tool) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'tool_start', name: response.tool.name, input: response.tool.input })}\n\n`
          )
        );
        await delay(800);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'tool_end', name: response.tool.name, output: response.tool.output })}\n\n`
          )
        );
        await delay(200);
      }

      // Stream text character by character
      for (let i = 0; i < response.text.length; i++) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'text', content: response.text[i] })}\n\n`)
        );
        // Variable speed: faster for spaces, slower for punctuation
        const ch = response.text[i];
        const ms = ch === ' ' ? 10 : '.!?,\n'.includes(ch) ? 60 : 18;
        await delay(ms);
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
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

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
