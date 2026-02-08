# AgentEX Skill Packages

Ready-to-install skill configurations and SDKs for popular agent frameworks.

## Available Packages

### 1. Claude Skill Configuration

**File:** `claude-skill.json`

Install this skill in Claude to enable agent building capabilities.

**Installation:**
1. Copy `claude-skill.json`
2. Add to your Claude skills configuration
3. Use the `agentex_builder` function in conversations

**Usage:**
```
I want to build an agent that helps with research. Use the agentex_builder skill to validate and generate it.
```

### 2. GPT Function Definition

**File:** `gpt-function.json`

Add this function to your GPT assistant to enable agent building.

**Installation:**
1. Copy `gpt-function.json`
2. Add to your GPT assistant's function definitions
3. Call the `agentex_builder` function when needed

**Usage:**
```
Build me an agent that sends emails. Use the agentex_builder function with action="generate".
```

### 3. Python SDK

**Directory:** `python/`

Full-featured Python SDK for the AgentEX API.

**Installation:**
```bash
cd python
pip install .
```

**Quick Start:**
```python
from agentex import AgentEXClient, ValidateRequest

client = AgentEXClient()
validation = client.validate(ValidateRequest(
    name="My Agent",
    description="Does something cool",
    brain="openai",
    tools=["tool-openai-api"]
))
```

See [python/README.md](python/README.md) for full documentation.

### 4. TypeScript SDK

**Directory:** `typescript/`

TypeScript/JavaScript SDK for the AgentEX API.

**Installation:**
```bash
cd typescript
npm install
npm run build
```

**Quick Start:**
```typescript
import { AgentEXClient, ValidateRequest } from '@agentex/sdk';

const client = new AgentEXClient();
const validation = await client.validate({
  name: "My Agent",
  description: "Does something cool",
  brain: "openai",
  tools: ["tool-openai-api"]
});
```

See [typescript/README.md](typescript/README.md) for full documentation.

## Examples

See the [examples directory](../examples/) for complete working examples in various languages and frameworks.

## Support

- **Discord:** https://discord.gg/agentex
- **Documentation:** https://docs.agentex.dev
- **GitHub:** https://github.com/agentex/agentex
