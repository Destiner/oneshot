import { Hono } from 'hono';

import {
  type StreamEvent as AnthropicStreamEvent,
  streamResponse,
  getTools,
  getTitle,
} from './anthropic/index.js';
import { streamSSE } from 'hono/streaming';

const llm = new Hono();

const route = llm
  .post('/chat', async (c) => {
    const { model } = c.req.query();
    const { messages, tools } = await c.req.json();

    if (!model) {
      return c.text('Model is required', 400);
    }
    if (
      model !== 'claude-3-5-sonnet-latest' &&
      model !== 'claude-3-5-haiku-latest'
    ) {
      return c.text('Model is not supported', 400);
    }

    return streamSSE(c, async (stream) => {
      await streamResponse(model, messages, tools, async (event) => {
        await stream.writeSSE({
          data: JSON.stringify(event),
        });
      });
    });
  })
  .post('/chat/title', async (c) => {
    const { messages } = await c.req.json();

    const title = await getTitle(messages);

    return c.json({ title });
  })
  .get('/tools', async (c) => {
    const tools = await getTools();
    return c.json(tools);
  });

type Route = typeof route;

export default llm;
export type { AnthropicStreamEvent, Route };
