# AgentEX TypeScript SDK

TypeScript/JavaScript SDK for the AgentEX Skill API - Build and deploy AI agents programmatically.

## Installation

```bash
npm install @agentex/sdk
```

Or with yarn:

```bash
yarn add @agentex/sdk
```

## Quick Start

```typescript
import { AgentEXClient, ValidateRequest, GenerateRequest } from '@agentex/sdk';

// Initialize client
const client = new AgentEXClient({
  baseUrl: 'https://agentexs.vercel.app/api/agentex/v2'
});

// Validate agent requirements
const validateReq: ValidateRequest = {
  name: 'Research Assistant',
  description: 'An AI agent that helps with research tasks',
  brain: 'openai',
  tools: ['tool-openai-api', 'tool-resend-email'],
  runtime: 'vercel'
};

const validation = await client.validate(validateReq);
console.log(`Valid: ${validation.valid}`);
console.log(`Recommended runtime: ${validation.recommendation?.primary}`);

// Generate agent code
const generateReq: GenerateRequest = {
  name: 'Research Assistant',
  description: 'An AI agent that helps with research tasks',
  brain: 'openai',
  tools: ['tool-openai-api', 'tool-resend-email'],
  runtime: 'vercel'
};

const generateResp = await client.generate(generateReq);
console.log(`Build ID: ${generateResp.buildId}`);

// Wait for completion
const status = await client.waitForCompletion(generateResp.buildId);
console.log(`Status: ${status.status}`);
console.log(`Download URL: ${status.result?.downloadUrl}`);
```

## API Reference

### AgentEXClient

Main client class for interacting with the API.

#### Methods

- `validate(request: ValidateRequest): Promise<ValidateResponse>`
- `generate(request: GenerateRequest): Promise<GenerateResponse>`
- `getStatus(buildId: string): Promise<BuildStatus>`
- `waitForCompletion(buildId: string, timeout?: number): Promise<BuildStatus>`
- `deploy(request: DeployRequest): Promise<DeployResponse>`
- `searchTools(request: ToolSearchRequest): Promise<ToolSearchResponse>`
- `getTool(toolId: string): Promise<ToolSpec>`

## Examples

See the [examples directory](../examples/) for complete examples.

## License

MIT
