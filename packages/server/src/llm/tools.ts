import { getStaticPath } from '@/utils';

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

const TOOLS: Tool[] = [
  {
    id: TOOL_EXA,
    name: 'Exa',
    iconUrl: 'https://exa.ai/images/favicon-32x32.png',
    commands: {
      search: {
        description: 'Search the web using Exa AI',
        actionDescription: {
          progress: 'Searching web with Exa',
          done: 'Searched web with Exa',
        },
      },
    },
  },
  {
    id: TOOL_SEQUENTIAL_THINKING,
    name: 'Sequential Thinking',
    iconUrl: getStaticPath('icons/thinking.svg'),
    commands: {
      sequentialthinking: {
        description: 'Thinking sequentially',
        actionDescription: {
          progress: 'Thinking sequentially',
          done: 'Thought sequentially',
        },
      },
    },
  },
  {
    id: TOOL_FILE_SYSTEM,
    name: 'File System',
    iconUrl: getStaticPath('icons/finder.png'),
    commands: {
      read_file: {
        description:
          'Read the complete contents of a file from the file system. Handles various text encodings and provides detailed error messages if the file cannot be read. Use this tool when you need to examine the contents of a single file. Only works within allowed directories.',
        actionDescription: {
          progress: 'Reading file contents',
          done: 'Read file contents',
        },
      },
      read_multiple_files: {
        description:
          "Read the contents of multiple files simultaneously. This is more efficient than reading files one by one when you need to analyze or compare multiple files. Each file's content is returned with its path as a reference. Failed reads for individual files won't stop the entire operation. Only works within allowed directories.",
        actionDescription: {
          progress: 'Reading multiple files',
          done: 'Read multiple files',
        },
      },
      write_file: {
        description:
          'Create a new file or completely overwrite an existing file with new content. Use with caution as it will overwrite existing files without warning. Handles text content with proper encoding. Only works within allowed directories.',
        actionDescription: {
          progress: 'Writing file contents',
          done: 'Wrote file contents',
        },
      },
      create_directory: {
        description:
          'Create a new directory or ensure a directory exists. Can create multiple nested directories in one operation. If the directory already exists, this operation will succeed silently. Perfect for setting up directory structures for projects or ensuring required paths exist. Only works within allowed directories.',
        actionDescription: {
          progress: 'Creating directory',
          done: 'Created directory',
        },
      },
      list_directory: {
        description:
          'Get a detailed listing of all files and directories in a specified path. Results clearly distinguish between files and directories with [FILE] and [DIR] prefixes. This tool is essential for understanding directory structure and finding specific files within a directory. Only works within allowed directories.',
        actionDescription: {
          progress: 'Listing directory contents',
          done: 'Listed directory contents',
        },
      },
      move_file: {
        description:
          'Move or rename files and directories. Can move files between directories and rename them in a single operation. If the destination exists, the operation will fail. Works across different directories and can be used for simple renaming within the same directory. Both source and destination must be within allowed directories.',
        actionDescription: {
          progress: 'Moving file',
          done: 'Moved file',
        },
      },
      search_files: {
        description:
          "Recursively search for files and directories matching a pattern. Searches through all subdirectories from the starting path. The search is case-insensitive and matches partial names. Returns full paths to all matching items. Great for finding files when you don't know their exact location. Only searches within allowed directories.",
        actionDescription: {
          progress: 'Searching for files',
          done: 'Found matching files',
        },
      },
      get_file_info: {
        description:
          'Retrieve detailed metadata about a file or directory. Returns comprehensive information including size, creation time, last modified time, permissions, and type. This tool is perfect for understanding file characteristics without reading the actual content. Only works within allowed directories.',
        actionDescription: {
          progress: 'Getting file information',
          done: 'Got file information',
        },
      },
      list_allowed_directories: {
        description:
          'Returns the list of directories that this server is allowed to access. Use this to understand which directories are available before trying to access files.',
        actionDescription: {
          progress: 'Listing allowed directories',
          done: 'Listed allowed directories',
        },
      },
    },
  },
  {
    id: TOOL_LINEAR,
    name: 'Linear',
    iconUrl: 'https://linear.app/favicon.ico',
    commands: {
      create_issue: {
        description:
          "Creates a new Linear issue with specified details. Use this to create tickets for tasks, bugs, or feature requests. Returns the created issue's identifier and URL. Required fields are title and teamId, with optional description, priority (0-4, where 0 is no priority and 1 is urgent), and status.",
        actionDescription: {
          progress: 'Creating a new Linear issue',
          done: 'Created a new Linear issue',
        },
      },
      update_issue: {
        description:
          "Updates an existing Linear issue's properties. Use this to modify issue details like title, description, priority, or status. Requires the issue ID and accepts any combination of updatable fields. Returns the updated issue's identifier and URL.",
        actionDescription: {
          progress: 'Updating Linear issue details',
          done: 'Updated Linear issue details',
        },
      },
      search_issues: {
        description:
          'Searches Linear issues using flexible criteria. Supports filtering by any combination of: title/description text, team, status, assignee, labels, priority (1=urgent, 2=high, 3=normal, 4=low), and estimate. Returns up to 10 issues by default (configurable via limit).',
        actionDescription: {
          progress: 'Searching for Linear issues',
          done: 'Found Linear issues',
        },
      },
      get_user_issues: {
        description:
          "Retrieves issues assigned to a specific user or the authenticated user if no userId is provided. Returns issues sorted by last updated, including priority, status, and other metadata. Useful for finding a user's workload or tracking assigned tasks.",
        actionDescription: {
          progress: "Retrieving user's Linear issues",
          done: "Retrieved user's Linear issues",
        },
      },
      add_comment: {
        description:
          "Adds a comment to an existing Linear issue. Supports markdown formatting in the comment body. Can optionally specify a custom user name and avatar for the comment. Returns the created comment's details including its URL.",
        actionDescription: {
          progress: 'Adding comment to issue',
          done: 'Added comment to issue',
        },
      },
    },
  },
  {
    id: TOOL_E2B,
    name: 'E2B',
    iconUrl: 'https://e2b.dev/favicon.ico',
    commands: {
      run_code: {
        description:
          'Run python code in a secure sandbox by E2B. Using the Jupyter Notebook syntax.',
        actionDescription: {
          progress: 'Running Python code',
          done: 'Ran Python code',
        },
      },
    },
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
