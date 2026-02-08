# AgentEX

> The universal standard for building and deploying AI agents. Build agents in 90 seconds with drag-and-drop components, natural language interface, and zero API key exposure.

## Features

- 🎨 **Modern UI**: Glass morphism design with kinetic typography
- 🗣️ **Natural Language**: Describe what you want to build in plain English
- 🔒 **Secure**: API keys managed server-side via proxy (never exposed)
- 🔄 **Recursive**: Agents can build other agents (meta-agent creation)
- 📦 **Portable**: Export to real, deployable code (TypeScript/Next.js or Python/FastAPI)
- 🚀 **Deploy Anywhere**: Vercel, Docker, or download locally

## Quick Start

1. **Build an Agent**: Visit the [builder](https://agentexs.vercel.app/builder)
2. **Use Natural Language**: Type "Add Claude brain with web search and deploy to Vercel"
3. **Export & Deploy**: Download code or deploy directly

## For AI Agents (OpenClaw, Clawd, Claude, GPT-4)

AgentEX can be installed as a skill/tool that allows agents to build other agents.

### Installation

Add AgentEX to your agent's tool list:

```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "agentex_build_agent",
        "description": "Build a new AI agent using AgentEX",
        "parameters": {
          "type": "object",
          "properties": {
            "description": {
              "type": "string",
              "description": "What the agent should do"
            },
            "name": {
              "type": "string",
              "description": "Agent name"
            },
            "brain": {
              "type": "string",
              "enum": ["claude", "gpt-4", "llama", "openclaw"]
            },
            "tools": {
              "type": "array",
              "items": { "type": "string" }
            },
            "runtime": {
              "type": "string",
              "enum": ["vercel", "docker"]
            }
          },
          "required": ["description", "name"]
        }
      }
    }
  ]
}
```

### API Endpoint

**POST** `https://agentexs.vercel.app/api/agentex/build`

```json
{
  "description": "A customer support agent with web search",
  "name": "SupportAgent",
  "brain": "claude",
  "tools": ["web-search"],
  "runtime": "vercel"
}
```

### Full Documentation

See [AGENT_SKILL_INSTALLATION.md](./docs/AGENT_SKILL_INSTALLATION.md) for complete installation and usage instructions.

## Architecture

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Code Generation**: TypeScript/Next.js and Python/FastAPI templates
- **API Proxy**: Secure backend proxy for API keys
- **Component Registry**: JSON-based component definitions

## Project Structure

```
agentex/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── lib/
│   │   ├── stores/      # Zustand state management
│   │   └── utils/        # Code generation, parsing
│   └── hooks/            # Custom React hooks
├── public/
│   └── components/       # Component JSON definitions
├── docs/                 # Documentation
└── templates/            # Code generation templates
```

## Development

```bash
npm install
npm run dev
```

## License

MIT

---

**AgentEX** - Build AI agents in 90 seconds. No API keys required.
