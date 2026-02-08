# Project Roadmap

## Current Milestone: v1.0 Foundation

### Phase 1: Project Structure Setup ✅

**Goal:** Create the complete directory structure for AgentEX project
**Depends on:** None
**Plans:** 5 plans

Plans:
- [x] Create root agentex directory (if needed)
- [x] Create source code directories (src/components, src/lib, src/hooks, src/app)
- [x] Create public asset directories (public/components, public/icons, public/assets)
- [x] Create template directories (templates/typescript, templates/python)
- [x] Create documentation directories (docs/spec, docs/guides)

**Details:**
Creates the complete directory structure to support:
- Source code organization (React/Next.js components, libraries, hooks)
- Public assets (component definitions, icons, static assets)
- Code generation templates (TypeScript/Next.js, Python/FastAPI)
- Documentation (specifications, guides)

All directories will be empty at this stage, ready for content in subsequent phases.

### Phase 2: Core Specification Documentation ✅

**Goal:** Write AgentEX standard specification and component schemas
**Depends on:** Phase 1
**Plans:** 2 plans

Plans:
- [x] Create AGENTEX_STANDARD.md with overview, core principles, component types, and base schema
- [x] Create COMPONENT_SCHEMAS.md with Brain, Tool, Runtime, and Build Configuration schemas

**Details:**
Creates the foundational documentation that defines:
- The universal standard for building and deploying AI agents
- 5 core principles (self-describing, token-efficient, composable, portable, minimal)
- Component types (Brain, Memory, Tool, Runtime)
- Complete JSON schemas for all component types
- Build configuration structure

These specifications will be referenced by component JSON files, code templates, and validation logic in subsequent phases.

### Phase 3: Brain Components ✅

**Goal:** Create 3 brain component JSON files (Claude Sonnet 4, GPT-4, Llama 3.3 70B)
**Depends on:** Phase 2
**Plans:** 3 plans

Plans:
- [x] Create brain-claude-sonnet-4.json (Anthropic, 200K context, extended thinking)
- [x] Create brain-gpt-4.json (OpenAI, 128K context, popular)
- [x] Create brain-llama-3-70b.json (Replicate/Meta, 128K context, cost-effective)

**Details:**
Creates three brain component definitions following the Brain Component schema:
- **Claude Sonnet 4**: Production-ready, balanced model with extended thinking capabilities
- **GPT-4.0**: Popular general-purpose model from OpenAI
- **Llama 3.3 70B**: Open-source, cost-effective option via Replicate

All components include complete configuration (model, temperature, max_tokens, streaming), interface specifications (inputs, outputs, capabilities), resource information (pricing, context window, cache), and metadata (author, description, tags, icon, color).

### Phase 4: Tool Components ✅

**Goal:** Create 5 tool component JSON files (Web Search, Code Execution, Blockchain Query, Token Price, Twitter Post)
**Depends on:** Phase 2
**Plans:** 5 plans

Plans:
- [x] Create tool-web-search.json (Brave API, web search capabilities)
- [x] Create tool-code-execution.json (E2B, Python sandbox execution)
- [x] Create tool-blockchain-query.json (Alchemy, Ethereum/Solana queries)
- [x] Create tool-token-price.json (CoinGecko, cryptocurrency price data)
- [x] Create tool-twitter-post.json (Twitter API, social media posting)

**Details:**
Creates five tool component definitions following the Tool Component schema:
- **Web Search**: Search the web for current information via Brave API
- **Code Execution**: Execute Python code in secure E2B sandbox
- **Blockchain Query**: Query Ethereum and Solana blockchain data via Alchemy
- **Token Price Feed**: Get real-time cryptocurrency price data from CoinGecko
- **Twitter Post**: Post tweets and manage Twitter presence

All components include complete configuration (endpoint, auth_type, method, parameters), interface specifications (inputs, outputs, capabilities), resource information (rate_limits), and metadata (author, description, tags, icon, color).

### Phase 5: Runtime Components ✅

**Goal:** Create 2 runtime component JSON files (Vercel Serverless, Local Docker)
**Depends on:** Phase 2
**Plans:** 2 plans

Plans:
- [x] Create runtime-vercel.json (Vercel serverless, Next.js, TypeScript, edge deployment)
- [x] Create runtime-local-docker.json (Local Docker, FastAPI, Python, development)

**Details:**
Creates two runtime component definitions following the Runtime Component schema:
- **Vercel Serverless**: Production-ready deployment to Vercel's edge network with Next.js and TypeScript
- **Local Docker**: Development environment running FastAPI in Docker container

All components include complete configuration (platform, framework, language, environment variables), interface specifications (inputs, outputs, capabilities), resource information (pricing, startup/cold start times, requirements), and metadata (author, description, tags, icon, color).

### Phase 6: Component Registry ✅

