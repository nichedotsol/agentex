# AgentEX Skill Code Locations

This document outlines where to find all skill-related code in the AgentEX GitHub repository.

## Repository Structure

```
agentex/
├── packages/
│   └── agentex-skill/          # Main skill package (npm package)
│       ├── bin/
│       │   └── install.js       # Interactive installer CLI
│       ├── scripts/
│       │   ├── postinstall.js   # Post-installation script
│       │   └── verify.js        # Verification script
│       ├── claude-skill.json    # Claude skill configuration
│       ├── gpt-function.json    # GPT/OpenAI function definition
│       ├── openclaw-skill.json  # OpenClaw skill configuration
│       ├── package.json          # npm package configuration
│       └── README.md             # Package documentation
│
├── src/
│   └── app/
│       ├── skill/
│       │   └── page.tsx         # Skill installation page (UI)
│       └── api/
│           ├── skill/
│           │   └── install/
│           │       └── route.ts # Installation API endpoint
│           └── agentex/
│               └── v2/           # Skill API endpoints
│                   ├── validate/
│                   │   └── route.ts
│                   ├── generate/
│                   │   └── route.ts
│                   ├── status/
│                   │   └── [buildId]/
│                   │       └── route.ts
│                   ├── deploy/
│                   │   └── route.ts
│                   └── tools/
│                       ├── search/
│                       │   └── route.ts
│                       └── [toolId]/
│                           └── route.ts
│
└── docs/
    ├── SKILL_INSTALLATION.md    # Installation guide
    └── API.md                    # API documentation
```

## Key Files

### 1. Skill Package (`packages/agentex-skill/`)

**Main Package Directory:**
- **Location:** `packages/agentex-skill/`
- **Purpose:** The npm package that users install with `npm install -g @agentex/skill`
- **GitHub URL:** `https://github.com/nichedotsol/agentex/tree/main/packages/agentex-skill`

**Key Files:**
- `bin/install.js` - Interactive CLI installer (`agentex-install` command)
- `claude-skill.json` - Claude skill configuration
- `gpt-function.json` - GPT/OpenAI function definition
- `openclaw-skill.json` - OpenClaw skill configuration
- `package.json` - npm package metadata

### 2. Installation Page (`src/app/skill/`)

**UI for Skill Installation:**
- **Location:** `src/app/skill/page.tsx`
- **GitHub URL:** `https://github.com/nichedotsol/agentex/tree/main/src/app/skill`
- **Purpose:** Web page where humans and AI agents can view installation instructions

### 3. Installation API (`src/app/api/skill/`)

**Programmatic Installation Instructions:**
- **Location:** `src/app/api/skill/install/route.ts`
- **GitHub URL:** `https://github.com/nichedotsol/agentex/tree/main/src/app/api/skill/install`
- **Purpose:** API endpoint that returns machine-readable installation instructions
- **Endpoint:** `GET /api/skill/install?platform=openclaw`

### 4. Skill API Endpoints (`src/app/api/agentex/v2/`)

**Core Skill Functionality:**
- **Location:** `src/app/api/agentex/v2/`
- **GitHub URL:** `https://github.com/nichedotsol/agentex/tree/main/src/app/api/agentex/v2`

**Available Endpoints:**
- `POST /api/agentex/v2/validate` - Validate agent requirements
  - File: `src/app/api/agentex/v2/validate/route.ts`
- `POST /api/agentex/v2/generate` - Generate agent code
  - File: `src/app/api/agentex/v2/generate/route.ts`
- `GET /api/agentex/v2/status/[buildId]` - Check build status
  - File: `src/app/api/agentex/v2/status/[buildId]/route.ts`
- `POST /api/agentex/v2/deploy` - Deploy agent
  - File: `src/app/api/agentex/v2/deploy/route.ts`
- `POST /api/agentex/v2/tools/search` - Search tools
  - File: `src/app/api/agentex/v2/tools/search/route.ts`
- `GET /api/agentex/v2/tools/[toolId]` - Get tool details
  - File: `src/app/api/agentex/v2/tools/[toolId]/route.ts`

### 5. Supporting Code

**Tool System:**
- Tool specifications: `public/components/tools/tool-*.json`
- Tool loader: `src/lib/tools/server-loader.ts`
- Tool validator: `src/lib/tools/validator.ts`
- Tool types: `src/lib/types/tool-spec.ts`

**Code Generation:**
- Code generator: `src/lib/utils/codeGenerator.ts`
- Setup generator: `src/lib/generators/setup-generator.ts`
- Test generator: `src/lib/generators/test-generator.ts`
- Deployment guide: `src/lib/generators/deployment-guide.ts`

**Build Management:**
- Build store: `src/lib/utils/build-store.ts`
- Runtime selector: `src/lib/utils/runtime-selector.ts`

## Quick Links

### GitHub Repository
- **Main Repo:** https://github.com/nichedotsol/agentex
- **Skill Package:** https://github.com/nichedotsol/agentex/tree/main/packages/agentex-skill
- **Installation Page:** https://github.com/nichedotsol/agentex/tree/main/src/app/skill
- **Installation API:** https://github.com/nichedotsol/agentex/tree/main/src/app/api/skill/install
- **Skill API Endpoints:** https://github.com/nichedotsol/agentex/tree/main/src/app/api/agentex/v2

### Documentation
- **Installation Guide:** `docs/SKILL_INSTALLATION.md`
- **API Documentation:** `docs/API.md`
- **Package README:** `packages/agentex-skill/README.md`

## How to Contribute

1. **Skill Configuration:** Edit files in `packages/agentex-skill/`
2. **API Endpoints:** Edit files in `src/app/api/agentex/v2/`
3. **Installation UI:** Edit `src/app/skill/page.tsx`
4. **Installer Script:** Edit `packages/agentex-skill/bin/install.js`

## Testing

To test the skill locally:

```bash
# Install the package locally
cd packages/agentex-skill
npm install
npm link

# Run the installer
agentex-install

# Test the API endpoints
curl http://localhost:3000/api/skill/install?platform=openclaw
```
