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

## Current Milestone: v2.0 Visual Builder UI

### Phase 11: Next.js App Setup & Layout - Hybrid Aesthetic ✅

**Goal:** Set up Next.js App Router with hybrid aesthetic (Overrides.com grid + Garden Intel CRT + Lain floating windows)
**Depends on:** Phase 10
**Plans:** 13 plans

Plans:
- [x] Update package.json with additional dependencies (@monaco-editor/react, react-draggable)
- [x] Create enhanced Tailwind config with custom colors, fonts (Inter/JetBrains/VT323), and CRT animations
- [x] Create PostCSS configuration
- [x] Create global styles with CRT effects (scan lines, noise, curvature), chrome aberration, grid patterns
- [x] Create root layout loading Google Fonts and applying font variables
- [x] Create BackgroundLayers component (grid dots, blurred gradients, noise texture)
- [x] Create TopBar component (terminal-style header with status and action buttons)
- [x] Create ComponentShowcase component (grid-based specimens with hover effects)
- [x] Create Canvas component (floating draggable windows with Lain-style design)
- [x] Create PropertiesPanel component (cost analysis, metrics, build config with animations)
- [x] Create StatusBar component (bottom status display)
- [x] Create main builder page integrating all components
- [x] Set up TypeScript configuration with path aliases

**Details:**
Sets up the Next.js application with a hybrid aesthetic combining:
- **Overrides.com style**: Interactive component specimens in grid layout with hover effects
- **Garden Intel style**: CRT effects (scan lines, noise texture, blurred gradient backgrounds)
- **Lain style**: Floating draggable windows with layered depth

Features include terminal/CRT aesthetic, custom color palette (ax-cyan, ax-red, ax-blue), mixed typography (Inter, JetBrains Mono, VT323 pixel font), RGB chromatic aberration, and window glass effects. The builder page includes TopBar, ComponentShowcase sidebar, Canvas workspace with floating windows, PropertiesPanel, and StatusBar.

### Phase 12: Landing Page ✅

**Goal:** Create attractive landing page with hero section, features, and quick start
**Depends on:** Phase 11
**Plans:** 6 plans

Plans:
- [x] Create hero section with headline, subheadline, and CTAs
- [x] Create features section with 4 key features (Lightweight, Simple, Universal, Portable)
- [x] Create component showcase section with category tabs and component cards
- [x] Create "How It Works" section with 3-step process
- [x] Create export targets section showing deployment options
- [x] Create footer with links, license, and contact info

**Details:**
Creates a modern, attractive landing page that showcases AgentEX:
- Hero section with compelling headline and call-to-action buttons
- Features section highlighting key value propositions
- Component showcase displaying available components from registry
- How it works section explaining the 3-step process
- Export targets section showing deployment options (GitHub, Vercel, Cursor, Local)
- Responsive design with smooth animations using Framer Motion

### Phase 13: Component Library UI ✅

**Goal:** Create component library sidebar with searchable, categorized component cards
**Depends on:** Phase 11, Phase 6
**Plans:** 5 plans

Plans:
- [x] Create component library hook (useComponentRegistry) to load and filter registry data
- [x] Create component library sidebar with category tabs (Brains, Tools, Runtimes)
- [x] Create component card component displaying icon, name, description, and tags
- [x] Create search bar with real-time filtering functionality
- [x] Create component details panel for expanded component information

**Details:**
Creates a searchable component library that displays all available components:
- Sidebar with category tabs showing component counts
- Component cards with icons, names, descriptions, and color accents
- Real-time search filtering by name, description, or tags
- Component details panel showing full information on click/hover
- Drag-and-drop ready for workspace integration
- Loads components dynamically from the registry JSON files

### Phase 14: Visual Builder Workspace ✅

**Goal:** Create 3D/visual workspace canvas for drag-and-drop component assembly
**Depends on:** Phase 11, Phase 13
**Plans:** 6 plans

Plans:
- [x] Set up Three.js scene with React Three Fiber (scene, camera, lighting, grid)
- [x] Create component nodes as 3D representations positioned in workspace zones
- [x] Implement drag-and-drop from component library to workspace
- [x] Create connection lines between components with validation
- [x] Add workspace controls (camera controls, zoom, pan, view presets)
- [x] Integrate with state management for build configuration updates

