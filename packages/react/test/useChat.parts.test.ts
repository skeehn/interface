import { describe, expect, test } from 'bun:test';
import { MessageAccumulator, parseSSE, finalizeMessage } from '../src/hooks/useChat';

const frame = (json: object) => JSON.stringify(json);

describe('useChat parts contract', () => {
  test('openai-compatible tool_calls fold into one tool part', () => {
    const a = new MessageAccumulator();
    const id = 'call_1';
    a.apply(parseSSE(frame({ choices: [{ delta: { tool_calls: [{ id, function: { name: 'search', arguments: '{"que' } }] } }] }))!);
    a.apply(parseSSE(frame({ choices: [{ delta: { tool_calls: [{ function: { arguments: 'ry":"ai"}' } }] } }] }))!);

    const tool = a.message.parts[0] as any;
    expect(tool.type).toBe('tool-search');
    expect(tool.toolCallId).toBe(id);
    expect(tool.state).toBe('input-available');
    expect(tool.input).toEqual({ query: 'ai' });
  });

  test('requiresApproval holds execution at awaiting-approval', () => {
    const a = new MessageAccumulator();
    a.apply(parseSSE(frame({ type: 'tool_call', tool_call_id: 't1', tool_name: 'delete_file', arguments: '{"x":1}', requiresApproval: true }))!);
    const tool = a.message.parts[0] as any;
    expect(tool.state).toBe('awaiting-approval');
  });

  test('result events output-available', () => {
    const a = new MessageAccumulator();
    a.apply(parseSSE(frame({ type: 'tool_call', tool_call_id: 't2', tool_name: 'ls', arguments: '{}' }))!);
    const out = parseSSE(frame({ type: 'tool_result', tool_call_id: 't2', output: 'ok' }))! as any;
    a.apply(out);
    const tool = a.message.parts[0] as any;
    expect(tool.state).toBe('output-available');
    expect(tool.output).toBe('ok');
  });

  test('text deltas accumulate into a single text part', () => {
    const a = new MessageAccumulator();
    a.apply({ textDelta: 'Hello ' });
    a.apply({ textDelta: 'world' });
    expect(a.message.parts).toHaveLength(1);
    expect((a.message.parts[0] as any).text).toBe('Hello world');
  });

  test('reasoning part preserves ordering (reasoning -> text)', () => {
    const a = new MessageAccumulator();
    a.apply({ reasoningDelta: 'think…' });
    a.apply({ textDelta: 'answer' });
    expect(a.message.parts.map(p => p.type)).toEqual(['reasoning', 'text']);
  });

  test('source-url and source-document events', () => {
    const a = new MessageAccumulator();
    a.apply(parseSSE(frame({ type: 'source-url', url: 'https://x.com/a', title: 'A' }))!);
    a.apply(parseSSE(frame({ type: 'source-document', title: 'Doc' }))!);
    expect(a.message.parts.map(p => p.type)).toEqual(['source-url', 'source-document']);
  });

  test('[DONE] + finalize flips streaming -> done', () => {
    const a = new MessageAccumulator();
    a.apply({ textDelta: 'hi' });
    expect(parseSSE('[DONE]')).toEqual({ done: true });
    const m = finalizeMessage(a.message);
    expect((m.parts[0] as any).state).toBe('done');
  });

  test('fragment without valid JSON stays input-streaming, ends as partial', () => {
    const a = new MessageAccumulator();
    a.apply(parseSSE(frame({ type: 'tool_call', tool_call_id: 't3', tool_name: 'edit', arguments: '{"path":"sr' }))!);
    const tool = a.message.parts[0] as any;
    expect(tool.state).toBe('input-available');
    expect(tool.input).toEqual({ _partial: '{"path":"sr' });
  });
});
