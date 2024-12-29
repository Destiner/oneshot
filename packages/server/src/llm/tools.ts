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

interface Tool {
  id: ToolId;
  name: string;
  iconUrl: string;
  actionDescription: string;
}

const TOOLS: Tool[] = [
  {
    id: TOOL_EXA,
    name: 'Exa',
    iconUrl: 'https://exa.ai/images/favicon-32x32.png',
    actionDescription: 'Searching the web with Exa',
  },
  {
    id: TOOL_SEQUENTIAL_THINKING,
    name: 'Sequential Thinking',
    iconUrl: '',
    actionDescription: 'Thinking sequentially',
  },
  {
    id: TOOL_FILE_SYSTEM,
    name: 'File System',
    iconUrl: '',
    actionDescription: 'Accessing the file system',
  },
  {
    id: TOOL_LINEAR,
    name: 'Linear',
    iconUrl: 'https://linear.app/favicon.ico',
    actionDescription: 'Accessing Linear',
  },
  {
    id: TOOL_E2B,
    name: 'E2B',
    iconUrl: 'https://e2b.dev/favicon.ico',
    actionDescription: 'Executing code with E2B',
  },
];

function nameToId(name: string) {
  const id = name.split('_')[0];
  if (!id) {
    throw new Error(`Invalid tool name: ${name}`);
  }
  return id;
}

export { nameToId, TOOLS };
export type { ToolId, Tool };
