# Testing the AgentEX Skill

This guide explains how to test the AgentEX skill functionality.

## Prerequisites

1. **Start the development server:**
   ```bash
   npm run dev
   ```
   The server should be running on `http://localhost:3000`

2. **Verify the server is running:**
   ```bash
   curl http://localhost:3000/api/skill/install
   ```
   Or visit: http://localhost:3000/skill

## Running Tests

### Option 1: Node.js Test Script (Recommended)

```bash
node scripts/test-skill.js
```

This will test:
- ✅ Installation API endpoints
- ✅ Tool discovery endpoints
- ✅ Validation endpoint
- ✅ Code generation endpoint
- ✅ Build status endpoint
- ✅ Error handling

### Option 2: PowerShell Test Script

```bash
npm run test:skill:ps1
```

Or directly:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/test-skill.ps1
```

### Option 3: Bash Test Script (Linux/Mac)

```bash
bash scripts/test-skill.sh
```

## Manual Testing

### 1. Test Installation API

```bash
# Get all platform instructions
curl http://localhost:3000/api/skill/install

# Get OpenClaw instructions
curl http://localhost:3000/api/skill/install?platform=openclaw

# Get Claude instructions
curl http://localhost:3000/api/skill/install?platform=claude
```

### 2. Test Tool Discovery

```bash
# Search all tools
curl -X POST http://localhost:3000/api/agentex/v2/tools/search \
  -H "Content-Type: application/json" \
  -d '{"query":""}'

# Search for email tools
curl -X POST http://localhost:3000/api/agentex/v2/tools/search \
  -H "Content-Type: application/json" \
  -d '{"query":"email"}'

# Get specific tool
curl http://localhost:3000/api/agentex/v2/tools/tool-resend-email
```

### 3. Test Validation

```bash
curl -X POST http://localhost:3000/api/agentex/v2/validate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "validate",
    "name": "Test Agent",
    "description": "A test agent",
    "brain": "claude-3-5-sonnet",
    "tools": ["tool-resend-email", "tool-web-search"]
  }'
```

### 4. Test Code Generation

```bash
curl -X POST http://localhost:3000/api/agentex/v2/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "description": "A test agent",
    "brain": "claude-3-5-sonnet",
    "tools": ["tool-resend-email"],
    "runtime": "vercel"
  }'
```

This will return a `buildId`. Use it to check status:

```bash
# Replace BUILD_ID with the actual build ID from above
curl http://localhost:3000/api/agentex/v2/status/BUILD_ID
```

## Testing with Different Base URLs

You can test against production or staging:

```bash
# Production
BASE_URL=https://agentexs.vercel.app node scripts/test-skill.js

# Custom URL
BASE_URL=http://localhost:3001 node scripts/test-skill.js
```

## Expected Results

All tests should:
- ✅ Return HTTP 200 for valid requests
- ✅ Return HTTP 400/404 for invalid requests
- ✅ Include proper JSON responses
- ✅ Complete within reasonable time

## Troubleshooting

### Server not running
```
Error: connect ECONNREFUSED
```
**Solution:** Start the dev server with `npm run dev`

### Port already in use
```
Error: listen EADDRINUSE
```
**Solution:** Change the port or kill the existing process

### API endpoint not found
```
Error: 404 Not Found
```
**Solution:** Check that the route files exist in `src/app/api/agentex/v2/`

### Build ID not found
```
Error: Build not found
```
**Solution:** Make sure you're using a valid build ID from the generate endpoint

## Next Steps

After testing:
1. ✅ Verify all endpoints work
2. ✅ Test with real agent frameworks (Claude, GPT, OpenClaw)
3. ✅ Test the npm package installation
4. ✅ Test the interactive installer (`agentex-install`)
