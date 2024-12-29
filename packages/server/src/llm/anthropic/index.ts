import { promisify } from 'node:util';

import Anthropic from '@anthropic-ai/sdk';

type StreamEvent = Anthropic.Messages.RawMessageStreamEvent;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function streamResponse(
  messages: { role: string; content: string }[],
  onEvent: (event: StreamEvent) => Promise<void>,
) {
  const anthropicMessages: Anthropic.MessageParam[] = messages.map((msg) => ({
    role: msg.role as Anthropic.MessageParam['role'],
    content: msg.content,
  }));

  await requestStream(anthropicMessages, [], (event) => {
    onEvent(event);
  });
}

async function requestStreamCallback(
  messages: Anthropic.MessageParam[],
  tools: Anthropic.Messages.Tool[],
  onEvent: (event: Anthropic.MessageStreamEvent) => void,
  onFinish: (err: Error | null, value: Anthropic.Message) => void,
) {
  const response = anthropic.messages.stream({
    model: 'claude-3-5-sonnet-latest',
    max_tokens: 1024,
    messages,
    tools,
  });
  response.on('streamEvent', onEvent);
  // Resolve when the message is received
  response.on('message', (message) => onFinish(null, message));
}

const requestStream = promisify(requestStreamCallback);

export { streamResponse };
export type { StreamEvent };