**Details:**
Enhances the visual workspace with connection visualization and workspace controls:
- Connection lines between components (Brain→Tools, Tools→Runtime, Brain→Runtime) with animated flow indicators
- Workspace controls (zoom in/out, reset, view presets: default, top, side, isometric)
- Component zones with smart positioning (Brain center, Tools in circle around brain, Runtime at bottom)
- Position validation (only one brain, only one runtime allowed)
- Enhanced floating windows displaying component metadata from registry
- Component selection with visual highlighting
- Real-time position updates when components are dragged

### Phase 15: Component Configuration UI ✅

**Goal:** Create configuration panels for editing component settings (brain, tools, runtime)
**Depends on:** Phase 13, Phase 14
**Plans:** 7 plans

Plans:
- [x] Create configuration panel component (slide-out or modal) with tabbed interface
- [x] Create brain configuration form (model, temperature, max_tokens, system prompt, streaming)
- [x] Create tool configuration form (endpoint, auth, parameters, rate limits)
- [x] Create runtime configuration form (platform, framework, environment variables)
- [x] Create build settings form (token budget, timeout, retry policy, metadata)
- [x] Add form validation with real-time error display
- [x] Integrate with state management to save configuration changes

**Details:**
Creates configuration panels for editing component and build settings:
- Slide-out or modal panel with tabbed interface for different component types
- Brain config: model selection, temperature slider, max tokens, system prompt, streaming toggle
- Tool config: endpoint URL, authentication setup, parameter forms, rate limit display
- Runtime config: platform selection, framework options, environment variables editor
- Build settings: token budget, timeout, retry policy, build name/description/author
- Real-time validation with error messages and helpful tooltips

### Phase 16: State Management & Build System ✅

**Goal:** Set up Zustand store for build state and integrate validation/export logic
**Depends on:** Phase 14, Phase 15, Phase 9
**Plans:** 6 plans

Plans:
- [x] Create Zustand stores (buildStore, uiStore, registryStore) with TypeScript types
- [x] Implement build actions (addComponent, removeComponent, updateConfig, connectComponents)
- [x] Integrate validation from Phase 9 with real-time validation on changes
- [x] Create build utilities (export formatter, build loader, configuration merger)
- [x] Add optional persistence (LocalStorage for draft saves)
- [x] Connect UI components to stores

**Details:**
Implemented comprehensive state management with Zustand:
- **Build Store** (`buildStore.ts`): Manages build configuration, components (brain, tools, runtime), positions, connections, settings, and validation. Includes LocalStorage persistence.
- **UI Store** (`uiStore.ts`): Manages UI state including component library visibility, configuration panel state, selected components, workspace zoom/pan/view, active category, and search query.
- **Registry Store** (`registryStore.ts`): Manages component registry loading, caching, and filtering.
- **Build Utilities** (`buildUtils.ts`): Provides functions for formatting builds for export, generating connections, loading build configs, and default settings.
- **Component Integration**: All UI components (Canvas, ComponentShowcase, PropertiesPanel, ConfigPanel) now use Zustand stores instead of local state.
- **Validation Integration**: Build validation runs automatically on component add/remove/update and settings changes.
- **Persistence**: Build state automatically saves to LocalStorage and restores on page load.
- [ ] Connect all UI components to Zustand stores

**Details:**
Sets up comprehensive state management for the entire application:
- Build store: manages build configuration, selected components, connections, settings
- UI store: manages component library visibility, config panel state, workspace camera, selections
- Registry store: manages loaded components, filtering, search, component cache
- Actions for component management, configuration updates, connection management
- Integration with validator from Phase 9 for real-time build validation
- Build utilities for exporting, loading, and formatting build configurations

### Phase 17: Export & Deployment UI ✅

**Goal:** Create export interface for GitHub, Vercel, Cursor, and local download
**Depends on:** Phase 16, Phase 7, Phase 8
**Plans:** 8 plans

Plans:
- [x] Create export modal component with target selection
- [x] Create export target components (GitHub, Vercel, Cursor, Local)
- [x] Create build summary component with validation status
- [x] Create code preview component with syntax highlighting
- [x] Create export progress component
- [x] Implement code generation from templates (TypeScript, Python)
- [x] Implement local ZIP export functionality
- [x] Integrate export modal with TopBar Export button

