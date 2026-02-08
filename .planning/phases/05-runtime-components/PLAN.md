# Phase 5: Runtime Components

## Goal
Create 2 runtime component JSON files that define deployment targets following the Runtime Component schema from Phase 2.

## Components to Create

### 1. Vercel Serverless
**File:** `public/components/runtime-vercel.json`

**Key Details:**
- Provider: Vercel
- Platform: vercel
- Framework: nextjs
- Language: typescript
- Required Env Vars: ANTHROPIC_API_KEY
- Optional Env Vars: OPENAI_API_KEY, BRAVE_API_KEY
- Capabilities: serverless, streaming, edge_runtime, auto_scaling
- Pricing: Free tier (100GB bandwidth), Pro ($20/mo)
- Cold Start: ~50-200ms
- Execution Timeout: 10s (hobby), 60s (pro)
- Icon: ▲
- Color: #000000
- Tags: serverless, edge, production, recommended

### 2. Local Docker
**File:** `public/components/runtime-local-docker.json`

**Key Details:**
- Provider: Docker
- Platform: local
- Framework: fastapi
- Language: python
- Required Env Vars: ANTHROPIC_API_KEY
- Optional Env Vars: OPENAI_API_KEY, BRAVE_API_KEY
- Capabilities: docker_container, hot_reload, local_development
- Pricing: Free (runs on your machine)
- Startup Time: ~2-5s
- Requirements: Docker Desktop installed
- Icon: 🐳
- Color: #2496ED
- Tags: local, development, docker

## Implementation Steps

1. **Create runtime-vercel.json**
   - Follow Runtime Component schema
   - Include all required fields (id, type, name, version, provider)
   - Configure platform, framework, language
   - Define environment variables (required and optional)
   - Define interface with inputs/outputs/capabilities
   - Add resources (pricing, cold_start, execution_timeout)
   - Add metadata (author, description, tags, icon, color)

2. **Create runtime-local-docker.json**
   - Follow Runtime Component schema
   - Configure for Docker provider
   - Set appropriate platform, framework, language
   - Define environment variables
   - Define interface and capabilities
   - Add resources (pricing, startup_time, requirements)
   - Add metadata

## Schema Compliance
All components must include:
- ✅ id (unique identifier)
- ✅ type: "runtime"
- ✅ name, version, provider
- ✅ config (platform, framework, language, environment)
- ✅ interface (inputs, outputs, capabilities)
- ✅ resources (pricing, startup_time/requirements)
- ✅ metadata (author, description, tags, icon, color)

## Success Criteria
- [ ] All 2 runtime component JSON files created
- [ ] All files follow Runtime Component schema exactly
- [ ] All required fields populated
- [ ] JSON is valid and properly formatted
- [ ] Files are ready for component registry (Phase 6)

## Dependencies
- Phase 2 must be complete (schemas defined)

## Notes
- These components will be referenced in the component registry (Phase 6)
- Vercel is production-ready with edge deployment
- Local Docker is for development and testing
- Both support different deployment workflows
- Environment variables are critical for runtime configuration
