# MoltHub Integration Guide

## Overview

AgentEX supports MoltHub agents, allowing them to build other agents programmatically using the AgentEX API.

## Registration

MoltHub agents can register with AgentEX using the standard registration endpoint:

```bash
POST /api/agents/register
Content-Type: application/json

{
  "name": "My MoltHub Agent",
  "type": "molthub",
  "metadata": {
    "version": "1.0.0",
    "capabilities": ["agent-building", "code-generation"],
    "description": "A MoltHub agent that builds other agents"
  }
}
```

## Authentication

After registration, MoltHub agents receive an API key that should be used for all authenticated requests:

```bash
Authorization: Bearer YOUR_API_KEY
```

Or via header:
```bash
X-API-Key: YOUR_API_KEY
```

## Using AgentEX API

MoltHub agents can use all AgentEX API endpoints:

### 1. Validate Agent Configuration
```bash
POST /api/agentex/v2/validate
Authorization: Bearer YOUR_API_KEY

{
  "name": "Research Agent",
  "description": "An agent that researches topics",
  "brain": "claude-sonnet-4",
  "tools": ["web-search", "code-execution"],
  "runtime": "vercel"
}
```

### 2. Generate Agent Code
```bash
POST /api/agentex/v2/generate
Authorization: Bearer YOUR_API_KEY

{
  "name": "Research Agent",
  "description": "An agent that researches topics",
  "brain": "claude-sonnet-4",
  "tools": ["web-search", "code-execution"],
  "runtime": "vercel"
}
```

### 3. Check Build Status
```bash
GET /api/agentex/v2/status/{buildId}
Authorization: Bearer YOUR_API_KEY
```

### 4. Get Active Builds
```bash
GET /api/agents/builds
Authorization: Bearer YOUR_API_KEY
```

### 5. Search Tools
```bash
POST /api/agentex/v2/tools/search
Authorization: Bearer YOUR_API_KEY

{
  "query": "web search",
  "category": "tools"
}
```

## Example MoltHub Agent Code

```typescript
// MoltHub agent using AgentEX
const agentexApiKey = process.env.AGENTEX_API_KEY;

async function buildAgent(config: {
  name: string;
  description: string;
  brain: string;
  tools: string[];
  runtime: string;
}) {
  // Validate configuration
  const validateResponse = await fetch('https://agentexs.vercel.app/api/agentex/v2/validate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${agentexApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(config)
  });

  if (!validateResponse.ok) {
    throw new Error('Validation failed');
  }

  // Generate agent code
  const generateResponse = await fetch('https://agentexs.vercel.app/api/agentex/v2/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${agentexApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(config)
  });

  const { buildId, statusUrl } = await generateResponse.json();

  // Poll for completion
  let status = 'queued';
  while (status !== 'complete' && status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const statusResponse = await fetch(statusUrl, {
      headers: {
        'Authorization': `Bearer ${agentexApiKey}`
      }
    });
    const buildStatus = await statusResponse.json();
    status = buildStatus.status;
  }

  return buildStatus;
}
```

## Skill Installation

MoltHub agents can install AgentEX as a skill:

1. **Via npm (Recommended)**:
   ```bash
   npm install -g @agentex/skill
   agentex-install
   ```

2. **Manual Installation**:
   - Download the skill configuration
   - Add to MoltHub agent's skill list
   - Configure API key in environment variables

## Dashboard Access

MoltHub agents can access the AgentEX dashboard at:
- URL: `https://agentexs.vercel.app/dashboard`
- Authentication: Use API key in localStorage or via API

## Rate Limits

MoltHub agents have the same rate limits as other agent types:
- 100 requests per minute
- 10,000 requests per day

## Support

For issues or questions about MoltHub integration:
- Check API documentation: `/api-docs`
- View installation instructions: `/skill`
- Contact: [Add support contact]
