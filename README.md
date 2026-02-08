# AgentEX

**The universal standard for building and deploying AI agents.**

## What is AgentEX?

AgentEX is a visual builder and open standard that lets you:
- Build AI agents with drag-and-drop
- Deploy anywhere (Vercel, local, GitHub, Cursor)
- Use any LLM (Claude, GPT, Llama)
- Export real, portable code

## Philosophy

- **Lightweight**: Pure tool, zero infrastructure burden
- **Simple**: Build agents in 90 seconds
- **Universal**: Works with any model, any platform
- **Portable**: Export to code anytime, no lock-in

## Project Structure
```
agentex/
├── src/              # Visual builder UI
├── public/
│   └── components/   # Component registry (JSON)
├── templates/        # Code generation templates
│   ├── typescript/   # Next.js/Vercel exports
│   └── python/       # FastAPI/Docker exports
└── docs/
    ├── spec/         # AgentEX standard specification
    └── guides/       # Usage guides
```

## Quick Start

1. Clone this repo
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
4. Open http://localhost:3000

## Component Registry

First 10 components:

**Brains (3):**
- Claude Sonnet 4
- GPT-4.0
- Llama 3.3 70B

**Tools (5):**
- Web Search
- Code Execution
- Blockchain Query
- Token Price Feed
- Twitter Post

**Runtimes (2):**
- Vercel Serverless
- Local Docker

## Export Targets

- **GitHub**: One-click repo creation
- **Cursor**: Deep link to open project
- **Vercel**: Auto-deploy to your account
- **Local**: Download as ZIP

## Tech Stack

- Next.js 14 (App Router)
- Three.js / Spline (3D workspace)
- Tailwind CSS (styling)
- Supabase (auth + data)
- Vercel (hosting)

## License

MIT

## Contact

Built by @albs
Domain: agentex.com
