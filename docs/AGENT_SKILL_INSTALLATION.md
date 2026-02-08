# AgentEX as an Agent Skill

This guide explains how to install and use AgentEX as a skill/tool for AI agents (OpenClaw, Clawd, Claude, GPT-4, etc.) to build other agents.

## Overview

AgentEX can be installed as a skill that allows agents to:
- Create new AI agents using natural language
- Configure agent components (brains, tools, runtimes)
- Generate and deploy agent code
- Build agents recursively (agents building agents)

## Installation

### For OpenClaw/Clawd Agents

Add AgentEX as a tool in your agent configuration:

```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "agentex_build_agent",
        "description": "Build a new AI agent using AgentEX. Describe what you want the agent to do, and AgentEX will create it.",
        "parameters": {
          "type": "object",
          "properties": {
            "description": {
              "type": "string",
              "description": "Natural language description of the agent you want to build. Example: 'A customer support agent that uses Claude Sonnet 4, web search, and deploys to Vercel'"
            },
            "name": {
              "type": "string",
              "description": "Name for the new agent"
            },
            "brain": {
              "type": "string",
              "description": "Brain/LLM to use: 'claude', 'gpt-4', 'llama', 'openclaw'",
              "enum": ["claude", "gpt-4", "llama", "openclaw"]
            },
            "tools": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "List of tools to include: 'web-search', 'code-execution', 'blockchain-query', 'token-price', 'twitter-post'"
            },
            "runtime": {
              "type": "string",
              "description": "Deployment runtime: 'vercel' or 'docker'",
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

### For Claude/GPT-4 Agents

Use the function calling format:

```typescript
const agentexTool = {
  type: "function",
  function: {
    name: "agentex_build_agent",
    description: "Build a new AI agent using AgentEX",
    parameters: {
      type: "object",
      properties: {
        description: { type: "string" },
        name: { type: "string" },
        brain: { type: "string", enum: ["claude", "gpt-4", "llama", "openclaw"] },
        tools: { type: "array", items: { type: "string" } },
        runtime: { type: "string", enum: ["vercel", "docker"] }
      },
      required: ["description", "name"]
    }
  }
}
```

## API Endpoints

### Build Agent Endpoint

**POST** `/api/agentex/build`

Creates a new agent based on natural language description.

**Request:**
```json
{
  "description": "A customer support agent that uses Claude Sonnet 4, web search, and deploys to Vercel",
  "name": "CustomerSupportAgent",
  "brain": "claude",
  "tools": ["web-search"],
  "runtime": "vercel"
}
```

**Response:**
```json
{
  "success": true,
  "build_id": "build_1234567890",
  "agent_config": {
    "name": "CustomerSupportAgent",
    "brain": { ... },
    "tools": [ ... ],
    "runtime": { ... }
  },
  "code": {
    "typescript": "...",
    "python": "..."
  },
  "deployment_url": "https://github.com/user/customer-support-agent"
}
```

### List Components Endpoint

**GET** `/api/agentex/components`

Returns available components for building agents.

**Response:**
```json
{
  "brains": [
    { "id": "brain-claude-sonnet-4", "name": "Claude Sonnet 4", ... },
    { "id": "brain-gpt-4", "name": "GPT-4", ... }
  ],
  "tools": [ ... ],
  "runtimes": [ ... ]
}
```

## Usage Examples

### Example 1: Simple Agent Creation

```python
# Agent (OpenClaw/Clawd) calling AgentEX
response = await httpx.post(
    "https://agentexs.vercel.app/api/agentex/build",
    json={
        "description": "A research assistant that uses Claude and web search",
        "name": "ResearchAssistant",
        "brain": "claude",
        "tools": ["web-search"]
    }
)

agent_config = response.json()
print(f"Created agent: {agent_config['build_id']}")
```

### Example 2: Recursive Agent Building

An agent can build another agent that can also build agents:

```python
# Agent builds an agent-builder agent
response = await httpx.post(
    "https://agentexs.vercel.app/api/agentex/build",
    json={
        "description": "An agent that can build other agents using AgentEX",
        "name": "AgentBuilderAgent",
        "brain": "openclaw",
        "tools": ["agent-builder"],  # Includes AgentEX builder tool
        "runtime": "vercel"
    }
)
```

## Integration Steps

1. **Add AgentEX endpoint to your agent's tool list**
2. **Configure your agent to call `/api/agentex/build`**
3. **Handle the response** (agent config, code, deployment URL)
4. **Optionally deploy** the generated agent automatically

## Security

- All API calls require authentication (session-based)
- API keys are managed server-side via proxy
- Rate limiting applies to prevent abuse
- Generated code uses proxy API (no exposed keys)

## Next Steps

1. Install AgentEX skill in your agent
2. Test with a simple agent build
3. Integrate into your agent's workflow
4. Enable recursive agent building

For more details, see [API_PROXY_ARCHITECTURE.md](./API_PROXY_ARCHITECTURE.md)
