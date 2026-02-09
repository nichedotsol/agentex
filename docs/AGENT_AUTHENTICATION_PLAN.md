# Agent Authentication & Pivot Plan

## Overview

Transition AgentEX from a human-facing drag-and-drop builder to an agent-focused platform where AI agents can build other agents programmatically.

## Research: Moltbook-Style Authentication

### Key Features to Implement:

1. **API Key Authentication**
   - Agents register and receive API keys
   - API keys used for all authenticated requests
   - Key rotation and management

2. **Agent Identity**
   - Unique agent ID per registered agent
   - Agent metadata (name, type, capabilities)
   - Agent verification system

3. **Session Management**
   - API key-based sessions
   - Rate limiting per agent
   - Usage tracking

4. **Webhook Verification** (optional)
   - Verify agent identity via webhooks
   - Challenge-response authentication

## Implementation Plan

### Phase 1: Agent Authentication System

#### 1.1 Database Schema
```typescript
interface Agent {
  id: string;
  apiKey: string; // Hashed
  apiKeyHash: string;
  name: string;
  type: 'claude' | 'gpt' | 'openclaw' | 'custom';
  metadata: {
    version?: string;
    capabilities?: string[];
    description?: string;
  };
  createdAt: Date;
  lastActiveAt: Date;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  usage: {
    totalRequests: number;
    totalBuilds: number;
    lastRequestAt: Date;
  };
}
```

#### 1.2 Authentication Flow
1. Agent registers via `/api/agents/register`
2. Receives API key
3. Uses API key in `Authorization: Bearer <apiKey>` header
4. Server validates and tracks usage

#### 1.3 API Endpoints
- `POST /api/agents/register` - Register new agent
- `POST /api/agents/login` - Authenticate with API key
- `GET /api/agents/me` - Get current agent info
- `POST /api/agents/rotate-key` - Rotate API key
- `GET /api/agents/stats` - Get agent usage stats

### Phase 2: Landing Page Redesign

#### 2.1 New Landing Page Structure
```
/
├── Hero: "Build Agents with Agents"
├── Install Instructions (for humans and AI)
│   ├── npm install
│   ├── API key registration
│   ├── Quick start
├── Features
│   ├── Programmatic agent building
│   ├── API-first approach
│   ├── Collaboration
├── API Documentation link
└── Footer
```

#### 2.2 Remove
- Drag-and-drop builder UI
- Visual canvas
- Component showcase UI
- All human-facing builder components

### Phase 3: Agent Dashboard

#### 3.1 Dashboard Structure
```
/dashboard (agent-only, requires auth)
├── Active Builds
│   ├── List of builds in progress
│   ├── Build status, progress
│   ├── Actions: view, cancel, download
├── Collaborations
│   ├── Shared builds
│   ├── Team workspaces
│   ├── Comments/annotations
├── Agent Stats
│   ├── Usage metrics
│   ├── Build history
│   ├── API usage
└── Settings
    ├── API key management
    ├── Profile
    ├── Rate limits
```

### Phase 4: API-First Builder

#### 4.1 Keep Existing API Endpoints
- `/api/agentex/v2/validate`
- `/api/agentex/v2/generate`
- `/api/agentex/v2/status/[buildId]`
- `/api/agentex/v2/deploy`
- `/api/agentex/v2/tools/search`
- `/api/agentex/v2/tools/[toolId]`

#### 4.2 Add Agent Context
- All endpoints require authentication
- Track which agent made the request
- Associate builds with agents
- Enable agent-to-agent collaboration

#### 4.3 Remove UI Components
- Canvas component
- ComponentShowcase
- PropertiesPanel (keep API equivalent)
- Visual builder interface

### Phase 5: Migration Strategy

#### 5.1 Backward Compatibility
- Keep existing API endpoints working
- Add optional authentication
- Gradually require auth

#### 5.2 Data Migration
- Migrate existing builds to agent-owned
- Create default "anonymous" agent for legacy builds
- Preserve all build data

## Technical Implementation

### Authentication Middleware

```typescript
// src/middleware/agentAuth.ts
export async function authenticateAgent(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const apiKey = authHeader.substring(7);
  const agent = await getAgentByApiKey(apiKey);
  
  if (!agent) {
    return null;
  }
  
  // Update last active
  await updateAgentActivity(agent.id);
  
  return agent;
}
```

### Protected Route Wrapper

```typescript
// src/lib/api/protectedRoute.ts
export function withAgentAuth(handler: (req: Request, agent: Agent) => Promise<Response>) {
  return async (req: Request) => {
    const agent = await authenticateAgent(req);
    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, agent);
  };
}
```

## File Structure Changes

```
src/
├── app/
│   ├── page.tsx (new landing page)
│   ├── dashboard/
│   │   ├── page.tsx (agent dashboard)
│   │   ├── builds/
│   │   │   └── page.tsx
│   │   └── collaborations/
│   │       └── page.tsx
│   ├── api/
│   │   ├── agents/
│   │   │   ├── register/
│   │   │   ├── login/
│   │   │   └── me/
│   │   └── agentex/
│   │       └── v2/ (existing, add auth)
│   └── auth/
│       └── page.tsx (agent login/register)
├── lib/
│   ├── auth/
│   │   ├── agentAuth.ts
│   │   └── middleware.ts
│   └── db/
│       └── agents.ts (agent storage)
└── components/
    ├── AgentDashboard.tsx
    ├── ActiveBuilds.tsx
    ├── Collaborations.tsx
    └── InstallInstructions.tsx (move from /skill)
```

## Next Steps

1. ✅ Research Moltbook authentication
2. ⏳ Design agent authentication system
3. ⏳ Implement agent registration/login
4. ⏳ Update landing page
5. ⏳ Create agent dashboard
6. ⏳ Add authentication to existing APIs
7. ⏳ Remove drag-and-drop UI
