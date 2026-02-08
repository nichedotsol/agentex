# AgentEX Python SDK

Python SDK for the AgentEX Skill API - Build and deploy AI agents programmatically.

## Installation

```bash
pip install agentex
```

Or from source:

```bash
git clone https://github.com/agentex/agentex
cd agentex/packages/python
pip install .
```

## Quick Start

```python
from agentex import AgentEXClient, ValidateRequest, GenerateRequest

# Initialize client
client = AgentEXClient()

# Validate agent requirements
validate_req = ValidateRequest(
    name="Research Assistant",
    description="An AI agent that helps with research tasks",
    brain="openai",
    tools=["tool-openai-api", "tool-resend-email"],
    runtime="vercel"
)

validation = client.validate(validate_req)
print(f"Valid: {validation.valid}")
print(f"Recommended runtime: {validation.recommendation.primary}")

# Generate agent code
generate_req = GenerateRequest(
    name="Research Assistant",
    description="An AI agent that helps with research tasks",
    brain="openai",
    tools=["tool-openai-api", "tool-resend-email"],
    runtime="vercel"
)

generate_resp = client.generate(generate_req)
print(f"Build ID: {generate_resp.buildId}")

# Wait for completion
status = client.wait_for_completion(generate_resp.buildId)
print(f"Status: {status.status}")
print(f"Download URL: {status.result.downloadUrl}")
```

## API Reference

### AgentEXClient

Main client class for interacting with the API.

#### Methods

- `validate(request: ValidateRequest) -> ValidateResponse`
- `generate(request: GenerateRequest) -> GenerateResponse`
- `get_status(build_id: str) -> BuildStatus`
- `wait_for_completion(build_id: str, timeout: int = 300) -> BuildStatus`
- `deploy(request: DeployRequest) -> DeployResponse`
- `search_tools(request: ToolSearchRequest) -> ToolSearchResponse`
- `get_tool(tool_id: str) -> ToolSpec`

## Examples

See the [examples directory](../examples/) for complete examples.

## License

MIT
