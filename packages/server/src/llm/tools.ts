import { getStaticPath } from '@/utils';

const TOOL_EXA = 'exa';
const TOOL_SEQUENTIAL_THINKING = 'sequentialThinking';
const TOOL_FILE_SYSTEM = 'fileSystem';
const TOOL_LINEAR = 'linear';
const TOOL_E2B = 'e2b';
const TOOL_OBSIDIAN = 'obsidian';
const TOOL_BRAVE_SEARCH = 'braveSearch';
const TOOL_YOUTUBE_TRANSCRIPT = 'youtubeTranscript';
const TOOL_GITHUB = 'github';
const TOOL_MEMORY_GRAPH = 'memoryGraph';
const TOOL_GOOGLE_MAPS = 'googleMaps';

type ToolId =
  | typeof TOOL_EXA
  | typeof TOOL_SEQUENTIAL_THINKING
  | typeof TOOL_FILE_SYSTEM
  | typeof TOOL_LINEAR
  | typeof TOOL_E2B
  | typeof TOOL_OBSIDIAN
  | typeof TOOL_BRAVE_SEARCH
  | typeof TOOL_YOUTUBE_TRANSCRIPT
  | typeof TOOL_GITHUB
  | typeof TOOL_MEMORY_GRAPH
  | typeof TOOL_GOOGLE_MAPS;

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
  package: string;
  args: string[] | null;
  env: Record<string, string>;
  enabled: boolean;
  commands: Record<string, Command>;
}

