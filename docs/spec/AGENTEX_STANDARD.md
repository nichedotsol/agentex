# AgentEX Standard v0.1

## Overview
AgentEX is the universal standard for building and deploying AI agents. This specification defines how components interact, connect, and deploy across any platform.

## Core Principles
1. **Self-describing** - Components declare their own capabilities
2. **Token-efficient** - Built-in caching, compression, context management
3. **Composable** - Components connect via standard interfaces
4. **Portable** - Same config works across all deployment targets
5. **Minimal** - No unnecessary fields, no bloat

## Component Types
- **Brain**: LLM providers (Claude, GPT, Llama)
- **Memory**: Context/storage (deferred to v2)
- **Tool**: External capabilities (APIs, functions)
- **Runtime**: Deployment targets (Vercel, local, etc.)

## Base Component Schema
Every component must include:
- id: Unique identifier
- type: Component category
- name: Human-readable name
- version: Semantic version
- provider: Service provider
- config: Component-specific settings
- interface: I/O specification
- resources: Cost and performance metrics
- metadata: Display information

See individual component schemas for detailed specifications.
