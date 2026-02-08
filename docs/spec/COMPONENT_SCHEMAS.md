# Component Schemas

## Brain Component
```json
{
  "id": "string",
  "type": "brain",
  "name": "string",
  "version": "semver",
  "provider": "anthropic | openai | replicate",
  "config": {
    "model": "string",
    "temperature": 0.0-1.0,
    "max_tokens": number,
    "system_prompt": "string (optional)",
    "streaming": boolean
  },
  "interface": {
    "inputs": ["messages", "context"],
    "outputs": ["text", "tool_calls"],
    "capabilities": ["text_generation", "tool_use", "vision"]
  },
  "resources": {
    "token_cost": "string (pricing info)",
    "context_window": number,
    "cache_enabled": boolean
  },
  "metadata": {
    "author": "string",
    "description": "string",
    "tags": ["array"],
    "icon": "url or emoji",
    "color": "#hex"
  }
}
```

## Tool Component
```json
{
  "id": "string",
  "type": "tool",
  "name": "string",
  "version": "semver",
  "provider": "string",
  "config": {
    "endpoint": "url (optional)",
    "auth_type": "bearer | api_key | none",
    "method": "POST | GET",
    "parameters": {
      "required": ["array"],
      "optional": ["array"]
    }
  },
  "interface": {
    "inputs": ["function_name", "arguments"],
    "outputs": ["result", "error"],
    "capabilities": ["array of capabilities"]
  },
  "resources": {
    "rate_limits": {
      "requests_per_minute": number
    }
  },
  "metadata": {
    "author": "string",
    "description": "string",
    "tags": ["array"],
    "icon": "url or emoji",
    "color": "#hex"
  }
}
```

## Runtime Component
```json
{
  "id": "string",
  "type": "runtime",
  "name": "string",
  "version": "semver",
  "provider": "string",
  "config": {
    "platform": "vercel | local | railway",
    "framework": "nextjs | fastapi | express",
    "language": "typescript | python",
    "environment": {
      "required_env_vars": ["array"],
      "optional_env_vars": ["array"]
    }
  },
  "interface": {
    "inputs": ["agent_config"],
    "outputs": ["deployed_url", "logs"],
    "capabilities": ["serverless", "streaming", "webhooks"]
  },
  "metadata": {
    "author": "string",
    "description": "string",
    "tags": ["array"],
    "icon": "url or emoji",
    "color": "#hex"
  }
}
```

## Build Configuration
```json
{
  "agentex_version": "0.1.0",
  "build": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "created": "ISO timestamp",
    "author": "string"
  },
  "components": {
    "brain": {},
    "tools": [],
    "runtime": {}
  },
  "connections": [
    {
      "from": "component-id",
      "to": "component-id",
      "type": "connection type",
      "config": {}
    }
  ],
  "settings": {
    "token_budget": number,
    "timeout": number,
    "retry_policy": "string"
  }
}
```
