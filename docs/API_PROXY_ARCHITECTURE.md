# API Proxy Architecture

## Overview

AgentEX uses a backend proxy system to handle API keys securely, eliminating the need for users to expose their API keys in generated code.

## Architecture

### Backend Proxy Service

```
User Agent → AgentEX Backend → LLM Provider APIs
           (API Key Storage)    (Anthropic, OpenAI, etc.)
```

### Key Components

1. **API Key Management**
   - Users store API keys securely in AgentEX backend
   - Keys are encrypted at rest
   - Keys are never exposed in generated code
   - Keys are never sent to client-side

2. **Proxy Endpoints**
   - `/api/proxy/anthropic` - Proxies Anthropic API calls
   - `/api/proxy/openai` - Proxies OpenAI API calls
   - `/api/proxy/openclaw` - Proxies OpenClaw API calls
   - `/api/proxy/tools/*` - Proxies tool API calls (Brave, E2B, etc.)

3. **Authentication**
   - User authentication via session tokens
   - API key association with user accounts
   - Rate limiting per user

## Implementation

### Backend API Routes

```typescript
// app/api/proxy/[provider]/route.ts
export async function POST(
  request: Request,
  { params }: { params: { provider: string } }
) {
  const session = await getSession(request)
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const apiKey = await getApiKey(session.userId, params.provider)
  if (!apiKey) {
    return new Response('API key not configured', { status: 400 })
  }

  const body = await request.json()
  
  // Proxy request to provider
  const response = await fetch(`${PROVIDER_URLS[params.provider]}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return response
}
```

### Generated Code Pattern

Instead of:
```typescript
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY // ❌ User must provide
})
```

Generated code uses:
```typescript
const response = await fetch('/api/proxy/anthropic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages, model, ... })
})
```

## Benefits

1. **Security**: API keys never exposed
2. **Simplicity**: Users don't need to manage keys
3. **Centralized**: Key rotation and management
4. **Analytics**: Usage tracking per user
5. **Rate Limiting**: Built-in protection

## Database Schema

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider VARCHAR(50) NOT NULL,
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user_provider ON api_keys(user_id, provider);
```

## Environment Variables

Backend requires:
- `ENCRYPTION_KEY` - For encrypting API keys
- `DATABASE_URL` - For storing encrypted keys
- `SESSION_SECRET` - For user sessions

## Migration Path

1. **Phase 1**: Optional API key storage (users can still use env vars)
2. **Phase 2**: Default to proxy, allow opt-out
3. **Phase 3**: Proxy-only mode
