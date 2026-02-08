# AgentEX Skill Installation Guide

This guide explains how to install and use the AgentEX skill in various agent frameworks.

## For Claude (Anthropic)

### Installation

1. **Copy the skill configuration:**
   ```bash
   cp packages/claude-skill.json ~/.claude/skills/agentex_builder.json
   ```

2. **Or add directly in Claude:**
   - Go to Claude settings
   - Navigate to "Skills" or "Functions"
   - Click "Add Skill"
   - Paste the contents of `packages/claude-skill.json`
   - Save as "agentex_builder"

### Usage

Once installed, you can use the skill in conversations:

```
I need to build an agent that helps with customer support. 
Can you use the agentex_builder skill to:
1. Validate the requirements (use action="validate")
2. Generate the code (use action="generate")
3. Check the status until complete (use action="status")
```

The skill will handle all API calls to AgentEX automatically.

## For GPT/OpenAI Assistants

### Installation

1. **Add function to your assistant:**
   - Go to OpenAI Platform → Assistants
   - Select your assistant
   - Go to "Functions" tab
   - Click "Add Function"
   - Paste the contents of `packages/gpt-function.json`
   - Save

### Usage

The function will be automatically available when the assistant needs to build agents:

```
User: Build me an agent that sends emails using Resend

Assistant: I'll use the agentex_builder function to create that for you.
[Function call happens automatically]
```

## For Python Agents

### Installation

```bash
pip install agentex
```

Or install from source:

```bash
cd packages/python
pip install .
```

### Usage

```python
from agentex import AgentEXClient, ValidateRequest, GenerateRequest

# Initialize client
client = AgentEXClient()

# Build an agent
def build_agent(name: str, description: str, tools: list):
    # Validate
    validate_req = ValidateRequest(
        name=name,
        description=description,
        brain="openai",
        tools=tools,
        runtime="vercel"
    )
    validation = client.validate(validate_req)
    
    if not validation.valid:
        return {"error": "Validation failed", "issues": validation.issues}
    
    # Generate
    generate_req = GenerateRequest(
        name=name,
        description=description,
        brain="openai",
        tools=tools,
        runtime="vercel"
    )
    generate_resp = client.generate(generate_req)
    
    # Wait for completion
    status = client.wait_for_completion(generate_resp.buildId)
    
    return {
        "buildId": status.buildId,
        "downloadUrl": status.result.downloadUrl,
        "status": status.status
    }

# Use in your agent
result = build_agent(
    "Email Sender",
    "Sends emails using Resend",
    ["tool-resend-email"]
)
```

## For TypeScript/JavaScript Agents

### Installation

```bash
npm install @agentex/sdk
```

Or install from source:

```bash
cd packages/typescript
npm install
npm run build
```

### Usage

```typescript
import { AgentEXClient, ValidateRequest, GenerateRequest } from '@agentex/sdk';

// Initialize client
const client = new AgentEXClient();

// Build an agent
async function buildAgent(
  name: string,
  description: string,
  tools: string[]
) {
  // Validate
  const validateReq: ValidateRequest = {
    name,
    description,
    brain: 'openai',
    tools,
    runtime: 'vercel'
  };
  const validation = await client.validate(validateReq);
  
  if (!validation.valid) {
    return { error: 'Validation failed', issues: validation.issues };
  }
  
  // Generate
  const generateReq: GenerateRequest = {
    name,
    description,
    brain: 'openai',
    tools,
    runtime: 'vercel'
  };
  const generateResp = await client.generate(generateReq);
  
  // Wait for completion
  const status = await client.waitForCompletion(generateResp.buildId);
  
  return {
    buildId: status.buildId,
    downloadUrl: status.result?.downloadUrl,
    status: status.status
  };
}

// Use in your agent
const result = await buildAgent(
  'Email Sender',
  'Sends emails using Resend',
  ['tool-resend-email']
);
```

## For OpenClaw

### Installation

1. **Copy the skill file:**
   ```bash
   cp packages/openclaw-skill.json ~/.openclaw/skills/agentex_builder.json
   ```

2. **Or import via OpenClaw UI:**
   - Open OpenClaw
   - Go to Settings → Skills
   - Click "Import Skill"
   - Select `packages/openclaw-skill.json`
   - Click "Install"

### Usage

Once installed, the skill is available as `agentex_builder`:

```python
# Validate agent requirements
validation = agentex_builder.validate(
    name="Research Assistant",
    description="Helps with research tasks",
    brain="openclaw",
    tools=["tool-openai-api", "tool-resend-email"],
    runtime="vercel"
)

if validation['valid']:
    # Generate agent code
    generate_result = agentex_builder.generate(
        name="Research Assistant",
        description="Helps with research tasks",
        brain="openclaw",
        tools=["tool-openai-api", "tool-resend-email"],
        runtime="vercel"
    )
    
    build_id = generate_result['buildId']
    
    # Wait for completion
    import time
    while True:
        status = agentex_builder.status(buildId=build_id)
        if status['status'] == 'complete':
            print(f"Download: {status['result']['downloadUrl']}")
            break
        time.sleep(5)
```

See [packages/openclaw-install.md](../packages/openclaw-install.md) for complete examples and troubleshooting.

## For Custom Agents

### Using the REST API Directly

If you're building a custom agent framework, you can use the REST API directly:

**Base URL:** `https://agentexs.vercel.app/api/agentex/v2`

**Endpoints:**
- `POST /validate` - Validate requirements
- `POST /generate` - Generate code
- `GET /status/{buildId}` - Check status
- `POST /deploy` - Deploy agent
- `POST /tools/search` - Search tools
- `GET /tools/{toolId}` - Get tool details

See [API.md](API.md) for complete API documentation.

## Examples

See the [examples directory](../examples/) for complete working examples in various languages and frameworks.

## Troubleshooting

### Skill not appearing in Claude

- Ensure the JSON file is valid
- Check that the skill is enabled in Claude settings
- Try restarting Claude

### Function not working in GPT

- Verify the function definition is correctly formatted
- Check that the assistant has function calling enabled
- Ensure the API key is set correctly

### SDK installation issues

- Make sure you have the correct Python/Node version
- Check that all dependencies are installed
- Verify network connectivity to the API

## Support

- **Discord:** https://discord.gg/agentex
- **Documentation:** https://docs.agentex.dev
- **GitHub Issues:** https://github.com/agentex/agentex/issues