const TOOLS: Tool[] = [
  {
    id: TOOL_EXA,
    name: 'Exa',
    iconUrl: 'https://exa.ai/images/favicon-32x32.png',
    package: 'exa-mcp-server',
    args: null,
    env: {
      EXA_API_KEY: '',
    },
    enabled: true,
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
    package: '@modelcontextprotocol/server-sequential-thinking',
    args: null,
    env: {},
    enabled: true,
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
    package: '@modelcontextprotocol/server-filesystem',
    args: ['/Users/destiner/Desktop', '/Users/destiner/Downloads'],
    env: {},
    enabled: true,
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
    package: 'mcp-linear',
    args: null,
    env: {
      LINEAR_API_KEY: '',
    },
    enabled: true,
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
    package: '@e2b/mcp-server',
    args: null,
    env: {
      E2B_API_KEY: '',
    },
    enabled: true,
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
  {
    id: TOOL_OBSIDIAN,
    name: 'Obsidian',
    iconUrl: 'https://obsidian.md/favicon.ico',
    package: 'mcp-obsidian',
    args: [],
    env: {},
    enabled: false,
    commands: {
      read_notes: {
        description:
          "Read the contents of multiple notes. Each note's content is returned with its path as a reference. Failed reads for individual notes won't stop the entire operation. Reading too many at once may result in an error.",
        actionDescription: {
          progress: 'Reading notes',
          done: 'Read notes',
        },
      },
      search_notes: {
        description:
          'Searches for a note by its name. The search is case-insensitive and matches partial names. Queries can also be a valid regex. Returns paths of the notes that match the query.',
        actionDescription: {
          progress: 'Searching for notes',
          done: 'Searched for notes',
        },
      },
    },
  },
  {
    id: TOOL_BRAVE_SEARCH,
    name: 'Brave Search',
    iconUrl: 'https://brave.com/favicon.ico',
    package: '@modelcontextprotocol/server-brave-search',
    args: null,
    env: {
      BRAVE_API_KEY: '',
    },
    enabled: false,
    commands: {
      brave_web_search: {
        description:
          'Performs a web search using the Brave Search API, ideal for general queries, news, articles, and online content. Supports pagination, content filtering, and freshness controls. Maximum 20 results per request, with offset for pagination.',
        actionDescription: {
          progress: 'Searching the web',
          done: 'Searched the web',
        },
      },
      brave_local_search: {
        description:
          "Searches for local businesses and places using Brave's Local Search API. Best for queries related to physical locations, businesses, restaurants, services, etc.",
        actionDescription: {
          progress: 'Searching for local data',
          done: 'Searched for local data',
        },
      },
    },
  },
  {
    id: TOOL_YOUTUBE_TRANSCRIPT,
    name: 'YouTube Transcript',
    iconUrl: 'https://www.youtube.com/favicon.ico',
    package: '@kimtaeyoon83/mcp-server-youtube-transcript',
    args: null,
    env: {},
    enabled: false,
    commands: {
      get_transcript: {
        description: 'Extract transcript from a YouTube video URL or ID',
        actionDescription: {
          progress: 'Extracting transcript',
          done: 'Extracted transcript',
        },
      },
    },
  },
  {
    id: TOOL_GITHUB,
    name: 'GitHub',
    iconUrl: 'https://github.com/favicon.ico',
    package: '@modelcontextprotocol/server-github',
    args: null,
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: '',
    },
    enabled: false,
    commands: {
      create_or_update_file: {
        description: 'Create or update a single file in a GitHub repository',
        actionDescription: {
          progress: 'Creating a file',
          done: 'Created a file',
        },
      },
      search_repositories: {
        description: 'Search for GitHub repositories',
        actionDescription: {
          progress: 'Searching for repositories',
          done: 'Searched for repositories',
        },
      },
      create_repository: {
        description: 'Create a new GitHub repository in your account',
        actionDescription: {
          progress: 'Creating a repository',
          done: 'Created a repository',
        },
      },
      get_file_contents: {
        description:
          'Get the contents of a file or directory from a GitHub repository',
        actionDescription: {
          progress: 'Getting file contents',
          done: 'Got file contents',
        },
      },
      push_files: {
        description:
          'Push multiple files to a GitHub repository in a single commit',
        actionDescription: {
          progress: 'Pushing files',
          done: 'Pushed files',
        },
      },
      create_issue: {
        description: 'Create a new issue in a GitHub repository',
        actionDescription: {
          progress: 'Creating an issue',
          done: 'Created an issue',
        },
      },
      create_pull_request: {
        description: 'Create a new pull request in a GitHub repository',
        actionDescription: {
          progress: 'Creating a pull request',
          done: 'Created a pull request',
        },
      },
      fork_repository: {
        description:
          'Fork a GitHub repository to your account or specified organization',
        actionDescription: {
          progress: 'Forking a repository',
          done: 'Forked a repository',
        },
      },
      create_branch: {
        description: 'Create a new branch in a GitHub repository',
        actionDescription: {
          progress: 'Creating a branch',
          done: 'Created a branch',
        },
      },
      list_commits: {
        description: 'Get list of commits of a branch in a GitHub repository',
        actionDescription: {
          progress: 'Listing commits',
          done: 'Listed commits',
        },
      },
      list_issues: {
        description:
          'List issues in a GitHub repository with filtering options',
        actionDescription: {
          progress: 'Listing issues',
          done: 'Listed issues',
        },
      },
      update_issue: {
        description: 'Update an existing issue in a GitHub repository',
        actionDescription: {
          progress: 'Updating an issue',
          done: 'Updated an issue',
        },
      },
      add_issue_comment: {
        description: 'Add a comment to an existing issue',
        actionDescription: {
          progress: 'Adding a comment',
          done: 'Added a comment',
        },
      },
      search_code: {
        description: 'Search for code across GitHub repositories',
        actionDescription: {
          progress: 'Searching for code',
          done: 'Searched for code',
        },
      },
      search_issues: {
        description:
          'Search for issues and pull requests across GitHub repositories',
        actionDescription: {
          progress: 'Searching for issues',
          done: 'Searched for issues',
        },
      },
      search_users: {
        description: 'Search for users on GitHub',
        actionDescription: {
          progress: 'Searching for users',
          done: 'Searched for users',
        },
      },
      get_issue: {
        description: 'Get details of a specific issue in a GitHub repository.',
        actionDescription: {
          progress: 'Getting an issue',
          done: 'Got an issue',
        },
      },
    },
  },
  {
    id: TOOL_MEMORY_GRAPH,
    name: 'Memory Graph',
    iconUrl: getStaticPath('icons/brain.svg'),
    package: '@modelcontextprotocol/server-memory',
    args: null,
    env: {},
    enabled: false,
    commands: {
      create_entities: {
        description: 'Create multiple new entities in the knowledge graph',
        actionDescription: {
          progress: 'Creating entities',
          done: 'Created entities',
        },
      },
      create_relations: {
        description:
          'Create multiple new relations between entities in the knowledge graph. Relations should be in active voice',
        actionDescription: {
          progress: 'Creating relations',
          done: 'Created relations',
        },
      },
      add_observations: {
        description:
          'Add new observations to existing entities in the knowledge graph',
        actionDescription: {
          progress: 'Adding observations',
          done: 'Added observations',
        },
      },
      delete_entities: {
        description:
          'Delete multiple entities and their associated relations from the knowledge graph',
        actionDescription: {
          progress: 'Deleting entities',
          done: 'Deleted entities',
        },
      },
      delete_observations: {
        description:
          'Delete specific observations from entities in the knowledge graph',
        actionDescription: {
          progress: 'Deleting observations',
          done: 'Deleted observations',
        },
      },
      delete_relations: {
        description: 'Delete multiple relations from the knowledge graph',
        actionDescription: {
          progress: 'Deleting relations',
          done: 'Deleted relations',
        },
      },
      read_graph: {
        description: 'Read the entire knowledge graph',
        actionDescription: {
          progress: 'Reading graph',
          done: 'Read graph',
        },
      },
      search_nodes: {
        description: 'Search for nodes in the knowledge graph based on a query',
        actionDescription: {
          progress: 'Searching for nodes',
          done: 'Searched for nodes',
        },
      },
      open_nodes: {
        description:
          'Open specific nodes in the knowledge graph by their names',
        actionDescription: {
          progress: 'Opening nodes',
          done: 'Opened nodes',
        },
      },
    },
  },
  {
    id: TOOL_GOOGLE_MAPS,
    name: 'Google Maps',
    iconUrl:
      'https://maps.gstatic.com/mapfiles/maps_lite/pwa/icons/maps15_bnuw3a_round_192x192.png',
    package: '@modelcontextprotocol/server-google-maps',
    args: null,
    env: {
      GOOGLE_MAPS_API_KEY: '',
    },
    enabled: false,
    commands: {
      maps_geocode: {
        description: 'Convert an address into geographic coordinates',
        actionDescription: {
          progress: 'Converting address to coordinates',
          done: 'Converted address to coordinates',
        },
      },
      maps_reverse_geocode: {
        description: 'Convert coordinates into an address',
        actionDescription: {
          progress: 'Converting coordinates to address',
          done: 'Converted coordinates to address',
        },
      },
      maps_search_places: {
        description: 'Search for places using Google Places API',
        actionDescription: {
          progress: 'Searching for places',
          done: 'Searched for places',
        },
      },
      maps_place_details: {
        description: 'Get detailed information about a specific place',
        actionDescription: {
          progress: 'Getting place details',
          done: 'Got place details',
        },
      },
      maps_distance_matrix: {
        description:
          'Calculate travel distance and time for multiple origins and destinations',
        actionDescription: {
          progress: 'Calculating distance matrix',
          done: 'Calculated distance matrix',
        },
      },
      maps_elevation: {
        description: 'Get elevation data for locations on the earth',
        actionDescription: {
          progress: 'Getting elevation data',
          done: 'Got elevation data',
        },
      },
      maps_directions: {
        description: 'Get directions between two points',
        actionDescription: {
          progress: 'Getting directions',
          done: 'Got directions',
        },
      },
    },
  },
];

async function getTools(): Promise<Tool[]> {
  return TOOLS;
}

function enableTool(id: ToolId) {
  const tool = getToolById(id);
  if (!tool) {
    throw new Error(`Tool ${id} not found`);
  }
  tool.enabled = true;
}

function disableTool(id: ToolId) {
  const tool = getToolById(id);
  if (!tool) {
    throw new Error(`Tool ${id} not found`);
  }
  tool.enabled = false;
}

function setToolArgs(id: ToolId, args: string[]) {
  const tool = getToolById(id);
  if (!tool) {
    throw new Error(`Tool ${id} not found`);
  }
  tool.args = args;
}

function setToolEnv(id: ToolId, env: Record<string, string>) {
  const tool = getToolById(id);
  if (!tool) {
    throw new Error(`Tool ${id} not found`);
  }
  tool.env = env;
}

function getToolById(id: ToolId) {
  return TOOLS.find((tool) => tool.id === id);
}

function nameToId(name: string) {
  const id = name.split('_')[0];
  if (!id) {
    throw new Error(`Invalid tool name: ${name}`);
  }
  return id;
}

export { nameToId, getTools, enableTool, disableTool, setToolArgs, setToolEnv };
export type { ToolId, Tool };
