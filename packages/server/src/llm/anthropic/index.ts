import { promisify } from 'node:util';

import Anthropic, { type AnthropicError } from '@anthropic-ai/sdk';
import { AnthropicChatAdapter, MultiClient } from '@smithery/sdk';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

import {
  nameToId as toolNameToId,
  getTools,
  type ToolId,
} from '@/llm/tools.js';
import type { ModelId, Provider } from '@/llm/providers.js';

type StreamEvent =
  | Anthropic.Messages.RawMessageStreamEvent
  | Anthropic.ErrorResponse
  | {
      type: 'tool_result';
      toolUseId: string;
      result: string;
    };

const anthropic = new Anthropic({
  apiKey: '',
});

const client = new MultiClient();

async function reconnect() {
  const clients: Record<string, StdioClientTransport> = {};
  const tools = getTools();
  for (const tool of tools) {
    if (!tool.enabled) {
      continue;
    }
    const args = tool.args
      ? [tool.package.name, ...tool.args]
      : [tool.package.name];
    const command =
      tool.package.registry === 'npm'
        ? 'bunx'
        : tool.package.registry === 'pypi'
          ? 'uvx'
          : '';
    console.log(command, args, tool.env);
    const client = new StdioClientTransport({
      command,
      args,
      env: {
        ...tool.env,
        PATH: process.env.PATH || '',
      },
    });
    clients[tool.id] = client;
  }
  await client.connectAll(clients);
}

async function getProvider(): Promise<Provider> {
  return {
    id: 'anthropic',
    name: 'Anthropic',
    iconUrl: 'https://anthropic.com/favicon.ico',
    apiKey: '',
    models: [
      {
        id: 'claude-3-5-sonnet-latest',
        name: 'Claude 3.5 Sonnet',
        description: 'Smart and powerful',
      },
      {
        id: 'claude-3-5-haiku-latest',
        name: 'Claude 3.5 Haiku',
        description: 'Fast and efficient',
      },
    ],
  };
}

async function setApiKey(key: string) {
  anthropic.apiKey = key;
}

async function streamResponse(
  model: ModelId,
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
        const errorMessageTokens = errorMessage.split(' ');
        const errorCode = errorMessageTokens[0];
        if (!errorCode) {
          return;
        }
        const errorText = Number.isNaN(Number(errorCode))
          ? errorMessage
          : errorMessage.substring(errorCode.length);
        if (!errorText) {
          return;
        }
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

async function getTitle(message: string) {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-latest',
    max_tokens: 1024,
    system: 'You provide short titles for user messages.',
    messages: [
      {
        role: 'user',
        content: `
      Give a short title for the message below. Do not output anything else. Prefer 3-5 words.
      
      Message text:
      ${message}
      `,
      },
    ],
  });

  const content = response.content;
  const firstBlock = content[0];

  if (!firstBlock) {
    return '';
  }
  return firstBlock.type === 'text' ? firstBlock.text : '';
}

async function requestStreamCallback(
  model: ModelId,
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

export { streamResponse, getTitle, setApiKey, reconnect, getProvider };
export type { StreamEvent };
