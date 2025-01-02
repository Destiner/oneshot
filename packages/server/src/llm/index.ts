import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';

import {
  type StreamEvent as AnthropicStreamEvent,
  streamResponse,
  getTitle,
  reconnect,
} from './anthropic/index.js';
import {
  type ToolId,
  getTools,
  enableTool,
  disableTool,
  setToolArgs,
  setToolEnv,
} from './tools.js';

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
  })
  .put('/tool/:id/enable', async (c) => {
    const { id } = c.req.param();
    enableTool(id as ToolId);
    await reconnect();
    return c.json({ id });
  })
  .put('/tool/:id/disable', async (c) => {
    const { id } = c.req.param();
    disableTool(id as ToolId);
    await reconnect();
    return c.json({ id });
  })
  .put('/tool/:id/args', async (c) => {
    const { id } = c.req.param();
    const { args } = await c.req.json();
    setToolArgs(id as ToolId, args);
    await reconnect();
    return c.json({ id });
  })
  .put('/tool/:id/env', async (c) => {
    const { id } = c.req.param();
    const { env } = await c.req.json();
    setToolEnv(id as ToolId, env);
    await reconnect();
    return c.json({ id });
  });

type Route = typeof route;

export default llm;
export type { AnthropicStreamEvent, Route };
