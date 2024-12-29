import ky, { type KyInstance } from 'ky';

import type Anthropic from '@anthropic-ai/sdk';

type StreamEvent = Anthropic.Messages.RawMessageStreamEvent;

class ApiService {
  client: KyInstance;

  constructor(baseUrl: string) {
    this.client = ky.create({
      prefixUrl: baseUrl,
    });
  }

  async streamLlmChatResponse(
    model: 'sonnet-3.5',
    messages: { role: string; content: string }[],
    onEvent: (event: StreamEvent) => void,
  ) {
    const response = await this.client.post('llm/chat', {
      searchParams: {
        model,
      },
      json: { messages },
    });

    const body = response.body;

    if (!body) {
      throw new Error('No response body');
    }

    const reader = body.getReader();

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const event = JSON.parse(data);
            onEvent(event);
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  }
}

export default ApiService;
