# Phase 1: Project Structure Setup

## Goal
Create the complete directory structure for AgentEX project to support:
- Source code organization (React/Next.js components, libraries, hooks)
- Public assets (component definitions, icons, static assets)
- Code generation templates (TypeScript/Next.js, Python/FastAPI)
- Documentation (specifications, guides)

## Directory Structure

### Root Level
- `agentex/` - Main project directory (if not already exists)

### Source Code (`src/`)
- `src/components/` - React components for the visual builder UI
- `src/lib/` - Utility libraries and shared code
- `src/hooks/` - React custom hooks
- `src/app/` - Next.js App Router pages and routes

### Public Assets (`public/`)
- `public/components/` - Component registry JSON files (brains, tools, runtimes)
- `public/icons/` - Icon assets for components
- `public/assets/` - Other static assets (images, fonts, etc.)

### Templates (`templates/`)
- `templates/typescript/` - TypeScript/Next.js code generation templates
- `templates/python/` - Python/FastAPI code generation templates

### Documentation (`docs/`)
- `docs/spec/` - AgentEX standard specification files
- `docs/guides/` - User guides and documentation

## Implementation Steps

1. **Create root agentex directory** (if needed)
   - Check if `agentex/` exists, create if not

2. **Create source code directories**
   - `agentex/src/components/`
   - `agentex/src/lib/`
   - `agentex/src/hooks/`
   - `agentex/src/app/`

3. **Create public asset directories**
   - `agentex/public/components/`
   - `agentex/public/icons/`
   - `agentex/public/assets/`

4. **Create template directories**
   - `agentex/templates/typescript/`
   - `agentex/templates/python/`

5. **Create documentation directories**
   - `agentex/docs/spec/`
   - `agentex/docs/guides/`

## Success Criteria
- [x] All directories created successfully
- [x] Directory structure matches specification
- [x] Ready for Phase 2 (specification files) and Phase 10 (config files)

## Notes
- Directories are empty at this stage
- Content will be added in subsequent phases
- Structure supports both TypeScript (Next.js) and Python (FastAPI) workflows
