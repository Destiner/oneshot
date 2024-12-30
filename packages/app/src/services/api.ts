import ky, { type KyInstance } from 'ky';

import type Anthropic from '@anthropic-ai/sdk';

type StreamEvent =
  | Anthropic.Messages.RawMessageStreamEvent
  | {
      type: 'tool_result';
      toolUseId: string;
      result: string;
    };

const TOOL_EXA = 'exa';
const TOOL_SEQUENTIAL_THINKING = 'sequentialThinking';
const TOOL_FILE_SYSTEM = 'fileSystem';
const TOOL_LINEAR = 'linear';
const TOOL_E2B = 'e2b';

type ToolId =
  | typeof TOOL_EXA
  | typeof TOOL_SEQUENTIAL_THINKING
  | typeof TOOL_FILE_SYSTEM
  | typeof TOOL_LINEAR
  | typeof TOOL_E2B;

interface Command {
  description: string;
  actionDescription: {
    progress: string;
    done: string;
  };
}

interface Tool {
  id: ToolId;
  name: string;
  iconUrl: string;
  commands: Record<string, Command>;
}

class ApiService {
  client: KyInstance;

  constructor(baseUrl: string) {
    this.client = ky.create({
      prefixUrl: baseUrl,
    });
  }

  async streamLlmChatResponse(
    model: 'sonnet-3.5',
    messages: Anthropic.MessageParam[],
    tools: ToolId[],
    onEvent: (event: StreamEvent) => void,
  ) {
    const response = await this.client.post('llm/chat', {
      searchParams: {
        model,
      },
      json: { messages, tools },
    });

    const body = response.body;

    if (!body) {
      throw new Error('No response body');
    }

    const reader = body.getReader();

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const event = JSON.parse(data);
            onEvent(event);
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  }

  async getTools() {
    const response = await this.client.get('llm/tools');
    return response.json<Tool[]>();
  }
}

export default ApiService;
export type { Tool, ToolId };
