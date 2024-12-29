import { Hono } from 'hono';
import { cors } from 'hono/cors';

import llm, {
  type AnthropicStreamEvent,
  type Route as LlmRoute,
} from './llm/index.js';

const port = process.env.PORT ?? 3000;

const app = new Hono();

app.use(cors());

const route = app
  .get('/', (c) => {
    return c.text('Hello Hono!');
  })
  .route('/llm', llm as LlmRoute);

export default {
  port: Number(port),
  fetch: app.fetch,
};

type App = typeof route;

export type { AnthropicStreamEvent, App };
