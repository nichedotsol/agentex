# AgentEX Skill Packages

Ready-to-install skill configurations and SDKs for popular agent frameworks.

## Quick Install (Recommended)

Install the AgentEX skill with a single npm command:

```bash
npm install -g @agentex/skill
agentex-install
```

This will guide you through installing the skill for Claude, GPT, or OpenClaw.

See [@agentex/skill README](agentex-skill/README.md) for details.

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

### 3. OpenClaw Skill Configuration

**File:** `openclaw-skill.json`

Install this skill in OpenClaw to enable agent building capabilities.

**Installation:**
1. Copy `openclaw-skill.json` to your OpenClaw skills directory
2. Or import via OpenClaw UI (Settings → Skills → Import)
3. The skill will be available as `agentex_builder`

**Usage:**
```python
# Validate agent requirements
validation = agentex_builder.validate(
    name="My Agent",
    description="Does something cool",
    brain="openclaw",
    tools=["tool-openai-api"]
)

# Generate agent code
result = agentex_builder.generate(
    name="My Agent",
    description="Does something cool",
    brain="openclaw",
    tools=["tool-openai-api"],
    runtime="vercel"
)
```

See [openclaw-install.md](openclaw-install.md) for complete installation and usage guide.

**Installation:**
1. Copy `gpt-function.json`
2. Add to your GPT assistant's function definitions
3. Call the `agentex_builder` function when needed

**Usage:**
```
Build me an agent that sends emails. Use the agentex_builder function with action="generate".
```

### 4. Python SDK

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

### 5. TypeScript SDK

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
