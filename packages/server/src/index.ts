import { Hono } from 'hono';
import { cors } from 'hono/cors';

import llm, {
  type AnthropicStreamEvent,
  type Route as LlmRoute,
} from './llm/index.js';

const app = new Hono();

app.use(cors());

const route = app
  .get('/', (c) => {
    return c.text('Hello Hono!');
  })
  .route('/llm', llm as LlmRoute);

type App = typeof route;

export default app;
export type { AnthropicStreamEvent, App };
