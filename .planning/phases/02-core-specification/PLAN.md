# Phase 2: Core Specification Documentation

## Goal
Write the AgentEX standard specification and component schemas that define:
- The universal standard for building and deploying AI agents
- Core principles and philosophy
- Component types and their schemas
- Build configuration structure

## Documents to Create

### 1. AGENTEX_STANDARD.md
**Location:** `docs/spec/AGENTEX_STANDARD.md`

**Content:**
- Overview: What AgentEX is and its purpose
- Core Principles:
  1. Self-describing - Components declare their own capabilities
  2. Token-efficient - Built-in caching, compression, context management
  3. Composable - Components connect via standard interfaces
  4. Portable - Same config works across all deployment targets
  5. Minimal - No unnecessary fields, no bloat
- Component Types:
  - Brain: LLM providers (Claude, GPT, Llama)
  - Memory: Context/storage (deferred to v2)
  - Tool: External capabilities (APIs, functions)
  - Runtime: Deployment targets (Vercel, local, etc.)
- Base Component Schema: Required fields for all components
  - id, type, name, version, provider
  - config, interface, resources, metadata

### 2. COMPONENT_SCHEMAS.md
**Location:** `docs/spec/COMPONENT_SCHEMAS.md`

**Content:**
- Brain Component Schema (JSON example)
  - Full structure with all fields
  - Config options (model, temperature, max_tokens, etc.)
  - Interface specification (inputs, outputs, capabilities)
  - Resources (token_cost, context_window, cache_enabled)
  - Metadata (author, description, tags, icon, color)
- Tool Component Schema (JSON example)
  - Config (endpoint, auth_type, method, parameters)
  - Interface (inputs, outputs, capabilities)
  - Resources (rate_limits)
  - Metadata
- Runtime Component Schema (JSON example)
  - Config (platform, framework, language, environment)
  - Interface (inputs, outputs, capabilities)
  - Resources (pricing, startup_time, requirements)
  - Metadata
- Build Configuration Schema
  - agentex_version
  - build metadata (id, name, description, created, author)
  - components structure (brain, tools, runtime)
  - connections array
  - settings (token_budget, timeout, retry_policy)

## Implementation Steps

1. **Create AGENTEX_STANDARD.md**
   - Write overview section
   - Document 5 core principles
   - Define component types
   - Specify base component schema requirements

2. **Create COMPONENT_SCHEMAS.md**
   - Document Brain component schema with full JSON example
   - Document Tool component schema with full JSON example
   - Document Runtime component schema with full JSON example
   - Document Build Configuration schema with full JSON example

## Success Criteria
- [ ] AGENTEX_STANDARD.md created with complete specification
- [ ] COMPONENT_SCHEMAS.md created with all component schemas
- [ ] Both documents are clear, comprehensive, and ready for reference
- [ ] Schemas match the structure used in component JSON files (Phase 3-5)

## Dependencies
- Phase 1 must be complete (directories exist)

## Notes
- These specifications will be referenced by:
  - Component JSON files (Phase 3-5)
  - Code generation templates (Phase 7-8)
  - Validation schema (Phase 9)
- Keep specifications minimal but complete
- Focus on clarity and practical examples
