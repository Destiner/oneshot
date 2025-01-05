# oneshot

Anthropic's MCP client for macOS.

> [!WARNING]
> This is an early prototype. Expect the chat history and the tool configuration to be lost with future updates.

<img width="990" alt="Screenshot 2025-01-05 at 15 01 14" src="https://github.com/user-attachments/assets/299840b7-e3c5-484d-8178-c13889a01df8" />


## Features

- Bring your own API key
- Built-in tool discovery
- One-click tool installation

## Set up

To install dependencies:

```bash
bun install
```

> [!NOTE]
> You also need `bun` and Python's `uv` installed locally. Later versions of the app will bundle those dependencies automatically.

To run:

1. Run the API server:

```bash
bun run server:dev
```

2. Run the UI:

```bash
bun run app:dev
```
