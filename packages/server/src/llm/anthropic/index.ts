import { promisify } from 'node:util';

import Anthropic, { type AnthropicError } from '@anthropic-ai/sdk';
import { AnthropicChatAdapter, MultiClient } from '@smithery/sdk';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

import {
  nameToId as toolNameToId,
  getTools,
  type ToolId,
} from '@/llm/tools.js';
import type { ModelId, Model, Provider } from '@/llm/providers.js';

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
  const tools = await getTools();
  for (const tool of tools) {
    if (!tool.enabled) {
      continue;
    }
    const args = tool.args || [];
    const client = new StdioClientTransport({
      command: 'bunx',
      args: [tool.package, ...args],
      env: tool.env,
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
