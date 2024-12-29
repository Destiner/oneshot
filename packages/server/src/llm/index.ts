import { Hono } from 'hono';

import {
  streamResponse,
  getTools,
  type StreamEvent as AnthropicStreamEvent,
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
    if (model !== 'sonnet-3.5') {
      return c.text('Model is not supported', 400);
    }

    return streamSSE(c, async (stream) => {
      await streamResponse(messages, tools, async (event) => {
        await stream.writeSSE({
          data: JSON.stringify(event),
        });
      });
    });
  })
  .get('/tools', async (c) => {
    const tools = await getTools();
    return c.json(tools);
  });

type Route = typeof route;

export default llm;
export type { AnthropicStreamEvent, Route };