**Details:**
Implemented complete export and deployment system:
- **Export Modal** (`ExportModal.tsx`): Full-featured modal with export target selection, format selection (TypeScript/Python), build summary, code preview, and progress tracking.
- **Build Summary** (`BuildSummary.tsx`): Displays build configuration, validation status, components, token budget, and estimated cost.
- **Export Targets** (`ExportTarget.tsx`): Cards for Local Download, Cursor, GitHub (placeholder), and Vercel (placeholder).
- **Code Preview** (`CodePreview.tsx`): Preview generated code files with tabbed interface and copy-to-clipboard functionality.
- **Export Progress** (`ExportProgress.tsx`): Real-time progress indicator with step-by-step status and error handling.
- **Code Generator** (`codeGenerator.ts`): Generates TypeScript/Next.js and Python/FastAPI code from templates with variable replacement, includes package.json, requirements.txt, README, .env.example, and .gitignore.
- **Export Utils** (`exportUtils.ts`): Handles ZIP file creation and download, with progress callbacks. Placeholders for GitHub and Vercel API integration.
- **Integration**: Export button in TopBar opens the export modal. Local export generates ZIP with all files. Cursor export generates deep link.
- [ ] Create export modal with export target selection and build summary
- [ ] Create export target cards (GitHub, Vercel, Cursor, Local) with descriptions
- [ ] Implement code generation from templates (replace BUILD_ID, TIMESTAMP, AGENT_CONFIG)
- [ ] Implement GitHub export (create repo via API, push code)
- [ ] Implement Vercel export (deploy via API)
- [ ] Implement Cursor export (generate deep link)
- [ ] Implement local export (generate ZIP file, trigger download)
- [ ] Add export progress tracking with step-by-step status and error handling

**Details:**
Creates a complete export system for deploying agents:
- Export modal with target selection (GitHub, Vercel, Cursor, Local download)
- Build summary showing selected components, token budget, estimated cost, validation status
- Code generation from templates (TypeScript and Python) with variable replacement
- GitHub export: creates repository and pushes generated code
- Vercel export: deploys Next.js application automatically
- Cursor export: generates deep link to open project in Cursor
- Local export: creates ZIP file with all generated code and dependencies
- Progress tracking with clear status updates and error messages

---

## Current Milestone: v3.0 Component Expansion & Modernization

### Phase 18: Component Expansion

**Goal:** Expand component library with additional brains, tools, runtimes, and introduce memory components
**Depends on:** Phase 17
**Status:** Planning

**Plans:**
- Add 5 new brain components (Gemini, Mistral, GPT-4 Turbo, Claude Haiku, Llama 3.1 8B)
- Add 10 new tool components (File Ops, Database, Email, Calendar, Slack, Image Gen, PDF, API Client, Vector DB, Audio)
- Add 5 new runtime components (AWS Lambda, Cloudflare Workers, Railway, Fly.io, Render)
- Introduce memory component category (4 memory components)
- Update registry and UI to support memory components

### Phase 19: UI Modernization & Enhanced Interactions

**Goal:** Modernize UI with advanced interactions, better animations, improved glass morphism
**Depends on:** Phase 18
**Status:** Planning

**Plans:**
- Enhance glass morphism with variable blur and gradient overlays
- Add advanced animations (page transitions, stagger effects, micro-interactions)
- Improve component cards with better hover states and information display
- Enhance workspace with smooth dragging, better connections, mini-map
- Modernize forms with better validation feedback and auto-save
- Improve natural language input with LLM integration
- Add gesture support and loading states

### Phase 20: Advanced Features & Functionality

**Goal:** Add advanced features (templates, testing, version control, collaboration, analytics)
**Depends on:** Phase 19
**Status:** Planning

**Plans:**
- Create agent template system
- Build testing interface with chat
- Implement version control
- Add collaboration features
- Build analytics dashboard
- Enhance natural language with LLM
- Create marketplace UI
- Implement real export integrations (GitHub, Vercel)
- Build agent chaining system
- Integrate memory components

---

## Future Milestones

---
