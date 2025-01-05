# oneshot

Anthropic's MCP client for macOS.

> [!WARNING]
> This is an early prototype. Expect the chat history and the tool configuration to be lost with future updates.

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
> You also need `bun` and Python's `uv` installed locally. Later versions of the app will bundle those dependencies.

To run:

1. Run the API server:

```bash
bun run server:dev
```

2. Run the UI:

```bash
bun run app:dev
```

This project was created using `bun init` in bun v1.1.34. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
