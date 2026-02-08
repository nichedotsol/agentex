# Installing AgentEX Skill in OpenClaw

## Installation Methods

### Method 1: JSON File Import

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

### Method 2: Direct API Integration

If OpenClaw supports direct API integration, you can configure it to use the AgentEX API:

**API Base URL:** `https://agentexs.vercel.app/api/agentex/v2`

**Available Functions:**
- `POST /validate` - Validate agent requirements
- `POST /generate` - Generate agent code
- `GET /status/{buildId}` - Check build status
- `POST /deploy` - Deploy agent
- `POST /tools/search` - Search tools
- `GET /tools/{toolId}` - Get tool details

## Usage Examples

### Example 1: Validate Agent Requirements

```python
# In OpenClaw, use the agentex_builder skill
result = agentex_builder.validate(
    name="Research Assistant",
    description="An AI agent that helps with research tasks",
    brain="openclaw",
    tools=["tool-openai-api", "tool-resend-email"],
    runtime="vercel"
)

print(f"Valid: {result['valid']}")
print(f"Recommended runtime: {result['recommendation']['primary']}")
```

### Example 2: Generate Agent Code

```python
# Generate agent code
generate_result = agentex_builder.generate(
    name="Research Assistant",
    description="An AI agent that helps with research tasks",
    brain="openclaw",
    tools=["tool-openai-api", "tool-resend-email"],
    runtime="vercel",
    config={
        "temperature": 0.7,
        "maxTokens": 4096
    }
)

build_id = generate_result['buildId']
print(f"Build started: {build_id}")
```

### Example 3: Check Status and Wait for Completion

```python
import time

# Check status
status = agentex_builder.status(buildId=build_id)

# Poll until complete
while status['status'] not in ['complete', 'failed']:
    time.sleep(5)
    status = agentex_builder.status(buildId=build_id)
    print(f"Progress: {status['progress']}%")

if status['status'] == 'complete':
    print(f"Download URL: {status['result']['downloadUrl']}")
```

### Example 4: Deploy Agent

```python
# Deploy to Vercel
deploy_result = agentex_builder.deploy(
    buildId=build_id,
    platform="vercel",
    credentials={
        "apiKey": "your-vercel-token",
        "projectName": "research-assistant"
    }
)

print(f"Deployment started: {deploy_result['deployId']}")
```

### Example 5: Search Tools

```python
# Search for email tools
tools = agentex_builder.search_tools(
    query="email",
    category="communication"
)

print(f"Found {tools['total']} tools:")
for tool in tools['tools']:
    print(f"- {tool['name']}: {tool['description']}")
```

### Example 6: Get Tool Details

```python
# Get details about a specific tool
tool = agentex_builder.get_tool(toolId="tool-resend-email")

print(f"Tool: {tool['name']}")
print(f"Description: {tool['description']}")
print(f"Required env vars: {[env['key'] for env in tool['requiredEnv']]}")
```

## Complete Workflow Example

```python
# Complete workflow: Validate → Generate → Deploy
def build_and_deploy_agent(name, description, tools, platform="vercel"):
    # Step 1: Validate
    validation = agentex_builder.validate(
        name=name,
        description=description,
        brain="openclaw",
        tools=tools,
        runtime=platform
    )
    
    if not validation['valid']:
        print("Validation failed:")
        for issue in validation['issues']:
            print(f"  - {issue['message']}")
        return None
    
    print(f"✓ Validation passed. Recommended: {validation['recommendation']['primary']}")
    
    # Step 2: Generate
    generate_result = agentex_builder.generate(
        name=name,
        description=description,
        brain="openclaw",
        tools=tools,
        runtime=platform
    )
    
    build_id = generate_result['buildId']
    print(f"✓ Generation started: {build_id}")
    
    # Step 3: Wait for completion
    import time
    while True:
        status = agentex_builder.status(buildId=build_id)
        if status['status'] == 'complete':
            print(f"✓ Generation complete!")
            break
        elif status['status'] == 'failed':
            print(f"✗ Generation failed: {status['error']['message']}")
            return None
        time.sleep(5)
    
    # Step 4: Deploy
    deploy_result = agentex_builder.deploy(
        buildId=build_id,
        platform=platform,
        credentials={
            "apiKey": "your-api-key",
            "projectName": name.lower().replace(" ", "-")
        }
    )
    
    print(f"✓ Deployment started: {deploy_result['deployId']}")
    return deploy_result

# Use it
result = build_and_deploy_agent(
    name="Email Sender",
    description="Sends emails using Resend",
    tools=["tool-resend-email"]
)
```

## Troubleshooting

### Skill not appearing

- Ensure the JSON file is valid
- Check that OpenClaw has permissions to access the skills directory
- Try restarting OpenClaw

### API errors

- Verify the API endpoint is accessible: `https://agentexs.vercel.app/api/agentex/v2`
- Check network connectivity
- Ensure all required parameters are provided

### Function not found

- Verify the skill is installed correctly
- Check that the function name matches exactly (case-sensitive)
- Review the skill configuration file

## Support

- **Discord:** https://discord.gg/agentex
- **Documentation:** https://docs.agentex.dev
- **GitHub:** https://github.com/agentex/agentex