**Goal:** Create component registry index JSON file
**Depends on:** Phase 3, Phase 4, Phase 5
**Plans:** 1 plan

Plans:
- [x] Create registry.json with all 10 components organized by type (brains, tools, runtimes) and category metadata

**Details:**
Creates a central registry index that catalogs all available components:
- **Brains**: 3 components (Claude Sonnet 4, GPT-4, Llama 3.3 70B)
- **Tools**: 5 components (Web Search, Code Execution, Blockchain Query, Token Price, Twitter Post)
- **Runtimes**: 2 components (Vercel Serverless, Local Docker)

The registry includes version information, last updated timestamp, component file references, and category metadata (name, description, icon, color) for organizing components in the UI. This serves as the index for the component library and enables the visual builder to discover and display available components.

### Phase 7: TypeScript Export Template ✅

**Goal:** Create TypeScript/Next.js code generation template
**Depends on:** Phase 2
**Plans:** 2 plans

Plans:
- [x] Create agent-template.ts with TypeScript interfaces, agent execution function, and Next.js API route handler
- [x] Include template variables (BUILD_ID, TIMESTAMP, AGENT_CONFIG) for dynamic code generation

**Details:**
Creates a TypeScript/Next.js code generation template that can generate deployable agent code from build configurations. The template includes:
- TypeScript interfaces for messages and agent configuration
- Agent execution function using Anthropic SDK
- Next.js App Router API route handler
- Template variables for dynamic content injection (build ID, timestamp, agent config)
- Error handling and type safety

The template uses placeholder variables ({{BUILD_ID}}, {{TIMESTAMP}}, {{AGENT_CONFIG}}) that get replaced during code generation with actual build configuration values. This enables one-click code generation for Vercel deployment.

### Phase 8: Python Export Template ✅

**Goal:** Create Python/FastAPI code generation template
**Depends on:** Phase 2
**Plans:** 2 plans

Plans:
- [x] Create agent_template.py with Pydantic models, agent execution function, and FastAPI endpoint
- [x] Include template variables (BUILD_ID, TIMESTAMP, AGENT_CONFIG) for dynamic code generation

**Details:**
Creates a Python/FastAPI code generation template that can generate deployable agent code from build configurations for Docker/local deployment. The template includes:
- Pydantic models for request/response validation
- Agent execution function using Anthropic SDK
- FastAPI application with POST endpoint
- Template variables for dynamic content injection (build ID, timestamp, agent config)
- Error handling with HTTP exceptions
- Uvicorn server configuration

The template uses placeholder variables ({{BUILD_ID}}, {{TIMESTAMP}}, {{AGENT_CONFIG}}) that get replaced during code generation with actual build configuration values. This enables code generation for local Docker deployment and development environments.

### Phase 9: Validation Schema ✅

**Goal:** Create build configuration validator
**Depends on:** Phase 2
**Plans:** 4 plans

Plans:
- [x] Create validator.ts with ValidationResult interface and validateBuild function
- [x] Implement component validation (exactly 1 brain, at least 1 tool, exactly 1 runtime)
- [x] Implement token budget validation (warn if too low)
- [x] Add error and warning message handling

**Details:**
Creates a build configuration validator that ensures build configurations are valid before code generation and deployment. The validator:
- Checks that exactly 1 brain component is present (required)
- Checks that at least 1 tool component is present (warning if none)
- Checks that exactly 1 runtime component is present (required)
- Validates token budget settings (warns if very low)
- Returns ValidationResult with success status, errors array, and warnings array

Errors prevent code generation, while warnings inform users of potential issues but allow generation to proceed. This ensures build quality and helps catch configuration mistakes early.

### Phase 10: Project Documentation and Configuration ✅

**Goal:** Create README, package.json, and .gitignore files
**Depends on:** Phase 1
**Plans:** 3 plans

Plans:
- [x] Create README.md with project overview, philosophy, quick start, and component registry summary
- [x] Create package.json with project metadata, scripts, and all dependencies (Next.js, React, Three.js, etc.)
- [x] Create .gitignore with Node.js, Next.js, and environment file patterns

**Details:**
Creates essential project documentation and configuration files to complete the AgentEX project setup:
- **README.md**: Comprehensive project documentation including overview, philosophy (lightweight, simple, universal, portable), project structure, quick start guide, component registry summary, export targets, tech stack, license, and contact information
- **package.json**: Project metadata, npm scripts (dev, build, start, lint), dependencies (Next.js 14, React 18, Anthropic SDK, Three.js, Framer Motion, Zustand), and dev dependencies (TypeScript, Tailwind CSS, type definitions)
- **.gitignore**: Ignore patterns for node_modules, build artifacts, environment files, debug logs, and Vercel deployment files

These files complete the project foundation and make the project ready for development, deployment, and contribution.

---

## Future Milestones

---
