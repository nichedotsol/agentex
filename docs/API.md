# AgentEX Skill API Documentation

The AgentEX Skill API enables autonomous AI agents to programmatically build other agents. This API provides endpoints for validating requirements, generating code, deploying agents, and discovering available tools.

## Base URL

- **Production:** `https://agentexs.vercel.app/api/agentex/v2`
- **Local:** `http://localhost:3000/api/agentex/v2`

## Interactive Documentation

View the complete interactive API documentation with Swagger UI:
- **Web UI:** https://agentexs.vercel.app/api-docs
- **OpenAPI Spec:** https://agentexs.vercel.app/api/docs

## Quick Start

### 1. Validate Agent Requirements

Before generating an agent, validate the requirements:

```bash
curl -X POST https://agentexs.vercel.app/api/agentex/v2/validate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Research Assistant",
    "description": "An AI agent that helps with research tasks",
    "brain": "openai",
    "tools": ["tool-openai-api", "tool-resend-email"],
    "runtime": "vercel"
  }'
```

**Response:**
```json
{
  "valid": true,
  "issues": [],
  "recommendation": {
    "primary": "vercel",
    "reasoning": "Best for serverless functions",
    "cost": "Free (Hobby plan)",
    "difficulty": "easy"
  },
  "estimatedCost": {
    "total": "$0/month",
    "breakdown": []
  },
  "requiredEnv": [
    {
      "key": "OPENAI_API_KEY",
      "purpose": "OpenAI API authentication",
      "getFrom": "https://platform.openai.com/api-keys",
      "required": true
    }
  ]
}
```

### 2. Generate Agent Code

Start the code generation process:

```bash
curl -X POST https://agentexs.vercel.app/api/agentex/v2/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Research Assistant",
    "description": "An AI agent that helps with research tasks",
    "brain": "openai",
    "tools": ["tool-openai-api", "tool-resend-email"],
    "runtime": "vercel",
    "config": {
      "temperature": 0.7,
      "maxTokens": 4096
    }
  }'
```

**Response:**
```json
{
  "buildId": "build_abc123",
  "status": "queued",
  "estimatedTime": "2-3 minutes",
  "statusUrl": "/api/agentex/v2/status/build_abc123"
}
```

### 3. Check Build Status

Poll the status endpoint to track progress:

```bash
curl https://agentexs.vercel.app/api/agentex/v2/status/build_abc123
```

**Response:**
```json
{
  "buildId": "build_abc123",
  "status": "complete",
  "progress": 100,
  "result": {
    "downloadUrl": "https://agentexs.vercel.app/api/agentex/v2/download/build_abc123",
    "previewUrl": "https://agentexs.vercel.app/preview/build_abc123",
    "setupInstructionsUrl": "https://agentexs.vercel.app/setup/build_abc123"
  }
}
```

### 4. Deploy Agent

Deploy the generated agent to a hosting platform:

```bash
curl -X POST https://agentexs.vercel.app/api/agentex/v2/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "buildId": "build_abc123",
    "platform": "vercel",
    "credentials": {
      "apiKey": "your-vercel-token",
      "projectName": "research-assistant"
    }
  }'
```

### 5. Search Tools

Discover available tools:

```bash
curl -X POST https://agentexs.vercel.app/api/agentex/v2/tools/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "email",
    "category": "communication"
  }'
```

## Endpoints

### Validation

- **POST** `/validate` - Validate agent requirements and get recommendations

### Generation

- **POST** `/generate` - Start agent code generation
- **GET** `/status/{buildId}` - Check build status

### Deployment

- **POST** `/deploy` - Deploy agent to hosting platform

### Tools

- **POST** `/tools/search` - Search available tools
- **GET** `/tools/{toolId}` - Get tool details

## Authentication

Currently, the API is open and does not require authentication. In production, you may want to add API keys or OAuth.

## Rate Limits

- **Validation:** 100 requests/minute
- **Generation:** 10 requests/minute
- **Deployment:** 5 requests/minute
- **Tools:** 200 requests/minute

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Common error codes:
- `VALIDATION_ERROR` - Invalid request data
- `TOOL_NOT_FOUND` - Tool ID does not exist
- `BUILD_NOT_FOUND` - Build ID does not exist
- `GENERATION_FAILED` - Code generation failed
- `DEPLOYMENT_FAILED` - Deployment failed

## SDKs

### Python

```python
import requests

BASE_URL = "https://agentexs.vercel.app/api/agentex/v2"

def validate_agent(config):
    response = requests.post(f"{BASE_URL}/validate", json=config)
    return response.json()

def generate_agent(config):
    response = requests.post(f"{BASE_URL}/generate", json=config)
    return response.json()

def get_build_status(build_id):
    response = requests.get(f"{BASE_URL}/status/{build_id}")
    return response.json()
```

### TypeScript/JavaScript

```typescript
const BASE_URL = 'https://agentexs.vercel.app/api/agentex/v2';

async function validateAgent(config: any) {
  const response = await fetch(`${BASE_URL}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return response.json();
}

async function generateAgent(config: any) {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return response.json();
}

async function getBuildStatus(buildId: string) {
  const response = await fetch(`${BASE_URL}/status/${buildId}`);
  return response.json();
}
```

## Examples

See the [examples directory](../examples/) for complete working examples in Python, TypeScript, and other languages.

## Support

- **Discord:** https://discord.gg/agentex
- **GitHub:** https://github.com/agentex/agentex
- **Documentation:** https://docs.agentex.dev
