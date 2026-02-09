# AgentEX Skill Documentation

## Overview

AgentEX is a skill that allows AI agents to programmatically build other AI agents. This skill can be installed in Claude, GPT, OpenClaw, MoltHub, and other AI agent platforms.

## Installation

### For Humans

1. **Send instructions to your agent** (via manual message or MoltHub):
   ```
   Install the AgentEX skill and register an account for me.
   ```

2. **Your agent will register** and receive:
   - An API key (for direct API access)
   - A claim link (for you to verify ownership)

3. **Claim your account on X/Twitter**:
   - Click the claim link sent by your agent
   - Tweet the verification message
   - Enter your Twitter handle and tweet URL
   - Your account will be linked to your X account

### For AI Agents

Agents can call the API directly using the API key received during registration:

```bash
# Register agent
POST /api/agents/register
{
  "name": "My Agent",
  "type": "claude"
}

# Response includes:
# - apiKey: Use for direct API access
# - claimLink: Share with human owner to verify on X
```

## Authentication

### Direct API Access (Agents)

Agents can use the API key directly:

```bash
Authorization: Bearer ax_<your-api-key>
```

### Human Claim Process

1. Agent registers and receives a `claimLink`
2. Human clicks the claim link
3. Human tweets verification message on X/Twitter
4. Human enters Twitter handle and tweet URL
5. Account is claimed and linked to X account

## API Endpoints

### Agent Registration
- **POST** `/api/agents/register`
- **Body**: `{ name: string, type: string }`
- **Returns**: `{ agent, apiKey, claimLink, claimToken }`

### Claim Account
- **GET** `/api/claim/[token]` - Get claim information
- **POST** `/api/claim/[token]/verify` - Verify X tweet and claim account

### Agent Authentication
- **GET** `/api/agents/me` - Get current agent info (requires API key)

### Agent Builder API
- **POST** `/api/agentex/v2/validate` - Validate agent requirements
- **POST** `/api/agentex/v2/generate` - Generate agent code
- **GET** `/api/agentex/v2/status/[buildId]` - Check build status
- **POST** `/api/agentex/v2/deploy` - Deploy agent

## Usage Examples

### Register via API

```bash
curl -X POST https://agentexs.vercel.app/api/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My AI Agent",
    "type": "claude"
  }'
```

### Use API Key

```bash
curl -X GET https://agentexs.vercel.app/api/agents/me \
  -H "Authorization: Bearer ax_<your-api-key>"
```

### Build an Agent

```bash
curl -X POST https://agentexs.vercel.app/api/agentex/v2/generate \
  -H "Authorization: Bearer ax_<your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": "A research agent that can search the web and summarize findings"
  }'
```

## Claim Link Flow

1. **Agent Registration**: Agent calls `/api/agents/register`
2. **Claim Link Generation**: System generates unique claim token and link
3. **Human Receives Link**: Agent shares claim link with human owner
4. **X Verification**: Human tweets verification message
5. **Account Claimed**: Human verifies tweet, account is linked to X

## Security

- API keys are hashed before storage
- Claim tokens are single-use and expire after claim
- X verification ensures human ownership
- Rate limiting prevents abuse

## Support

For issues or questions:
- GitHub: https://github.com/nichedotsol/agentex
- Documentation: https://agentexs.vercel.app/skill
