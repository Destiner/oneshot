import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';

import {
  type StreamEvent as AnthropicStreamEvent,
  streamResponse,
  getTitle,
  reconnect,
  setApiKey,
  getProvider as getAnthropicProvider,
} from './anthropic/index.js';
import {
  type ToolId,
  getTools,
  setTools,
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
    const { message } = await c.req.json();
    const title = await getTitle(message);
    return c.json({ title });
  })
  .get('/providers', async (c) => {
    const anthropic = await getAnthropicProvider();
    return c.json([anthropic]);
  })
  .put('/provider/:provider/key', async (c) => {
    const { provider } = c.req.param();
    const { key } = await c.req.json();
    if (provider !== 'anthropic') {
      return c.text('Provider is not supported', 400);
    }
    await setApiKey(key);
    return c.text('OK');
  })
  .get('/tools', async (c) => {
    const tools = getTools();
    return c.json(tools);
  })
  .put('/tools', async (c) => {
    const { tools } = await c.req.json();
    setTools(tools);
    await reconnect();
    return c.text('OK');
  })
  .put('/tool/:id/enable', async (c) => {
    const { id } = c.req.param();
    enableTool(id as ToolId);
    await reconnect();
    return c.text('OK');
  })
  .put('/tool/:id/disable', async (c) => {
    const { id } = c.req.param();
    disableTool(id as ToolId);
    await reconnect();
    return c.text('OK');
  })
  .put('/tool/:id/args', async (c) => {
    const { id } = c.req.param();
    const { args } = await c.req.json();
    setToolArgs(id as ToolId, args);
    await reconnect();
    return c.text('OK');
  })
  .put('/tool/:id/env', async (c) => {
    const { id } = c.req.param();
    const { env } = await c.req.json();
    setToolEnv(id as ToolId, env);
    await reconnect();
    return c.text('OK');
  });

type Route = typeof route;

export default llm;
export type { AnthropicStreamEvent, Route };
