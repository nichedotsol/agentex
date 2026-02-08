# @agentex/skill

Install AgentEX as a skill for Claude, GPT, OpenClaw, and other AI agents with a single npm command.

## Installation

```bash
npm install -g @agentex/skill
```

Or install locally:

```bash
npm install @agentex/skill
```

## Quick Start

After installation, run:

```bash
agentex-install
```

This will guide you through installing the skill for your preferred platform.

## Manual Installation

### Claude

```bash
npm run install-claude
```

Or manually copy `claude-skill.json` to your Claude skills directory.

### GPT/OpenAI

```bash
npm run install-gpt
```

Or manually add `gpt-function.json` to your GPT assistant's function definitions.

### OpenClaw

```bash
npm run install-openclaw
```

Or manually copy `openclaw-skill.json` to `~/.openclaw/skills/agentex_builder.json`

## Skill Files

After installation, you'll find the skill files in:

- `node_modules/@agentex/skill/claude-skill.json`
- `node_modules/@agentex/skill/gpt-function.json`
- `node_modules/@agentex/skill/openclaw-skill.json`

## Usage

Once installed, the skill is available as `agentex_builder` in your agent framework.

### Example (Claude)

```
I want to build a research agent. Use the agentex_builder skill to validate and generate it with OpenAI API and web search tools.
```

### Example (Python/OpenClaw)

```python
import agentex_builder

# Validate agent requirements
validation = agentex_builder.validate(
    name="Research Assistant",
    description="Helps with research",
    brain="openclaw",
    tools=["tool-openai-api", "tool-web-search"]
)

# Generate agent code
result = agentex_builder.generate(
    name="Research Assistant",
    description="Helps with research",
    brain="openclaw",
    tools=["tool-openai-api", "tool-web-search"],
    runtime="vercel"
)
```

## API Reference

The skill uses the AgentEX API at: `https://agentexs.vercel.app/api/agentex/v2`

Available actions:
- `validate` - Validate agent requirements
- `generate` - Generate agent code
- `status` - Check build status
- `deploy` - Deploy to hosting platform
- `search_tools` - Search available tools
- `get_tool` - Get tool details

See [Full Documentation](https://agentexs.vercel.app/api-docs) for complete API reference.

## Support

- **Website:** https://agentexs.vercel.app
- **Installation Guide:** https://agentexs.vercel.app/skill
- **API Docs:** https://agentexs.vercel.app/api-docs
- **Discord:** https://discord.gg/agentex
- **GitHub:** https://github.com/nichedotsol/agentex

## License

MIT
