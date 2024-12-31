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

async function getTools(): Promise<Tool[]> {
  return TOOLS;
}

async function requestStreamCallback(
  messages: Anthropic.MessageParam[],
  tools: Anthropic.Messages.Tool[],
  onEvent: (event: Anthropic.MessageStreamEvent) => void,
  onError: (err: AnthropicError) => void,
  onFinish: (err: Error | null, value: Anthropic.Message) => void,
) {
  const response = anthropic.messages.stream({
    model: 'claude-3-5-sonnet-latest',
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

export { streamResponse, getTools };
export type { StreamEvent };
