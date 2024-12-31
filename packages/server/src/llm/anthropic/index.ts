import { promisify } from 'node:util';

import Anthropic, { type AnthropicError } from '@anthropic-ai/sdk';
import { AnthropicChatAdapter, MultiClient } from '@smithery/sdk';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

import {
  nameToId as toolNameToId,
  TOOLS,
  type Tool,
  type ToolId,
} from '@/llm/tools.js';

type Model = 'claude-3-5-sonnet-latest' | 'claude-3-5-haiku-latest';

type StreamEvent =
  | Anthropic.Messages.RawMessageStreamEvent
  | Anthropic.ErrorResponse
  | {
      type: 'tool_result';
      toolUseId: string;
      result: string;
    };

const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const exaApiKey = process.env.EXA_API_KEY;
const linearApiKey = process.env.LINEAR_API_KEY;
const e2bApiKey = process.env.E2B_API_KEY;

if (!anthropicApiKey) {
  throw new Error('ANTHROPIC_API_KEY is not set');
}
if (!exaApiKey) {
  throw new Error('EXA_API_KEY is not set');
}
if (!linearApiKey) {
  throw new Error('LINEAR_API_KEY is not set');
}
if (!e2bApiKey) {
  throw new Error('E2B_API_KEY is not set');
}

const anthropic = new Anthropic({
  apiKey: anthropicApiKey,
});

const exa = new StdioClientTransport({
  command: 'bunx',
  args: ['exa-mcp-server'],
  env: {
    EXA_API_KEY: exaApiKey,
    PATH: process.env.PATH as string,
  },
});
const fileSystem = new StdioClientTransport({
  command: 'bunx',
  args: [
    '@modelcontextprotocol/server-filesystem',
    '/Users/destiner/Desktop',
    '/Users/destiner/Downloads',
  ],
});
const sequentialThinking = new StdioClientTransport({
  command: 'bunx',
  args: ['@modelcontextprotocol/server-sequential-thinking'],
});
const linear = new StdioClientTransport({
  command: 'bunx',
  args: ['mcp-linear'],
  env: {
    LINEAR_API_KEY: linearApiKey,
    PATH: process.env.PATH as string,
  },
});
const e2b = new StdioClientTransport({
  command: 'bunx',
  args: ['@e2b/mcp-server'],
  env: {
    E2B_API_KEY: e2bApiKey,
    PATH: process.env.PATH as string,
  },
});

const client = new MultiClient();
async function init() {
  await client.connectAll({
    exa,
    fileSystem,
    sequentialThinking,
    linear,
    e2b,
  });
}

async function streamResponse(
  model: Model,
  messages: Anthropic.MessageParam[],
  tools: ToolId[],
  onEvent: (event: StreamEvent) => Promise<void>,
) {
  const anthropicMessages: Anthropic.MessageParam[] = messages.map((msg) => ({
    role: msg.role as Anthropic.MessageParam['role'],
    content: msg.content,
  }));

  const adapter = new AnthropicChatAdapter(client);
  const availableTools = await adapter.listTools();
  const toolsToUse = availableTools.filter((tool) =>
    tools.some((selectedTool) => selectedTool === toolNameToId(tool.name)),
  );

  let isDone = false;
  while (!isDone) {
    const newMessage = await requestStream(
      model,
      anthropicMessages,
      toolsToUse,
      (event) => {
        onEvent(event);
      },
      (e) => {
        const errorMessage = e.message;
        const errorCode = errorMessage.split(' ')[0];
        if (!errorCode) {
          return;
        }
        const errorText = errorMessage.substring(errorCode.length);
        const error = JSON.parse(errorText) as Anthropic.ErrorResponse;
        onEvent(error);
      },
    );
    anthropicMessages.push({
      role: newMessage.role,
      content: newMessage.content,
    });

    const toolMessages = await adapter.callTool(newMessage);
    anthropicMessages.push(...toolMessages);
    for (const toolMessage of toolMessages) {
      if (typeof toolMessage.content === 'string') {
        continue;
      }
      const toolResultContent = toolMessage.content.find(
        (content) => content.type === 'tool_result',
      );
      if (!toolResultContent) {
        continue;
      }
      const result =
        typeof toolResultContent.content === 'string'
          ? toolResultContent.content
          : (toolResultContent.content || [])
              .filter((content) => content.type === 'text')
              .map((content) => content.text)
              .join('\n');
      onEvent({
        type: 'tool_result',
        toolUseId: toolResultContent.tool_use_id,
        result,
      });
    }

    isDone = toolMessages.length === 0;
  }
}

async function getTitle(messages: Anthropic.MessageParam[]) {
  const anthropicMessages: Anthropic.MessageParam[] = messages.map((msg) => ({
    role: msg.role as Anthropic.MessageParam['role'],
    content: msg.content,
  }));

  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-latest',
    max_tokens: 1024,
    system: `
Give a short title for the chat below. Do not output anything else. Prefer 3-5 words. Don't paraphrase the words in the chat unless absolutely necessary. 
      
Some examples:
      
1. User: "How do I prepare a traditional Italian carbonara from scratch?"
Expected title: "Carbonara Recipe" or "Italian Cooking"

2. User: "What are the main differences between Python and JavaScript?"
Expected title: "Python vs JavaScript" or "Programming Language Comparison"

3. User: "My cat has been sleeping more than usual lately. Should I be worried?"
Expected title: "Cat Health Concerns" or "Pet Behavior"

4. User: "Can you help me understand quantum entanglement in simple terms?"
Expected title: "Quantum Physics Basics" or "Understanding Entanglement"

5. User: "I need tips for negotiating a salary for my first job."
Expected title: "Salary Negotiation" or "Career Advice"

6. User: "What's causing the current conflict between Country A and Country B?"
Expected title: "Geopolitical Conflict Analysis" or "International Relations"

7. User: "How can I improve my landscape photography skills?"
Expected title: "Photography Tips" or "Landscape Photo Guide"

8. User: "What are some exercises I can do at home without any equipment?"
Expected title: "Home Workout" or "No-Equipment Exercise"`,
    messages: anthropicMessages,
  });

  const content = response.content;
  const firstBlock = content[0];

  if (!firstBlock) {
    return '';
  }
  return firstBlock.type === 'text' ? firstBlock.text : '';
}

async function getTools(): Promise<Tool[]> {
  return TOOLS;
}

async function requestStreamCallback(
  model: Model,
  messages: Anthropic.MessageParam[],
  tools: Anthropic.Messages.Tool[],
  onEvent: (event: Anthropic.MessageStreamEvent) => void,
  onError: (err: AnthropicError) => void,
  onFinish: (err: Error | null, value: Anthropic.Message) => void,
) {
  const response = anthropic.messages.stream({
    model,
    max_tokens: 1024,
    messages,
    tools,
  });
  response.on('streamEvent', onEvent);
  response.on('error', (e) => {
    onError(e);
  });
  // Resolve when the message is received
  response.on('message', (message) => onFinish(null, message));
}

const requestStream = promisify(requestStreamCallback);

init();

export { streamResponse, getTitle, getTools };
export type { StreamEvent };
