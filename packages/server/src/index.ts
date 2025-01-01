import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { cors } from 'hono/cors';

import llm, {
  type AnthropicStreamEvent,
  type Route as LlmRoute,
} from './llm/index.js';
import { getPort } from './utils/index.js';

const port = getPort();

const app = new Hono();

app.use(cors());
app.use('/static/*', serveStatic({ root: './' }));

const route = app
  .get('/', (c) => {
    return c.text('Hello Hono!');
  })
  .route('/llm', llm as LlmRoute);

export default {
  port: Number(port),
  fetch: app.fetch,
  idleTimeout: 60,
};

type App = typeof route;

export type { AnthropicStreamEvent, App };
